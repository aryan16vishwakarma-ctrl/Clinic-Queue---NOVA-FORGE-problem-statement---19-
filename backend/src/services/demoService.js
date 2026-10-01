// Helper service to seed realistic demo data and reset clinic state for demonstration.

import db from '../db/connection.js';
import { patientRepository } from '../repositories/patientRepository.js';
import { metaRepository } from '../repositories/metaRepository.js';
import { queueService } from './queueService.js';
import { formatLocalDate } from '../logic/queueLogic.js';
import { DEFAULT_CONSULTATION_MINUTES } from '../config.js';

export const demoService = {
  seedDemoPatients() {
    const samples = [
      { name: 'Asha Sharma', age: 34, priority: 'normal' },
      { name: 'David Chen', age: 58, priority: 'normal' },
      { name: 'Rajesh Patel', age: 62, priority: 'emergency' },
      { name: 'Maria Santos', age: 27, priority: 'normal' },
      { name: 'Samuel Taylor', age: 41, priority: 'normal' }
    ];

    const seededPatients = [];
    for (const sample of samples) {
      const patient = queueService.issueToken(sample);
      seededPatients.push(patient);
    }

    return {
      message: 'Demo patients seeded successfully.',
      count: seededPatients.length,
      patients: seededPatients
    };
  },

  resetAllData() {
    const resetTransaction = db.transaction(() => {
      patientRepository.clearAll();
      const todayStr = formatLocalDate(new Date());
      metaRepository.set('last_token', 0);
      metaRepository.set('business_date', todayStr);
      metaRepository.set('consultation_minutes', String(DEFAULT_CONSULTATION_MINUTES));
    });

    resetTransaction();

    return {
      message: 'All queue data and tokens have been reset.'
    };
  }
};
