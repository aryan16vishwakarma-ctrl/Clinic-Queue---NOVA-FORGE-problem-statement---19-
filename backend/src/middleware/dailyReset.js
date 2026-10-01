// Middleware executing the daily reset check before handling incoming requests.

import db from '../db/connection.js';
import { metaRepository } from '../repositories/metaRepository.js';
import { patientRepository } from '../repositories/patientRepository.js';
import { needsDailyReset, formatLocalDate } from '../logic/queueLogic.js';

export function dailyReset(req, res, next) {
  try {
    const todayStr = formatLocalDate(new Date());
    const storedDate = metaRepository.get('business_date');

    if (needsDailyReset(storedDate, todayStr)) {
      // Overnight walk-ins or unserved visits expire into cancelled state to start day fresh from token 1.
      const resetTransaction = db.transaction(() => {
        metaRepository.set('last_token', 0);
        patientRepository.cancelAllActive();
        metaRepository.set('business_date', todayStr);
      });

      resetTransaction();
    }
    next();
  } catch (err) {
    next(err);
  }
}
