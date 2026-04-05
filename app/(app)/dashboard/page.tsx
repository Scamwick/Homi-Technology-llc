'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Landmark,
  Sparkles,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { ScoreOrb, DimensionCard, VerdictBadge } from '@/components/scoring';
import { Card, Badge } from '@/components/ui';
import { generateTransformationPath } from '@/lib/transformation/generator';
import type { ActionItem as TransformAction } from '@/lib/transformation/generator';
import type { AssessmentResult, AssessmentSummary } from '@/types/assessment';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Dashboard — The central hub.
 *
 * Shows score overview, dynamic action items, recent activity, and quick-actions.
 * Fetches real data from APIs — no hardcoded mock data.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Priority = 'high' | 'medium' | 'low';

interface DashboardAction {
  id: string;
  text: string;
  priority: Priority;
  completed: boolean;
  dimension?: 'financial' | 'emotional' | 'timing';
}

interface ActivityEvent {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  variant: 'info' | 'success' | 'warning';
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  Icon: typeof ClipboardCheck;
  color: string;
  glowColor: string;
}

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------

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
    label: 'Open Advisor',
    description: 'Chat with your HōMI advisor',
    href: '/advisor',
    Icon: Bot,
    color: 'var(--emerald, #34d399)',
    glowColor: 'rgba(52, 211, 153, 0.15)',
  },
  {
    label: 'Financial Calendar',
    description: 'Track bills, income & spending',
    href: '/calendar',
    Icon: Landmark,
    color: 'var(--yellow, #facc15)',
    glowColor: 'rgba(250, 204, 21, 0.12)',
  },
  {
    label: 'Decision Center',
    description: 'Rehearse life decisions',
    href: '/decisions',
    Icon: Sparkles,
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
// Helpers
// ---------------------------------------------------------------------------

function difficultyToPriority(difficulty: string): Priority {
  switch (difficulty) {
    case 'hard': return 'high';
    case 'medium': return 'medium';
    default: return 'low';
  }
}

function transformActionsToDisplay(actions: TransformAction[]): DashboardAction[] {
  return actions.slice(0, 6).map((a) => ({
    id: a.id,
    text: a.title,
    priority: difficultyToPriority(a.difficulty),
    completed: a.completed,
    dimension: a.dimension,
  }));
}

function buildActivityFromAssessments(assessments: AssessmentSummary[]): ActivityEvent[] {
  return assessments.slice(0, 5).map((a, i) => {
    const date = new Date(a.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let timestamp: string;
    if (diffHours < 1) timestamp = 'Just now';
    else if (diffHours < 24) timestamp = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    else if (diffDays < 7) timestamp = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    else timestamp = date.toLocaleDateString();

    const verdictLabel = a.verdict.replace(/_/g, ' ');

    return {
      id: a.id || `assess-${i}`,
      label: 'Assessment completed',
      detail: `Score: ${a.overall} (${verdictLabel})`,
      timestamp,
      variant: a.verdict === 'READY' ? 'success' as const
        : a.verdict === 'ALMOST_THERE' ? 'warning' as const
        : 'info' as const,
    };
  });
}

// ---------------------------------------------------------------------------
// Animation config
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
  const [latestResult, setLatestResult] = useState<AssessmentResult | null>(null);
  const [actions, setActions] = useState<DashboardAction[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [bankConnected, setBankConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch latest assessment and bank connection status
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [assessRes, accountsRes] = await Promise.all([
          fetch('/api/assessments?limit=5'),
          fetch('/api/plaid/accounts'),
        ]);

        if (cancelled) return;

        // Process assessments
        if (assessRes.ok) {
          const assessData = await assessRes.json();
          const assessments: AssessmentSummary[] = assessData.data ?? assessData ?? [];

          if (assessments.length > 0) {
            // Build activity from assessment history
            setActivity(buildActivityFromAssessments(assessments));

            // Try to load the latest full assessment result
            const latestId = assessments[0].id;
            if (latestId) {
              try {
                const resultRes = await fetch(`/api/assessments/${latestId}`);
                if (resultRes.ok) {
                  const resultData = await resultRes.json();
                  const result = resultData.data ?? resultData;
                  if (!cancelled) setLatestResult(result);
                }
              } catch {
                // Fall back to summary data
                if (!cancelled) {
                  setLatestResult({
                    id: assessments[0].id,
                    userId: 'self',
                    overall: assessments[0].overall,
                    verdict: assessments[0].verdict,
                    confidenceBand: assessments[0].confidenceBand ?? 'medium',
                    financial: { score: 0, maxContribution: 35, contribution: 0, breakdown: {} },
                    emotional: { score: 0, maxContribution: 35, contribution: 0, breakdown: {} },
                    timing: { score: 0, maxContribution: 30, contribution: 0, breakdown: {} },
                    monteCarlo: { successRate: 0, scenariosRun: 0, p10: 0, p50: 0, p90: 0, crashSurvivalRate: 0, gateApplied: false },
                    crisisDetected: false,
                    createdAt: assessments[0].createdAt,
                    version: '1.0.0',
                  } as AssessmentResult);
                }
              }
            }

            // Generate dynamic action items from scores
            const latest = assessments[0];
            const path = generateTransformationPath({
              financial: latest.overall > 0 ? Math.min(100, latest.overall + 10) : 50,
              emotional: latest.overall > 0 ? latest.overall : 50,
              timing: latest.overall > 0 ? Math.max(0, latest.overall - 5) : 50,
              verdict: latest.verdict,
            });
            if (!cancelled) setActions(transformActionsToDisplay(path.actionItems));
          }
        }

        // Check bank connections
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          if (accountsData.data?.length > 0) {
            setBankConnected(true);
          }
        }
      } catch {
        // Dashboard still renders without data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  // Use real scores from latest result, or defaults for new users
  const score = latestResult?.overall ?? 0;
  const verdict = latestResult?.verdict ?? 'BUILD_FIRST';
  const dimensions = {
    financial: { score: latestResult?.financial?.score ?? 0, maxContribution: 35 },
    emotional: { score: latestResult?.emotional?.score ?? 0, maxContribution: 35 },
    timing: { score: latestResult?.timing?.score ?? 0, maxContribution: 30 },
  };

  const toggleAction = useCallback((id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)),
    );
  }, []);

  // Default actions for new users who haven't taken an assessment
  const displayActions: DashboardAction[] = actions.length > 0 ? actions : [
    { id: 'onboard-1', text: 'Take your first readiness assessment', priority: 'high' as Priority, completed: false },
    { id: 'onboard-2', text: 'Connect your bank accounts for verified insights', priority: 'high' as Priority, completed: bankConnected },
    { id: 'onboard-3', text: 'Explore the financial calendar', priority: 'medium' as Priority, completed: false },
    { id: 'onboard-4', text: 'Set up your decision goals', priority: 'low' as Priority, completed: false },
  ];

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
          {latestResult && bankConnected && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs" style={{ color: '#34d399' }}>
              <TrendingUp size={12} /> Verified data active
            </span>
          )}
        </p>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         SCORE OVERVIEW
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          {score > 0 ? (
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
              <div className="flex flex-col items-center gap-3">
                <ScoreOrb score={score} size="md" showLabel />
                <VerdictBadge verdict={verdict} pulse />
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <DimensionCard
                  dimension="financial"
                  score={dimensions.financial.score}
                  maxContribution={dimensions.financial.maxContribution}
                />
                <DimensionCard
                  dimension="emotional"
                  score={dimensions.emotional.score}
                  maxContribution={dimensions.emotional.maxContribution}
                />
                <DimensionCard
                  dimension="timing"
                  score={dimensions.timing.score}
                  maxContribution={dimensions.timing.maxContribution}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div
                className="flex size-16 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
              >
                <ClipboardCheck size={28} style={{ color: '#22d3ee' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  No assessment yet
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Take your first assessment to see your readiness score across all three dimensions.
                </p>
              </div>
              <Link
                href="/assess/new"
                className="mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)', color: '#22d3ee' }}
              >
                Start Assessment
              </Link>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         PLAID BANNER (when not connected)
         ════════════════════════════════════════════════════════════════════ */}
      {!bankConnected && !loading && (
        <motion.div variants={fadeUp}>
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(250, 204, 21, 0.12)' }}
              >
                <AlertTriangle size={20} style={{ color: '#facc15' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Unlock verified insights
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Connect your bank accounts to get real DTI, savings rate, and income volatility data that makes your score more accurate.
                </p>
              </div>
              <Link
                href="/calendar"
                className="shrink-0 rounded-lg px-4 py-2 text-xs font-semibold"
                style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)', color: '#22d3ee' }}
              >
                Connect
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

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
                  {actions.length > 0 ? 'Your Transformation Path' : 'Getting Started'}
                </span>
              </div>
            }
          >
            <ul className="space-y-3">
              {displayActions.map((item) => {
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
            {activity.length > 0 ? (
              <ul className="space-y-4">
                {activity.map((ev) => (
                  <li key={ev.id} className="flex gap-3">
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
            ) : (
              <p className="text-xs text-center py-6" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Complete your first assessment to see activity here.
              </p>
            )}
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
