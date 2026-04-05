'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Bot,
  Wrench,
  Clock,
  ArrowRight,
  Activity,
  Sparkles,
  Users,
  MessageSquare,
  TrendingUp,
  Shield,
  Heart,
  Timer,
  Zap,
} from 'lucide-react';
import { ScoreOrb, DimensionCard, VerdictBadge } from '@/components/scoring';
import { ThresholdCompass, BrandedName } from '@/components/brand';
import { Card, Button, ProgressBar } from '@/components/ui';
import type { Verdict } from '@/lib/scoring/engine';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Dashboard — Personal Readiness Command Center
 *
 * Two states:
 *   1. Empty — No assessments yet (ThresholdCompass + CTA)
 *   2. Active — Score hero, dimensions, transformation, quick actions,
 *               activity feed, temporal twin, sparkline history
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardData {
  score: number;
  verdict: Verdict;
  dimensions: {
    financial: { score: number; maxContribution: number };
    emotional: { score: number; maxContribution: number };
    timing: { score: number; maxContribution: number };
  };
  hasAssessment: boolean;
}

// ---------------------------------------------------------------------------
// Mock data (STATE 2)
// ---------------------------------------------------------------------------

const MOCK_DATA: DashboardData = {
  score: 73,
  verdict: 'ALMOST_THERE',
  dimensions: {
    financial: { score: 82, maxContribution: 35 },
    emotional: { score: 61, maxContribution: 35 },
    timing: { score: 77, maxContribution: 30 },
  },
  hasAssessment: true,
};

const EMPTY_DATA: DashboardData = {
  score: 0,
  verdict: 'NOT_YET',
  dimensions: {
    financial: { score: 0, maxContribution: 35 },
    emotional: { score: 0, maxContribution: 35 },
    timing: { score: 0, maxContribution: 30 },
  },
  hasAssessment: false,
};

interface ActivityEvent {
  id: string;
  icon: typeof Activity;
  label: string;
  detail: string;
  timestamp: string;
  color: string;
}

const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: 'ev1',
    icon: ClipboardCheck,
    label: 'Assessment completed',
    detail: 'Score: 73',
    timestamp: '2 hours ago',
    color: '#facc15',
  },
  {
    id: 'ev2',
    icon: Sparkles,
    label: 'Trinity analysis generated',
    detail: 'All three dimensions analyzed',
    timestamp: '2 hours ago',
    color: '#22d3ee',
  },
  {
    id: 'ev3',
    icon: TrendingUp,
    label: 'Transformation path started',
    detail: '8 action items created',
    timestamp: '1 day ago',
    color: '#34d399',
  },
  {
    id: 'ev4',
    icon: ClipboardCheck,
    label: 'Assessment completed',
    detail: 'Score: 65',
    timestamp: '1 week ago',
    color: '#facc15',
  },
  {
    id: 'ev5',
    icon: ClipboardCheck,
    label: 'Assessment completed',
    detail: 'Score: 58',
    timestamp: '3 weeks ago',
    color: '#fb923c',
  },
];

/** Mock sparkline data — 3 assessments over time */
const SCORE_HISTORY = [
  { date: 'Mar 12', score: 58 },
  { date: 'Mar 26', score: 65 },
  { date: 'Apr 5', score: 73 },
];

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
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/assessments');
        const json = await res.json();
        const assessments = json?.data?.assessments;
        if (assessments && assessments.length > 0) {
          const latest = assessments[assessments.length - 1];
          setData({
            score: latest.overall ?? MOCK_DATA.score,
            verdict: latest.verdict ?? MOCK_DATA.verdict,
            dimensions: MOCK_DATA.dimensions,
            hasAssessment: true,
          });
        } else {
          // Use mock data for demonstration
          setData(MOCK_DATA);
        }
      } catch {
        // Fallback to mock data on error
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Loading spinner
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl flex items-center justify-center py-24">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  // STATE 1: Empty — no assessments
  if (!data.hasAssessment) {
    return <EmptyState />;
  }

  // STATE 2: Active dashboard
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
        <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
          Your <BrandedName className="font-semibold" /> readiness at a glance
        </p>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         TWO-COLUMN LAYOUT: Left 60% / Right 40%
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ────────────────────────────────────────────────────────────────
           LEFT COLUMN (3/5 = 60%)
           ──────────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* ── Score Hero Card ── */}
          <motion.div variants={fadeUp}>
            <Card padding="lg">
              <div className="flex flex-col items-center gap-4">
                <ScoreOrb score={data.score} size="lg" showLabel />
                <VerdictBadge verdict={data.verdict} size="lg" pulse />
                <p
                  className="text-xs text-center mt-1"
                  style={{ color: '#94a3b8' }}
                >
                  <BrandedName className="font-semibold" />
                  -Score across all three dimensions
                </p>
              </div>
            </Card>
          </motion.div>

          {/* ── Three Dimension Bars ── */}
          <motion.div variants={fadeUp}>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#94a3b8' }}
            >
              Dimension Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </motion.div>

          {/* ── Transformation Progress ── */}
          {(data.verdict === 'NOT_YET' ||
            data.verdict === 'BUILD_FIRST' ||
            data.verdict === 'ALMOST_THERE') && (
            <motion.div variants={fadeUp}>
              <Card padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} style={{ color: '#34d399' }} />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: '#e2e8f0' }}
                  >
                    Transformation Progress
                  </span>
                </div>

                <ProgressBar
                  value={transformationProgress}
                  color="emerald"
                  size="md"
                  showLabel
                  className="mb-3"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#94a3b8' }}>
                    {completedItems} of {totalItems} action items completed
                  </span>
                  <Link
                    href="/transformation"
                    className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: '#34d399' }}
                  >
                    View path
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

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

          {/* ── Couple Status ── */}
          <motion.div variants={fadeUp}>
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
                >
                  <Users size={16} style={{ color: '#34d399' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: '#e2e8f0' }}
                  >
                    Partner: Sarah
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    Score: 68 &middot; Almost There
                  </p>
                </div>
                <Link
                  href="/couples"
                  className="shrink-0"
                >
                  <ArrowRight size={16} style={{ color: '#34d399' }} />
                </Link>
              </div>
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
