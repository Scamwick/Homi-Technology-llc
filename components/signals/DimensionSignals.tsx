'use client';

import { motion } from 'framer-motion';
import { Shield, Heart, Clock, type LucideIcon } from 'lucide-react';
import { ReadinessSignal, scoreToTemperature } from './ReadinessSignal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DimensionSignalsProps {
  financial: number;
  emotional: number;
  timing: number;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

// ---------------------------------------------------------------------------
// Dimension config
// ---------------------------------------------------------------------------

type DimensionKey = 'financial' | 'emotional' | 'timing';

interface DimConfig {
  label: string;
  Icon: LucideIcon;
  color: string;
  borderColor: string;
}

const DIM_MAP: Record<DimensionKey, DimConfig> = {
  financial: {
    label: 'Financial',
    Icon: Shield,
    color: 'var(--cyan, #22d3ee)',
    borderColor: 'rgba(34, 211, 238, 0.15)',
  },
  emotional: {
    label: 'Emotional',
    Icon: Heart,
    color: 'var(--emerald, #34d399)',
    borderColor: 'rgba(52, 211, 153, 0.15)',
  },
  timing: {
    label: 'Timing',
    Icon: Clock,
    color: 'var(--yellow, #facc15)',
    borderColor: 'rgba(250, 204, 21, 0.15)',
  },
} as const;

const DIMENSIONS: DimensionKey[] = ['financial', 'emotional', 'timing'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DimensionSignals({
  financial,
  emotional,
  timing,
  layout = 'horizontal',
  className = '',
}: DimensionSignalsProps) {
  const scores: Record<DimensionKey, number> = { financial, emotional, timing };
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={`flex ${isHorizontal ? 'flex-row items-center gap-3' : 'flex-col gap-2'} ${className}`}
      role="group"
      aria-label="Dimension readiness signals"
    >
      {DIMENSIONS.map((key, i) => {
        const config = DIM_MAP[key];
        const score = Math.max(0, Math.min(100, Math.round(scores[key])));
        const temp = scoreToTemperature(score);
        const { Icon } = config;

        return (
          <motion.div
            key={key}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
              isHorizontal ? '' : 'w-full'
            }`}
            style={{
              borderColor: config.borderColor,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.1,
              duration: 0.35,
              ease: 'easeInOut' as const,
            }}
          >
            {/* Dimension icon */}
            <Icon
              size={14}
              style={{ color: config.color }}
              strokeWidth={2.2}
              aria-hidden="true"
            />

            {/* Label */}
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: config.color }}
            >
              {config.label}
            </span>

            {/* Signal dot */}
            <ReadinessSignal
              score={score}
              size="sm"
              showLabel={false}
              animated
            />
          </motion.div>
        );
      })}
    </div>
  );
}
