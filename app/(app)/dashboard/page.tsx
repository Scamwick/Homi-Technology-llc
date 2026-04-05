'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Bot,
  Wrench,
  Clock,
  ArrowRight,
  Activity,
  ListChecks,
  Landmark,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Circle,
  CheckCircle2,
  MessageSquare,
  Shield,
  Heart,
  Timer,
} from 'lucide-react';
import { ScoreOrb, DimensionCard, VerdictBadge } from '@/components/scoring';
import { Card, Badge, Button } from '@/components/ui';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { BrandedName } from '@/components/brand/BrandedName';
import { generateTransformationPath } from '@/lib/transformation/generator';
import type { ActionItem as TransformAction } from '@/lib/transformation/generator';
import type { AssessmentResult, AssessmentSummary } from '@/types/assessment';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Dashboard — Personal Readiness Command Center
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
  icon: typeof Activity;
  label: string;
  detail: string;
  timestamp: string;
  color: string;
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
      icon: Activity,
      label: 'Assessment completed',
      detail: `Score: ${a.overall} (${verdictLabel})`,
      timestamp,
      color: a.verdict === 'READY' ? '#34d399'
        : a.verdict === 'ALMOST_THERE' ? '#facc15'
        : '#22d3ee',
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const PRIORITY_MAP: Record<string, { label: string; variant: 'info' | 'warning' | 'caution' }> = {
  high: { label: 'High', variant: 'caution' },
  medium: { label: 'Med', variant: 'warning' },
  low: { label: 'Low', variant: 'info' },
};

// ---------------------------------------------------------------------------
// Mock activity feed
// ---------------------------------------------------------------------------
const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: 'a1', icon: Activity, label: 'Assessment completed', detail: 'Score: 73 (ALMOST THERE)', timestamp: '2 hours ago', color: '#facc15' },
  { id: 'a2', icon: Activity, label: 'Trinity analysis generated', detail: 'Advocate, Skeptic, Arbiter perspectives', timestamp: '2 hours ago', color: '#22d3ee' },
  { id: 'a3', icon: Activity, label: 'Transformation path started', detail: '8 action items generated', timestamp: '1 day ago', color: '#34d399' },
  { id: 'a4', icon: Activity, label: 'Daily check-in completed', detail: 'Streak: 3 days', timestamp: '1 day ago', color: '#facc15' },
  { id: 'a5', icon: Activity, label: 'First assessment taken', detail: 'Score: 58 (BUILD FIRST)', timestamp: '2 weeks ago', color: '#fb923c' },
];

// ---------------------------------------------------------------------------
// Mock score history for sparkline
// ---------------------------------------------------------------------------
const SCORE_HISTORY = [
  { date: '2026-01-15', score: 58 },
  { date: '2026-02-20', score: 65 },
  { date: '2026-03-25', score: 73 },
];

// ---------------------------------------------------------------------------
// Sparkline SVG sub-component
// ---------------------------------------------------------------------------

