import { FC } from 'react';
import { LunchStatus } from '../types';
import { LunchSliceState } from '../utils/lunchTimer';

interface PizzaPlateProps {
  slices: LunchSliceState[];
  formattedTime: string;
  status: LunchStatus;
  rotationDeg: number;
  prefersReducedMotion: boolean;
  elapsedProgress: number;
}

const CX = 230;
const CY = 230;

// Convert polar (angle in degrees where 0 is 12 o'clock, clockwise) to SVG cartesian
function polarToXY(radius: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

// Create a pizza wedge SVG path from innerRadius to outerRadius between startAngle and endAngle
function describeAnnularSector(
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToXY(outerR, startAngle);
  const outerEnd = polarToXY(outerR, endAngle);
  if (innerR <= 0) {
    return [
      `M ${CX} ${CY}`,
      `L ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
      `A ${outerR} ${outerR} 0 0 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
      'Z',
    ].join(' ');
  }
  const innerStart = polarToXY(innerR, startAngle);
  const innerEnd = polarToXY(innerR, endAngle);
  return [
    `M ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    `L ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 0 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 0 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// Deterministic ceramic plate speckles
const PLATE_SPECKLES = [
  { x: 112, y: 120, r: 1.1, o: 0.25 },
  { x: 315, y: 98, r: 1.4, o: 0.22 },
  { x: 356, y: 175, r: 1.0, o: 0.28 },
  { x: 342, y: 295, r: 1.3, o: 0.22 },
  { x: 270, y: 368, r: 1.2, o: 0.26 },
  { x: 158, y: 355, r: 1.1, o: 0.24 },
  { x: 96, y: 268, r: 1.4, o: 0.2 },
  { x: 95, y: 185, r: 1.0, o: 0.25 },
  { x: 190, y: 82, r: 1.2, o: 0.2 },
  { x: 280, y: 155, r: 1.1, o: 0.22 },
  { x: 150, y: 225, r: 1.3, o: 0.2 },
  { x: 245, y: 312, r: 1.0, o: 0.24 },
  { x: 300, y: 240, r: 1.2, o: 0.22 },
  { x: 182, y: 305, r: 1.1, o: 0.2 },
];

// Deterministic crumbs per slice sector (revealed underneath as slices are eaten)
const SECTOR_CRUMBS = Array.from({ length: 8 }, (_, sector) => {
  const baseAngle = sector * 45 + 10;
  return [
    { ...polarToXY(104, baseAngle + 4), r: 2.3, color: '#D38B3E' },
    { ...polarToXY(128, baseAngle + 17), r: 1.6, color: '#B46825' },
    { ...polarToXY(146, baseAngle + 8), r: 2.7, color: '#DFA04E' },
    { ...polarToXY(158, baseAngle + 23), r: 1.4, color: '#5A7836' }, // oregano fleck
    { ...polarToXY(118, baseAngle + 28), r: 1.9, color: '#C8782B' },
    { ...polarToXY(166, baseAngle + 14), r: 1.5, color: '#9E541A' },
  ];
});

// Bite circle definitions in local slice coordinates (slice centered around angle 22.5 deg)
const BITE_CIRCLES = [
  { threshold: 0.06, rDist: 86, angleOffset: 15, radius: 26 },
  { threshold: 0.22, rDist: 96, angleOffset: 30, radius: 30 },
  { threshold: 0.42, rDist: 118, angleOffset: 20, radius: 35 },
  { threshold: 0.62, rDist: 142, angleOffset: 14, radius: 38 },
  { threshold: 0.80, rDist: 160, angleOffset: 30, radius: 42 },
  { threshold: 0.94, rDist: 174, angleOffset: 22.5, radius: 58 },
];

export const PizzaPlate: FC<PizzaPlateProps> = ({
  slices,
  formattedTime,
  status,
  rotationDeg,
  prefersReducedMotion,
  elapsedProgress,
}) => {
  const isFinished = status === 'finished';
  const showArrows = !isFinished && !prefersReducedMotion;

  return (
    <div
      className="relative w-full max-w-[320px] sm:max-w-[376px] aspect-square mx-auto flex items-center justify-center select-none"
      data-testid="pizza-stage"
      data-status={status}
    >
      {/* Main SVG: Fixed Ceramic Plate + Rotating 8-Slice Pizza */}
      <svg
        viewBox="0 0 460 460"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label={
          isFinished
            ? 'Prato de cerâmica vazio com migalhas de pizza'
            : `Pizza dividida em 8 fatias sobre prato de cerâmica, tempo restante ${formattedTime}`
        }
      >
        <defs>
          {/* Soft warm ceramic plate drop shadow */}
          <filter id="plateShadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#5C3A21" floodOpacity="0.18" />
          </filter>

          {/* Subtle pizza drop shadow onto plate */}
          <filter id="pizzaShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#4A2B13" floodOpacity="0.22" />
          </filter>

          {/* Stoneware ceramic plate radial gradient */}
          <radialGradient id="plateSurface" cx="46%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#FBF4E8" />
            <stop offset="78%" stopColor="#F2E3CD" />
            <stop offset="94%" stopColor="#E4CEB2" />
            <stop offset="100%" stopColor="#D4BA98" />
          </radialGradient>

          {/* Plate inner well shadow */}
          <radialGradient id="plateInnerWell" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="#F4E7D4" stopOpacity="0" />
            <stop offset="96%" stopColor="#C9AD89" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#B89872" stopOpacity="0.12" />
          </radialGradient>

          {/* Artisan crust gradient (concentric around pizza center) */}
          <radialGradient
            id="crustGradient"
            gradientUnits="userSpaceOnUse"
            cx={CX}
            cy={CY}
            r="175"
          >
            <stop offset="82%" stopColor="#B86420" />
            <stop offset="88%" stopColor="#E4A252" />
            <stop offset="95%" stopColor="#D68232" />
            <stop offset="100%" stopColor="#944816" />
          </radialGradient>

          {/* Melted cheese radial gradient (concentric around pizza center) */}
          <radialGradient
            id="cheeseGradient"
            gradientUnits="userSpaceOnUse"
            cx={CX}
            cy={CY}
            r="146"
          >
            <stop offset="0%" stopColor="#FCE9AE" />
            <stop offset="72%" stopColor="#F8D984" />
            <stop offset="94%" stopColor="#F2C864" />
            <stop offset="100%" stopColor="#E3A548" />
          </radialGradient>

          {/* Dynamic Bite Masks for each of the 8 slices */}
          {slices.map((slice) => {
            const startAngle = slice.index * 45 + 0.7;
            return (
              <mask key={`mask-${slice.index}`} id={`slice-bite-mask-${slice.index}`}>
                <rect x="0" y="0" width="460" height="460" fill="white" />
                {slice.status === 'biting' &&
                  BITE_CIRCLES.map((bite, bIdx) => {
                    const isBitten = slice.biteProgress >= bite.threshold;
                    const pos = polarToXY(bite.rDist, startAngle + bite.angleOffset);
                    return (
                      <circle
                        key={bIdx}
                        cx={pos.x}
                        cy={pos.y}
                        r={isBitten ? bite.radius : 0}
                        fill="black"
                        style={{
                          transition: prefersReducedMotion
                            ? 'none'
                            : 'r 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                    );
                  })}
              </mask>
            );
          })}
        </defs>

        {/* LAYER 1: FIXED CERAMIC PLATE */}
        <g filter="url(#plateShadow)">
          {/* Outer plate body */}
          <circle cx={CX} cy={CY} r="204" fill="url(#plateSurface)" stroke="#DFC7A9" strokeWidth="1.5" />
          {/* Inner rim contour */}
          <circle cx={CX} cy={CY} r="184" fill="url(#plateInnerWell)" stroke="#E3CEB4" strokeWidth="1" />
          {/* Stoneware speckles */}
          {PLATE_SPECKLES.map((sp, i) => (
            <circle key={i} cx={sp.x} cy={sp.y} r={sp.r} fill="#9C7B58" opacity={sp.o} />
          ))}
        </g>

        {/* LAYER 2: CRUMBS ON FIXED PLATE (naturally revealed when slices are bitten/eaten or finished) */}
        <g
          opacity={isFinished ? 1 : elapsedProgress > 0.01 ? Math.min(1, 0.45 + elapsedProgress * 0.55) : 0}
          style={{ transition: 'opacity 0.4s ease' }}
        >
          {SECTOR_CRUMBS.flatMap((crumbs, sIdx) =>
            crumbs.map((c, cIdx) => (
              <circle
                key={`crumb-${sIdx}-${cIdx}`}
                cx={c.x}
                cy={c.y}
                r={c.r}
                fill={c.color}
                opacity={0.85}
              />
            ))
          )}
        </g>

        {/* LAYER 3: CURVED OLIVE ROTATION ARROWS (FIXED OUTSIDE PLATE) */}
        {showArrows && (
          <g fill="none" stroke="#858E63" strokeWidth="2.2" strokeLinecap="round" opacity="0.85">
            {/* Top-left clockwise arrow */}
            <path d="M 18 148 A 222 222 0 0 1 92 40" />
            <path d="M 80 39 L 94 39 L 90 52" fill="none" strokeLinejoin="round" />

            {/* Bottom-right clockwise arrow */}
            <path d="M 442 312 A 222 222 0 0 1 368 420" />
            <path d="M 380 421 L 366 421 L 370 408" fill="none" strokeLinejoin="round" />
          </g>
        )}

        {/* LAYER 4: ROTATING 8-SLICE PIZZA GROUP */}
        {!isFinished && (
          <g
            data-testid="rotating-pizza"
            filter="url(#pizzaShadow)"
            style={{
              transform: `rotate(${prefersReducedMotion ? 0 : rotationDeg}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
            }}
          >
            {slices.map((slice) => {
              if (slice.status === 'eaten') return null;

              const startAngle = slice.index * 45 + 0.8;
              const endAngle = (slice.index + 1) * 45 - 0.8;
              const midAngle = (startAngle + endAngle) / 2;

              // Deterministic topping coordinates per slice
              const tomatoRadius = slice.index % 2 === 0 ? 122 : 114;
              const tomatoPos = polarToXY(tomatoRadius, midAngle - (slice.index % 2 === 0 ? 5 : -5));
              const secondTomatoPos = polarToXY(134, midAngle + (slice.index % 2 === 0 ? 9 : -8));

              const basilPos = polarToXY(slice.index % 2 === 0 ? 105 : 126, midAngle + (slice.index % 2 === 0 ? 6 : -4));
              const basilAngle = midAngle + (slice.index % 2 === 0 ? 25 : -35);

              const blister1 = polarToXY(163, startAngle + 12);
              const blister2 = polarToXY(167, startAngle + 31);
              const cheesePocket = polarToXY(130, midAngle - 8);
              const oregano1 = polarToXY(112, midAngle + 8);
              const oregano2 = polarToXY(138, midAngle - 3);
              const oregano3 = polarToXY(96, midAngle - 4);

              return (
                <g
                  key={slice.index}
                  data-testid={`pizza-slice-${slice.index}`}
                  data-slice-state={slice.status}
                  mask={`url(#slice-bite-mask-${slice.index})`}
                >
                  {/* Slice crust rim */}
                  <path
                    d={describeAnnularSector(148, 175, startAngle, endAngle)}
                    fill="url(#crustGradient)"
                  />
                  {/* Crust toasted blisters */}
                  <circle cx={blister1.x} cy={blister1.y} r="4.5" fill="#7D3B12" opacity="0.55" />
                  <circle cx={blister2.x} cy={blister2.y} r="3.5" fill="#6F310D" opacity="0.5" />

                  {/* Rich tomato sauce rim */}
                  <path
                    d={describeAnnularSector(0, 152, startAngle, endAngle)}
                    fill="#C93F27"
                  />

                  {/* Melted mozzarella cheese layer */}
                  <path
                    d={describeAnnularSector(0, 146, startAngle + 0.5, endAngle - 0.5)}
                    fill="url(#cheeseGradient)"
                  />

                  {/* Golden melted cheese spot */}
                  <circle cx={cheesePocket.x} cy={cheesePocket.y} r="9" fill="#E39D3B" opacity="0.45" />

                  {/* Cherry tomato slice 1 */}
                  <g transform={`translate(${tomatoPos.x}, ${tomatoPos.y})`}>
                    <circle r="13.5" fill="#C9331E" />
                    <circle r="11" fill="#E45339" />
                    <circle cx="-3" cy="-2" r="2.2" fill="#FBE5A4" opacity="0.85" />
                    <circle cx="3" cy="2.5" r="2" fill="#FBE5A4" opacity="0.85" />
                    <circle cx="2" cy="-3.5" r="1.5" fill="#FBE5A4" opacity="0.75" />
                  </g>

                  {/* Smaller cherry tomato half on outer zone */}
                  <g transform={`translate(${secondTomatoPos.x}, ${secondTomatoPos.y})`}>
                    <circle r="9.5" fill="#CE3721" />
                    <circle r="7.4" fill="#EB6045" />
                    <circle cx="-2" cy="1" r="1.5" fill="#FBE5A4" opacity="0.8" />
                  </g>

                  {/* Fresh basil leaf */}
                  <g transform={`translate(${basilPos.x}, ${basilPos.y}) rotate(${basilAngle})`}>
                    <path
                      d="M 0 -13 C 8 -7 9 6 0 13 C -9 6 -8 -7 0 -13 Z"
                      fill="#4B752C"
                    />
                    <path
                      d="M 0 -10 L 0 10"
                      stroke="#7BA550"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Oregano flecks */}
                  <circle cx={oregano1.x} cy={oregano1.y} r="1.3" fill="#4E682A" opacity="0.8" />
                  <circle cx={oregano2.x} cy={oregano2.y} r="1.1" fill="#4E682A" opacity="0.75" />
                  <circle cx={oregano3.x} cy={oregano3.y} r="1.2" fill="#4E682A" opacity="0.75" />
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* LAYER 5: FIXED CENTER COUNTDOWN BADGE */}
      {!isFinished ? (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-live="off"
        >
          <div className="w-[132px] h-[132px] sm:w-[154px] sm:h-[154px] rounded-full bg-[#FAF3E7] border border-[#E5D5BE] shadow-[0_8px_24px_rgba(59,33,20,0.22)] flex flex-col items-center justify-center">
            {/* Three olive-green accent strokes above the clock */}
            <svg width="34" height="14" viewBox="0 0 34 14" className="mb-0.5" aria-hidden="true">
              <line x1="7" y1="11" x2="4" y2="4" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="17" y1="10" x2="17" y2="2" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="27" y1="11" x2="30" y2="4" stroke="#7E8859" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <span
              data-testid="lunch-clock-display"
              className="font-serif-display tabular-digits text-[32px] sm:text-[38px] font-bold leading-none text-[#3B2114] tracking-tight"
            >
              {formattedTime}
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#5C3D2E] mt-1">
              restantes
            </span>
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-live="polite"
        >
          <div className="flex flex-col items-center justify-center">
            <svg width="38" height="16" viewBox="0 0 38 16" className="mb-1" aria-hidden="true">
              <line x1="8" y1="12" x2="4" y2="4" stroke="#7E8859" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="19" y1="11" x2="19" y2="2" stroke="#7E8859" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="30" y1="12" x2="34" y2="4" stroke="#7E8859" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
            <span
              data-testid="lunch-clock-display"
              className="font-serif-display tabular-digits text-4xl sm:text-5xl font-bold leading-none text-[#3B2114] tracking-tight"
            >
              00:00
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
