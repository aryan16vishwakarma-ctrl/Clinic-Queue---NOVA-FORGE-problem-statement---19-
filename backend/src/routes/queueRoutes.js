// Queue operations API routes for viewing the board and advancing the next patient.

import { Router } from 'express';
import { queueService } from '../services/queueService.js';

const router = Router();

router.get('/queue', (req, res, next) => {
  try {
    const queueView = queueService.getQueueView();
    return res.json(queueView);
  } catch (err) {
    next(err);
  }
});

router.post('/next', (req, res, next) => {
  try {
    const result = queueService.callNext();
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
