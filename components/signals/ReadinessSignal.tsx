'use client';

import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TemperatureState = 'cool' | 'warm' | 'warm+' | 'hot';

export interface ReadinessSignalProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Temperature config
// ---------------------------------------------------------------------------

interface TempConfig {
  label: string;
  color: string;
  glowColor: string;
  pulseSpeed: number;
}

const TEMP_MAP: Record<TemperatureState, TempConfig> = {
  cool: {
    label: 'Cool',
    color: 'var(--emerald, #34d399)',
    glowColor: 'rgba(52, 211, 153, 0.6)',
    pulseSpeed: 2.4,
  },
  warm: {
    label: 'Warm',
    color: 'var(--yellow, #facc15)',
    glowColor: 'rgba(250, 204, 21, 0.5)',
    pulseSpeed: 0, // steady — no pulse
  },
  'warm+': {
    label: 'Warm+',
    color: 'var(--homi-amber, #fb923c)',
    glowColor: 'rgba(251, 146, 60, 0.55)',
    pulseSpeed: 1.6,
  },
  hot: {
    label: 'Hot',
    color: 'var(--homi-crimson, #ef4444)',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    pulseSpeed: 1.0,
  },
} as const;

const SIZE_MAP = {
  sm: { dot: 8, fontSize: 0, gap: 0 },
  md: { dot: 12, fontSize: 12, gap: 6 },
  lg: { dot: 16, fontSize: 13, gap: 8 },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function scoreToTemperature(score: number): TemperatureState {
  if (score >= 80) return 'cool';
  if (score >= 65) return 'warm';
  if (score >= 50) return 'warm+';
  return 'hot';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReadinessSignal({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
  className = '',
}: ReadinessSignalProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const temp = scoreToTemperature(clamped);
  const config = TEMP_MAP[temp];
  const s = SIZE_MAP[size];

  const shouldPulse = animated && config.pulseSpeed > 0;

  return (
    <motion.div
      className={`inline-flex items-center ${className}`}
      style={{ gap: s.gap }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' as const }}
      role="status"
      aria-label={`Readiness: ${config.label}${size === 'lg' ? `, score ${clamped}` : ''}`}
    >
      {/* Dot with glow */}
      <span className="relative inline-flex flex-shrink-0">
        {/* Pulse ring */}
        {shouldPulse && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              width: s.dot,
              height: s.dot,
              backgroundColor: config.glowColor,
            }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{
              duration: config.pulseSpeed,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        )}
        {/* Solid dot */}
        <span
          className="relative block rounded-full"
          style={{
            width: s.dot,
            height: s.dot,
            backgroundColor: config.color,
            boxShadow: `0 0 ${s.dot}px ${config.glowColor}`,
          }}
        />
      </span>

      {/* Label (md / lg only) */}
      {showLabel && s.fontSize > 0 && (
        <span
          className="font-semibold tracking-wide whitespace-nowrap"
          style={{
            fontSize: s.fontSize,
            color: config.color,
            lineHeight: 1,
          }}
        >
          {config.label}
        </span>
      )}

      {/* Score (lg only) */}
      {size === 'lg' && (
        <span
          className="font-bold tabular-nums"
          style={{
            fontSize: s.fontSize,
            color: 'var(--text-primary, #e2e8f0)',
            lineHeight: 1,
          }}
        >
          {clamped}
        </span>
      )}
    </motion.div>
  );
}
