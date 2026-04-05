'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GENOME_DIMENSIONS,
  type GenomeProfile,
} from '@/lib/behavioral-genome';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BehavioralGenome — 9-dimension genome visualization
 *
 * Renders horizontal bars for each genome dimension with:
 * - Animated fill on mount (stagger 100ms per bar)
 * - Hover tooltip: dimension description + detection method
 * - Overall genome summary sentence
 * - Glass-morphism card on navy background
 *
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface BehavioralGenomeProps {
  /** The genome profile to visualize */
  profile: GenomeProfile;
  /** Optional CSS class on the root element */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGenomeSummary(profile: GenomeProfile): string {
  const high: string[] = [];
  const low: string[] = [];

  for (const dim of GENOME_DIMENSIONS) {
    const { score } = profile[dim.id];
    if (score >= 70) high.push(dim.name);
    if (score <= 35) low.push(dim.name);
  }

  if (high.length === 0 && low.length === 0) {
    return 'Your behavioral profile is well-balanced across all dimensions.';
  }

  const parts: string[] = [];
  if (high.length > 0) {
    parts.push(
      `elevated ${high.join(', ')}`,
    );
  }
  if (low.length > 0) {
    parts.push(
      `lower ${low.join(', ')}`,
    );
  }

  return `Your profile shows ${parts.join(' and ')}. This shapes how we present information to you.`;
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  if (confidence > 0) return 'Low';
  return 'No data';
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const barVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BehavioralGenome({
  profile,
  className = '',
}: BehavioralGenomeProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const summary = getGenomeSummary(profile);

  return (
    <div
      className={`rounded-[var(--radius-lg,16px)] backdrop-blur-[10px] ${className}`}
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(34, 211, 238, 0.2)',
      }}
    >
      <div className="p-6 sm:p-8">
        {/* Dimension bars */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {GENOME_DIMENSIONS.map((dim) => {
            const { score, confidence } = profile[dim.id];
            const isHovered = hoveredId === dim.id;

            return (
              <motion.div
                key={dim.id}
                variants={barVariants}
                className="relative"
                onMouseEnter={() => setHoveredId(dim.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(dim.id)}
                onBlur={() => setHoveredId(null)}
                tabIndex={0}
                role="group"
                aria-label={`${dim.name}: ${score} out of 100`}
              >
                {/* Label row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Color dot */}
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: dim.color }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary, #e2e8f0)' }}
                    >
                      {dim.name}
                    </span>
                  </div>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: dim.color }}
                  >
                    {score}
                  </span>
                </div>

                {/* Bar track */}
                <div
                  className="w-full h-2.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(148, 163, 184, 0.12)' }}
                >
                  {/* Bar fill — animates width from 0 */}
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: dim.color,
                      opacity: 0.85,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: GENOME_DIMENSIONS.indexOf(dim) * 0.1,
                    }}
                  />
                </div>

                {/* Confidence indicator */}
                <div className="flex justify-end mt-1">
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: 'rgba(148, 163, 184, 0.5)' }}
                  >
                    {getConfidenceLabel(confidence)} confidence
                  </span>
                </div>

                {/* Tooltip — appears on hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 z-50 mt-1 p-3 rounded-lg"
                    style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      top: '100%',
                    }}
                  >
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--text-primary, #e2e8f0)' }}
                    >
                      {dim.description}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: 'rgba(148, 163, 184, 0.7)' }}
                    >
                      <span
                        className="font-medium"
                        style={{ color: dim.color }}
                      >
                        How we detect this:
                      </span>{' '}
                      {dim.detection}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Summary */}
        <motion.div
          className="mt-6 pt-5"
          style={{ borderTop: '1px solid rgba(34, 211, 238, 0.1)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            {summary}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
