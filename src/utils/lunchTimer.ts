export const TOTAL_PIZZA_SLICES = 8;
export const BITE_STEPS_PER_SLICE = 5;

export interface LunchSliceState {
  index: number;
  status: 'whole' | 'biting' | 'eaten';
  /** 0 (untouched) to 1 (completely eaten) */
  biteProgress: number;
  /** Discrete bite stage 0..5 for crisp nibble transitions */
  biteStage: number;
}

export interface LunchProgress {
  totalDurationMs: number;
  remainingMs: number;
  elapsedMs: number;
  /** 0 to 1 overall progress */
  progress: number;
  /** Integer count of completely eaten slices (0..8) */
  slicesEatenCount: number;
  /** Index of the slice currently being eaten (0..7), or -1 if finished */
  activeSliceIndex: number;
  /** Local progress inside the active slice (0..1) */
  activeSliceProgress: number;
  slices: LunchSliceState[];
  isFinished: boolean;
}

export function computeRemainingMs(endTimestampMs: number | null, nowMs: number): number {
  if (endTimestampMs === null) return 0;
  return Math.max(0, endTimestampMs - nowMs);
}

export function formatLunchClock(remainingMs: number): string {
  if (remainingMs <= 0) return '00:00';
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function calculateLunchProgress(
  totalDurationMs: number,
  remainingMs: number
): LunchProgress {
  const safeTotal = Math.max(1, totalDurationMs);
  const clampedRemaining = Math.max(0, Math.min(safeTotal, remainingMs));
  const elapsedMs = safeTotal - clampedRemaining;
  const progress = Math.min(1, Math.max(0, elapsedMs / safeTotal));
  const isFinished = clampedRemaining <= 0;

  const exactSlicesEaten = progress * TOTAL_PIZZA_SLICES;
  // Small epsilon avoids floating point edge cases like 1.999999999999 at exact 2/8 mark
  const slicesEatenCount = isFinished
    ? TOTAL_PIZZA_SLICES
    : Math.min(TOTAL_PIZZA_SLICES, Math.floor(exactSlicesEaten + 1e-6));

  const activeSliceIndex =
    slicesEatenCount < TOTAL_PIZZA_SLICES ? slicesEatenCount : -1;

  const activeSliceProgress =
    activeSliceIndex >= 0
      ? Math.max(0, Math.min(1, exactSlicesEaten - slicesEatenCount))
      : 1;

  const slices: LunchSliceState[] = Array.from(
    { length: TOTAL_PIZZA_SLICES },
    (_, index) => {
      if (index < slicesEatenCount) {
        return {
          index,
          status: 'eaten',
          biteProgress: 1,
          biteStage: BITE_STEPS_PER_SLICE,
        };
      }
      if (index === activeSliceIndex) {
        const biteStage = Math.min(
          BITE_STEPS_PER_SLICE - 1,
          Math.floor(activeSliceProgress * BITE_STEPS_PER_SLICE)
        );
        return {
          index,
          status: activeSliceProgress > 0.02 ? 'biting' : 'whole',
          biteProgress: activeSliceProgress,
          biteStage,
        };
      }
      return {
        index,
        status: 'whole',
        biteProgress: 0,
        biteStage: 0,
      };
    }
  );

  return {
    totalDurationMs: safeTotal,
    remainingMs: clampedRemaining,
    elapsedMs,
    progress,
    slicesEatenCount,
    activeSliceIndex,
    activeSliceProgress,
    slices,
    isFinished,
  };
}

export function clampDurationMinutes(value: number): number {
  if (!Number.isFinite(value)) return 60;
  return Math.max(1, Math.min(180, Math.round(value)));
}
