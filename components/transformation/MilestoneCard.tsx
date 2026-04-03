'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Shield, Heart, Clock } from 'lucide-react';
import type { Milestone } from '@/lib/transformation/generator';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MilestoneCard — Displays a milestone target with achieved/pending state.
 *
 * - Dimension-colored accent
 * - Target score display
 * - Celebration message when achieved
 * - Trophy icon for achieved, Target icon for pending
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Dimension config
// ---------------------------------------------------------------------------

const DIMENSION_CONFIG: Record<
  Milestone['targetDimension'],
  { color: string; bgColor: string; borderColor: string; label: string; Icon: typeof Shield }
> = {
  financial: {
    color: 'var(--cyan, #22d3ee)',
    bgColor: 'rgba(34, 211, 238, 0.06)',
    borderColor: 'rgba(34, 211, 238, 0.2)',
    label: 'Financial',
    Icon: Shield,
  },
  emotional: {
    color: 'var(--emerald, #34d399)',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.2)',
    label: 'Emotional',
    Icon: Heart,
  },
  timing: {
    color: 'var(--yellow, #facc15)',
    bgColor: 'rgba(250, 204, 21, 0.06)',
    borderColor: 'rgba(250, 204, 21, 0.2)',
    label: 'Timing',
    Icon: Clock,
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MilestoneCardProps {
  milestone: Milestone;
  currentScore?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MilestoneCard({
  milestone,
  currentScore,
  className = '',
}: MilestoneCardProps) {
  const dim = DIMENSION_CONFIG[milestone.targetDimension];
  const progress =
    currentScore !== undefined
      ? Math.min(100, Math.max(0, (currentScore / milestone.targetScore) * 100))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={[
        'relative rounded-xl border p-5 backdrop-blur-[10px] overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: milestone.achieved
          ? 'rgba(52, 211, 153, 0.08)'
          : 'rgba(30, 41, 59, 0.8)',
        borderColor: milestone.achieved
          ? 'rgba(52, 211, 153, 0.3)'
          : dim.borderColor,
      }}
    >
      {/* Achievement glow */}
      {milestone.achieved && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(52,211,153,0.12) 0%, transparent 60%)',
          }}
        />
      )}

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: milestone.achieved
              ? 'rgba(52, 211, 153, 0.15)'
              : dim.bgColor,
          }}
        >
          {milestone.achieved ? (
            <Trophy
              size={20}
              style={{ color: 'var(--emerald, #34d399)' }}
            />
          ) : (
            <Target size={20} style={{ color: dim.color }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="text-sm font-semibold"
              style={{
                color: milestone.achieved
                  ? 'var(--emerald, #34d399)'
                  : 'var(--text-primary, #e2e8f0)',
              }}
            >
              {milestone.title}
            </h3>

            {/* Dimension label */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: dim.bgColor,
                color: dim.color,
              }}
            >
              {dim.label}
            </span>
          </div>

          {/* Target score */}
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              Target:
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: dim.color }}
            >
              {milestone.targetScore}
            </span>
            {currentScore !== undefined && !milestone.achieved && (
              <>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  (current: {currentScore})
                </span>
              </>
            )}
          </div>

          {/* Progress bar for non-achieved milestones */}
          {!milestone.achieved && currentScore !== undefined && (
            <div className="mt-2">
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{ backgroundColor: dim.color }}
                />
              </div>
            </div>
          )}

          {/* Celebration message (shown when achieved) */}
          {milestone.achieved && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-2 text-xs leading-relaxed"
              style={{ color: 'var(--emerald, #34d399)' }}
            >
              {milestone.celebrationMessage}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
