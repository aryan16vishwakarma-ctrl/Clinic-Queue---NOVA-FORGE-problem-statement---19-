// Pure business rules for queue management, token rotation, and wait-time estimation.

import { TOTAL_TOKENS } from '../config.js';

export function assignNextToken(lastToken, activeTokens = [], totalTokens = TOTAL_TOKENS) {
  const activeSet = new Set(activeTokens);

  // When every slot in the cycle is active, we cannot issue another token without causing duplicates.
  if (activeSet.size >= totalTokens) {
    return { error: 'QUEUE_FULL' };
  }

  // Token numbers cycle continuously 1..N to keep physical token slips reusable across patient visits.
  for (let offset = 1; offset <= totalTokens; offset += 1) {
    const candidate = ((lastToken + offset - 1) % totalTokens) + 1;
    if (!activeSet.has(candidate)) {
      return { token: candidate };
    }
  }

  return { error: 'QUEUE_FULL' };
}

export function sortWaitingPatients(patients = []) {
  // We make a defensive shallow copy so caller state is never mutated unexpectedly.
  return [...patients].sort((first, second) => {
    // Triage rule: emergencies must be seen ahead of routine checkups.
    const firstIsEmergency = first.priority === 'emergency';
    const secondIsEmergency = second.priority === 'emergency';

    if (firstIsEmergency && !secondIsEmergency) {
      return -1;
    }
    if (!firstIsEmergency && secondIsEmergency) {
      return 1;
    }

    // Within the same priority category, fairness demands strict first-come first-served ordering.
    return first.arrived_at.localeCompare(second.arrived_at);
  });
}

export function addWaitEstimates(sortedWaiting = [], consultationMinutes = 10) {
  // Wait times are derived dynamically from remaining queue depth rather than stored statically,
  // ensuring times automatically adjust whenever a patient cancels or finishes early.
  return sortedWaiting.map((patient, index) => {
    const position = index + 1;
    return {
      ...patient,
      position,
      estimatedWaitMinutes: position * consultationMinutes
    };
  });
}

export function pickNextPatient(waitingPatients = []) {
  if (!waitingPatients || waitingPatients.length === 0) {
    return null;
  }
  return waitingPatients[0];
}

export function needsDailyReset(storedBusinessDate, todayDate) {
  // A clinic resets counters daily so early morning walk-ins start fresh from token 1.
  return !storedBusinessDate || storedBusinessDate !== todayDate;
}

export function formatLocalDate(dateObject) {
  // Clinics operate on local wall-clock time rather than UTC to align with local business days.
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, '0');
  const day = String(dateObject.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
