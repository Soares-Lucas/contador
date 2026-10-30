export type TimerMode = 'stopwatch' | 'event' | 'timer';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface Lap {
  id: number;
  lapTime: number;
  overallTime: number;
  timestamp: string;
}

export type PlanetTheme = 'earth' | 'mars' | 'gas_giant' | 'quantum_cyan';

export interface EventTarget {
  id: string;
  title: string;
  targetTimestamp: number;
  category: string;
}

export interface NielsenHeuristic {
  number: number;
  title: string;
  titlePt: string;
  description: string;
  howWeApply: string;
}
