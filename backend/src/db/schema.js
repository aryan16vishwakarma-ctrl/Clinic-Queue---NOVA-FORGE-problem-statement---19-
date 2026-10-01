// Initializes SQLite tables and seeds initial metadata values for CareQueue.

import { formatLocalDate } from '../logic/queueLogic.js';
import { DEFAULT_CONSULTATION_MINUTES } from '../config.js';

export function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token INTEGER NOT NULL CHECK (token >= 1 AND token <= 50),
      name TEXT NOT NULL,
      age INTEGER NOT NULL CHECK (age >= 0 AND age <= 120),
      priority TEXT NOT NULL CHECK (priority IN ('normal', 'emergency')),
      status TEXT NOT NULL CHECK (status IN ('waiting', 'serving', 'done', 'cancelled')),
      arrived_at TEXT NOT NULL,
      called_at TEXT,
      finished_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_patients_status ON patients (status);
    CREATE INDEX IF NOT EXISTS idx_patients_arrived ON patients (arrived_at);

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const todayStr = formatLocalDate(new Date());

  const insertMetaDefault = db.prepare(`
    INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)
  `);

  insertMetaDefault.run('last_token', '0');
  insertMetaDefault.run('business_date', todayStr);
  insertMetaDefault.run('consultation_minutes', String(DEFAULT_CONSULTATION_MINUTES));
}
