// Central configuration constants for the CareQueue backend.

export const TOTAL_TOKENS = 50;
export const DEFAULT_CONSULTATION_MINUTES = 10;
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 60;
export const MIN_AGE = 0;
export const MAX_AGE = 120;
export const POLL_INTERVAL_MS = 2000;
export const PORT = Number(process.env.PORT) || 3000;
export const DB_FILE = process.env.DB_FILE || 'clinic.db';

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
