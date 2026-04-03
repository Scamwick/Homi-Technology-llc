'use client';

import { motion } from 'framer-motion';
import { Shield, Heart, Clock, type LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Dimension = 'financial' | 'emotional' | 'timing';

export interface DimensionCardProps {
  dimension: Dimension;
  score: number;
  maxContribution: number;
  showDetails?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Dimension config
// ---------------------------------------------------------------------------

interface DimensionConfig {
  label: string;
  Icon: LucideIcon;
  color: string;
  glowColor: string;
  bgColor: string;
  borderColor: string;
}

const DIMENSION_MAP: Record<Dimension, DimensionConfig> = {
  financial: {
    label: 'Financial',
    Icon: Shield,
    color: 'var(--cyan, #22d3ee)',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    bgColor: 'rgba(34, 211, 238, 0.06)',
    borderColor: 'rgba(34, 211, 238, 0.12)',
  },
  emotional: {
    label: 'Emotional',
    Icon: Heart,
    color: 'var(--emerald, #34d399)',
    glowColor: 'rgba(52, 211, 153, 0.3)',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.12)',
  },
  timing: {
    label: 'Timing',
    Icon: Clock,
    color: 'var(--yellow, #facc15)',
    glowColor: 'rgba(250, 204, 21, 0.25)',
    bgColor: 'rgba(250, 204, 21, 0.06)',
    borderColor: 'rgba(250, 204, 21, 0.12)',
  },
} as const;

// ---------------------------------------------------------------------------
// Ring SVG sub-component
// ---------------------------------------------------------------------------

const RING_SIZE = 64;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE * 2) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ScoreRing({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  const offset = RING_CIRCUMFERENCE - (score / 100) * RING_CIRCUMFERENCE;

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      className="flex-shrink-0"
    >
      {/* Track */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="var(--slate, #1e293b)"
        strokeWidth={RING_STROKE}
      />
      {/* Progress */}
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeInOut' as const }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
      {/* Center score text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill={color}
        fontSize={18}
        fontWeight={700}
        fontFamily="inherit"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DimensionCard({
  dimension,
  score,
  maxContribution,
  showDetails = true,
  className = '',
}: DimensionCardProps) {
  const config = DIMENSION_MAP[dimension];
  const { Icon } = config;
  const clamped = Math.max(0, Math.min(100, score));
  const weighted = (clamped / 100) * maxContribution;

  return (
    <motion.div
      className={`flex items-center gap-4 rounded-xl border p-4 ${className}`}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' as const }}
      role="article"
      aria-label={`${config.label} dimension: ${clamped} out of 100`}
    >
      {/* Ring */}
      <ScoreRing score={clamped} color={config.color} />

      {/* Text content */}
      <div className="flex flex-col gap-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <Icon
            size={16}
            style={{ color: config.color }}
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>

        {/* Score row */}
        <div className="flex items-baseline gap-1">
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            {clamped}
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            / 100
          </span>
        </div>

        {/* Weighted contribution */}
        {showDetails && (
          <div className="flex items-baseline gap-1">
            <span
              className="text-xs font-medium tabular-nums"
              style={{ color: config.color }}
            >
              {weighted.toFixed(1)}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              / {maxContribution}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              weighted
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
