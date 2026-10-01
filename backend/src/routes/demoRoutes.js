// Demonstration routes for seeding mock clinic patients and wiping demo state.

import { Router } from 'express';
import { demoService } from '../services/demoService.js';

const router = Router();

router.post('/demo/seed', (req, res, next) => {
  try {
    const result = demoService.seedDemoPatients();
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/demo/reset', (req, res, next) => {
  try {
    const result = demoService.resetAllData();
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
