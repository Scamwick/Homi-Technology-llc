'use client';

import { useId, useMemo } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 * ThresholdCompass — The signature visual element of HōMI.
 *
 * Three concentric rings represent the three dimensions of decision readiness:
 *   Outer (cyan)    → Financial readiness
 *   Middle (emerald) → Emotional readiness
 *   Inner (yellow)  → Timing readiness
 *
 * When all three dimensions score ≥ 70, the keyhole center pulses — the
 * decision is unlocked. Harmonic alignment occurs every 60s (LCM 20,15,10).
 * ────────────────────────────────────────────────────────────────────────── */

export interface ThresholdCompassProps {
  /** Rendered size in pixels. Default: 200. */
  size?: number;
  /** Financial readiness score (0–100). Controls outer ring arc length. */
  financial?: number;
  /** Emotional readiness score (0–100). Controls middle ring arc length. */
  emotional?: number;
  /** Timing readiness score (0–100). Controls inner ring arc length. */
  timing?: number;
  /** Enable continuous ring rotation. Default: true. */
  animate?: boolean;
  /** Render the keyhole at center. Default: true. */
  showKeyhole?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/* ── Geometry constants ── */
const VB = 200;
const CX = 100;
const CY = 100;

const OUTER  = { r: 85, stroke: 'var(--cyan,  #22d3ee)', dotR: 3,   opacity: 0.6, dur: '20s', dir: 'normal'  } as const;
const MIDDLE = { r: 60, stroke: 'var(--emerald, #34d399)', dotR: 2.5, opacity: 0.7, dur: '15s', dir: 'reverse' } as const;
const INNER  = { r: 35, stroke: 'var(--yellow, #facc15)', dotR: 0,   opacity: 0.8, dur: '10s', dir: 'normal'  } as const;

/** Cardinal-point offsets for node dots (0°, 90°, 180°, 270°). */
const CARDINALS = [0, 90, 180, 270] as const;

function dotPosition(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function circumference(r: number) {
  return 2 * Math.PI * r;
}

/** Convert a 0–100 score to a strokeDasharray string. */
function arcDash(r: number, score: number | undefined): string | undefined {
  if (score === undefined) return undefined;
  const c = circumference(r);
  const visible = (Math.max(0, Math.min(100, score)) / 100) * c;
  return `${visible} ${c - visible}`;
}

/* ─────────────────────────────────────────────────────────────────────────── */

export function ThresholdCompass({
  size = 200,
  financial,
  emotional,
  timing,
  animate = true,
  showKeyhole = true,
  className,
}: ThresholdCompassProps) {
  const instanceId = useId();
  const filterId = `homi-ring-glow-${instanceId.replace(/:/g, '')}`;

  const isUnlocked = useMemo(
    () =>
      showKeyhole &&
      financial !== undefined &&
      emotional !== undefined &&
      timing !== undefined &&
      financial >= 70 &&
      emotional >= 70 &&
      timing >= 70,
    [financial, emotional, timing, showKeyhole],
  );

  const outerDash  = arcDash(OUTER.r,  financial);
  const middleDash = arcDash(MIDDLE.r, emotional);
  const innerDash  = arcDash(INNER.r,  timing);

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="HōMI Threshold Compass — decision readiness indicator"
      className={className}
    >
      {/* ── Inline styles (CSS animation keyframes) ── */}
      <style>{`
        @keyframes homi-spin-cw-20  { to { transform: rotate(360deg); } }
        @keyframes homi-spin-ccw-15 { to { transform: rotate(-360deg); } }
        @keyframes homi-spin-cw-10  { to { transform: rotate(360deg); } }
        @keyframes homi-keyhole-pulse {
          0%, 100% { filter: drop-shadow(0 0 4px var(--yellow, #facc15)); }
          50%      { filter: drop-shadow(0 0 14px var(--yellow, #facc15)) drop-shadow(0 0 28px rgba(250, 204, 21, 0.35)); }
        }
      `}</style>

      <defs>
        {/* Gaussian blur glow applied to all rings */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>

      {/* ═══════════════════════════════════════════════════════════════════
           OUTER RING — Financial (cyan)
         ═══════════════════════════════════════════════════════════════════ */}
      <g
        style={animate ? {
          transformOrigin: `${CX}px ${CY}px`,
          animation: `homi-spin-cw-20 ${OUTER.dur} linear infinite`,
        } : { transformOrigin: `${CX}px ${CY}px` }}
      >
        {/* Glow layer */}
        <circle
          cx={CX} cy={CY} r={OUTER.r}
          stroke={OUTER.stroke}
          strokeWidth={2}
          opacity={OUTER.opacity * 0.5}
          filter={`url(#${filterId})`}
          strokeDasharray={outerDash}
          strokeLinecap="round"
        />
        {/* Sharp ring */}
        <circle
          cx={CX} cy={CY} r={OUTER.r}
          stroke={OUTER.stroke}
          strokeWidth={2}
          opacity={OUTER.opacity}
          strokeDasharray={outerDash}
          strokeLinecap="round"
        />
        {/* Cardinal dots */}
        {CARDINALS.map((angle) => {
          const { x, y } = dotPosition(CX, CY, OUTER.r, angle);
          return (
            <circle
              key={`outer-${angle}`}
              cx={x} cy={y} r={OUTER.dotR}
              fill={OUTER.stroke}
              opacity={OUTER.opacity}
            />
          );
        })}
      </g>

      {/* ═══════════════════════════════════════════════════════════════════
           MIDDLE RING — Emotional (emerald)
         ═══════════════════════════════════════════════════════════════════ */}
      <g
        style={animate ? {
          transformOrigin: `${CX}px ${CY}px`,
          animation: `homi-spin-ccw-15 ${MIDDLE.dur} linear infinite`,
        } : { transformOrigin: `${CX}px ${CY}px` }}
      >
        <circle
          cx={CX} cy={CY} r={MIDDLE.r}
          stroke={MIDDLE.stroke}
          strokeWidth={2}
          opacity={MIDDLE.opacity * 0.5}
          filter={`url(#${filterId})`}
          strokeDasharray={middleDash}
          strokeLinecap="round"
        />
        <circle
          cx={CX} cy={CY} r={MIDDLE.r}
          stroke={MIDDLE.stroke}
          strokeWidth={2}
          opacity={MIDDLE.opacity}
          strokeDasharray={middleDash}
          strokeLinecap="round"
        />
        {CARDINALS.map((angle) => {
          const { x, y } = dotPosition(CX, CY, MIDDLE.r, angle);
          return (
            <circle
              key={`middle-${angle}`}
              cx={x} cy={y} r={MIDDLE.dotR}
              fill={MIDDLE.stroke}
              opacity={MIDDLE.opacity}
            />
          );
        })}
      </g>

      {/* ═══════════════════════════════════════════════════════════════════
           INNER RING — Timing (yellow)
         ═══════════════════════════════════════════════════════════════════ */}
      <g
        style={animate ? {
          transformOrigin: `${CX}px ${CY}px`,
          animation: `homi-spin-cw-10 ${INNER.dur} linear infinite`,
        } : { transformOrigin: `${CX}px ${CY}px` }}
      >
        <circle
          cx={CX} cy={CY} r={INNER.r}
          stroke={INNER.stroke}
          strokeWidth={2}
          opacity={INNER.opacity * 0.5}
          filter={`url(#${filterId})`}
          strokeDasharray={innerDash}
          strokeLinecap="round"
        />
        <circle
          cx={CX} cy={CY} r={INNER.r}
          stroke={INNER.stroke}
          strokeWidth={2}
          opacity={INNER.opacity}
          strokeDasharray={innerDash}
          strokeLinecap="round"
        />
      </g>

      {/* ═══════════════════════════════════════════════════════════════════
           KEYHOLE CENTER
           Outer stroke circle → body rect → inner filled circle + rect
         ═══════════════════════════════════════════════════════════════════ */}
      {showKeyhole && (
        <g
          style={isUnlocked ? {
            animation: 'homi-keyhole-pulse 2.5s ease-in-out infinite',
          } : undefined}
        >
          {/* Outer keyhole circle (stroke only) */}
          <circle
            cx={100} cy={96} r={12}
            stroke="var(--yellow, #facc15)"
            strokeWidth={2}
            fill="none"
          />
          {/* Body rectangle (stroke only) */}
          <rect
            x={94} y={104} width={12} height={16} rx={2}
            stroke="var(--yellow, #facc15)"
            strokeWidth={2}
            fill="none"
          />
          {/* Inner filled circle */}
          <circle
            cx={100} cy={96} r={5}
            fill="var(--yellow, #facc15)"
          />
          {/* Inner filled rectangle */}
          <rect
            x={97} y={96} width={6} height={12}
            fill="var(--yellow, #facc15)"
          />
        </g>
      )}
    </svg>
  );
}

export default ThresholdCompass;
