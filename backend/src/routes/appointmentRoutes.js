// Appointment routes for scheduled clinic visits in appointment database.

import { Router } from 'express';
import { appointmentRepository } from '../repositories/appointmentRepository.js';

const router = Router();

router.get('/appointments', async (req, res, next) => {
  try {
    const appointments = await appointmentRepository.findAll();
    return res.json(appointments);
  } catch (err) {
    next(err);
  }
});

router.post('/appointments', async (req, res, next) => {
  try {
    const { patient_name, age, contact, doctor_name, appointment_date, appointment_time, notes } = req.body;
    if (!patient_name || !age || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'patient_name, age, appointment_date, and appointment_time are required.' });
    }

    const id = await appointmentRepository.create({
      patient_name,
      age: Number(age),
      contact,
      doctor_name,
      appointment_date,
      appointment_time,
      notes
    });

    const appointment = await appointmentRepository.findById(id);
    return res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

router.patch('/appointments/:id/status', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be scheduled, completed, or cancelled.' });
    }

    await appointmentRepository.updateStatus(id, status);
    const updated = await appointmentRepository.findById(id);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/appointments/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await appointmentRepository.delete(id);
    return res.json({ success: true, message: 'Appointment deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
