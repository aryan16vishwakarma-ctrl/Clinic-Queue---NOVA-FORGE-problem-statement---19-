// Data access layer for clinic operational metadata.

import db from '../db/connection.js';

const getMetaStmt = db.prepare('SELECT value FROM meta WHERE key = ?');
const setMetaStmt = db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
const getAllMetaStmt = db.prepare('SELECT key, value FROM meta');

export const metaRepository = {
  get(key) {
    const row = getMetaStmt.get(key);
    return row ? row.value : null;
  },

  getNumber(key, defaultValue = 0) {
    const row = getMetaStmt.get(key);
    return row ? Number(row.value) : defaultValue;
  },

  set(key, value) {
    setMetaStmt.run(key, String(value));
  },

  getAll() {
    const rows = getAllMetaStmt.all();
    const map = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }
};
