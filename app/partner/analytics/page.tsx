'use client';

import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Card, Badge } from '@/components/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Analytics
 *
 * Verdict distribution, score histogram, platform comparison, monthly trend.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const VERDICT_DISTRIBUTION = [
  { name: 'READY', value: 31, color: '#34d399' },
  { name: 'ALMOST THERE', value: 38, color: '#facc15' },
  { name: 'NOT YET', value: 22, color: '#fb923c' },
  { name: 'STOP', value: 9, color: '#ef4444' },
];

const SCORE_HISTOGRAM = [
  { range: '0-10', count: 2 },
  { range: '11-20', count: 3 },
  { range: '21-30', count: 5 },
  { range: '31-40', count: 8 },
  { range: '41-50', count: 14 },
  { range: '51-60', count: 22 },
  { range: '61-70', count: 28 },
  { range: '71-80', count: 35 },
  { range: '81-90', count: 25 },
  { range: '91-100', count: 14 },
];

interface ComparisonStat {
  label: string;
  partner: string;
  platform: string;
  trend: 'up' | 'down' | 'neutral';
}

const COMPARISON_STATS: ComparisonStat[] = [
  { label: 'Avg. Score', partner: '68', platform: '62', trend: 'up' },
  { label: 'READY Rate', partner: '31%', platform: '24%', trend: 'up' },
  { label: 'Completion Rate', partner: '87%', platform: '79%', trend: 'up' },
  { label: 'Avg. Assessments/Client', partner: '3.2', platform: '2.8', trend: 'up' },
  { label: 'Score Improvement', partner: '+8.4', platform: '+5.1', trend: 'up' },
  { label: 'Avg. Time to READY', partner: '42 days', platform: '56 days', trend: 'down' },
];

const MONTHLY_TREND = [
  { month: 'Oct', assessments: 82, readyRate: 22 },
  { month: 'Nov', assessments: 96, readyRate: 24 },
  { month: 'Dec', assessments: 110, readyRate: 26 },
  { month: 'Jan', assessments: 124, readyRate: 27 },
  { month: 'Feb', assessments: 138, readyRate: 29 },
  { month: 'Mar', assessments: 156, readyRate: 31 },
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
// Tooltip Components
// ---------------------------------------------------------------------------

function HistoTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg border"
      style={{ backgroundColor: 'var(--navy-light, #0f172a)', borderColor: 'rgba(34,211,238,0.2)' }}
    >
      <p style={{ color: 'var(--text-primary)' }}>Score Range: {label}</p>
      <p style={{ color: '#22d3ee' }}>Count: {payload[0].value}</p>
    </div>
  );
}

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg border"
      style={{ backgroundColor: 'var(--navy-light, #0f172a)', borderColor: 'rgba(34,211,238,0.2)' }}
    >
      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.dataKey === 'assessments' ? '#22d3ee' : '#34d399' }}>
          {entry.dataKey === 'assessments' ? 'Assessments' : 'READY Rate'}: {entry.value}{entry.dataKey === 'readyRate' ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PartnerAnalyticsPage() {
  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
          Analytics
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          Performance metrics across your client portfolio
        </p>
      </motion.div>

      {/* Verdict Distribution + Score Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verdict Distribution Pie */}
        <motion.div variants={fadeUp}>
          <Card
            padding="md"
            header={
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Verdict Distribution
              </span>
            }
          >
            <div className="flex items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={VERDICT_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="value"
                      stroke="none"
                    >
                      {VERDICT_DISTRIBUTION.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {VERDICT_DISTRIBUTION.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Score Histogram */}
        <motion.div variants={fadeUp}>
          <Card
            padding="md"
            header={
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Score Distribution
              </span>
            }
          >
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_HISTOGRAM} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.06)" />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(34,211,238,0.1)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(34,211,238,0.1)' }}
                  />
                  <RechartsTooltip content={<HistoTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {SCORE_HISTOGRAM.map((entry, index) => {
                      const val = parseInt(entry.range.split('-')[0]);
                      let color = '#ef4444';
                      if (val >= 75) color = '#34d399';
                      else if (val >= 50) color = '#facc15';
                      else if (val >= 30) color = '#fb923c';
                      return <Cell key={index} fill={color} fillOpacity={0.7} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Platform Comparison */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Comparison to Platform Averages
              </span>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Your clients vs. all platform users
              </p>
            </div>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {COMPARISON_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  {stat.label}
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--cyan, #22d3ee)' }}>
                  {stat.partner}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp size={12} style={{ color: 'var(--emerald, #34d399)' }} />
                  ) : stat.trend === 'down' ? (
                    <TrendingDown size={12} style={{ color: 'var(--emerald, #34d399)' }} />
                  ) : (
                    <Minus size={12} style={{ color: 'var(--text-secondary)' }} />
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    vs {stat.platform}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Monthly Trend */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Monthly Trend
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: '#22d3ee' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Assessments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: '#34d399' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>READY Rate (%)</span>
                </div>
              </div>
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.06)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(34,211,238,0.1)' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(34,211,238,0.1)' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(34,211,238,0.1)' }}
                  domain={[0, 50]}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <RechartsTooltip content={<TrendTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="assessments"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#22d3ee' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="readyRate"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
