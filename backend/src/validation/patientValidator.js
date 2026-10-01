// Validates and normalizes incoming patient registration payloads.

import {
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_AGE,
  MAX_AGE,
  PATIENT_PRIORITY
} from '../config.js';

export function validatePatientPayload(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Please provide patient details.' };
  }

  const rawName = body.name;
  if (typeof rawName !== 'string' || rawName.trim().length === 0) {
    return { error: 'Please enter the patient\'s name.' };
  }

  const trimmedName = rawName.trim();
  if (trimmedName.length < MIN_NAME_LENGTH || trimmedName.length > MAX_NAME_LENGTH) {
    return { error: `Patient name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.` };
  }

  const rawAge = body.age;
  const parsedAge = Number(rawAge);
  if (rawAge === '' || rawAge === null || rawAge === undefined || !Number.isInteger(parsedAge)) {
    return { error: 'Please enter a valid whole number for age.' };
  }

  if (parsedAge < MIN_AGE || parsedAge > MAX_AGE) {
    return { error: `Patient age must be between ${MIN_AGE} and ${MAX_AGE}.` };
  }

  const rawPriority = body.priority;
  if (rawPriority !== PATIENT_PRIORITY.NORMAL && rawPriority !== PATIENT_PRIORITY.EMERGENCY) {
    return { error: 'Priority must be either normal or emergency.' };
  }

  return {
    data: {
      name: trimmedName,
      age: parsedAge,
      priority: rawPriority
    }
  };
}
