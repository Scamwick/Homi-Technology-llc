'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Bot,
  Calculator,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  Activity,
  ListChecks,
} from 'lucide-react';
import { ScoreOrb, DimensionCard, VerdictBadge } from '@/components/scoring';
import { Card, Badge } from '@/components/ui';
import { MiniPITI, MiniDebtPayoff, MiniScoreImpact } from '@/components/calculators';
import type { AssessmentInputs } from '@/lib/scoring/engine';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Dashboard — The central hub.
 *
 * Shows score overview, action items, recent activity, and quick-action cards.
 * Uses mock data throughout — no API calls.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_SCORE = 73;
const MOCK_DIMENSIONS = {
  financial: { score: 82, maxContribution: 40 },
  emotional: { score: 61, maxContribution: 35 },
  timing: { score: 77, maxContribution: 25 },
} as const;

// Mock scoring inputs for what-if modeler (derived from the mock score)
const MOCK_SCORING_INPUTS: AssessmentInputs = {
  debtToIncomeRatio: 0.32,
  downPaymentPercent: 0.15,
  emergencyFundMonths: 4,
  creditScore: 720,
  lifeStability: 6,
  confidenceLevel: 5,
  partnerAlignment: 7,
  fomoLevel: 4,
  timeHorizonMonths: 9,
  savingsRate: 0.15,
  downPaymentProgress: 0.60,
};

const MOCK_DEBTS = [
  { name: 'Credit Card', balance: 8500, annualRate: 22.9, minimumPayment: 200 },
  { name: 'Car Loan', balance: 15000, annualRate: 6.5, minimumPayment: 350 },
  { name: 'Student Loan', balance: 28000, annualRate: 5.8, minimumPayment: 280 },
];

type Priority = 'high' | 'medium' | 'low';

interface ActionItem {
  id: string;
  text: string;
  priority: Priority;
  completed: boolean;
}

const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: 'a1',
    text: 'Build 3 more months of emergency fund',
    priority: 'high',
    completed: false,
  },
  {
    id: 'a2',
    text: 'Have the alignment conversation with your partner',
    priority: 'high',
    completed: false,
  },
  {
    id: 'a3',
    text: 'Track mortgage rates for the next quarter',
    priority: 'medium',
    completed: false,
  },
  {
    id: 'a4',
    text: 'Review homeowners insurance quotes',
    priority: 'low',
    completed: false,
  },
];

interface ActivityEvent {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  variant: 'info' | 'success' | 'warning';
}

const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: 'ev1',
    label: 'Assessment completed',
    detail: 'Score: 73 (ALMOST THERE)',
    timestamp: '2 hours ago',
    variant: 'warning',
  },
  {
    id: 'ev2',
    label: 'Agent action',
    detail: 'Monitored 3 rate changes this week',
    timestamp: '5 hours ago',
    variant: 'info',
  },
  {
    id: 'ev3',
    label: 'Tool used',
    detail: 'Monte Carlo Simulator — 10k scenarios run',
    timestamp: '1 day ago',
    variant: 'info',
  },
  {
    id: 'ev4',
    label: 'Score improved',
    detail: 'Financial dimension: 78 -> 82 (+4)',
    timestamp: '3 days ago',
    variant: 'success',
  },
  {
    id: 'ev5',
    label: 'Assessment completed',
    detail: 'Score: 69 (ALMOST THERE)',
    timestamp: '1 week ago',
    variant: 'warning',
  },
];

interface QuickAction {
  label: string;
  description: string;
  href: string;
  Icon: typeof ClipboardCheck;
  color: string;
  glowColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Take Assessment',
    description: 'Recalculate your readiness score',
    href: '/assess/new',
    Icon: ClipboardCheck,
    color: 'var(--cyan, #22d3ee)',
    glowColor: 'rgba(34, 211, 238, 0.15)',
  },
  {
    label: 'Open Agent',
    description: 'Chat with your HōMI advisor',
    href: '/agent',
    Icon: Bot,
    color: 'var(--emerald, #34d399)',
    glowColor: 'rgba(52, 211, 153, 0.15)',
  },
  {
    label: 'Financial Tools',
    description: 'Calculators and simulators',
    href: '/tools',
    Icon: Calculator,
    color: 'var(--yellow, #facc15)',
    glowColor: 'rgba(250, 204, 21, 0.12)',
  },
  {
    label: 'View History',
    description: 'Past assessments and trends',
    href: '/assess',
    Icon: Clock,
    color: 'var(--cyan, #22d3ee)',
    glowColor: 'rgba(34, 211, 238, 0.15)',
  },
];

const PRIORITY_MAP: Record<Priority, { label: string; variant: 'danger' | 'warning' | 'info' }> = {
  high: { label: 'High', variant: 'danger' },
  medium: { label: 'Med', variant: 'warning' },
  low: { label: 'Low', variant: 'info' },
};

