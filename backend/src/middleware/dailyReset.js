// Middleware executing the daily reset check before handling incoming requests.

import pool from '../db/connection.js';
import { metaRepository } from '../repositories/metaRepository.js';
import { patientRepository } from '../repositories/patientRepository.js';
import { needsDailyReset, formatLocalDate } from '../logic/queueLogic.js';

export async function dailyReset(req, res, next) {
  try {
    const todayStr = formatLocalDate(new Date());
    const storedDate = await metaRepository.get('business_date');

    if (needsDailyReset(storedDate, todayStr)) {
      // Overnight walk-ins or unserved visits expire into cancelled state to start day fresh from token 1.
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await metaRepository.set('last_token', 0, conn);
        await patientRepository.cancelAllActive(conn);
        await metaRepository.set('business_date', todayStr, conn);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}
