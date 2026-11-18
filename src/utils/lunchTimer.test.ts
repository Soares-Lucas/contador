import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLunchProgress,
  clampDurationMinutes,
  computeRemainingMs,
  formatLunchClock,
  TOTAL_PIZZA_SLICES,
} from './lunchTimer';

const SIXTY_MIN_MS = 60 * 60 * 1000;
const FORTY_FIVE_MIN_MS = 45 * 60 * 1000;
const ONE_SLICE_MS = SIXTY_MIN_MS / TOTAL_PIZZA_SLICES; // 7m30s = 450,000ms

test('formatLunchClock formats whole minutes and edge cases accurately', () => {
  assert.equal(formatLunchClock(SIXTY_MIN_MS), '60:00');
  assert.equal(formatLunchClock(FORTY_FIVE_MIN_MS), '45:00');
  assert.equal(formatLunchClock(ONE_SLICE_MS), '07:30');
  assert.equal(formatLunchClock(1500), '00:02');
  assert.equal(formatLunchClock(100), '00:01');
  assert.equal(formatLunchClock(0), '00:00');
  assert.equal(formatLunchClock(-500), '00:00');
});

test('calculateLunchProgress starts with 0 of 8 slices eaten and all slices whole', () => {
  const state = calculateLunchProgress(SIXTY_MIN_MS, SIXTY_MIN_MS);
  assert.equal(state.slicesEatenCount, 0);
  assert.equal(state.activeSliceIndex, 0);
  assert.equal(state.isFinished, false);
  assert.equal(state.slices.length, 8);
  assert.ok(state.slices.every((s) => s.status === 'whole'));
});

test('calculateLunchProgress consumes 1 slice every 7m30s for 60 min lunch', () => {
  // After 7m30s (remaining 52m30s) -> 1 of 8 slices eaten
  const afterOne = calculateLunchProgress(SIXTY_MIN_MS, SIXTY_MIN_MS - ONE_SLICE_MS);
  assert.equal(afterOne.slicesEatenCount, 1);
  assert.equal(afterOne.slices[0].status, 'eaten');
  assert.equal(afterOne.activeSliceIndex, 1);

  // At 45:00 remaining (15m elapsed) -> exactly 2 of 8 slices eaten
  const afterTwo = calculateLunchProgress(SIXTY_MIN_MS, FORTY_FIVE_MIN_MS);
  assert.equal(afterTwo.slicesEatenCount, 2);
  assert.equal(afterTwo.slices[0].status, 'eaten');
  assert.equal(afterTwo.slices[1].status, 'eaten');
  assert.equal(afterTwo.activeSliceIndex, 2);
});

test('calculateLunchProgress animates biting stage inside active slice', () => {
  // Halfway through slice 0 (3m45s elapsed)
  const midFirst = calculateLunchProgress(SIXTY_MIN_MS, SIXTY_MIN_MS - ONE_SLICE_MS / 2);
  assert.equal(midFirst.slicesEatenCount, 0);
  assert.equal(midFirst.activeSliceIndex, 0);
  assert.equal(midFirst.slices[0].status, 'biting');
  assert.ok(midFirst.slices[0].biteProgress > 0.45 && midFirst.slices[0].biteProgress < 0.55);
  assert.equal(midFirst.slices[0].biteStage, 2);
  assert.equal(midFirst.slices[1].status, 'whole');
});

test('calculateLunchProgress marks all 8 slices eaten at 00:00', () => {
  const done = calculateLunchProgress(SIXTY_MIN_MS, 0);
  assert.equal(done.isFinished, true);
  assert.equal(done.slicesEatenCount, 8);
  assert.equal(done.activeSliceIndex, -1);
  assert.ok(done.slices.every((s) => s.status === 'eaten'));
});

test('computeRemainingMs handles real-clock calculations and never drops below 0', () => {
  const now = 1_700_000_000_000;
  assert.equal(computeRemainingMs(now + 60_000, now), 60_000);
  assert.equal(computeRemainingMs(now - 5_000, now), 0);
  assert.equal(computeRemainingMs(null, now), 0);
});

test('clampDurationMinutes bounds durations between 1 and 180 minutes', () => {
  assert.equal(clampDurationMinutes(0), 1);
  assert.equal(clampDurationMinutes(-10), 1);
  assert.equal(clampDurationMinutes(45.4), 45);
  assert.equal(clampDurationMinutes(300), 180);
  assert.equal(clampDurationMinutes(Number.NaN), 60);
});
