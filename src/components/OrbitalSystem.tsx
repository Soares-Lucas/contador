import { useMemo, FC, ReactNode } from 'react';
import { PlanetTheme, TimerStatus } from '../types';

interface OrbitalSystemProps {
  elapsedMs: number;
  status: TimerStatus;
  theme: PlanetTheme;
  orbitPeriodMs?: number; // Time for 1 full 360 revolution in ms (default 60000ms = 60s)
  children: ReactNode;
}

export const OrbitalSystem: FC<OrbitalSystemProps> = ({
  elapsedMs,
  status,
  theme,
  orbitPeriodMs = 60000,
  children,
}) => {
  // Calculate current orbital angle in radians & degrees
  // 1 full revolution = orbitPeriodMs
  const revolutions = Math.floor(elapsedMs / orbitPeriodMs);
  const currentLapMs = elapsedMs % orbitPeriodMs;
  const progressRatio = currentLapMs / orbitPeriodMs;
  
  // Angle: 0 starts at top (-90 deg), moves clockwise
  const angleRad = useMemo(() => {
    return progressRatio * 2 * Math.PI - Math.PI / 2;
  }, [progressRatio]);

  const angleDeg = useMemo(() => {
    const deg = Math.round((progressRatio * 360));
    return deg;
  }, [progressRatio]);

  // Elliptical orbit geometry (responsive box: 1000 x 600)
  // X-radius (horizontal width) = 380, Y-radius (vertical depth) = 170 for a natural Keplerian 3D orbital tilt
  const rx = 360;
  const ry = 160;
  const cx = 500;
  const cy = 250;

  const planetX = cx + rx * Math.cos(angleRad);
  const planetY = cy + ry * Math.sin(angleRad);

  // Z-depth simulation: when planetY > cy, planet is in front (scale 1.15, higher z-index, brighter glow)
  // when planetY < cy, planet is behind the timer (scale 0.85, lower z-index, slightly dimmed)
  const isForeground = planetY >= cy;
  const depthScale = isForeground 
    ? 0.95 + 0.25 * ((planetY - cy) / ry) 
    : 0.95 - 0.2 * ((cy - planetY) / ry);
  const planetOpacity = isForeground ? 1 : 0.75;

  // Theme styling for the orbiting planet
  const planetVisuals = useMemo(() => {
    switch (theme) {
      case 'mars':
        return {
          name: 'Marte',
          colorCore: '#ef4444',
          colorAtmosphere: 'rgba(239, 68, 68, 0.35)',
          colorGlow: '#f97316',
          hasRings: false,
          gradient: 'from-orange-500 via-red-600 to-amber-900',
          satelliteColor: '#d6d3d1'
        };
      case 'gas_giant':
        return {
          name: 'Gigante dos Anéis',
          colorCore: '#f59e0b',
          colorAtmosphere: 'rgba(245, 158, 11, 0.35)',
          colorGlow: '#fbbf24',
          hasRings: true,
          gradient: 'from-amber-300 via-amber-600 to-stone-900',
          satelliteColor: '#fef08a'
        };
      case 'quantum_cyan':
        return {
          name: 'Ciano Quântico',
          colorCore: '#06b6d4',
          colorAtmosphere: 'rgba(6, 182, 212, 0.45)',
          colorGlow: '#38bdf8',
          hasRings: false,
          gradient: 'from-cyan-300 via-sky-500 to-indigo-950',
          satelliteColor: '#bae6fd'
        };
      case 'earth':
      default:
        return {
          name: 'Terra',
          colorCore: '#3b82f6',
          colorAtmosphere: 'rgba(59, 130, 246, 0.4)',
          colorGlow: '#60a5fa',
          hasRings: false,
          gradient: 'from-sky-400 via-blue-600 to-slate-900',
          satelliteColor: '#e2e8f0'
        };
    }
  }, [theme]);

  // Satellite (mini moon) coordinates relative to the planet
  // Satellite revolves faster (e.g. 4x faster around the planet)
  const moonAngle = (elapsedMs / 5000) * 2 * Math.PI;
  const moonX = Math.cos(moonAngle) * 32;
  const moonY = Math.sin(moonAngle) * 14;

  return (
    <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center min-h-[440px] md:min-h-[500px] select-none">
      {/* SVG Canvas for Celestial Orbital Geometry */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Orbital path gradient */}
          <linearGradient id="orbitalPathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
          </linearGradient>

          {/* Central gravitational field gradient */}
          <radialGradient id="gravityField" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#07090e" stopOpacity="0" />
          </radialGradient>

          {/* Planet glow filter */}
          <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Gravitational Core Glow */}
        <ellipse cx={cx} cy={cy} rx={rx * 0.75} ry={ry * 0.75} fill="url(#gravityField)" />

        {/* Background Semi-Orbit (drawn behind center when planet is behind) */}
        {!isForeground && (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="url(#orbitalPathGradient)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="transition-opacity duration-300"
          />
        )}

        {/* Outer Gravitational Resonance Ring */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx + 45}
          ry={ry + 22}
          fill="none"
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth="1"
          strokeDasharray="2 12"
        />

        {/* Inner Gravitational Resonance Ring */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx - 45}
          ry={ry - 20}
          fill="none"
          stroke="rgba(148, 163, 184, 0.06)"
          strokeWidth="1"
        />

        {/* Cardinal Keplerian Orbital Markers */}
        {/* Apoastro / Apogee (Top) */}
        <line x1={cx} y1={cy - ry - 8} x2={cx} y2={cy - ry + 8} stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.5" />
        <text x={cx} y={cy - ry - 14} textAnchor="middle" fill="#64748b" fontSize="10" className="font-mono-tabular uppercase tracking-wider">
          Apoastro (0°)
        </text>

        {/* Periastro / Perigee (Bottom) */}
        <line x1={cx} y1={cy + ry - 8} x2={cx} y2={cy + ry + 8} stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.5" />
        <text x={cx} y={cy + ry + 22} textAnchor="middle" fill="#64748b" fontSize="10" className="font-mono-tabular uppercase tracking-wider">
          Periastro (180°)
        </text>

        {/* Equinócio Leste / West Nodes */}
        <line x1={cx - rx - 8} y1={cy} x2={cx - rx + 8} y2={cy} stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.5" />
        <line x1={cx + rx - 8} y1={cy} x2={cx + rx + 8} y2={cy} stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.5" />

        {/* Foreground Orbit Arc (drawn if foreground for seamless depth) */}
        {isForeground && (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="url(#orbitalPathGradient)"
            strokeWidth="1.75"
            strokeDasharray="4 6"
          />
        )}

        {/* BEHIND-STAGE PLANET RENDER (when planet is in upper orbit behind timer) */}
        {!isForeground && (
          <g
            transform={`translate(${planetX}, ${planetY}) scale(${depthScale})`}
            opacity={planetOpacity}
            filter="url(#planetGlow)"
          >
            {/* Atmosphere glow circle */}
            <circle r="26" fill={planetVisuals.colorAtmosphere} />
            {/* Planetary Body */}
            <circle r="18" fill={planetVisuals.colorCore} />
            {/* Shading overlay simulating sunlight from front */}
            <circle
              r="18"
              fill="black"
              opacity="0.35"
              clipPath="url(#planetClip)"
            />
            {/* Optional Planetary Rings */}
            {planetVisuals.hasRings && (
              <ellipse rx="36" ry="10" fill="none" stroke={planetVisuals.colorGlow} strokeWidth="3" opacity="0.6" transform="rotate(-18)" />
            )}
            {/* Orbiting Moon */}
            <circle cx={moonX} cy={moonY} r="3" fill={planetVisuals.satelliteColor} />
          </g>
        )}
      </svg>

      {/* CENTRAL CORE: The Primary Data Display */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4">
        {children}
      </div>

      {/* FOREGROUND-STAGE PLANET RENDER (when planet is in lower orbit in front of timer) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid meet"
      >
        {isForeground && (
          <g
            transform={`translate(${planetX}, ${planetY}) scale(${depthScale})`}
            opacity={planetOpacity}
            filter="url(#planetGlow)"
          >
            {/* Atmospheric Outer Corona */}
            <circle r="30" fill={planetVisuals.colorAtmosphere} />
            <circle r="22" fill={planetVisuals.colorCore} />
            {/* 3D Spherical Specular Light */}
            <circle cx="-6" cy="-6" r="6" fill="#ffffff" opacity="0.4" />
            {/* Planetary Rings */}
            {planetVisuals.hasRings && (
              <ellipse rx="44" ry="12" fill="none" stroke={planetVisuals.colorGlow} strokeWidth="3.5" opacity="0.8" transform="rotate(-18)" />
            )}
            {/* Satellite Moon */}
            <g transform={`translate(${moonX}, ${moonY})`}>
              <circle r="4" fill={planetVisuals.satelliteColor} />
              <circle r="7" fill={planetVisuals.colorAtmosphere} opacity="0.5" />
            </g>
          </g>
        )}
      </svg>

      {/* Real-time Orbital Telemetry Ribbon (Silicon Valley Aerospace HUD) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 text-xs font-mono-tabular text-slate-400 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-800 whitespace-nowrap select-none">
        <span className="flex items-center gap-1.5 text-slate-300 min-w-[110px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Corpo: {planetVisuals.name}</span>
        </span>
        <span className="text-slate-600">·</span>
        <span className="inline-block min-w-[85px] tabular-nums text-left">
          Posição: {angleDeg}°
        </span>
        <span className="text-slate-600">·</span>
        <span className="inline-block min-w-[95px] tabular-nums text-left">
          Revoluções: {revolutions}
        </span>
        <span className="text-slate-600">·</span>
        <span className={`inline-block min-w-[105px] text-left ${status === 'running' ? 'text-emerald-400' : status === 'paused' ? 'text-amber-400' : 'text-slate-500'}`}>
          {status === 'running' ? '● Em Translação' : status === 'paused' ? '❚❚ Estacionário' : '○ Órbita Zero'}
        </span>
      </div>
    </div>
  );
};
