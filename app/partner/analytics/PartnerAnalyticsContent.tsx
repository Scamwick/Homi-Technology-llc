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
} from 'recharts';
import { Card } from '@/components/ui';
import { TrendingUp } from 'lucide-react';
import type { PartnerAnalyticsData } from '@/lib/data/partner';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Analytics Content (Client Component)
 *
 * Verdict distribution, score histogram, monthly trend.
 * Data comes from server via props.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

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

interface PartnerAnalyticsContentProps {
  data: PartnerAnalyticsData;
}

export default function PartnerAnalyticsContent({ data }: PartnerAnalyticsContentProps) {
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

      {/* Summary KPIs */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Average Score
              </p>
              <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--cyan, #22d3ee)' }}>
                {data.avgScore}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}>
              <TrendingUp size={20} style={{ color: 'var(--cyan, #22d3ee)' }} />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Total Assessments
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
              {data.totalAssessments}
            </p>
          </div>
        </Card>
        <Card padding="md">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              READY Rate
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--emerald, #34d399)' }}>
              {data.readyRate}%
            </p>
          </div>
        </Card>
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
            {data.verdictDistribution.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                No assessment data yet
              </p>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.verdictDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.verdictDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex-1">
                  {data.verdictDistribution.map((item) => (
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
            )}
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
                <BarChart data={data.scoreHistogram} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                    {data.scoreHistogram.map((entry, index) => {
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
              <LineChart data={data.monthlyTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
                  domain={[0, 100]}
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
