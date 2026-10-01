// Data access layer for patient records and queue states.

import db from '../db/connection.js';

const findActiveTokensStmt = db.prepare(`
  SELECT token FROM patients WHERE status IN ('waiting', 'serving')
`);

const findWaitingPatientsStmt = db.prepare(`
  SELECT * FROM patients WHERE status = 'waiting' ORDER BY arrived_at ASC
`);

const findServingPatientStmt = db.prepare(`
  SELECT * FROM patients WHERE status = 'serving' LIMIT 1
`);

const findPatientByIdStmt = db.prepare(`
  SELECT * FROM patients WHERE id = ?
`);

const insertPatientStmt = db.prepare(`
  INSERT INTO patients (token, name, age, priority, status, arrived_at)
  VALUES (@token, @name, @age, @priority, @status, @arrived_at)
`);

const markDoneStmt = db.prepare(`
  UPDATE patients SET status = 'done', finished_at = ? WHERE id = ?
`);

const markServingStmt = db.prepare(`
  UPDATE patients SET status = 'serving', called_at = ? WHERE id = ?
`);

const cancelPatientStmt = db.prepare(`
  UPDATE patients SET status = 'cancelled' WHERE id = ?
`);

const cancelActivePatientsStmt = db.prepare(`
  UPDATE patients SET status = 'cancelled' WHERE status IN ('waiting', 'serving')
`);

const countWaitingStmt = db.prepare(`
  SELECT COUNT(*) as count FROM patients WHERE status = 'waiting'
`);

const countServedTodayStmt = db.prepare(`
  SELECT COUNT(*) as count FROM patients WHERE status = 'done' AND substr(arrived_at, 1, 10) = ?
`);

const countCancelledTodayStmt = db.prepare(`
  SELECT COUNT(*) as count FROM patients WHERE status = 'cancelled' AND substr(arrived_at, 1, 10) = ?
`);

const countEmergenciesTodayStmt = db.prepare(`
  SELECT COUNT(*) as count FROM patients WHERE priority = 'emergency' AND substr(arrived_at, 1, 10) = ?
`);

const clearAllPatientsStmt = db.prepare('DELETE FROM patients');

export const patientRepository = {
  findActiveTokens() {
    return findActiveTokensStmt.all().map((row) => row.token);
  },

  findWaitingPatients() {
    return findWaitingPatientsStmt.all();
  },

  findServingPatient() {
    return findServingPatientStmt.get() || null;
  },

  findById(id) {
    return findPatientByIdStmt.get(id) || null;
  },

  insert(patientData) {
    const result = insertPatientStmt.run(patientData);
    return result.lastInsertRowid;
  },

  markDone(id, finishedAt) {
    markDoneStmt.run(finishedAt, id);
  },

  markServing(id, calledAt) {
    markServingStmt.run(calledAt, id);
  },

  cancel(id) {
    cancelPatientStmt.run(id);
  },

  cancelAllActive() {
    cancelActivePatientsStmt.run();
  },

  getStats(businessDate) {
    return {
      waitingCount: countWaitingStmt.get().count,
      servedToday: countServedTodayStmt.get(businessDate).count,
      cancelledToday: countCancelledTodayStmt.get(businessDate).count,
      emergenciesToday: countEmergenciesTodayStmt.get(businessDate).count
    };
  },

  clearAll() {
    clearAllPatientsStmt.run();
  }
};
