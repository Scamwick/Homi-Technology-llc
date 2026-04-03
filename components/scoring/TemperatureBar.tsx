'use client';

import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TemperatureBarProps {
  score: number;
  showMarker?: boolean;
  showLabels?: boolean;
  height?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THRESHOLDS = [
  { value: 50, label: '50' },
  { value: 65, label: '65' },
  { value: 80, label: '80' },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function markerColor(score: number): string {
  if (score < 50) return '#ef4444';
  if (score < 65) return '#fb923c';
  if (score < 80) return '#facc15';
  return '#34d399';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TemperatureBar({
  score,
  showMarker = true,
  showLabels = false,
  height = 8,
  className = '',
}: TemperatureBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const pct = `${clamped}%`;
  const color = markerColor(clamped);

  return (
    <div
      className={`w-full ${className}`}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Temperature score: ${clamped} out of 100`}
    >
      {/* Bar container */}
      <div className="relative" style={{ height: showMarker ? height + 16 : height }}>
        {/* Gradient track */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height,
            background: 'var(--gradient-temperature, linear-gradient(90deg, #34d399 0%, #facc15 33%, #fb923c 66%, #ef4444 100%))',
          }}
        />

        {/* Score marker */}
        {showMarker && (
          <motion.div
            className="absolute flex flex-col items-center"
            style={{
              top: 0,
              left: pct,
              transform: 'translateX(-50%)',
            }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: 'easeInOut' as const }}
          >
            {/* Marker dot */}
            <div
              className="rounded-full border-2"
              style={{
                width: height + 8,
                height: height + 8,
                marginTop: -(height + 8 - height) / 2,
                backgroundColor: color,
                borderColor: 'var(--navy, #0a1628)',
                boxShadow: `0 0 8px ${color}66`,
              }}
            />
            {/* Score label below dot */}
            <span
              className="mt-1 text-xs font-semibold tabular-nums"
              style={{ color, fontSize: 10 }}
            >
              {Math.round(clamped)}
            </span>
          </motion.div>
        )}
      </div>

      {/* Threshold labels */}
      {showLabels && (
        <div className="relative mt-1" style={{ height: 16 }}>
          {THRESHOLDS.map((t) => (
            <span
              key={t.value}
              className="absolute text-xs tabular-nums"
              style={{
                left: `${t.value}%`,
                transform: 'translateX(-50%)',
                color: 'var(--text-secondary, #94a3b8)',
                fontSize: 10,
              }}
            >
              {t.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
