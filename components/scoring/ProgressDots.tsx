'use client';

import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number; // 0-indexed
  labels?: string[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOT = {
  completed: {
    size: 12,
    color: 'var(--emerald, #34d399)',
    border: 'transparent',
  },
  active: {
    size: 16,
    color: 'var(--cyan, #22d3ee)',
    border: 'var(--cyan, #22d3ee)',
    glow: 'rgba(34, 211, 238, 0.5)',
  },
  future: {
    size: 10,
    color: 'var(--slate-light, #334155)',
    border: 'transparent',
  },
} as const;

const LINE_COLOR_DONE = 'var(--emerald, #34d399)';
const LINE_COLOR_PENDING = 'var(--slate, #1e293b)';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProgressDots({
  totalSteps,
  currentStep,
  labels,
  className = '',
}: ProgressDotsProps) {
  const clampedStep = Math.max(0, Math.min(totalSteps - 1, currentStep));

  return (
    <div
      className={`flex items-start justify-center ${className}`}
      role="progressbar"
      aria-valuenow={clampedStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${clampedStep + 1} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const isCompleted = i < clampedStep;
        const isActive = i === clampedStep;
        const isFuture = i > clampedStep;
        const state = isCompleted ? 'completed' : isActive ? 'active' : 'future';
        const dotConfig = DOT[state];
        const showLine = i < totalSteps - 1;
        const lineComplete = i < clampedStep;

        return (
          <div key={i} className="flex items-start">
            {/* Dot + optional label */}
            <div className="flex flex-col items-center" style={{ minWidth: 32 }}>
              <motion.div
                className="relative rounded-full flex items-center justify-center"
                style={{
                  width: dotConfig.size,
                  height: dotConfig.size,
                  backgroundColor: isActive ? 'transparent' : dotConfig.color,
                  border: isActive
                    ? `2px solid ${DOT.active.border}`
                    : isFuture
                      ? `1.5px solid var(--slate-light, #334155)`
                      : 'none',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.35,
                  ease: 'easeInOut' as const,
                }}
              >
                {/* Active dot inner fill */}
                {isActive && (
                  <div
                    className="rounded-full"
                    style={{
                      width: dotConfig.size - 6,
                      height: dotConfig.size - 6,
                      backgroundColor: DOT.active.color,
                    }}
                  />
                )}

                {/* Pulse glow on active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow: `0 0 10px ${DOT.active.glow}`,
                    }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut' as const,
                    }}
                  />
                )}

                {/* Checkmark for completed */}
                {isCompleted && (
                  <svg
                    width={dotConfig.size * 0.6}
                    height={dotConfig.size * 0.6}
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="var(--navy, #0a1628)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </motion.div>

              {/* Label */}
              {labels?.[i] && (
                <span
                  className="mt-2 text-center leading-tight"
                  style={{
                    fontSize: 10,
                    maxWidth: 64,
                    color: isActive
                      ? 'var(--cyan, #22d3ee)'
                      : isCompleted
                        ? 'var(--text-primary, #e2e8f0)'
                        : 'var(--text-secondary, #94a3b8)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {labels[i]}
                </span>
              )}
            </div>

            {/* Connecting line */}
            {showLine && (
              <div
                className="flex items-center"
                style={{
                  height: DOT.active.size,
                  paddingTop: (DOT.active.size - 2) / 2,
                }}
              >
                <motion.div
                  style={{
                    width: 32,
                    height: 2,
                    backgroundColor: lineComplete
                      ? LINE_COLOR_DONE
                      : LINE_COLOR_PENDING,
                    borderRadius: 1,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: i * 0.08 + 0.1,
                    duration: 0.3,
                    ease: 'easeInOut' as const,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
