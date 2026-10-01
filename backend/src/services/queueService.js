// Orchestrates queue operations, transactions, and view transformations.

import pool from '../db/connection.js';
import { patientRepository } from '../repositories/patientRepository.js';
import { metaRepository } from '../repositories/metaRepository.js';
import {
  assignNextToken,
  sortWaitingPatients,
  addWaitEstimates,
  pickNextPatient
} from '../logic/queueLogic.js';
import { TOTAL_TOKENS, DEFAULT_CONSULTATION_MINUTES, PATIENT_STATUS } from '../config.js';

export const queueService = {
  async issueToken({ name, age, priority }) {
    // Atomicity is essential here: token selection and insertion must occur inside the same
    // transaction to guarantee no two concurrent requests receive the same active token.
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const lastToken = await metaRepository.getNumber('last_token', 0, conn);
      const activeTokens = await patientRepository.findActiveTokens(conn);

      const assignment = assignNextToken(lastToken, activeTokens, TOTAL_TOKENS);
      if (assignment.error) {
        const error = new Error('Queue full, please wait.');
        error.statusCode = 409;
        throw error;
      }

      const assignedToken = assignment.token;
      const arrivedAt = new Date().toISOString();

      const patientId = await patientRepository.insert({
        token: assignedToken,
        name,
        age,
        priority,
        status: PATIENT_STATUS.WAITING,
        arrived_at: arrivedAt
      }, conn);

      await metaRepository.set('last_token', assignedToken, conn);

      await conn.commit();

      return {
        id: patientId,
        token: assignedToken,
        name
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async callNext() {
    // Transitioning from the current patient to the next must be atomic so consultation state remains consistent.
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const nowIso = new Date().toISOString();
      const currentServing = await patientRepository.findServingPatient(conn);

      if (currentServing) {
        await patientRepository.markDone(currentServing.id, nowIso, conn);
      }

      const rawWaiting = await patientRepository.findWaitingPatients(conn);
      const sortedWaiting = sortWaitingPatients(rawWaiting);
      const nextToServe = pickNextPatient(sortedWaiting);

      if (!nextToServe) {
        await conn.commit();
        return {
          serving: null,
          message: 'No patient waiting'
        };
      }

      await patientRepository.markServing(nextToServe.id, nowIso, conn);
      const newlyServing = await patientRepository.findById(nextToServe.id, conn);

      await conn.commit();

      return {
        serving: newlyServing
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async cancelPatient(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      const error = new Error('Patient not found.');
      error.statusCode = 404;
      throw error;
    }

    // Only waiting patients may be cancelled; serving or completed patients represent clinical consultations.
    if (patient.status !== PATIENT_STATUS.WAITING) {
      const error = new Error('Only waiting patients can be cancelled.');
      error.statusCode = 400;
      throw error;
    }

    await patientRepository.cancel(id);
    return {
      success: true,
      message: 'Patient cancelled successfully.'
    };
  },

  async getQueueView() {
    const serving = await patientRepository.findServingPatient();
    const rawWaiting = await patientRepository.findWaitingPatients();
    const consultationMinutes = await metaRepository.getNumber('consultation_minutes', DEFAULT_CONSULTATION_MINUTES);
    const businessDate = await metaRepository.get('business_date');

    const sortedWaiting = sortWaitingPatients(rawWaiting);
    const waitingWithEstimates = addWaitEstimates(sortedWaiting, consultationMinutes);

    const lastToken = await metaRepository.getNumber('last_token', 0);
    const activeTokens = await patientRepository.findActiveTokens();
    const nextTokenPreview = assignNextToken(lastToken, activeTokens, TOTAL_TOKENS);

    const stats = await patientRepository.getStats(businessDate);

    return {
      serving,
      waiting: waitingWithEstimates,
      nextToken: nextTokenPreview.token || null,
      stats
    };
  }
};
