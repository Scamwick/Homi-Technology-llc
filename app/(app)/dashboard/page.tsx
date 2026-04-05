'use client';

import { useState, useEffect } from 'react';
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
import type { Verdict } from '@/lib/scoring/engine';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Dashboard — The central hub.
 *
 * Fetches the user's latest assessment data and renders score overview,
 * action items, recent activity, and embedded calculator widgets.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Data Fetching Types
// ---------------------------------------------------------------------------

interface DashboardData {
  score: number;
  verdict: Verdict;
  dimensions: {
    financial: { score: number; maxContribution: number };
    emotional: { score: number; maxContribution: number };
    timing: { score: number; maxContribution: number };
  };
  scoringInputs: AssessmentInputs;
  debts: Array<{ name: string; balance: number; annualRate: number; minimumPayment: number }>;
  hasAssessment: boolean;
}

// Defaults when no assessment exists yet
const EMPTY_DASHBOARD: DashboardData = {
  score: 0,
  verdict: 'NOT_YET',
  dimensions: {
    financial: { score: 0, maxContribution: 35 },
    emotional: { score: 0, maxContribution: 35 },
    timing: { score: 0, maxContribution: 30 },
  },
  scoringInputs: {
    debtToIncomeRatio: 0.35,
    downPaymentPercent: 0.10,
    emergencyFundMonths: 2,
    creditScore: 680,
    lifeStability: 5,
    confidenceLevel: 5,
    partnerAlignment: null,
    fomoLevel: 5,
    timeHorizonMonths: 12,
    savingsRate: 0.10,
    downPaymentProgress: 0.25,
  },
  debts: [],
  hasAssessment: false,
};

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
    detail: 'Monte Carlo Simulator: 10k scenarios run',
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
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<ActionItem[]>(INITIAL_ACTIONS);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/assessments');
        const json = await res.json();
        const assessments = json?.data?.assessments;
        if (assessments && assessments.length > 0) {
          // Use the latest assessment
          const latest = assessments[assessments.length - 1];
          setData((prev) => ({
            ...prev,
            score: latest.overall ?? 0,
            verdict: latest.verdict ?? 'NOT_YET',
            hasAssessment: true,
          }));
        }
      } catch (err) {
        console.error('[Dashboard] Failed to fetch assessments:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  function toggleAction(id: string) {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)),
    );
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl flex items-center justify-center py-24">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--cyan, #22d3ee)', borderTopColor: 'transparent' }}
        />
      </div>
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
              <ScoreOrb score={data.score} size="md" showLabel />
              <VerdictBadge verdict={data.verdict} pulse />
            </div>

            {/* Dimension Cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <DimensionCard
                dimension="financial"
                score={data.dimensions.financial.score}
                maxContribution={data.dimensions.financial.maxContribution}
              />
              <DimensionCard
                dimension="emotional"
                score={data.dimensions.emotional.score}
                maxContribution={data.dimensions.emotional.maxContribution}
              />
              <DimensionCard
                dimension="timing"
                score={data.dimensions.timing.score}
                maxContribution={data.dimensions.timing.maxContribution}
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
            downPaymentPercent={data.scoringInputs.downPaymentPercent * 100}
            interestRate={6.5}
            monthlyIncome={Math.round(95000 / 12)}
            dataSource={data.hasAssessment ? 'assessment' : 'manual'}
          />
          <MiniDebtPayoff
            debts={data.debts.length > 0 ? data.debts : [
              { name: 'Sample Debt', balance: 5000, annualRate: 18, minimumPayment: 150 },
            ]}
            extraPayment={200}
            dataSource={data.hasAssessment ? 'assessment' : 'manual'}
          />
          <MiniScoreImpact baseInputs={data.scoringInputs} />
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
