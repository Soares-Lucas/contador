import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppTheme,
  TimerMode,
  TimerStatus,
  Lap,
  PlanetTheme,
  EventTarget,
} from './types';
import { OrbitalSystem } from './components/OrbitalSystem';
import { TimeDisplay } from './components/TimeDisplay';
import { ControlBar } from './components/ControlBar';
import { LapsTable } from './components/LapsTable';
import { EventCountdownSetup } from './components/EventCountdownSetup';
import { HeuristicsModal } from './components/HeuristicsModal';
import { LunchExperience } from './components/LunchExperience';
import { playTickSound, playLapSound, playAlarmSound } from './utils/audio';
import {
  Compass,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  Timer,
  Clock,
  Sun,
} from 'lucide-react';

function getInitialAppTheme(): AppTheme {
  if (typeof window === 'undefined') return 'lunch';
  const params = new URLSearchParams(window.location.search);
  const urlTheme = params.get('theme');
  if (urlTheme === 'orbita' || urlTheme === 'dark') return 'orbita';
  if (urlTheme === 'lunch' || urlTheme === 'light') return 'lunch';
  const stored = window.localStorage.getItem('orbita_app_theme');
  return stored === 'orbita' ? 'orbita' : 'lunch';
}

export default function App() {
  // Dual-Theme State ('lunch' = Light Pizzeria Theme, 'orbita' = Dark Space Theme)
  const [appTheme, setAppTheme] = useState<AppTheme>(getInitialAppTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', appTheme === 'orbita');
    try {
      window.localStorage.setItem('orbita_app_theme', appTheme);
    } catch {
      // Ignore storage failures
    }
  }, [appTheme]);

  // Modes & State
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [planetTheme, setPlanetTheme] = useState<PlanetTheme>('earth');
  const [orbitSpeedSec, setOrbitSpeedSec] = useState<number>(60);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHeuristicsModal, setShowHeuristicsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Target event for Event Countdown Mode
  const [targetEvent, setTargetEvent] = useState<EventTarget>({
    id: 'launch_event',
    title: 'Lançamento de Produto Silicon Valley',
    targetTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 45, // ~3 days, 45 min
    category: 'Startup',
  });

  // Focus Timer preset duration (e.g. 25 min Pomodoro in ms)
  const [timerDurationMs, setTimerDurationMs] = useState<number>(25 * 60 * 1000);
  const [timerRemainingMs, setTimerRemainingMs] = useState<number>(25 * 60 * 1000);

  // Interval reference
  const lastTickTimeRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Toast feedback trigger (Heuristic #1)
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Update browser document title with live timer status when Orbita theme is active (Heuristic #1)
  useEffect(() => {
    if (appTheme !== 'orbita') return;
    const s = Math.floor((displayTotalMs / 1000) % 60);
    const m = Math.floor((displayTotalMs / (1000 * 60)) % 60);
    const h = Math.floor((displayTotalMs / (1000 * 60 * 60)) % 24);
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const statusPrefix = status === 'running' ? '▶ ' : status === 'paused' ? '❚❚ ' : '';
    document.title = `${statusPrefix}${timeStr} · ÓRBITA`;
  }, [appTheme, elapsedMs, timerRemainingMs, mode, status]);

  // Main Timer Loop
  useEffect(() => {
    if (status !== 'running') {
      lastTickTimeRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const now = performance.now();
      const delta = lastTickTimeRef.current ? now - lastTickTimeRef.current : 10;
      lastTickTimeRef.current = now;

      if (mode === 'stopwatch') {
        setElapsedMs((prev) => {
          const next = prev + delta;
          // Play subtle tick every second if sound enabled
          if (soundEnabled && Math.floor(next / 1000) !== Math.floor(prev / 1000)) {
            playTickSound();
          }
          return next;
        });
      } else if (mode === 'timer') {
        setTimerRemainingMs((prev) => {
          const next = Math.max(0, prev - delta);
          if (next === 0 && prev > 0) {
            setStatus('idle');
            if (soundEnabled) playAlarmSound();
            showToast('Sessão finalizada! Temporizador concluído.');
          }
          return next;
        });
      }
    }, 10);

    return () => clearInterval(interval);
  }, [status, mode, soundEnabled, showToast]);

  // For Event Mode: continuously compute difference to target timestamp
  const [eventRemainingMs, setEventRemainingMs] = useState<number>(0);
  useEffect(() => {
    if (mode !== 'event') return;

    const updateEventCountdown = () => {
      const diff = Math.max(0, targetEvent.targetTimestamp - Date.now());
      setEventRemainingMs(diff);
    };

    updateEventCountdown();
    const interval = setInterval(updateEventCountdown, 10);
    return () => clearInterval(interval);
  }, [mode, targetEvent]);

  // Calculate current display total Ms
  const displayTotalMs = mode === 'stopwatch' 
    ? elapsedMs 
    : mode === 'event' 
    ? eventRemainingMs 
    : timerRemainingMs;

  // Actions
  const handleStart = () => {
    setStatus('running');
    if (soundEnabled) playTickSound();
    showToast('Cronômetro em execução');
  };

  const handlePause = () => {
    setStatus('paused');
    showToast('Cronômetro pausado');
  };

  const handleResume = () => {
    setStatus('running');
    if (soundEnabled) playTickSound();
    showToast('Cronômetro retomado');
  };

  const handleReset = () => {
    setStatus('idle');
    setElapsedMs(0);
    setLaps([]);
    setTimerRemainingMs(timerDurationMs);
    showToast('Contador reiniciado');
  };

  const handleLap = () => {
    if (status === 'idle') return;
    const lastLapOverall = laps.length > 0 ? laps[laps.length - 1].overallTime : 0;
    const currentLapTime = elapsedMs - lastLapOverall;
    const newLap: Lap = {
      id: laps.length + 1,
      lapTime: currentLapTime,
      overallTime: elapsedMs,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    };
    setLaps((prev) => [...prev, newLap]);
    if (soundEnabled) playLapSound();
    showToast(`Volta #${newLap.id} registrada com sucesso`);
  };

  const handleClearLaps = () => {
    setLaps([]);
    showToast('Histórico de voltas limpo');
  };

  const handleCopyLaps = () => {
    if (laps.length === 0) return;
    const text = laps
      .map(
        (l) =>
          `Volta ${l.id}: Parcial ${(l.lapTime / 1000).toFixed(2)}s | Total ${(l.overallTime / 1000).toFixed(2)}s`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast('Dados de voltas copiados para a área de transferência');
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      showToast(next ? 'Áudio ativado' : 'Áudio silenciado');
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard Shortcuts Listener (Heuristic #7: Flexibility and efficiency of use)
  useEffect(() => {
    if (appTheme !== 'orbita') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'idle') handleStart();
        else if (status === 'running') handlePause();
        else if (status === 'paused') handleResume();
      } else if (e.code === 'KeyL' && status !== 'idle' && mode === 'stopwatch') {
        e.preventDefault();
        handleLap();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleSound();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '?') {
        e.preventDefault();
        setShowHeuristicsModal(true);
      } else if (e.code === 'Escape') {
        setShowHeuristicsModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appTheme, status, mode, soundEnabled, laps, elapsedMs]);

  if (appTheme === 'lunch') {
    return <LunchExperience theme={appTheme} onSelectTheme={setAppTheme} />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col radial-stars selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Silicon Valley Top Bar Contract */}
      {/* Zone 1 (Brand) — Zone 2 (Single-line Nav Links) — Zone 3 (Primary Action) */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-orbitron font-extrabold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 whitespace-nowrap">
              ÓRBITA
            </span>
            <span className="hidden md:inline text-xs text-slate-500 font-mono-tabular">
              v2.0
            </span>
          </div>

          {/* Zone 2: Clean single-line navigation links / modes */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => {
                setMode('stopwatch');
                setStatus('idle');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                mode === 'stopwatch'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Cronômetro</span>
            </button>

            <button
              onClick={() => {
                setMode('event');
                setStatus('running');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                mode === 'event'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Contagem de Evento</span>
            </button>

            <button
              onClick={() => {
                setMode('timer');
                setStatus('idle');
                setTimerRemainingMs(timerDurationMs);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                mode === 'timer'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sessão de Foco</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Theme Switch */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAppTheme('lunch')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:text-amber-100 bg-amber-950/50 hover:bg-amber-900/60 rounded-lg border border-amber-700/50 transition-colors cursor-pointer whitespace-nowrap"
              aria-label="Alternar para o tema claro Hora do almoço"
              title="Alternar para o tema claro Hora do almoço"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Hora do almoço</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHeuristicsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              title="Ver Heurísticas de Usabilidade (Nielsen)"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Heurísticas UX</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              aria-label={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia'}
              title={isFullscreen ? 'Sair da Tela Cheia (Atalho: F)' : 'Modo Tela Cheia (Atalho: F)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-7xl mx-auto w-full">
        {/* Orbital Stage with Planet orbiting the central time data */}
        <section className="w-full flex flex-col items-center justify-center my-auto">
          <OrbitalSystem
            elapsedMs={displayTotalMs}
            status={status}
            theme={planetTheme}
            orbitPeriodMs={orbitSpeedSec * 1000}
          >
            <TimeDisplay
              totalMs={displayTotalMs}
              status={status}
              modeLabel={
                mode === 'stopwatch'
                  ? 'Cronômetro de Alta Resolução'
                  : mode === 'event'
                  ? `Alvo: ${targetEvent.title}`
                  : 'Temporizador de Foco'
              }
            />
          </OrbitalSystem>

          {/* Interactive Control Console */}
          <div className="mt-4 sm:mt-6 z-20">
            {mode === 'stopwatch' && (
              <ControlBar
                status={status}
                hasRecordedData={laps.length > 0}
                soundEnabled={soundEnabled}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onReset={handleReset}
                onLap={handleLap}
                onToggleSound={toggleSound}
              />
            )}

            {mode === 'event' && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono-tabular">
                  Contagem sincronizada em tempo real com o meridiano local
                </span>
              </div>
            )}

            {mode === 'timer' && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  {[5, 15, 25, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        const ms = mins * 60 * 1000;
                        setTimerDurationMs(ms);
                        setTimerRemainingMs(ms);
                        setStatus('idle');
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-mono-tabular transition-colors cursor-pointer ${
                        timerDurationMs === mins * 60 * 1000
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <ControlBar
                  status={status}
                  hasRecordedData={false}
                  soundEnabled={soundEnabled}
                  onStart={handleStart}
                  onPause={handlePause}
                  onResume={handleResume}
                  onReset={handleReset}
                  onLap={() => {}}
                  onToggleSound={toggleSound}
                />
              </div>
            )}
          </div>

          {/* Celestial Parameters & Theme Selector (Flexibility & Customization) */}
          <div className="mt-6 flex items-center gap-3 flex-wrap justify-center text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Sliders className="w-3.5 h-3.5" />
              <span>Corpo Celeste:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
              {(
                [
                  { id: 'earth', label: 'Terra' },
                  { id: 'mars', label: 'Marte' },
                  { id: 'gas_giant', label: 'Gigante Anéis' },
                  { id: 'quantum_cyan', label: 'Ciano Quântico' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlanetTheme(p.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    planetTheme === p.id
                      ? 'bg-slate-800 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <span className="text-slate-700">·</span>

            <span className="text-slate-500">Velocidade da Translação:</span>
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800 font-mono-tabular">
              {[10, 30, 60, 300].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setOrbitSpeedSec(sec)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    orbitSpeedSec === sec
                      ? 'bg-slate-800 text-cyan-300 font-medium'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Laps Table (when in Stopwatch mode) */}
        {mode === 'stopwatch' && (
          <LapsTable
            laps={laps}
            onClearLaps={handleClearLaps}
            onCopyLaps={handleCopyLaps}
          />
        )}

        {/* Event Setup Panel (when in Event Countdown mode) */}
        {mode === 'event' && (
          <EventCountdownSetup
            currentEvent={targetEvent}
            onSelectEvent={(evt) => {
              setTargetEvent(evt);
              showToast(`Contagem ajustada para: ${evt.title}`);
            }}
          />
        )}
      </main>

      {/* Footer conforming to Silicon Valley design rules (Quiet & Purposeful) */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>ÓRBITA · Relógio de Evento & Telemetria</span>
          <span>·</span>
          <span>Inspirado em Soluções do Vale do Silício</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHeuristicsModal(true)}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>10 Heurísticas de Nielsen</span>
          </button>
          <span>·</span>
          <span className="font-mono-tabular">Pressione [?] para ajuda</span>
        </div>
      </footer>

      {/* Toast Notification (Nielsen Heuristic #1: Visibility of system status) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 text-slate-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Heuristics Modal */}
      <HeuristicsModal
        isOpen={showHeuristicsModal}
        onClose={() => setShowHeuristicsModal(false)}
      />
    </div>
  );
}
