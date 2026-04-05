'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  Shield,
  Heart,
  Clock,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import type { TransformationData } from '@/lib/data/features';
import type { TransformationStepData } from '@/types/database';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Transformation Path — Client Component
 *
 * Renders the user's personalised transformation path with real data
 * from Supabase. Shows progress, steps by dimension, and assessment scores.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Dimension config
// ---------------------------------------------------------------------------

interface DimensionMeta {
  label: string;
  Icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

const DIMENSION_META: Record<string, DimensionMeta> = {
  financial: {
    label: 'Financial Reality',
    Icon: Shield,
    color: '#22d3ee',
    bgColor: 'rgba(34, 211, 238, 0.06)',
    borderColor: 'rgba(34, 211, 238, 0.15)',
  },
  emotional: {
    label: 'Emotional Alignment',
    Icon: Heart,
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.15)',
  },
  timing: {
    label: 'Timing & Market',
    Icon: Clock,
    color: '#facc15',
    bgColor: 'rgba(250, 204, 21, 0.06)',
    borderColor: 'rgba(250, 204, 21, 0.15)',
  },
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeInOut' as const },
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TransformationContentProps {
  data: TransformationData | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TransformationContent({
  data,
}: TransformationContentProps) {
  const path = data?.path ?? null;
  const latestAssessment = data?.latestAssessment ?? null;

  // Group steps by dimension
  const groupedSteps = useMemo(() => {
    if (!path?.steps) return {};
    const groups: Record<string, TransformationStepData[]> = {};
    for (const step of path.steps) {
      if (!groups[step.dimension]) groups[step.dimension] = [];
      groups[step.dimension].push(step);
    }
    return groups;
  }, [path?.steps]);

  // Dimension scores from the latest assessment
  const dimensionScores = useMemo(() => {
    if (!latestAssessment) return {} as Record<string, number>;
    return {
      financial: latestAssessment.financial_score,
      emotional: latestAssessment.emotional_score,
      timing: latestAssessment.timing_score,
    };
  }, [latestAssessment]);

  // Dimension order: lowest score first
  const dimensionOrder = useMemo(() => {
    const dims = Object.keys(groupedSteps) as string[];
    return dims.sort(
      (a, b) => (dimensionScores[a] ?? 0) - (dimensionScores[b] ?? 0),
    );
  }, [groupedSteps, dimensionScores]);

  // Completion stats
  const completedStepCount = path?.steps.filter((s) => s.completed).length ?? 0;
  const totalStepCount = path?.steps.length ?? 0;
  const progressPercent = path?.progress_percent ?? 0;
  const currentStepIndex = path?.current_step_index ?? 0;

  // ─── Empty State ───────────────────────────────────────────────────────────

  if (!path) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div
            className="flex size-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
          >
            <Sparkles size={32} style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: '#e2e8f0' }}
            >
              Your Transformation Path
            </h1>
            <p
              className="mt-2 max-w-md text-sm leading-relaxed"
              style={{ color: '#94a3b8' }}
            >
              Take your first assessment to generate your transformation path.
              We will create a personalised roadmap to guide you from where you
              are now to homeownership readiness.
            </p>
          </div>
          <Link
            href="/assess/new"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#22d3ee', color: '#0a1628' }}
          >
            Take Assessment
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Main Content ──────────────────────────────────────────────────────────

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(52, 211, 153, 0.12)' }}
          >
            <Sparkles size={20} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: '#e2e8f0' }}
            >
              Your Transformation Path
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: '#94a3b8' }}>
              Your personalised journey from NOT YET to READY
            </p>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         OVERVIEW CARD
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Progress */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} style={{ color: '#34d399' }} />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}
                >
                  Progress
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: '#34d399' }}
                >
                  {progressPercent}%
                </span>
                <span className="text-sm" style={{ color: '#94a3b8' }}>
                  complete
                </span>
              </div>
              <ProgressBar
                value={progressPercent}
                color="emerald"
                size="sm"
              />
            </div>

            {/* Overall Score */}
            {latestAssessment && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Target size={16} style={{ color: '#22d3ee' }} />
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#94a3b8' }}
                  >
                    Current Score
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: '#22d3ee' }}
                  >
                    {latestAssessment.overall_score}
                  </span>
                  <span className="text-sm" style={{ color: '#94a3b8' }}>
                    / 100
                  </span>
                </div>
              </div>
            )}

            {/* Steps Completed */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} style={{ color: '#facc15' }} />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}
                >
                  Completed
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: '#facc15' }}
                >
                  {completedStepCount}
                </span>
                <span className="text-sm" style={{ color: '#94a3b8' }}>
                  / {totalStepCount} steps
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         STEPS BY DIMENSION
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: Steps by dimension (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {dimensionOrder.map((dim) => {
            const meta = DIMENSION_META[dim];
            if (!meta) return null;
            const steps = groupedSteps[dim] ?? [];
            const score = dimensionScores[dim] ?? 0;
            const completedCount = steps.filter((s) => s.completed).length;

            return (
              <motion.div key={dim} variants={fadeUp}>
                <div
                  className="rounded-2xl border p-5 backdrop-blur-xl"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderColor: 'rgba(34, 211, 238, 0.1)',
                  }}
                >
                  {/* Dimension header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: meta.bgColor }}
                      >
                        <meta.Icon size={18} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <h2
                          className="text-sm font-semibold"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </h2>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>
                          {completedCount}/{steps.length} steps completed
                        </p>
                      </div>
                    </div>

                    {/* Score display */}
                    <div className="text-right">
                      <span
                        className="text-lg font-bold tabular-nums"
                        style={{ color: meta.color }}
                      >
                        {score}
                      </span>
                      <span
                        className="ml-0.5 text-xs"
                        style={{ color: '#94a3b8' }}
                      >
                        / 100
                      </span>
                    </div>
                  </div>

                  {/* Score progress bar */}
                  <div className="mt-4">
                    <div
                      className="relative h-2 w-full overflow-hidden rounded-full"
                      style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, score)}%` }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        style={{ backgroundColor: meta.color }}
                      />
                      {/* Target line at 75 */}
                      <div
                        className="absolute top-0 h-full w-px"
                        style={{
                          left: '75%',
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        Current
                      </span>
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        Target: 75
                      </span>
                    </div>
                  </div>

                  {/* Step items */}
                  <div className="mt-4 space-y-3">
                    {steps.map((step, stepIdx) => {
                      // Find the global index to determine if this is the current step
                      const globalIdx = path.steps.indexOf(step);
                      const isCurrent = globalIdx === currentStepIndex;

                      return (
                        <motion.div
                          key={`${dim}-${stepIdx}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: stepIdx * 0.05,
                          }}
                          className="rounded-xl border p-4 transition-colors"
                          style={{
                            background: isCurrent
                              ? 'rgba(34, 211, 238, 0.06)'
                              : 'rgba(15, 23, 42, 0.4)',
                            borderColor: isCurrent
                              ? 'rgba(34, 211, 238, 0.3)'
                              : step.completed
                                ? 'rgba(52, 211, 153, 0.2)'
                                : 'rgba(30, 41, 59, 0.5)',
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Status icon */}
                            <div className="mt-0.5 shrink-0">
                              {step.completed ? (
                                <CheckCircle2
                                  size={18}
                                  style={{ color: '#34d399' }}
                                />
                              ) : (
                                <Circle
                                  size={18}
                                  style={{
                                    color: isCurrent
                                      ? '#22d3ee'
                                      : '#475569',
                                  }}
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3
                                  className="text-sm font-semibold"
                                  style={{
                                    color: step.completed
                                      ? '#34d399'
                                      : '#e2e8f0',
                                  }}
                                >
                                  {step.title}
                                </h3>
                                {isCurrent && (
                                  <Badge variant="info">
                                    Current
                                  </Badge>
                                )}
                              </div>

                              <p
                                className="mt-1 text-xs leading-relaxed"
                                style={{ color: '#94a3b8' }}
                              >
                                {step.description}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {/* Dimension badge */}
                                <span
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                                  style={{
                                    backgroundColor: meta.bgColor,
                                    color: meta.color,
                                    border: `1px solid ${meta.borderColor}`,
                                  }}
                                >
                                  <meta.Icon size={10} />
                                  {meta.label}
                                </span>

                                {/* Estimated score impact */}
                                {step.estimated_score_impact > 0 && (
                                  <span
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                                    style={{
                                      backgroundColor:
                                        'rgba(34, 211, 238, 0.06)',
                                      color: '#22d3ee',
                                      border:
                                        '1px solid rgba(34, 211, 238, 0.15)',
                                    }}
                                  >
                                    <TrendingUp size={10} />+
                                    {step.estimated_score_impact} pts
                                  </span>
                                )}

                                {/* Completed date */}
                                {step.completed && step.completed_at && (
                                  <span
                                    className="text-xs"
                                    style={{ color: '#64748b' }}
                                  >
                                    Completed{' '}
                                    {new Date(
                                      step.completed_at,
                                    ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* ── Reassess CTA (inline) ── */}
          {progressPercent >= 70 && (
            <motion.div variants={fadeUp}>
              <Card padding="md">
                <div className="flex items-start gap-4">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.12)',
                    }}
                  >
                    <Sparkles size={20} style={{ color: '#34d399' }} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: '#34d399' }}
                    >
                      Ready to Reassess?
                    </h3>
                    <p
                      className="mt-1 text-xs leading-relaxed"
                      style={{ color: '#94a3b8' }}
                    >
                      You have made great progress. Take a new assessment to see
                      how your scores have improved.
                    </p>
                    <Link
                      href="/assess/new"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
                      style={{
                        backgroundColor: '#34d399',
                        color: '#0a1628',
                      }}
                    >
                      Take New Assessment
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right column: Score breakdown + motivational (1/3) */}
        <div className="space-y-6">
          {/* ── Score Breakdown ── */}
          {latestAssessment && (
            <motion.div variants={fadeUp}>
              <div
                className="rounded-2xl border p-5 backdrop-blur-xl"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderColor: 'rgba(34, 211, 238, 0.1)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Target size={18} style={{ color: '#34d399' }} />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: '#e2e8f0' }}
                  >
                    Score Breakdown
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {(['financial', 'emotional', 'timing'] as const).map(
                    (dim) => {
                      const meta = DIMENSION_META[dim];
                      const score = dimensionScores[dim] ?? 0;
                      if (!meta) return null;

                      return (
                        <div key={dim}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <meta.Icon
                                size={14}
                                style={{ color: meta.color }}
                              />
                              <span
                                className="text-xs font-medium"
                                style={{ color: '#94a3b8' }}
                              >
                                {meta.label}
                              </span>
                            </div>
                            <span
                              className="text-sm font-bold tabular-nums"
                              style={{ color: meta.color }}
                            >
                              {score}
                            </span>
                          </div>
                          <div
                            className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
                            style={{
                              backgroundColor: 'rgba(30, 41, 59, 0.6)',
                            }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(100, score)}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                ease: 'easeInOut',
                              }}
                              style={{ backgroundColor: meta.color }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step Summary ── */}
          <motion.div variants={fadeUp}>
            <div
              className="rounded-2xl border p-5 backdrop-blur-xl"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderColor: 'rgba(34, 211, 238, 0.1)',
              }}
            >
              <h3
                className="text-sm font-semibold"
                style={{ color: '#e2e8f0' }}
              >
                Step Overview
              </h3>
              <div className="mt-3 space-y-2">
                {path.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2"
                  >
                    {step.completed ? (
                      <CheckCircle2
                        size={14}
                        style={{ color: '#34d399' }}
                      />
                    ) : idx === currentStepIndex ? (
                      <Circle size={14} style={{ color: '#22d3ee' }} />
                    ) : (
                      <Circle size={14} style={{ color: '#334155' }} />
                    )}
                    <span
                      className="truncate text-xs"
                      style={{
                        color: step.completed
                          ? '#34d399'
                          : idx === currentStepIndex
                            ? '#e2e8f0'
                            : '#64748b',
                      }}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Motivational message ── */}
          <motion.div variants={fadeUp}>
            <div
              className="rounded-xl border p-4 text-center"
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderColor: 'rgba(52, 211, 153, 0.15)',
              }}
            >
              <p
                className="text-xs leading-relaxed italic"
                style={{ color: '#94a3b8' }}
              >
                &ldquo;This is your path forward, and you are making progress.
                Every step you complete brings you closer to the home that is
                right for you.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
