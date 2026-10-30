import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getDevelopmentCounter,
  getProjectDateParts,
  millisecondsUntilNextProjectDay,
  PROJECT_TIME_ZONE,
} from '../src/scripts/building-counter.js';

test('uses the documented fixed project timezone', () => {
  assert.equal(PROJECT_TIME_ZONE, 'Europe/Moscow');
  assert.deepEqual(getProjectDateParts(new Date('2026-10-30T20:59:59.500Z')), {
    year: 2026, month: 10, day: 30, hour: 23, minute: 59, second: 59,
  });
});

test('returns the approved inclusive baseline on 2026-10-30', () => {
  assert.deepEqual(getDevelopmentCounter(new Date('2026-10-30T12:00:00.000Z')), {
    days: 183,
    estimatedHours: 2400,
    dateLabel: '30 Oct 2026',
  });
});

test('increments by one day and approximately ten hours after the Moscow date boundary', () => {
  const beforeBoundary = getDevelopmentCounter(new Date('2026-10-30T20:59:59.500Z'));
  const afterBoundary = getDevelopmentCounter(new Date('2026-10-30T21:00:00.000Z'));

  assert.equal(beforeBoundary.days, 183);
  assert.equal(beforeBoundary.estimatedHours, 2400);
  assert.equal(afterBoundary.days, 184);
  assert.equal(afterBoundary.estimatedHours, 2410);
  assert.equal(afterBoundary.dateLabel, '31 Oct 2026');
});

test('uses the project calendar even before the corresponding UTC date changes', () => {
  const counter = getDevelopmentCounter(new Date('2026-10-30T22:00:00.000Z'));

  assert.equal(counter.dateLabel, '31 Oct 2026');
  assert.equal(counter.days, 184);
  assert.equal(counter.estimatedHours, 2410);
});

test('schedules the next update at the Europe/Moscow midnight boundary', () => {
  const delay = millisecondsUntilNextProjectDay(new Date('2026-10-30T20:59:59.500Z'));

  assert.equal(delay, 525);
});
