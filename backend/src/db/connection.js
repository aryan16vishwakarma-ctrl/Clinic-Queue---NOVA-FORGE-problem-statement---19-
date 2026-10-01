// Opens and configures the SQLite database instance using better-sqlite3.

import Database from 'better-sqlite3';
import path from 'node:path';
import { DB_FILE } from '../config.js';
import { initSchema } from './schema.js';

// Resolve database file to the root of the project workspace.
const dbPath = path.resolve(process.cwd(), DB_FILE);
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and foreign keys for referential integrity.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema immediately so all prepared statements in repositories succeed on import.
initSchema(db);

export default db;
