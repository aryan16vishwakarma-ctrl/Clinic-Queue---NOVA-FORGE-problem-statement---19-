// Central configuration constants for the CareQueue backend.
import dotenv from 'dotenv';
dotenv.config();

export const TOTAL_TOKENS = 50;
export const DEFAULT_CONSULTATION_MINUTES = 10;
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 60;
export const MIN_AGE = 0;
export const MAX_AGE = 120;
export const POLL_INTERVAL_MS = 2000;
export const PORT = Number(process.env.PORT) || 3000;

// MySQL Database configuration
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = Number(process.env.DB_PORT) || 3306;
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_NAME = process.env.DB_NAME || 'appointment';

export const PATIENT_STATUS = {
  WAITING: 'waiting',
  SERVING: 'serving',
  DONE: 'done',
  CANCELLED: 'cancelled'
};

export const PATIENT_PRIORITY = {
  NORMAL: 'normal',
  EMERGENCY: 'emergency'
};
