// Unit tests for pure queue management logic using Node's built-in test runner.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assignNextToken,
  sortWaitingPatients,
  addWaitEstimates,
  pickNextPatient,
  needsDailyReset,
  formatLocalDate
} from '../src/logic/queueLogic.js';

describe('Pure Queue Logic Tests', () => {
  it('gives the first patient of the day token 1 when last_token is 0', () => {
    const result = assignNextToken(0, []);
    assert.deepEqual(result, { token: 1 });
  });

  it('wraps 50 -> 1 and skips a token still held by an active patient', () => {
    // Last token was 49, token 50 and token 1 are currently active
    const result = assignNextToken(49, [50, 1], 50);
    assert.deepEqual(result, { token: 2 });
  });

  it('returns queue full when all 50 tokens are active', () => {
    const allTokens = Array.from({ length: 50 }, (_, i) => i + 1);
    const result = assignNextToken(25, allTokens, 50);
    assert.deepEqual(result, { error: 'QUEUE_FULL' });
  });

  it('orders emergency patient before normal patients and respects FIFO within each priority', () => {
    const patients = [
      { id: 1, name: 'Alice', priority: 'normal', arrived_at: '2026-10-01T09:00:00.000Z' },
      { id: 2, name: 'Bob', priority: 'normal', arrived_at: '2026-10-01T09:05:00.000Z' },
      { id: 3, name: 'Charlie (Emergency)', priority: 'emergency', arrived_at: '2026-10-01T09:10:00.000Z' },
      { id: 4, name: 'Dana (Emergency)', priority: 'emergency', arrived_at: '2026-10-01T09:08:00.000Z' }
    ];

    const sorted = sortWaitingPatients(patients);

    // Patients input must remain unmutated
    assert.equal(patients[0].name, 'Alice');

    // Emergencies first, sorted by arrived_at, then normal patients by arrived_at
    assert.deepEqual(
      sorted.map((patient) => patient.id),
      [4, 3, 1, 2]
    );
  });

  it('ensures emergency in queue does not replace the currently serving patient', () => {
    const currentServingPatient = { id: 10, token: 5, name: 'Eve', status: 'serving' };
    const waitingPatients = [
      { id: 11, token: 6, name: 'Frank (Normal)', priority: 'normal', arrived_at: '2026-10-01T09:00:00.000Z' },
      { id: 12, token: 7, name: 'Grace (Emergency)', priority: 'emergency', arrived_at: '2026-10-01T09:15:00.000Z' }
    ];

    const sortedWaiting = sortWaitingPatients(waitingPatients);
    const nextInLine = pickNextPatient(sortedWaiting);

    // Serving patient remains untouched; the emergency simply heads the waiting line
    assert.equal(currentServingPatient.id, 10);
    assert.equal(currentServingPatient.status, 'serving');
    assert.equal(nextInLine.id, 12);
  });

  it('cancelling a middle patient reduces others wait time by 10 minutes', () => {
    const initialQueue = [
      { id: 1, name: 'Patient 1', priority: 'normal', arrived_at: '2026-10-01T09:00:00.000Z' },
      { id: 2, name: 'Patient 2', priority: 'normal', arrived_at: '2026-10-01T09:05:00.000Z' },
      { id: 3, name: 'Patient 3', priority: 'normal', arrived_at: '2026-10-01T09:10:00.000Z' }
    ];

    const estimatesBefore = addWaitEstimates(initialQueue, 10);
    assert.equal(estimatesBefore[2].estimatedWaitMinutes, 30);
    assert.equal(estimatesBefore[2].position, 3);

    // Patient 2 cancels, so Patient 3 moves from position 3 to position 2
    const remainingQueue = initialQueue.filter((patient) => patient.id !== 2);
    const estimatesAfter = addWaitEstimates(remainingQueue, 10);

    const patient3After = estimatesAfter.find((patient) => patient.id === 3);
    assert.equal(patient3After.position, 2);
    assert.equal(patient3After.estimatedWaitMinutes, 20);
    assert.equal(estimatesBefore[2].estimatedWaitMinutes - patient3After.estimatedWaitMinutes, 10);
  });

  it('calling next on an empty queue does not crash and returns null', () => {
    const emptyQueue = [];
    assert.doesNotThrow(() => {
      const next = pickNextPatient(emptyQueue);
      assert.equal(next, null);
    });
  });

  it('triggers a daily reset on date change and not on the same day', () => {
    const today = '2026-10-01';
    const yesterday = '2026-09-30';
    const tomorrow = '2026-10-02';

    assert.equal(needsDailyReset(yesterday, today), true);
    assert.equal(needsDailyReset(today, today), false);
    assert.equal(needsDailyReset(null, today), true);
    assert.equal(needsDailyReset(today, tomorrow), true);
  });

  it('formats local date correctly as YYYY-MM-DD', () => {
    const sampleDate = new Date(2026, 9, 1); // October 1, 2026
    assert.equal(formatLocalDate(sampleDate), '2026-10-01');
  });
});
