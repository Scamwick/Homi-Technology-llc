'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Milestone } from '@/lib/transformation/generator';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ProgressTimeline — Vertical timeline showing milestone progression.
 *
 * - Completed milestones: emerald fill + checkmark
 * - Current milestone: pulsing cyan dot
 * - Future milestones: slate dot
 * - Target scores + dates along the right
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Dimension colors
// ---------------------------------------------------------------------------

const DIMENSION_COLORS: Record<string, string> = {
  financial: 'var(--cyan, #22d3ee)',
  emotional: 'var(--emerald, #34d399)',
  timing: 'var(--yellow, #facc15)',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProgressTimelineProps {
  milestones: Milestone[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProgressTimeline({
  milestones,
  className = '',
}: ProgressTimelineProps) {
  // Find the first non-achieved milestone (current target)
  const currentIndex = milestones.findIndex((m) => !m.achieved);

  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      {milestones.map((milestone, index) => {
        const isAchieved = milestone.achieved;
        const isCurrent = index === currentIndex;
        const isFuture = !isAchieved && !isCurrent;
        const isLast = index === milestones.length - 1;
        const dimColor = DIMENSION_COLORS[milestone.targetDimension] ?? 'var(--cyan, #22d3ee)';

        return (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative flex gap-4"
          >
            {/* Left column: dot + line */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div className="relative flex items-center justify-center">
                {isAchieved ? (
                  /* Achieved: emerald filled circle with checkmark */
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="flex size-7 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--emerald, #34d399)' }}
                  >
                    <Check
                      size={14}
                      strokeWidth={3}
                      style={{ color: 'var(--navy, #0a1628)' }}
                    />
                  </motion.div>
                ) : isCurrent ? (
                  /* Current: pulsing cyan dot */
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      className="absolute size-7 rounded-full"
                      style={{ backgroundColor: 'rgba(34, 211, 238, 0.2)' }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <div
                      className="relative size-3.5 rounded-full ring-2"
                      style={{
                        backgroundColor: 'var(--cyan, #22d3ee)',
                        ['--tw-ring-color' as string]: 'rgba(34, 211, 238, 0.4)',
                      }}
                    />
                  </div>
                ) : (
                  /* Future: slate dot */
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: 'rgba(148, 163, 184, 0.3)' }}
                  />
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className="w-px flex-1 min-h-[40px]"
                  style={{
                    backgroundColor: isAchieved
                      ? 'rgba(52, 211, 153, 0.3)'
                      : 'rgba(148, 163, 184, 0.12)',
                  }}
                />
              )}
            </div>

            {/* Right column: content */}
            <div className={['pb-6', isLast ? 'pb-0' : ''].join(' ')}>
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className={[
                    'text-sm font-semibold leading-tight',
                    isFuture ? 'opacity-50' : '',
                  ].join(' ')}
                  style={{
                    color: isAchieved
                      ? 'var(--emerald, #34d399)'
                      : isCurrent
                        ? 'var(--text-primary, #e2e8f0)'
                        : 'var(--text-secondary, #94a3b8)',
                  }}
                >
                  {milestone.title}
                </h4>

                {/* Score badge */}
                <span
                  className={[
                    'text-xs font-bold tabular-nums px-1.5 py-0.5 rounded',
                    isFuture ? 'opacity-40' : '',
                  ].join(' ')}
                  style={{
                    backgroundColor: isAchieved
                      ? 'rgba(52, 211, 153, 0.1)'
                      : `${dimColor}15`,
                    color: isAchieved ? 'var(--emerald, #34d399)' : dimColor,
                  }}
                >
                  {milestone.targetScore}
                </span>
              </div>

              {/* Celebration message for achieved */}
              {isAchieved && (
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: 'rgba(52, 211, 153, 0.7)' }}
                >
                  {milestone.celebrationMessage}
                </p>
              )}

              {/* Current target indicator */}
              {isCurrent && (
                <p
                  className="mt-1 text-xs"
                  style={{ color: 'rgba(34, 211, 238, 0.7)' }}
                >
                  Current target
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