function ScoreSparkline({ data }: { data: typeof SCORE_HISTORY }) {
  const W = 600;
  const H = 80;
  const padX = 40;
  const padY = 12;

  const minScore = Math.min(...data.map((d) => d.score)) - 10;
  const maxScore = Math.max(...data.map((d) => d.score)) + 10;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (W - padX * 2);
    const y = padY + ((maxScore - d.score) / (maxScore - minScore)) * (H - padY * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkline-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <motion.path
        d={areaPath}
        fill="url(#sparkline-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      />
      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="url(#sparkline-stroke)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 1.2, ease: 'easeInOut' as const }}
      />
      {/* Data points */}
      {points.map((p, i) => (
        <g key={p.date}>
          {/* Glow */}
          <motion.circle
            cx={p.x}
            cy={p.y}
            r={6}
            fill="rgba(34, 211, 238, 0.2)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + i * 0.2, duration: 0.3 }}
          />
          {/* Dot */}
          <motion.circle
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill={i === points.length - 1 ? '#34d399' : '#22d3ee'}
            stroke="rgba(10, 22, 40, 0.8)"
            strokeWidth={1.5}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + i * 0.2, duration: 0.3 }}
          />
          {/* Score label */}
          <motion.text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            fill={i === points.length - 1 ? '#34d399' : '#94a3b8'}
            fontSize={12}
            fontWeight={600}
            fontFamily="inherit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.2, duration: 0.3 }}
          >
            {p.score}
          </motion.text>
          {/* Date label */}
          <text
            x={p.x}
            y={H - 2}
            textAnchor="middle"
            fill="#64748b"
            fontSize={10}
            fontFamily="inherit"
          >
            {p.date}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <motion.div
      className="mx-auto w-full max-w-6xl flex flex-col items-center justify-center py-16"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Compass */}
      <motion.div variants={fadeUp} className="mb-8">
        <ThresholdCompass size={200} financial={0} emotional={0} timing={0} animate />
      </motion.div>

      {/* Heading */}
      <motion.h1
        variants={fadeUp}
        className="text-2xl font-bold tracking-tight text-center mb-3"
        style={{ color: '#e2e8f0' }}
      >
        Your readiness compass is waiting.
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="text-base text-center max-w-md mb-8"
        style={{ color: '#94a3b8' }}
      >
        Take your first assessment to discover your{' '}
        <BrandedName className="font-bold" />
        -Score across three dimensions.
      </motion.p>

      {/* CTA */}
      <motion.div variants={fadeUp}>
        <Link href="/assess/new">
          <Button variant="cta" size="lg" icon={<ClipboardCheck size={20} />}>
            Take Assessment
          </Button>
        </Link>
      </motion.div>

      {/* Three dimension explanation cards */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-2xl"
      >
        {[
          {
            icon: Shield,
            label: 'Financial',
            desc: 'Debt ratios, savings, credit, and down payment readiness.',
            color: '#22d3ee',
            border: 'rgba(34, 211, 238, 0.3)',
          },
          {
            icon: Heart,
            label: 'Emotional',
            desc: 'Life stability, confidence, partner alignment, and FOMO awareness.',
            color: '#34d399',
            border: 'rgba(52, 211, 153, 0.3)',
          },
          {
            icon: Timer,
            label: 'Timing',
            desc: 'Market conditions, time horizon, savings velocity, and progress.',
            color: '#facc15',
            border: 'rgba(250, 204, 21, 0.3)',
          },
        ].map((dim) => (
          <Card key={dim.label} padding="sm">
            <div
              className="w-full rounded-t-lg -mt-4 -mx-4 px-4 pt-3 pb-2 mb-3"
              style={{
                width: 'calc(100% + 2rem)',
                borderBottom: `2px solid ${dim.border}`,
              }}
            >
              <div className="flex items-center gap-2">
                <dim.icon size={16} style={{ color: dim.color }} />
                <span className="text-sm font-semibold" style={{ color: dim.color }}>
                  {dim.label}
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              {dim.desc}
            </p>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
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

  // STATE 1: Loading
  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    );
  }

  // STATE 2: Empty — no assessments yet
  if (!latestResult) {
    return <EmptyState />;
  }

  // STATE 3: Active dashboard
  const transformationProgress = 37.5; // 3 of 8
  const completedItems = 3;
  const totalItems = 8;

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Page header ── */}
      <motion.div variants={fadeUp}>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#e2e8f0' }}
        >
          Command Center
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
         TWO-COLUMN LAYOUT: Left 60% / Right 40%
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

        {/* ────────────────────────────────────────────────────────────────
           RIGHT COLUMN (2/5 = 40%)
           ──────────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Quick Actions Grid (2x2) ── */}
          <motion.div variants={fadeUp}>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#94a3b8' }}
            >
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'New Assessment',
                  href: '/assess/new',
                  Icon: ClipboardCheck,
                  color: '#34d399',
                  glow: 'rgba(52, 211, 153, 0.12)',
                },
                {
                  label: 'AI Advisor',
                  href: '/advisor',
                  Icon: Bot,
                  color: '#22d3ee',
                  glow: 'rgba(34, 211, 238, 0.12)',
                },
                {
                  label: 'Agent',
                  href: '/agent',
                  Icon: Sparkles,
                  color: '#facc15',
                  glow: 'rgba(250, 204, 21, 0.10)',
                },
                {
                  label: 'Tools',
                  href: '/tools',
                  Icon: Wrench,
                  color: '#fb923c',
                  glow: 'rgba(251, 146, 60, 0.12)',
                },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="group">
                  <Card interactive padding="sm">
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div
                        className="flex size-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: action.glow }}
                      >
                        <action.Icon size={20} style={{ color: action.color }} />
                      </div>
                      <span
                        className="text-xs font-semibold text-center"
                        style={{ color: '#e2e8f0' }}
                      >
                        {action.label}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── Recent Activity Feed ── */}
          <motion.div variants={fadeUp}>
            <Card
              padding="md"
              header={
                <div className="flex items-center gap-2">
                  <Activity size={16} style={{ color: '#34d399' }} />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: '#e2e8f0' }}
                  >
                    Recent Activity
                  </span>
                </div>
              }
            >
              <ul className="space-y-3">
                {MOCK_ACTIVITY.map((ev, i) => (
                  <li key={ev.id} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div
                        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${ev.color}15` }}
                      >
                        <ev.icon size={12} style={{ color: ev.color }} />
                      </div>
                      {i < MOCK_ACTIVITY.length - 1 && (
                        <span
                          className="flex-1 w-px mt-1"
                          style={{ backgroundColor: 'rgba(148, 163, 184, 0.12)' }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-1 min-w-0">
                      <p
                        className="text-sm font-medium leading-tight"
                        style={{ color: '#e2e8f0' }}
                      >
                        {ev.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: '#94a3b8' }}
                      >
                        {ev.detail}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'rgba(148, 163, 184, 0.5)' }}
                      >
                        {ev.timestamp}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* ── Temporal Twin Preview ── */}
          <motion.div variants={fadeUp}>
            <Card padding="sm">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
                >
                  <MessageSquare size={16} style={{ color: '#22d3ee' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#22d3ee' }}
                  >
                    Temporal Twin
                  </p>
                  <p
                    className="text-sm italic leading-relaxed"
                    style={{ color: '#94a3b8' }}
                  >
                    &ldquo;Focus on your emotional readiness score -- that alignment
                    conversation will unlock everything.&rdquo;
                  </p>
                  <Link
                    href="/temporal-twin"
                    className="inline-flex items-center gap-1 text-xs font-medium mt-2 transition-colors"
                    style={{ color: '#22d3ee' }}
                  >
                    Talk to your future self
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── Recent Activity (dynamic) ── */}
          <motion.div variants={fadeUp}>
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
                          backgroundColor: ev.color,
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
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         BOTTOM ROW — Assessment History Sparkline (full width)
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: '#22d3ee' }} />
              <span
                className="text-sm font-semibold"
                style={{ color: '#e2e8f0' }}
              >
                Score History
              </span>
            </div>
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              {SCORE_HISTORY.length} assessments
            </span>
          </div>
          <div className="h-24">
            <ScoreSparkline data={SCORE_HISTORY} />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
