'use client';

import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReadinessBarProps {
  score: number;
  height?: number;
  showThresholds?: boolean;
  showLabels?: boolean;
  animated?: boolean;
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

/** Zone labels — positioned at visual midpoints of each zone. */
const ZONE_LABELS = [
  { label: 'Hot', center: 25, color: 'var(--homi-crimson, #ef4444)' },
  { label: 'Warm+', center: 57.5, color: 'var(--homi-amber, #fb923c)' },
  { label: 'Warm', center: 72.5, color: 'var(--yellow, #facc15)' },
  { label: 'Cool', center: 90, color: 'var(--emerald, #34d399)' },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function markerColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 65) return '#facc15';
  if (score >= 50) return '#fb923c';
  return '#ef4444';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReadinessBar({
  score,
  height = 12,
  showThresholds = true,
  showLabels = true,
  animated = true,
  className = '',
}: ReadinessBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = markerColor(clamped);

  // The marker is a triangle/needle above the bar.
  const markerSize = height + 6;

  return (
    <div
      className={`w-full ${className}`}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Readiness bar: ${Math.round(clamped)} out of 100`}
    >
      {/* Marker row */}
      <div className="relative" style={{ height: markerSize + 4, marginBottom: 2 }}>
        <motion.div
          className="absolute flex flex-col items-center"
          style={{
            left: `${clamped}%`,
            transform: 'translateX(-50%)',
            bottom: 0,
          }}
          initial={animated ? { opacity: 0, y: -6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeInOut' as const }}
        >
          {/* Score value */}
          <span
            className="text-xs font-bold tabular-nums mb-0.5"
            style={{ color, fontSize: 11, lineHeight: 1 }}
          >
            {Math.round(clamped)}
          </span>
          {/* Triangle needle pointing down */}
          <svg
            width={10}
            height={6}
            viewBox="0 0 10 6"
            style={{ display: 'block' }}
          >
            <polygon
              points="0,0 10,0 5,6"
              fill={color}
            />
          </svg>
        </motion.div>
      </div>

      {/* Gradient bar */}
      <div className="relative">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height,
            background:
              'var(--gradient-temperature, linear-gradient(90deg, #ef4444 0%, #fb923c 33%, #facc15 66%, #34d399 100%))',
          }}
        />

        {/* Threshold tick lines */}
        {showThresholds &&
          THRESHOLDS.map((t) => (
            <div
              key={t.value}
              className="absolute top-0"
              style={{
                left: `${t.value}%`,
                width: 1.5,
                height,
                backgroundColor: 'rgba(10, 22, 40, 0.6)',
              }}
            />
          ))}
      </div>

      {/* Zone labels below */}
      {showLabels && (
        <div className="relative mt-1.5" style={{ height: 16 }}>
          {ZONE_LABELS.map((z) => (
            <span
              key={z.label}
              className="absolute text-xs font-medium"
              style={{
                left: `${z.center}%`,
                transform: 'translateX(-50%)',
                color: z.color,
                fontSize: 10,
                lineHeight: 1,
              }}
            >
              {z.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
