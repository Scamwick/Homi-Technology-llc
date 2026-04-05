'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Target,
  ArrowRight,
  Shield,
  Heart,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import {
  ActionItemCard,
  MilestoneCard,
  ProgressTimeline,
} from '@/components/transformation';
import type {
  ActionItem,
  Milestone,
  TransformationPath,
} from '@/lib/transformation';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Transformation Path — The guided NOT YET -> READY journey.
 *
 * This is the highest-value page for the 70% who receive NOT YET.
 * It shows personalised action items, milestones, and progress tracking.
 *
 * Uses mock data throughout — no API calls.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock Data — Realistic transformation path
// ---------------------------------------------------------------------------

const MOCK_SCORES = {
  financial: 45,
  emotional: 58,
  timing: 72,
};

const MOCK_PATH: TransformationPath = {
  id: 'tp-mock-001',
  assessmentId: 'assess-mock-001',
  status: 'active',
  weakestDimension: 'financial',
  actionItems: [
    {
      id: 'ai-1',
      title: 'Calculate your true monthly expenses',
      description:
        'Track every expense for 30 days. Knowing your real spend is the foundation for all financial planning.',
      dimension: 'financial',
      category: 'Budgeting',
      difficulty: 'easy',
      estimatedDuration: '30 days',
      completed: true,
      order: 1,
    },
    {
      id: 'ai-2',
      title: 'Set up dedicated home fund account',
      description:
        'Automate savings into a separate account labelled for your home purchase. Out of sight, out of spend.',
      dimension: 'financial',
      category: 'Savings',
      difficulty: 'easy',
      estimatedDuration: '1 day',
      completed: true,
      order: 2,
    },
    {
      id: 'ai-3',
      title: 'Get your credit report and dispute errors',
      description:
        'Pull your free annual report from all three bureaus. Dispute any inaccuracies that are dragging your score down.',
      dimension: 'financial',
      category: 'Credit',
      difficulty: 'easy',
      estimatedDuration: '1 week',
      completed: false,
      order: 3,
    },
    {
      id: 'ai-4',
      title: 'Build emergency fund to 3 months',
      description:
        'Set up automatic transfers to build a safety net. Aim for 3 months of living expenses before buying.',
      dimension: 'financial',
      category: 'Savings',
      difficulty: 'easy',
      estimatedDuration: '3-6 months',
      completed: false,
      order: 4,
    },
    {
      id: 'ai-5',
      title: 'Reduce debt-to-income ratio below 36%',
      description:
        'Pay down revolving debt aggressively. Lenders want your total monthly debt payments under 36% of gross income.',
      dimension: 'financial',
      category: 'Debt Management',
      difficulty: 'medium',
      estimatedDuration: '3-12 months',
      completed: false,
      order: 5,
    },
    {
      id: 'ai-6',
      title: 'Write down your 3 biggest fears about this decision',
      description:
        'Name your fears to shrink them. Are they based on evidence or anxiety? This clarity changes everything.',
      dimension: 'emotional',
      category: 'Self-Reflection',
      difficulty: 'easy',
      estimatedDuration: '30 minutes',
      completed: true,
      order: 6,
    },
    {
      id: 'ai-7',
      title: 'Have the money conversation with your partner',
      description:
        'Sit down and discuss finances openly: debts, savings goals, risk tolerance. Alignment prevents resentment.',
      dimension: 'emotional',
      category: 'Relationship',
      difficulty: 'medium',
      estimatedDuration: '1-2 hours',
      completed: false,
      order: 7,
    },
    {
      id: 'ai-8',
      title: 'Define your non-negotiables vs nice-to-haves',
      description:
        'Create two lists: what you absolutely need and what you would like. This prevents decision paralysis later.',
      dimension: 'emotional',
      category: 'Planning',
      difficulty: 'easy',
      estimatedDuration: '1 hour',
      completed: false,
      order: 8,
    },
    {
      id: 'ai-9',
      title: 'Research market conditions in your target area',
      description:
        'Track listing prices, days on market, and inventory levels. Understanding trends helps you time your move.',
      dimension: 'timing',
      category: 'Market Research',
      difficulty: 'easy',
      estimatedDuration: '1 week',
      completed: false,
      order: 9,
    },
    {
      id: 'ai-10',
      title: 'Monitor interest rate trends weekly',
      description:
        'Set up rate alerts. Even 0.25% matters on a 30-year mortgage. Be ready to act when rates dip.',
      dimension: 'timing',
      category: 'Market Research',
      difficulty: 'easy',
      estimatedDuration: 'Ongoing',
      completed: false,
      order: 10,
    },
  ],
  milestones: [
    {
      id: 'ms-1',
      title: 'Financial Foundation',
      targetDimension: 'financial',
      targetScore: 50,
      achieved: false,
      celebrationMessage:
        'You have built a solid financial foundation. The numbers are starting to work in your favour.',
    },
    {
      id: 'ms-2',
      title: 'Clarity Achieved',
      targetDimension: 'emotional',
      targetScore: 65,
      achieved: false,
      celebrationMessage:
        'You have named your fears and started to work through them. Clarity is power.',
    },
    {
      id: 'ms-3',
      title: 'Financial Confidence',
      targetDimension: 'financial',
      targetScore: 65,
      achieved: false,
      celebrationMessage:
        'Your financial picture is looking strong. Lenders will notice the difference.',
    },
    {
      id: 'ms-4',
      title: 'Emotionally Ready',
      targetDimension: 'emotional',
      targetScore: 75,
      achieved: false,
      celebrationMessage:
        'You feel confident and clear about this decision. Trust that feeling.',
    },
    {
      id: 'ms-5',
      title: 'Financial Readiness',
      targetDimension: 'financial',
      targetScore: 75,
      achieved: false,
      celebrationMessage:
        'Your finances are in great shape. You are ready to start the mortgage conversation.',
    },
  ],
  reassessmentDate: '2026-07-02',
  daysOnPath: 18,
  completionPercentage: 30,
};

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
    color: 'var(--cyan, #22d3ee)',
    bgColor: 'rgba(34, 211, 238, 0.06)',
    borderColor: 'rgba(34, 211, 238, 0.15)',
  },
  emotional: {
    label: 'Emotional Alignment',
    Icon: Heart,
    color: 'var(--emerald, #34d399)',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.15)',
  },
  timing: {
    label: 'Timing & Market',
    Icon: Clock,
    color: 'var(--yellow, #facc15)',
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
// Component
// ---------------------------------------------------------------------------

export default function TransformationPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>(
    MOCK_PATH.actionItems,
  );
  const [expandedDimension, setExpandedDimension] = useState<string | null>(
    null,
  );

  // Compute live completion percentage
  const completionPercentage = useMemo(() => {
    const total = actionItems.length;
    if (total === 0) return 0;
    const done = actionItems.filter((a) => a.completed).length;
    return Math.round((done / total) * 100);
  }, [actionItems]);

  // Group actions by dimension
  const groupedActions = useMemo(() => {
    const groups: Record<string, ActionItem[]> = {};
    for (const item of actionItems) {
      if (!groups[item.dimension]) groups[item.dimension] = [];
      groups[item.dimension].push(item);
    }
    return groups;
  }, [actionItems]);

  // Dimension order: weakest first
  const dimensionOrder = useMemo(() => {
    const dims = Object.keys(groupedActions) as Array<
      'financial' | 'emotional' | 'timing'
    >;
    return dims.sort(
      (a, b) =>
        (MOCK_SCORES[a] ?? 100) - (MOCK_SCORES[b] ?? 100),
    );
  }, [groupedActions]);

  // Handle toggling action items
  function toggleAction(id: string) {
    setActionItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)),
    );
  }

  // Toggle dimension expansion
  function toggleDimension(dim: string) {
    setExpandedDimension((prev) => (prev === dim ? null : dim));
  }

  // Show reassessment prompt at 70%+
  const showReassessment = completionPercentage >= 70;

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
            <Sparkles
              size={20}
              style={{ color: 'var(--emerald, #34d399)' }}
            />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              Your Transformation Path
            </h1>
            <p
              className="mt-0.5 text-sm"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Progress */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={16}
                  style={{ color: 'var(--emerald, #34d399)' }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  Progress
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: 'var(--emerald, #34d399)' }}
                >
                  {completionPercentage}%
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  complete
                </span>
              </div>
              <ProgressBar
                value={completionPercentage}
                color="emerald"
                size="sm"
              />
            </div>

            {/* Days on Path */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar
                  size={16}
                  style={{ color: 'var(--cyan, #22d3ee)' }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  Days on Path
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: 'var(--cyan, #22d3ee)' }}
                >
                  {MOCK_PATH.daysOnPath}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  days
                </span>
              </div>
            </div>

            {/* Items Completed */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Target
                  size={16}
                  style={{ color: 'var(--yellow, #facc15)' }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  Completed
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: 'var(--yellow, #facc15)' }}
                >
                  {actionItems.filter((a) => a.completed).length}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  / {actionItems.length} items
                </span>
              </div>
            </div>

            {/* Reassessment Date */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RefreshCw
                  size={16}
                  style={{ color: 'var(--homi-amber, #fb923c)' }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  Reassess By
                </span>
              </div>
              <span
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              >
                {new Date(MOCK_PATH.reassessmentDate).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' },
                )}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         MAIN CONTENT: Dimension Sections + Timeline
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Action items by dimension (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {dimensionOrder.map((dim) => {
            const meta = DIMENSION_META[dim];
            if (!meta) return null;
            const items = groupedActions[dim] ?? [];
            const score = MOCK_SCORES[dim as keyof typeof MOCK_SCORES] ?? 0;
            const completedCount = items.filter((a) => a.completed).length;
            const isExpanded = expandedDimension === dim || expandedDimension === null;

            return (
              <motion.div key={dim} variants={fadeUp}>
                <Card padding="md">
                  {/* Dimension header */}
                  <button
                    type="button"
                    onClick={() => toggleDimension(dim)}
                    className="w-full flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: meta.bgColor }}
                      >
                        <meta.Icon
                          size={18}
                          style={{ color: meta.color }}
                        />
                      </div>
                      <div className="text-left">
                        <h2
                          className="text-sm font-semibold"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </h2>
                        <p
                          className="text-xs"
                          style={{
                            color: 'var(--text-secondary, #94a3b8)',
                          }}
                        >
                          {completedCount}/{items.length} actions completed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Score display */}
                      <div className="text-right">
                        <span
                          className="text-lg font-bold tabular-nums"
                          style={{ color: meta.color }}
                        >
                          {score}
                        </span>
                        <span
                          className="text-xs ml-0.5"
                          style={{
                            color: 'var(--text-secondary, #94a3b8)',
                          }}
                        >
                          / 100
                        </span>
                      </div>

                      {/* Expand/collapse */}
                      {expandedDimension === dim ? (
                        <ChevronUp
                          size={16}
                          style={{
                            color: 'var(--text-secondary, #94a3b8)',
                          }}
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          style={{
                            color: 'var(--text-secondary, #94a3b8)',
                          }}
                        />
                      )}
                    </div>
                  </button>

                  {/* Score progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs"
                        style={{
                          color: 'var(--text-secondary, #94a3b8)',
                        }}
                      >
                        Current
                      </span>
                      <div className="flex-1" />
                      <span
                        className="text-xs"
                        style={{
                          color: 'var(--text-secondary, #94a3b8)',
                        }}
                      >
                        Target: 75
                      </span>
                    </div>
                    <div
                      className="relative w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, score)}%` }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        style={{ backgroundColor: meta.color }}
                      />
                      {/* Target line */}
                      <div
                        className="absolute top-0 h-full w-px"
                        style={{
                          left: '75%',
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Action items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3">
                          {items.map((item) => (
                            <ActionItemCard
                              key={item.id}
                              item={item}
                              onToggle={toggleAction}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}

          {/* ── Weekly Check-in Prompt ── */}
          <motion.div variants={fadeUp}>
            <Card padding="md">
              <div className="flex items-start gap-4">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'rgba(34, 211, 238, 0.1)',
                  }}
                >
                  <Calendar
                    size={20}
                    style={{ color: 'var(--cyan, #22d3ee)' }}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-sm font-semibold"
                    style={{
                      color: 'var(--text-primary, #e2e8f0)',
                    }}
                  >
                    Weekly Check-in
                  </h3>
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{
                      color: 'var(--text-secondary, #94a3b8)',
                    }}
                  >
                    Take a few minutes each week to review your progress,
                    update completed items, and reflect on what is next.
                    Consistency beats intensity.
                  </p>
                  <Link
                    href="/assess/new"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80"
                    style={{ color: 'var(--cyan, #22d3ee)' }}
                  >
                    Start check-in
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right column: Timeline + Reassessment (1/3) */}
        <div className="space-y-6">
          {/* ── Milestone Timeline ── */}
          <motion.div variants={fadeUp}>
            <Card
              padding="md"
              header={
                <div className="flex items-center gap-2">
                  <Target
                    size={18}
                    style={{ color: 'var(--emerald, #34d399)' }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: 'var(--text-primary, #e2e8f0)',
                    }}
                  >
                    Milestone Timeline
                  </span>
                </div>
              }
            >
              <ProgressTimeline milestones={MOCK_PATH.milestones} />
            </Card>
          </motion.div>

          {/* ── Milestone Detail Cards ── */}
          <motion.div variants={fadeUp} className="space-y-3">
            {MOCK_PATH.milestones.slice(0, 3).map((ms) => (
              <MilestoneCard
                key={ms.id}
                milestone={ms}
                currentScore={
                  MOCK_SCORES[
                    ms.targetDimension as keyof typeof MOCK_SCORES
                  ]
                }
              />
            ))}
          </motion.div>

          {/* ── Reassessment CTA ── */}
          {showReassessment && (
            <motion.div
              variants={fadeUp}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <Card padding="md">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div
                    className="flex size-12 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.12)',
                    }}
                  >
                    <Sparkles
                      size={24}
                      style={{ color: 'var(--emerald, #34d399)' }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-semibold"
                      style={{
                        color: 'var(--emerald, #34d399)',
                      }}
                    >
                      Ready to Reassess?
                    </h3>
                    <p
                      className="mt-1 text-xs leading-relaxed"
                      style={{
                        color: 'var(--text-secondary, #94a3b8)',
                      }}
                    >
                      You have made great progress. Take a new assessment to
                      see how your scores have improved.
                    </p>
                  </div>
                  <Link
                    href="/assess/new"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--emerald, #34d399)',
                      color: '#0a1628',
                    }}
                  >
                    Take New Assessment
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Motivational message (always visible) ── */}
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
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                &ldquo;This is your path forward, and you are making
                progress. Every action you complete brings you closer to
                the home that is right for you.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
