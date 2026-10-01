// Patient-related API routes for registration and cancellation.

import { Router } from 'express';
import { validatePatientPayload } from '../validation/patientValidator.js';
import { queueService } from '../services/queueService.js';

const router = Router();

router.post('/patients', async (req, res, next) => {
  try {
    const validation = validatePatientPayload(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const patient = await queueService.issueToken(validation.data);
    return res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
});

router.post('/patients/:id/cancel', async (req, res, next) => {
  try {
    const patientId = Number(req.params.id);
    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ error: 'Please provide a valid patient identifier.' });
    }

    const result = await queueService.cancelPatient(patientId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
