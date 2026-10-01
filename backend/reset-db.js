// Drops and recreates the appointment database with fresh schema.
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { formatLocalDate } from './src/logic/queueLogic.js';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'appointment';

async function resetDatabase() {
  console.log(`Connecting to MySQL on ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  console.log(`Dropping existing database "${DB_NAME}"...`);
  await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\`;`);
  console.log(`Database "${DB_NAME}" removed.`);

  console.log(`Creating fresh database "${DB_NAME}"...`);
  await conn.query(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await conn.query(`USE \`${DB_NAME}\`;`);

  console.log('Creating required tables...');

  // 1. patients table
  await conn.query(`
    CREATE TABLE patients (
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

  // 2. appointments table
  await conn.query(`
    CREATE TABLE appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_name VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      contact VARCHAR(50) NULL,
      doctor_name VARCHAR(255) NULL,
      appointment_date VARCHAR(50) NOT NULL,
      appointment_time VARCHAR(50) NOT NULL,
      status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_appointments_date (appointment_date),
      INDEX idx_appointments_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 3. meta table
  await conn.query(`
    CREATE TABLE meta (
      \`key\` VARCHAR(191) PRIMARY KEY,
      \`value\` TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Seed default metadata
  const todayStr = formatLocalDate(new Date());
  await conn.execute('INSERT INTO meta (`key`, `value`) VALUES (?, ?)', ['last_token', '0']);
  await conn.execute('INSERT INTO meta (`key`, `value`) VALUES (?, ?)', ['business_date', todayStr]);
  await conn.execute('INSERT INTO meta (`key`, `value`) VALUES (?, ?)', ['consultation_minutes', '10']);

  console.log('Database and schema created successfully!');
  const [tables] = await conn.query('SHOW TABLES;');
  console.log('Tables in ' + DB_NAME + ':', tables.map(t => Object.values(t)[0]));

  const [meta] = await conn.query('SELECT * FROM meta;');
  console.log('Initial metadata:', meta);

  await conn.end();
}

resetDatabase().catch(err => {
  console.error('Failed to reset database:', err);
  process.exit(1);
});
