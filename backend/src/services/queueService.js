// Orchestrates queue operations, transactions, and view transformations.

import db from '../db/connection.js';
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
  issueToken({ name, age, priority }) {
    // Atomicity is essential here: token selection and insertion must occur inside the same
    // transaction to guarantee no two concurrent requests receive the same active token.
    const issueTransaction = db.transaction(() => {
      const lastToken = metaRepository.getNumber('last_token', 0);
      const activeTokens = patientRepository.findActiveTokens();

      const assignment = assignNextToken(lastToken, activeTokens, TOTAL_TOKENS);
      if (assignment.error) {
        const error = new Error('Queue full, please wait.');
        error.statusCode = 409;
        throw error;
      }

      const assignedToken = assignment.token;
      const arrivedAt = new Date().toISOString();

      const patientId = patientRepository.insert({
        token: assignedToken,
        name,
        age,
        priority,
        status: PATIENT_STATUS.WAITING,
        arrived_at: arrivedAt
      });

      metaRepository.set('last_token', assignedToken);

      return {
        id: patientId,
        token: assignedToken,
        name
      };
    });

    return issueTransaction();
  },

  callNext() {
    // Transitioning from the current patient to the next must be atomic so consultation state remains consistent.
    const callNextTransaction = db.transaction(() => {
      const nowIso = new Date().toISOString();
      const currentServing = patientRepository.findServingPatient();

      if (currentServing) {
        patientRepository.markDone(currentServing.id, nowIso);
      }

      const rawWaiting = patientRepository.findWaitingPatients();
      const sortedWaiting = sortWaitingPatients(rawWaiting);
      const nextToServe = pickNextPatient(sortedWaiting);

      if (!nextToServe) {
        return {
          serving: null,
          message: 'No patient waiting'
        };
      }

      patientRepository.markServing(nextToServe.id, nowIso);
      const newlyServing = patientRepository.findById(nextToServe.id);

      return {
        serving: newlyServing
      };
    });

    return callNextTransaction();
  },

  cancelPatient(id) {
    const patient = patientRepository.findById(id);
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

    patientRepository.cancel(id);
    return {
      success: true,
      message: 'Patient cancelled successfully.'
    };
  },

  getQueueView() {
    const serving = patientRepository.findServingPatient();
    const rawWaiting = patientRepository.findWaitingPatients();
    const consultationMinutes = metaRepository.getNumber('consultation_minutes', DEFAULT_CONSULTATION_MINUTES);
    const businessDate = metaRepository.get('business_date');

    const sortedWaiting = sortWaitingPatients(rawWaiting);
    const waitingWithEstimates = addWaitEstimates(sortedWaiting, consultationMinutes);

    const lastToken = metaRepository.getNumber('last_token', 0);
    const activeTokens = patientRepository.findActiveTokens();
    const nextTokenPreview = assignNextToken(lastToken, activeTokens, TOTAL_TOKENS);

    const stats = patientRepository.getStats(businessDate);

    return {
      serving,
      waiting: waitingWithEstimates,
      nextToken: nextTokenPreview.token || null,
      stats
    };
  }
};
