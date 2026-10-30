import { useState, FC } from 'react';
import { Play, Pause, RotateCcw, Flag, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { TimerStatus } from '../types';

interface ControlBarProps {
  status: TimerStatus;
  hasRecordedData: boolean;
  soundEnabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onLap: () => void;
  onToggleSound: () => void;
}

export const ControlBar: FC<ControlBarProps> = ({
  status,
  hasRecordedData,
  soundEnabled,
  onStart,
  onPause,
  onResume,
  onReset,
  onLap,
  onToggleSound,
}) => {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleResetClick = () => {
    // If timer is running or has recorded laps, ask confirmation (Nielsen Heuristic #5: Error Prevention)
    if (status === 'running' || hasRecordedData) {
      setConfirmingReset(true);
    } else {
      onReset();
    }
  };

  const handleConfirmReset = () => {
    setConfirmingReset(false);
    onReset();
  };

  const handleCancelReset = () => {
    setConfirmingReset(false);
  };

  return (
    <div className="relative flex flex-col items-center gap-3">
      {/* Safety Confirmation Dialog (Nielsen Heuristic #5: Error Prevention) */}
      {confirmingReset && (
        <div className="absolute -top-16 bg-slate-900 border border-amber-500/40 shadow-xl shadow-black/50 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-slate-200 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Confirmar reset e limpar medições?</span>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={handleConfirmReset}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-medium rounded-md transition-colors"
            >
              Sim, resetar
            </button>
            <button
              onClick={handleCancelReset}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Main Action Buttons Strip */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
        {/* Lap / Split Button */}
        <button
          onClick={onLap}
          disabled={status === 'idle'}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${
            status !== 'idle'
              ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600 hover:scale-105 active:scale-95 shadow-sm'
              : 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
          title="Registrar Volta / Parcial (Atalho: L)"
        >
          <Flag className="w-4 h-4 text-cyan-400" />
          <span>Volta</span>
          <span className="hidden sm:inline-block text-[10px] font-mono-tabular px-1.5 py-0.2 rounded bg-slate-950/60 text-slate-400 border border-slate-700/50">
            L
          </span>
        </button>

        {/* Primary Start / Pause / Resume Button */}
        {status === 'idle' && (
          <button
            onClick={onStart}
            className="flex items-center gap-2.5 px-7 py-3 rounded-full text-base font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Iniciar Cronômetro (Atalho: Espaço)"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Iniciar</span>
            <span className="hidden sm:inline-block text-[11px] font-mono-tabular px-1.5 py-0.5 rounded bg-cyan-600/30 text-slate-950 font-semibold border border-cyan-400/40 ml-1">
              Espaço
            </span>
          </button>
        )}

        {status === 'running' && (
          <button
            onClick={onPause}
            className="flex items-center gap-2.5 px-7 py-3 rounded-full text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Pausar Cronômetro (Atalho: Espaço)"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Pausar</span>
            <span className="hidden sm:inline-block text-[11px] font-mono-tabular px-1.5 py-0.5 rounded bg-amber-600/30 text-slate-950 font-semibold border border-amber-400/40 ml-1">
              Espaço
            </span>
          </button>
        )}

        {status === 'paused' && (
          <button
            onClick={onResume}
            className="flex items-center gap-2.5 px-7 py-3 rounded-full text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Continuar Cronômetro (Atalho: Espaço)"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Continuar</span>
            <span className="hidden sm:inline-block text-[11px] font-mono-tabular px-1.5 py-0.5 rounded bg-emerald-600/30 text-slate-950 font-semibold border border-emerald-400/40 ml-1">
              Espaço
            </span>
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={handleResetClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Resetar Cronômetro (Atalho: R)"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Resetar</span>
          <span className="hidden sm:inline-block text-[10px] font-mono-tabular px-1.5 py-0.2 rounded bg-slate-950/60 text-slate-400 border border-slate-700/50">
            R
          </span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-slate-800 text-cyan-400 border-slate-700 hover:border-cyan-500/50'
              : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Áudio Habilitado (Atalho: M)' : 'Áudio Desabilitado (Atalho: M)'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
