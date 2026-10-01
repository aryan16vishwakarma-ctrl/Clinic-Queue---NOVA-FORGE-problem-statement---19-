// Data access layer for clinic operational metadata stored in MySQL.

import pool from '../db/connection.js';

export const metaRepository = {
  async get(key, conn = pool) {
    const [rows] = await conn.execute('SELECT `value` FROM meta WHERE `key` = ?', [key]);
    return rows.length > 0 ? rows[0].value : null;
  },

  async getNumber(key, defaultValue = 0, conn = pool) {
    const [rows] = await conn.execute('SELECT `value` FROM meta WHERE `key` = ?', [key]);
    return rows.length > 0 ? Number(rows[0].value) : defaultValue;
  },

  async set(key, value, conn = pool) {
    await conn.execute(
      'INSERT INTO meta (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
      [key, String(value)]
    );
  },

  async getAll(conn = pool) {
    const [rows] = await conn.query('SELECT `key`, `value` FROM meta');
    const map = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }
};
