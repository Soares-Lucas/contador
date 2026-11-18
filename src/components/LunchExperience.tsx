import { FC, useState, useEffect, useRef, useCallback } from 'react';
import {
  Settings,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Moon,
  Check,
} from 'lucide-react';
import { AppTheme, LunchStatus } from '../types';
import { PizzaPlate } from './PizzaPlate';
import { LunchSettingsModal } from './LunchSettingsModal';
import {
  calculateLunchProgress,
  clampDurationMinutes,
  computeRemainingMs,
  formatLunchClock,
} from '../utils/lunchTimer';
import { playLunchFinishChime } from '../utils/audio';

interface LunchExperienceProps {
  theme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

const QUICK_DURATIONS = [15, 30, 45, 60, 90];
// Degrees per second for slow, soothing clockwise pizza rotation (1 full turn = 90s)
const ROTATION_DEG_PER_SEC = 4;

// Decorative 3-stroke olive accent matching the mockup
const OliveSparkLeft: FC = () => (
  <svg width="22" height="26" viewBox="0 0 22 26" className="shrink-0" aria-hidden="true">
    <line x1="18" y1="6" x2="7" y2="2" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="17" y1="13" x2="4" y2="13" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="18" y1="20" x2="7" y2="24" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const OliveSparkRight: FC = () => (
  <svg width="22" height="26" viewBox="0 0 22 26" className="shrink-0" aria-hidden="true">
    <line x1="4" y1="6" x2="15" y2="2" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="5" y1="13" x2="18" y2="13" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="4" y1="20" x2="15" y2="24" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

// Stylized pizza slice header icon
const HeaderPizzaIcon: FC = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" className="shrink-0" aria-hidden="true">
    <path d="M16 3 L29 25 Q16 30 3 25 Z" fill="#F6C85F" stroke="#FFF4DC" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M4 23.5 Q16 28.5 28 23.5" fill="none" stroke="#E08B3C" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="15" cy="14" r="2.2" fill="#C93B25" />
    <circle cx="19" cy="19" r="2" fill="#C93B25" />
    <circle cx="11.5" cy="19.5" r="1.8" fill="#5A8334" />
  </svg>
);

export const LunchExperience: FC<LunchExperienceProps> = ({ theme, onSelectTheme }) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [status, setStatus] = useState<LunchStatus>('config');
  const [remainingMs, setRemainingMs] = useState<number>(60 * 60 * 1000);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Real-clock references to prevent drift when tab is in background
  const endTimestampRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(60 * 60 * 1000);
  const lastFrameRef = useRef<number | null>(null);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const totalDurationMs = durationMinutes * 60 * 1000;

  // Detect OS reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const triggerCompletion = useCallback(() => {
    endTimestampRef.current = null;
    pausedRemainingRef.current = 0;
    setRemainingMs(0);
    setStatus('finished');
    if (soundEnabledRef.current) {
      playLunchFinishChime();
    }
  }, []);

  // Real-clock synchronization loop + visibilitychange catch-up
  useEffect(() => {
    if (status !== 'running') {
      lastFrameRef.current = null;
      return;
    }

    const syncClock = () => {
      const nextRemaining = computeRemainingMs(endTimestampRef.current, Date.now());
      setRemainingMs(nextRemaining);
      if (nextRemaining <= 0) {
        triggerCompletion();
      }
    };

    // High-responsiveness interval using real Date.now()
    const timerInterval = window.setInterval(syncClock, 250);

    // Immediate catch-up when returning from background tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncClock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Smooth pizza rotation loop synced to active running state
    let rafId: number | null = null;
    if (!prefersReducedMotion) {
      const animateRotation = (timestamp: number) => {
        if (lastFrameRef.current !== null) {
          const dtSec = (timestamp - lastFrameRef.current) / 1000;
          setRotationDeg((prev) => (prev + dtSec * ROTATION_DEG_PER_SEC) % 360);
        }
        lastFrameRef.current = timestamp;
        rafId = window.requestAnimationFrame(animateRotation);
      };
      rafId = window.requestAnimationFrame(animateRotation);
    }

    return () => {
      window.clearInterval(timerInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [status, prefersReducedMotion, triggerCompletion]);

  const progressState = calculateLunchProgress(totalDurationMs, remainingMs);
  const formattedTime = formatLunchClock(remainingMs);

  // Sync document title
  useEffect(() => {
    if (status === 'running') {
      document.title = `${formattedTime} · Hora do almoço`;
    } else if (status === 'paused') {
      document.title = `Pausado (${formattedTime}) · Hora do almoço`;
    } else if (status === 'finished') {
      document.title = `Ei, a pizza acabou! · Hora do almoço`;
    } else {
      document.title = `Hora do almoço · ÓRBITA`;
    }
  }, [formattedTime, status]);

  // Handlers
  const handleSelectDuration = (mins: number) => {
    if (status !== 'config') return;
    const clamped = clampDurationMinutes(mins);
    setDurationMinutes(clamped);
    const ms = clamped * 60 * 1000;
    pausedRemainingRef.current = ms;
    setRemainingMs(ms);
  };

  const handleStart = () => {
    const startMs = totalDurationMs;
    endTimestampRef.current = Date.now() + startMs;
    pausedRemainingRef.current = startMs;
    setRemainingMs(startMs);
    setRotationDeg(0);
    setStatus('running');
  };

  const handlePause = () => {
    const currentLeft = computeRemainingMs(endTimestampRef.current, Date.now());
    endTimestampRef.current = null;
    pausedRemainingRef.current = currentLeft;
    setRemainingMs(currentLeft);
    setStatus('paused');
  };

  const handleResume = () => {
    const resumeLeft = pausedRemainingRef.current;
    if (resumeLeft <= 0) {
      triggerCompletion();
      return;
    }
    endTimestampRef.current = Date.now() + resumeLeft;
    setStatus('running');
  };

  const handleReset = () => {
    endTimestampRef.current = null;
    const fullMs = durationMinutes * 60 * 1000;
    pausedRemainingRef.current = fullMs;
    setRemainingMs(fullMs);
    setRotationDeg(0);
    setStatus('config');
  };

  const handleFinishAcknowledge = () => {
    handleReset();
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F7EFE2] text-[#3B2114] flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 selection:bg-[#B84127]/20 selection:text-[#3B2114]">
      {/* Warm Pizzeria Framed Container */}
      <div className="w-full max-w-[780px] bg-[#FAF3E7] rounded-[28px] border border-[#DFC7AE] shadow-[0_18px_48px_rgba(74,43,19,0.12)] overflow-hidden flex flex-col">
        {/* Terracotta Header */}
        <header className="bg-[#B84127] text-white px-4 sm:px-7 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <HeaderPizzaIcon />
            <span className="w-px h-5 bg-white/35 shrink-0" aria-hidden="true" />
            <h1 className="font-serif-display text-lg sm:text-xl font-bold tracking-tight truncate">
              Hora do almoço
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Switcher (Lunch Light <-> Órbita Dark) */}
            <button
              type="button"
              onClick={() => onSelectTheme('orbita')}
              className="min-h-[40px] px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white whitespace-nowrap"
              aria-label="Alternar para o tema escuro Órbita"
              title="Alternar para o tema escuro Órbita"
            >
              <Moon className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Tema Órbita</span>
            </button>

            {/* Mute / Unmute Button */}
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!soundEnabled}
              aria-label={soundEnabled ? 'Silenciar alerta sonoro' : 'Ativar alerta sonoro'}
              title={soundEnabled ? 'Silenciar alerta sonoro' : 'Ativar alerta sonoro'}
              className="min-w-[42px] min-h-[42px] flex items-center justify-center rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-5 h-5 opacity-80" aria-hidden="true" />
              )}
            </button>

            {/* Settings Gear Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Configurações"
              title="Configurações"
              className="min-w-[42px] min-h-[42px] flex items-center justify-center rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Main Card Body */}
        <main className="px-5 sm:px-10 py-6 sm:py-7 flex flex-col items-center text-center">
          {/* STATE 1 & 2: Configuration or Running/Paused */}
          {status !== 'finished' ? (
            <>
              {/* Hero Heading with Olive Sparks */}
              <div className="flex items-center justify-center gap-2 sm:gap-3.5 mb-1">
                <OliveSparkLeft />
                <h2 className="font-serif-display text-2xl sm:text-[34px] font-bold text-[#3B2114] leading-tight tracking-tight">
                  Uma pausa bem servida.
                </h2>
                <OliveSparkRight />
              </div>

              <p className="text-sm sm:text-base text-[#5C3D2E] mb-4 sm:mb-5 max-w-md">
                Aproveite seu almoço. A gente cuida do tempo.
              </p>

              {/* Central Pizza on Ceramic Plate */}
              <PizzaPlate
                slices={progressState.slices}
                formattedTime={formattedTime}
                status={status}
                rotationDeg={rotationDeg}
                prefersReducedMotion={prefersReducedMotion}
                elapsedProgress={progressState.progress}
              />

              {/* Configuration Controls (shown before starting) */}
              {status === 'config' && (
                <div className="w-full max-w-xl mt-4 flex flex-col items-center gap-4">
                  {/* Duration Quick Presets */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6E774D]">
                      Escolha a duração do intervalo
                    </span>
                    <div
                      className="flex flex-wrap items-center justify-center gap-2"
                      role="group"
                      aria-label="Duração do intervalo de almoço"
                    >
                      {QUICK_DURATIONS.map((mins) => {
                        const isActive = durationMinutes === mins;
                        return (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => handleSelectDuration(mins)}
                            aria-pressed={isActive}
                            className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84127] ${
                              isActive
                                ? 'bg-[#D3D8BD] text-[#3B2114] ring-1 ring-[#8F986B] shadow-xs'
                                : 'bg-white/75 text-[#5C3D2E] border border-[#E2D0B8] hover:bg-[#EFE4D2]'
                            }`}
                          >
                            {mins} min
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setIsSettingsOpen(true)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-full text-sm font-medium bg-white/75 text-[#5C3D2E] border border-[#E2D0B8] hover:bg-[#EFE4D2] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84127]"
                      >
                        Outro
                      </button>
                    </div>
                  </div>

                  {/* Start CTA Button */}
                  <button
                    type="button"
                    onClick={handleStart}
                    className="min-h-[48px] w-full sm:w-auto min-w-[220px] px-8 py-2.5 rounded-full bg-[#B84127] hover:bg-[#9E351F] active:scale-[0.99] text-white text-base font-semibold shadow-[0_6px_18px_rgba(184,65,39,0.28)] flex items-center justify-center gap-2.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84127]"
                  >
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Iniciar almoço</span>
                  </button>
                </div>
              )}

              {/* Active / Paused Controls */}
              {(status === 'running' || status === 'paused') && (
                <div className="w-full max-w-md mt-5 flex flex-col items-center gap-5">
                  {/* Slices Eaten Progress Indicator */}
                  <div
                    data-testid="slices-eaten-badge"
                    className="inline-flex items-center justify-center px-5 py-1.5 rounded-full bg-[#D6DBBF] text-[#3B2114] text-sm font-semibold shadow-2xs"
                    aria-live="polite"
                  >
                    {progressState.slicesEatenCount} de 8 fatias saboreadas
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    {status === 'running' ? (
                      <button
                        type="button"
                        onClick={handlePause}
                        className="min-h-[48px] w-full sm:w-44 px-6 py-2.5 rounded-full bg-[#B84127] hover:bg-[#9E351F] active:scale-[0.99] text-white text-base font-semibold shadow-[0_6px_16px_rgba(184,65,39,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84127]"
                      >
                        <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                        <span>Pausar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResume}
                        className="min-h-[48px] w-full sm:w-44 px-6 py-2.5 rounded-full bg-[#B84127] hover:bg-[#9E351F] active:scale-[0.99] text-white text-base font-semibold shadow-[0_6px_16px_rgba(184,65,39,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84127]"
                      >
                        <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                        <span>Retomar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleReset}
                      className="min-h-[48px] w-full sm:w-44 px-6 py-2.5 rounded-full bg-[#FAF3E7] hover:bg-[#F2E6D3] active:scale-[0.99] text-[#3B2114] border-2 border-[#B84127] text-base font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84127]"
                    >
                      <RotateCcw className="w-4 h-4 text-[#3B2114]" aria-hidden="true" />
                      <span>Reiniciar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Interval Duration Footer Line */}
              <div className="w-full max-w-md mt-7 flex items-center gap-4 text-sm text-[#5C3D2E] font-medium">
                <span className="h-px flex-1 bg-[#B6BD99]" aria-hidden="true" />
                <span data-testid="lunch-interval-label">
                  Seu intervalo: {durationMinutes} min
                </span>
                <span className="h-px flex-1 bg-[#B6BD99]" aria-hidden="true" />
              </div>
            </>
          ) : (
            /* STATE 3: Intervalo Concluído (Finished) */
            <div className="w-full flex flex-col items-center py-2">
              <PizzaPlate
                slices={progressState.slices}
                formattedTime="00:00"
                status="finished"
                rotationDeg={0}
                prefersReducedMotion={prefersReducedMotion}
                elapsedProgress={1}
              />

              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 mb-1.5">
                <OliveSparkLeft />
                <h2 className="font-serif-display text-2xl sm:text-[34px] font-bold text-[#3B2114] leading-tight">
                  Ei, a pizza acabou!
                </h2>
                <OliveSparkRight />
              </div>

              <p className="text-sm sm:text-base text-[#5C3D2E] mb-7">
                Hora de voltar ao trabalho.
              </p>

              <button
                type="button"
                onClick={handleFinishAcknowledge}
                className="min-h-[50px] w-full max-w-xs px-8 py-3 rounded-full bg-[#B84127] hover:bg-[#9E351F] active:scale-[0.99] text-white text-base font-semibold shadow-[0_6px_18px_rgba(184,65,39,0.28)] flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84127]"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Concluir almoço</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <LunchSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        durationMinutes={durationMinutes}
        canEditDuration={status === 'config'}
        soundEnabled={soundEnabled}
        theme={theme}
        onSaveDuration={handleSelectDuration}
        onToggleSound={toggleSound}
        onTestSound={() => playLunchFinishChime()}
        onSelectTheme={onSelectTheme}
      />
    </div>
  );
};
