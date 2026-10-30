import { FC } from 'react';
import { TimerStatus } from '../types';

interface TimeDisplayProps {
  totalMs: number;
  status: TimerStatus;
  modeLabel?: string;
}

function formatDigits(val: number): string {
  return val < 10 ? `0${val}` : String(val);
}

function formatMs(ms: number): string {
  return String(ms).padStart(3, '0');
}

interface DigitSlotProps {
  char: string;
}

// Fixed-width cell for each individual digit to guarantee zero jitter/trembling
const DigitSlot: FC<DigitSlotProps> = ({ char }) => (
  <span className="inline-block w-[0.62em] text-center font-mono-tabular select-none tabular-nums">
    {char}
  </span>
);

interface DigitGroupProps {
  value: string;
  label: string;
  colorClass?: string;
  dropShadowClass?: string;
  isSmall?: boolean;
}

const DigitGroup: FC<DigitGroupProps> = ({
  value,
  label,
  colorClass = 'text-white',
  dropShadowClass = 'drop-shadow-[0_0_24px_rgba(56,189,248,0.2)]',
  isSmall = false,
}) => {
  return (
    <div className="flex flex-col items-center select-none">
      <div
        className={`flex items-center justify-center font-bold tracking-normal ${colorClass} ${dropShadowClass} ${
          isSmall
            ? 'text-2xl sm:text-3xl md:text-4xl'
            : 'text-4xl sm:text-6xl md:text-7xl'
        }`}
      >
        {value.split('').map((char, index) => (
          <DigitSlot key={index} char={char} />
        ))}
      </div>
      <span className="text-[10px] sm:text-xs font-sans font-medium uppercase tracking-wider text-slate-400 mt-1 select-none">
        {label}
      </span>
    </div>
  );
};

interface SeparatorProps {
  char?: string;
  isRunning?: boolean;
}

// Separator with fixed width so pulsing or character rendering never shifts adjacent columns
const Separator: FC<SeparatorProps> = ({ char = ':', isRunning = false }) => (
  <div className="flex flex-col items-center select-none">
    <span
      className={`inline-block w-4 sm:w-6 md:w-8 text-center font-bold text-3xl sm:text-5xl md:text-6xl leading-none transition-colors duration-200 ${
        isRunning ? 'text-cyan-400/90' : 'text-slate-600'
      }`}
    >
      {char}
    </span>
    {/* Spacer matching label height */}
    <span className="text-[10px] sm:text-xs mt-1 invisible" aria-hidden="true">
      -
    </span>
  </div>
);

export const TimeDisplay: FC<TimeDisplayProps> = ({ totalMs, status, modeLabel }) => {
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);
  const milliseconds = totalMs % 1000;

  const isRunning = status === 'running';

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {modeLabel && (
        <div className="mb-3 text-xs font-mono-tabular uppercase tracking-widest text-slate-400 flex items-center gap-2 select-none">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`}></span>
          <span>{modeLabel}</span>
        </div>
      )}

      {/* Main Digit Display Cluster with Fixed-Cell Alignment */}
      <div className="flex items-center justify-center font-mono-tabular text-slate-100 select-none">
        {/* Days */}
        <DigitGroup
          value={formatDigits(days)}
          label="Dias"
          colorClass="text-white"
        />

        <Separator char=":" isRunning={isRunning} />

        {/* Hours */}
        <DigitGroup
          value={formatDigits(hours)}
          label="Horas"
          colorClass="text-white"
        />

        <Separator char=":" isRunning={isRunning} />

        {/* Minutes */}
        <DigitGroup
          value={formatDigits(minutes)}
          label="Min"
          colorClass="text-white"
        />

        <Separator char=":" isRunning={isRunning} />

        {/* Seconds */}
        <DigitGroup
          value={formatDigits(seconds)}
          label="Seg"
          colorClass="text-cyan-300"
          dropShadowClass="drop-shadow-[0_0_28px_rgba(6,182,212,0.35)]"
        />

        {/* Period separator for milliseconds */}
        <div className="flex flex-col items-center select-none">
          <span className="inline-block w-2 sm:w-3 md:w-4 text-center font-bold text-2xl sm:text-3xl md:text-4xl text-slate-500 leading-none">
            .
          </span>
          <span className="text-[10px] sm:text-xs mt-1 invisible" aria-hidden="true">
            -
          </span>
        </div>

        {/* Milliseconds (isolated with fixed-width 3-digit cell) */}
        <DigitGroup
          value={formatMs(milliseconds)}
          label="Ms"
          colorClass="text-slate-400"
          isSmall={true}
        />
      </div>
    </div>
  );
};
