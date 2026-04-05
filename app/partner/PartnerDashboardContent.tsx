'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  Send,
  Webhook,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui';
import type { PartnerDashboardData } from '@/lib/data/partner';
import type { Verdict } from '@/types/assessment';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Dashboard Content (Client Component)
 *
 * KPI cards, client activity chart, recent assessments, quick actions.
 * All data comes from server via props.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface KPI {
  label: string;
  value: string;
  Icon: typeof Users;
  color: string;
  bgColor: string;
}

const VERDICT_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  READY: { color: 'var(--emerald, #34d399)', bg: 'rgba(52, 211, 153, 0.1)', label: 'READY' },
  ALMOST_THERE: { color: 'var(--yellow, #facc15)', bg: 'rgba(250, 204, 21, 0.1)', label: 'ALMOST THERE' },
  BUILD_FIRST: { color: 'var(--homi-amber, #fb923c)', bg: 'rgba(251, 146, 60, 0.1)', label: 'BUILD FIRST' },
  NOT_YET: { color: 'var(--homi-crimson, #ef4444)', bg: 'rgba(239, 68, 68, 0.1)', label: 'NOT YET' },
};

interface QuickAction {
  label: string;
  description: string;
  Icon: typeof Send;
  color: string;
  bgColor: string;
  href: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Invite Client', description: 'Send assessment invitation', Icon: Send, color: 'var(--cyan, #22d3ee)', bgColor: 'rgba(34, 211, 238, 0.1)', href: '/partner/clients' },
  { label: 'Test Webhook', description: 'Send a test payload', Icon: Webhook, color: 'var(--emerald, #34d399)', bgColor: 'rgba(52, 211, 153, 0.1)', href: '/partner/api' },
  { label: 'View API Docs', description: 'Integration reference', Icon: BookOpen, color: 'var(--yellow, #facc15)', bgColor: 'rgba(250, 204, 21, 0.1)', href: '/partner/api' },
];

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ---------------------------------------------------------------------------
// Custom tooltip for recharts
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg border"
      style={{
        backgroundColor: 'var(--navy-light, #0f172a)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
      }}
    >
      <p className="font-medium mb-1" style={{ color: 'var(--text-primary, #e2e8f0)' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.dataKey === 'assessments' ? '#22d3ee' : '#34d399' }}>
          {entry.dataKey === 'assessments' ? 'Assessments' : 'New Clients'}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: build chart data from recent assessments
// ---------------------------------------------------------------------------

function buildChartData(recentAssessments: PartnerDashboardData['recentAssessments']) {
  const dayMap = new Map<string, { assessments: number }>();

  // Initialize last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    dayMap.set(key, { assessments: 0 });
  }

  // Count assessments per day
  for (const a of recentAssessments) {
    const d = new Date(a.created_at);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const existing = dayMap.get(key);
    if (existing) {
      existing.assessments += 1;
    }
  }

  return Array.from(dayMap.entries()).map(([date, counts]) => ({
    date,
    assessments: counts.assessments,
  }));
}

// ---------------------------------------------------------------------------
// Helper: relative time
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PartnerDashboardContentProps {
  data: PartnerDashboardData;
}

export default function PartnerDashboardContent({ data }: PartnerDashboardContentProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const readyRate = data.totalAssessments > 0
    ? Math.round((data.readyCount / data.totalAssessments) * 100)
    : 0;

  const kpiData: KPI[] = [
    {
      label: 'Total Clients',
      value: String(data.clientCount),
      Icon: Users,
      color: 'var(--cyan, #22d3ee)',
      bgColor: 'rgba(34, 211, 238, 0.1)',
    },
    {
      label: 'Total Assessments',
      value: String(data.totalAssessments),
      Icon: ClipboardCheck,
      color: 'var(--emerald, #34d399)',
      bgColor: 'rgba(52, 211, 153, 0.1)',
    },
    {
      label: 'READY Rate',
      value: `${readyRate}%`,
      Icon: TrendingUp,
      color: 'var(--yellow, #facc15)',
      bgColor: 'rgba(250, 204, 21, 0.1)',
    },
  ];

  const chartData = buildChartData(data.recentAssessments);

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          Partner Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          Overview of your client portfolio and platform activity
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  {kpi.label}
                </p>
                <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  {kpi.value}
                </p>
              </div>
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: kpi.bgColor }}
              >
                <kpi.Icon size={20} style={{ color: kpi.color }} />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Client Activity Chart */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Assessment Activity (Last 30 Days)
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: '#22d3ee' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Assessments</span>
                </div>
              </div>
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(34, 211, 238, 0.1)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(34, 211, 238, 0.1)' }}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="assessments"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22d3ee' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Recent Assessments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assessments */}
        <motion.div className="lg:col-span-2" variants={fadeUp}>
          <Card
            padding="md"
            header={
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Recent Client Assessments
              </span>
            }
          >
            <div className="space-y-3">
              {data.recentAssessments.length === 0 && (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  No assessments yet
                </p>
              )}
              {data.recentAssessments.map((a) => {
                const vs = VERDICT_STYLES[a.verdict] ?? VERDICT_STYLES.NOT_YET;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 rounded-lg p-3 transition-colors"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: vs.bg, color: vs.color }}
                    >
                      {a.overall_score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                        {a.user_name || a.user_email || 'Unknown'}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: vs.bg, color: vs.color }}
                    >
                      {vs.label}
                    </span>
                    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card
            padding="md"
            header={
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Quick Actions
              </span>
            }
          >
            <div className="space-y-3">
              {QUICK_ACTIONS.map((qa) => (
                <a
                  key={qa.label}
                  href={qa.href}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all cursor-pointer no-underline"
                  style={{
                    backgroundColor: hoveredAction === qa.label ? 'rgba(34, 211, 238, 0.05)' : 'rgba(15, 23, 42, 0.5)',
                  }}
                  onMouseEnter={() => setHoveredAction(qa.label)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: qa.bgColor }}
                  >
                    <qa.Icon size={18} style={{ color: qa.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                      {qa.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      {qa.description}
                    </p>
                  </div>
                  <ArrowRight size={16} style={{ color: qa.color }} />
                </a>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
