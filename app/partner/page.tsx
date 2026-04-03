'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  Send,
  Webhook,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
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
import { Card, Badge, Button } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Dashboard
 *
 * KPI cards, client activity chart, recent assessments, quick actions.
 * All data is mock.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

interface KPI {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  Icon: typeof Users;
  color: string;
  bgColor: string;
}

const KPI_DATA: KPI[] = [
  {
    label: 'Total Clients',
    value: '47',
    change: '+5 this month',
    changeType: 'up',
    Icon: Users,
    color: 'var(--cyan, #22d3ee)',
    bgColor: 'rgba(34, 211, 238, 0.1)',
  },
  {
    label: 'Assessments This Month',
    value: '156',
    change: '+12% vs last month',
    changeType: 'up',
    Icon: ClipboardCheck,
    color: 'var(--emerald, #34d399)',
    bgColor: 'rgba(52, 211, 153, 0.1)',
  },
  {
    label: 'READY Rate',
    value: '31%',
    change: '+3pp vs last month',
    changeType: 'up',
    Icon: TrendingUp,
    color: 'var(--yellow, #facc15)',
    bgColor: 'rgba(250, 204, 21, 0.1)',
  },
  {
    label: 'Revenue',
    value: '$2,340',
    change: '+8% vs last month',
    changeType: 'up',
    Icon: DollarSign,
    color: 'var(--emerald, #34d399)',
    bgColor: 'rgba(52, 211, 153, 0.1)',
  },
];

function generateChartData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      assessments: Math.floor(Math.random() * 8) + 2,
      clients: Math.floor(Math.random() * 4) + 1,
    });
  }
  return data;
}

const CHART_DATA = generateChartData();

type Verdict = 'READY' | 'ALMOST_THERE' | 'NOT_YET' | 'STOP';

interface RecentAssessment {
  id: string;
  clientName: string;
  score: number;
  verdict: Verdict;
  decision: string;
  timestamp: string;
}

const RECENT_ASSESSMENTS: RecentAssessment[] = [
  { id: 'a1', clientName: 'Sarah Mitchell', score: 82, verdict: 'READY', decision: 'Home Purchase', timestamp: '2 hours ago' },
  { id: 'a2', clientName: 'James Rodriguez', score: 71, verdict: 'ALMOST_THERE', decision: 'Career Change', timestamp: '5 hours ago' },
  { id: 'a3', clientName: 'Emily Chen', score: 45, verdict: 'NOT_YET', decision: 'Investment Property', timestamp: '1 day ago' },
  { id: 'a4', clientName: 'Michael Davis', score: 88, verdict: 'READY', decision: 'Business Launch', timestamp: '1 day ago' },
  { id: 'a5', clientName: 'Olivia Thompson', score: 34, verdict: 'STOP', decision: 'Relocation', timestamp: '2 days ago' },
];

const VERDICT_STYLES: Record<Verdict, { color: string; bg: string; label: string }> = {
  READY: { color: 'var(--emerald, #34d399)', bg: 'rgba(52, 211, 153, 0.1)', label: 'READY' },
  ALMOST_THERE: { color: 'var(--yellow, #facc15)', bg: 'rgba(250, 204, 21, 0.1)', label: 'ALMOST THERE' },
  NOT_YET: { color: 'var(--homi-amber, #fb923c)', bg: 'rgba(251, 146, 60, 0.1)', label: 'NOT YET' },
  STOP: { color: 'var(--homi-crimson, #ef4444)', bg: 'rgba(239, 68, 68, 0.1)', label: 'STOP' },
};

interface QuickAction {
  label: string;
  description: string;
  Icon: typeof Send;
  color: string;
  bgColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Invite Client', description: 'Send assessment invitation', Icon: Send, color: 'var(--cyan, #22d3ee)', bgColor: 'rgba(34, 211, 238, 0.1)' },
  { label: 'Test Webhook', description: 'Send a test payload', Icon: Webhook, color: 'var(--emerald, #34d399)', bgColor: 'rgba(52, 211, 153, 0.1)' },
  { label: 'View API Docs', description: 'Integration reference', Icon: BookOpen, color: 'var(--yellow, #facc15)', bgColor: 'rgba(250, 204, 21, 0.1)' },
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
// Component
// ---------------------------------------------------------------------------

export default function PartnerDashboardPage() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

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
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi) => (
          <Card key={kpi.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  {kpi.label}
                </p>
                <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs" style={{ color: kpi.color }}>
                  {kpi.change}
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
                Client Activity (Last 30 Days)
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: '#22d3ee' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Assessments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: '#34d399' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>New Clients</span>
                </div>
              </div>
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#34d399' }}
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
              {RECENT_ASSESSMENTS.map((a) => {
                const vs = VERDICT_STYLES[a.verdict];
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
                      {a.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                        {a.clientName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {a.decision}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: vs.bg, color: vs.color }}
                    >
                      {vs.label}
                    </span>
                    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      {a.timestamp}
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
                <button
                  key={qa.label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all cursor-pointer"
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
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
