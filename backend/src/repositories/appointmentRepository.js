// Data access layer for appointments table stored in MySQL appointment database.

import pool from '../db/connection.js';

export const appointmentRepository = {
  async findAll(conn = pool) {
    const [rows] = await conn.query('SELECT * FROM appointments ORDER BY appointment_date ASC, appointment_time ASC');
    return rows;
  },

  async findById(id, conn = pool) {
    const [rows] = await conn.execute('SELECT * FROM appointments WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  async create(data, conn = pool) {
    const { patient_name, age, contact, doctor_name, appointment_date, appointment_time, notes } = data;
    const [result] = await conn.execute(
      `INSERT INTO appointments (patient_name, age, contact, doctor_name, appointment_date, appointment_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_name, age, contact || null, doctor_name || null, appointment_date, appointment_time, notes || null]
    );
    return result.insertId;
  },

  async updateStatus(id, status, conn = pool) {
    await conn.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id, conn = pool) {
    await conn.execute('DELETE FROM appointments WHERE id = ?', [id]);
  }
};
