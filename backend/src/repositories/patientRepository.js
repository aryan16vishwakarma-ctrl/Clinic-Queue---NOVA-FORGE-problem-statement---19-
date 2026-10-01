// Data access layer for patient records and queue states stored in MySQL.

import pool from '../db/connection.js';

export const patientRepository = {
  async findActiveTokens(conn = pool) {
    const [rows] = await conn.execute(
      "SELECT token FROM patients WHERE status IN ('waiting', 'serving')"
    );
    return rows.map((row) => row.token);
  },

  async findWaitingPatients(conn = pool) {
    const [rows] = await conn.execute(
      "SELECT * FROM patients WHERE status = 'waiting' ORDER BY arrived_at ASC"
    );
    return rows;
  },

  async findServingPatient(conn = pool) {
    const [rows] = await conn.execute(
      "SELECT * FROM patients WHERE status = 'serving' LIMIT 1"
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async findById(id, conn = pool) {
    const [rows] = await conn.execute(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async insert(patientData, conn = pool) {
    const { token, name, age, priority, status, arrived_at } = patientData;
    const [result] = await conn.execute(
      'INSERT INTO patients (token, name, age, priority, status, arrived_at) VALUES (?, ?, ?, ?, ?, ?)',
      [token, name, age, priority, status, arrived_at]
    );
    return result.insertId;
  },

  async markDone(id, finishedAt, conn = pool) {
    await conn.execute(
      "UPDATE patients SET status = 'done', finished_at = ? WHERE id = ?",
      [finishedAt, id]
    );
  },

  async markServing(id, calledAt, conn = pool) {
    await conn.execute(
      "UPDATE patients SET status = 'serving', called_at = ? WHERE id = ?",
      [calledAt, id]
    );
  },

  async cancel(id, conn = pool) {
    await conn.execute(
      "UPDATE patients SET status = 'cancelled' WHERE id = ?",
      [id]
    );
  },

  async cancelAllActive(conn = pool) {
    await conn.execute(
      "UPDATE patients SET status = 'cancelled' WHERE status IN ('waiting', 'serving')"
    );
  },

  async getStats(businessDate, conn = pool) {
    const [[waitingRow]] = await conn.execute(
      "SELECT COUNT(*) as count FROM patients WHERE status = 'waiting'"
    );
    const [[servedRow]] = await conn.execute(
      "SELECT COUNT(*) as count FROM patients WHERE status = 'done' AND SUBSTRING(arrived_at, 1, 10) = ?",
      [businessDate]
    );
    const [[cancelledRow]] = await conn.execute(
      "SELECT COUNT(*) as count FROM patients WHERE status = 'cancelled' AND SUBSTRING(arrived_at, 1, 10) = ?",
      [businessDate]
    );
    const [[emergencyRow]] = await conn.execute(
      "SELECT COUNT(*) as count FROM patients WHERE priority = 'emergency' AND SUBSTRING(arrived_at, 1, 10) = ?",
      [businessDate]
    );

    return {
      waitingCount: Number(waitingRow.count || 0),
      servedToday: Number(servedRow.count || 0),
      cancelledToday: Number(cancelledRow.count || 0),
      emergenciesToday: Number(emergencyRow.count || 0)
    };
  },

  async clearAll(conn = pool) {
    await conn.execute('DELETE FROM patients');
  }
};
