// Initializes MySQL tables and seeds initial metadata values for CareQueue.

import pool from './connection.js';
import { formatLocalDate } from '../logic/queueLogic.js';
import { DEFAULT_CONSULTATION_MINUTES } from '../config.js';

export async function initSchema() {
  // Patients table for queue tracking
  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      priority ENUM('normal', 'emergency') NOT NULL DEFAULT 'normal',
      status ENUM('waiting', 'serving', 'done', 'cancelled') NOT NULL DEFAULT 'waiting',
      arrived_at VARCHAR(100) NOT NULL,
      called_at VARCHAR(100) NULL,
      finished_at VARCHAR(100) NULL,
      INDEX idx_patients_status (status),
      INDEX idx_patients_arrived (arrived_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Meta table for clinic operational key-value state
  await pool.query(`
    CREATE TABLE IF NOT EXISTS meta (
      \`key\` VARCHAR(191) PRIMARY KEY,
      \`value\` TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Appointments table for scheduled consultations
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_name VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      contact VARCHAR(50) NULL,
      doctor_name VARCHAR(255) NULL,
      appointment_date VARCHAR(50) NOT NULL,
      appointment_time VARCHAR(50) NOT NULL,
      status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const todayStr = formatLocalDate(new Date());

  await pool.execute(
    'INSERT IGNORE INTO meta (`key`, `value`) VALUES (?, ?)',
    ['last_token', '0']
  );
  await pool.execute(
    'INSERT IGNORE INTO meta (`key`, `value`) VALUES (?, ?)',
    ['business_date', todayStr]
  );
  await pool.execute(
    'INSERT IGNORE INTO meta (`key`, `value`) VALUES (?, ?)',
    ['consultation_minutes', String(DEFAULT_CONSULTATION_MINUTES)]
  );
}
