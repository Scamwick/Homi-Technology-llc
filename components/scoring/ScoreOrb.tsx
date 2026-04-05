'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScoreOrbProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showLabel?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIZE_MAP = {
  sm: 80,
  md: 160,
  lg: 240,
} as const;

const FONT_SCALE = {
  sm: { number: 24, label: 10 },
  md: { number: 48, label: 14 },
  lg: { number: 72, label: 18 },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps a 0-100 score to a brand HSL color string.
 *  0-49  -> crimson  hsl(12, 88%, 55%)   #ef4444
 *  50-64 -> amber    hsl(37, 95%, 59%)   #fb923c
 *  65-79 -> yellow   hsl(48, 96%, 53%)   #facc15
 *  80-100-> emerald  hsl(155, 63%, 52%)  #34d399
 */
function scoreToColor(score: number): string {
  if (score < 50) return 'hsl(12, 88%, 55%)';
  if (score < 65) return 'hsl(37, 95%, 59%)';
  if (score < 80) return 'hsl(48, 96%, 53%)';
  return 'hsl(155, 63%, 52%)';
}

function scoreToVerdict(score: number): string {
  if (score >= 80) return 'Ready';
  if (score >= 65) return 'Almost There';
  if (score >= 50) return 'Build First';
  return 'Not Yet';
}

function scoreToGlow(score: number): string {
  if (score < 50) return 'rgba(239, 68, 68, 0.45)';
  if (score < 65) return 'rgba(251, 146, 60, 0.4)';
  if (score < 80) return 'rgba(250, 204, 21, 0.35)';
  return 'rgba(52, 211, 153, 0.4)';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScoreOrb({
  score,
  size = 'md',
  animate = true,
  showLabel = false,
  className = '',
}: ScoreOrbProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const px = SIZE_MAP[size];
  const fonts = FONT_SCALE[size];
  const color = scoreToColor(clamped);
  const glow = scoreToGlow(clamped);
  const verdict = scoreToVerdict(clamped);

  // Spring-driven counter (0 -> score over ~2s ease-out)
  const spring = useSpring(0, { stiffness: 40, damping: 20, mass: 1 });
  const displayed = useTransform(spring, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(animate ? 0 : clamped);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (animate && !hasAnimated.current) {
      hasAnimated.current = true;
      spring.set(clamped);
    } else if (!animate) {
      spring.jump(clamped);
    }
  }, [animate, clamped, spring]);

  useEffect(() => {
    const unsub = displayed.on('change', (v) => setDisplayValue(v));
    return unsub;
  }, [displayed]);

  // Update when score changes after initial animation
  useEffect(() => {
    if (hasAnimated.current) {
      spring.set(clamped);
    }
  }, [clamped, spring]);

  // Ring stroke length for the progress arc
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 6;
  const radius = px / 2 - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (clamped / 100) * circumference;

  // Unique IDs for SVG gradients to avoid collisions when multiple orbs render
  const uid = useId().replace(/:/g, '');

  return (
    <div
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      role="figure"
      aria-label={`HōMI-Score: ${clamped} out of 100. Verdict: ${verdict}`}
    >
      <motion.div
        className="relative"
        style={{ width: px, height: px }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' as const }}
      >
        {/* Glow layer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 ${px * 0.35}px ${glow}` }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const }}
        />

        {/* SVG ring + rotating gradient */}
        <svg
          width={px}
          height={px}
          viewBox={`0 0 ${px} ${px}`}
          className="absolute inset-0"
        >
          <defs>
            {/* Rotating conic-style gradient behind the number */}
            <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.08" />
              <stop offset="50%" stopColor={color} stopOpacity="0.02" />
              <stop offset="100%" stopColor={color} stopOpacity="0.08" />
            </linearGradient>

            {/* Gradient for the progress arc */}
            <linearGradient id={`${uid}-arc`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Filled background circle */}
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius + strokeWidth}
            fill={`url(#${uid}-bg)`}
          />

          {/* Track ring (faint) */}
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke="var(--slate, #1e293b)"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <motion.circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke={`url(#${uid}-arc)`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: animate ? 2 : 0, ease: 'easeInOut' as const }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
          />
        </svg>

        {/* Rotating gradient disc (subtle background effect) */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-[0.07]"
          style={{
            background: `conic-gradient(from 0deg, ${color}, transparent 40%, ${color} 60%, transparent)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
        />

        {/* Center number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold tabular-nums tracking-tight"
            style={{
              fontSize: fonts.number,
              color,
              textShadow: `0 0 ${fonts.number * 0.4}px ${glow}`,
              lineHeight: 1,
            }}
          >
            {displayValue}
          </span>
        </div>
      </motion.div>

      {/* Verdict label */}
      {showLabel && (
        <motion.span
          className="font-semibold tracking-wide uppercase"
          style={{
            fontSize: fonts.label,
            color,
            letterSpacing: '0.08em',
          }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animate ? 1.6 : 0, duration: 0.4 }}
        >
          {verdict}
        </motion.span>
      )}
    </div>
  );
}