// ---------------------------------------------------------------------------
// Stagger animation config
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [actions, setActions] = useState<ActionItem[]>(INITIAL_ACTIONS);

  function toggleAction(id: string) {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)),
    );
  }

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Page header ── */}
      <motion.div variants={fadeUp}>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          Dashboard
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Your decision readiness at a glance
        </p>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         SCORE OVERVIEW
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
            {/* Score Orb */}
            <div className="flex flex-col items-center gap-3">
              <ScoreOrb score={MOCK_SCORE} size="md" showLabel />
              <VerdictBadge verdict="ALMOST_THERE" pulse />
            </div>

            {/* Dimension Cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <DimensionCard
                dimension="financial"
                score={MOCK_DIMENSIONS.financial.score}
                maxContribution={MOCK_DIMENSIONS.financial.maxContribution}
              />
              <DimensionCard
                dimension="emotional"
                score={MOCK_DIMENSIONS.emotional.score}
                maxContribution={MOCK_DIMENSIONS.emotional.maxContribution}
              />
              <DimensionCard
                dimension="timing"
                score={MOCK_DIMENSIONS.timing.score}
                maxContribution={MOCK_DIMENSIONS.timing.maxContribution}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         YOUR NUMBERS — Embedded calculator widgets
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <h2
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Your Numbers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MiniPITI
            homePrice={425000}
            downPaymentPercent={15}
            interestRate={6.5}
            monthlyIncome={Math.round(95000 / 12)}
            dataSource="assessment"
          />
          <MiniDebtPayoff
            debts={MOCK_DEBTS}
            extraPayment={200}
            dataSource="assessment"
          />
          <MiniScoreImpact baseInputs={MOCK_SCORING_INPUTS} />
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         ACTION ITEMS + RECENT ACTIVITY  (2-column on desktop)
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Action Items (left, 3/5) ── */}
        <motion.div className="lg:col-span-3" variants={fadeUp}>
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <ListChecks
                  size={18}
                  style={{ color: 'var(--cyan, #22d3ee)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  Recommended Actions
                </span>
              </div>
            }
          >
            <ul className="space-y-3">
              {actions.map((item) => {
                const p = PRIORITY_MAP[item.priority];
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAction(item.id)}
                      className="mt-0.5 shrink-0 cursor-pointer"
                      aria-label={
                        item.completed
                          ? `Mark "${item.text}" incomplete`
                          : `Mark "${item.text}" complete`
                      }
                    >
                      {item.completed ? (
                        <CheckCircle2
                          size={20}
                          style={{ color: 'var(--emerald, #34d399)' }}
                        />
                      ) : (
                        <Circle
                          size={20}
                          className="transition-colors"
                          style={{ color: 'var(--text-secondary, #94a3b8)' }}
                        />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm leading-relaxed transition-opacity ${
                        item.completed ? 'line-through opacity-50' : ''
                      }`}
                      style={{ color: 'var(--text-primary, #e2e8f0)' }}
                    >
                      {item.text}
                    </span>
                    <Badge variant={p.variant}>{p.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        </motion.div>

        {/* ── Recent Activity (right, 2/5) ── */}
        <motion.div className="lg:col-span-2" variants={fadeUp}>
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <Activity
                  size={18}
                  style={{ color: 'var(--emerald, #34d399)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  Recent Activity
                </span>
              </div>
            }
          >
            <ul className="space-y-4">
              {MOCK_ACTIVITY.map((ev) => (
                <li key={ev.id} className="flex gap-3">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center">
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          ev.variant === 'success'
                            ? 'var(--emerald, #34d399)'
                            : ev.variant === 'warning'
                              ? 'var(--yellow, #facc15)'
                              : 'var(--cyan, #22d3ee)',
                      }}
                    />
                    <span
                      className="flex-1 w-px mt-1"
                      style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)' }}
                    />
                  </div>
                  <div className="pb-1">
                    <p
                      className="text-sm font-medium leading-tight"
                      style={{ color: 'var(--text-primary, #e2e8f0)' }}
                    >
                      {ev.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-secondary, #94a3b8)' }}
                    >
                      {ev.detail}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'rgba(148, 163, 184, 0.6)' }}
                    >
                      {ev.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         QUICK ACTIONS
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((qa) => (
            <Link key={qa.href} href={qa.href} className="group">
              <Card interactive padding="md">
                <div className="flex flex-col gap-3">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: qa.glowColor }}
                  >
                    <qa.Icon size={20} style={{ color: qa.color }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary, #e2e8f0)' }}
                    >
                      {qa.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-secondary, #94a3b8)' }}
                    >
                      {qa.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                    style={{ color: qa.color }}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
