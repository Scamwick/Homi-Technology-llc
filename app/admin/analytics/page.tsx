'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

/* ── Brand Colors ────────────────────────────────────────────────────────── */

const CYAN = '#22d3ee';
const EMERALD = '#34d399';
const YELLOW = '#facc15';
const AMBER = '#fb923c';
const CRIMSON = '#ef4444';
const TEXT_PRIMARY = '#e2e8f0';
const TEXT_SECONDARY = '#94a3b8';
const CARD_BG = 'rgba(30,41,59,0.8)';
const CARD_BORDER = 'rgba(34,211,238,0.2)';

/* ── Time Filters ────────────────────────────────────────────────────────── */

const TIME_FILTERS = ['Live', '24h', '7d', '30d', '90d', 'Custom'] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

/* ── Mock Data ───────────────────────────────────────────────────────────── */

const KPI_DATA = [
  { label: 'Total Users', value: '2,847', trend: '+12.4%', up: true, color: CYAN },
  { label: 'Active Assessments', value: '1,820', trend: '+8.2%', up: true, color: EMERALD },
  { label: 'NOT YET Rate', value: '68.7%', trend: '-2.1%', up: false, color: YELLOW },
  { label: 'READY Rate', value: '31.3%', trend: '+2.1%', up: true, color: CYAN },
  { label: 'Avg Score', value: '54.2', trend: '+3.8', up: true, color: EMERALD },
  { label: 'Revenue', value: '$48.2K', trend: '+18.6%', up: true, color: YELLOW },
];

const FUNNEL_STEPS = [
  { step: 'Signup', count: 2847, pct: 100, color: CYAN },
  { step: 'Onboard', count: 2275, pct: 79.9, color: '#2dd4c0' },
  { step: 'Start Assessment', count: 1820, pct: 63.9, color: EMERALD },
  { step: 'Complete', count: 1530, pct: 53.7, color: YELLOW },
  { step: 'READY', count: 612, pct: 21.5, color: AMBER },
];

const FINANCIAL_DIST = [
  { range: '0-20', count: 82, label: '0-20' },
  { range: '21-40', count: 195, label: '21-40' },
  { range: '41-60', count: 412, label: '41-60' },
  { range: '61-80', count: 328, label: '61-80' },
  { range: '81-100', count: 153, label: '81-100' },
];

const EMOTIONAL_DIST = [
  { range: '0-20', count: 124, label: '0-20' },
  { range: '21-40', count: 267, label: '21-40' },
  { range: '41-60', count: 389, label: '41-60' },
  { range: '61-80', count: 285, label: '61-80' },
  { range: '81-100', count: 105, label: '81-100' },
];

const TIMING_DIST = [
  { range: '0-20', count: 156, label: '0-20' },
  { range: '21-40', count: 312, label: '21-40' },
  { range: '41-60', count: 345, label: '41-60' },
  { range: '61-80', count: 248, label: '61-80' },
  { range: '81-100', count: 109, label: '81-100' },
];

const VERDICT_DATA = [
  { name: 'READY', value: 478, color: EMERALD },
  { name: 'ALMOST THERE', value: 312, color: YELLOW },
  { name: 'BUILD FIRST', value: 289, color: AMBER },
  { name: 'NOT YET', value: 451, color: CRIMSON },
];

const VERDICT_TOTAL = VERDICT_DATA.reduce((sum, d) => sum + d.value, 0);

const VOLUME_DATA = [
  { date: 'Jan 1', assessments: 42 },
  { date: 'Jan 8', assessments: 58 },
  { date: 'Jan 15', assessments: 51 },
  { date: 'Jan 22', assessments: 67 },
  { date: 'Jan 29', assessments: 73 },
  { date: 'Feb 5', assessments: 82 },
  { date: 'Feb 12', assessments: 78 },
  { date: 'Feb 19', assessments: 91 },
  { date: 'Feb 26', assessments: 105 },
  { date: 'Mar 5', assessments: 98 },
  { date: 'Mar 12', assessments: 112 },
  { date: 'Mar 19', assessments: 125 },
  { date: 'Mar 26', assessments: 138 },
];

const COHORT_DATA = [
  { month: 'Oct 2025', users: 210, m1: 72, m2: 58, m3: 49, m4: 43, m5: 38, m6: 34 },
  { month: 'Nov 2025', users: 285, m1: 75, m2: 61, m3: 52, m4: 46, m5: 41, m6: -1 },
  { month: 'Dec 2025', users: 320, m1: 70, m2: 55, m3: 47, m4: 42, m5: -1, m6: -1 },
  { month: 'Jan 2026', users: 410, m1: 78, m2: 63, m3: 54, m4: -1, m5: -1, m6: -1 },
  { month: 'Feb 2026', users: 485, m1: 76, m2: 60, m3: -1, m4: -1, m5: -1, m6: -1 },
  { month: 'Mar 2026', users: 530, m1: 80, m2: -1, m3: -1, m4: -1, m5: -1, m6: -1 },
];

/* ── Glass Card Component ────────────────────────────────────────────────── */

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-[rgba(30,41,59,0.8)] backdrop-blur-[10px] ${className}`}
      style={{ borderColor: CARD_BORDER }}
    >
      {children}
    </div>
  );
}

/* ── Custom Tooltip ──────────────────────────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{
        backgroundColor: '#0f172a',
        borderColor: CARD_BORDER,
      }}
    >
      <p className="mb-1 font-medium" style={{ color: TEXT_SECONDARY }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || CYAN }} className="font-semibold">
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ── Cohort Cell Color ───────────────────────────────────────────────────── */

function cohortColor(val: number): string {
  if (val < 0) return TEXT_SECONDARY;
  if (val >= 70) return EMERALD;
  if (val >= 50) return YELLOW;
  if (val >= 35) return AMBER;
  return CRIMSON;
}

function cohortBg(val: number): string {
  if (val < 0) return 'transparent';
  if (val >= 70) return 'rgba(52,211,153,0.12)';
  if (val >= 50) return 'rgba(250,204,21,0.10)';
  if (val >= 35) return 'rgba(251,146,60,0.10)';
  return 'rgba(239,68,68,0.10)';
}

/* ── Custom Pie Label ────────────────────────────────────────────────────── */

function renderPieLabel(props: PieLabelRenderProps) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const percent = Number(props.percent ?? 0);
  const name = String(props.name ?? '');

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={TEXT_SECONDARY}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
    >
      {name} {(percent * 100).toFixed(0)}%
    </text>
  );
}

/* ── Dimension Histogram ─────────────────────────────────────────────────── */

function DimensionCard({
  title,
  avgScore,
  weakest,
  color,
  data,
}: {
  title: string;
  avgScore: number;
  weakest: boolean;
  color: string;
  data: Array<{ range: string; count: number; label: string }>;
}) {
  return (
    <GlassCard>
      <div className="px-5 pt-5 pb-2">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
            {title}
          </h3>
          {weakest && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(239,68,68,0.15)',
                color: CRIMSON,
              }}
            >
              Weakest
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" style={{ color }}>
            {avgScore}
          </span>
          <span className="text-xs" style={{ color: TEXT_SECONDARY }}>
            avg score
          </span>
        </div>
      </div>
      <div className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: TEXT_SECONDARY, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={`${color}${i === 2 ? '' : '99'}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function AdminAnalytics() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('30d');

  return (
    <div className="space-y-6">
      {/* ── Header + Time Filter ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
            Analytics
          </h1>
          <p className="mt-1 text-sm" style={{ color: TEXT_SECONDARY }}>
            Platform performance, funnels, and cohort intelligence
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1" style={{ borderColor: CARD_BORDER, backgroundColor: 'rgba(15,23,42,0.5)' }}>
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150"
              style={{
                backgroundColor: activeFilter === filter ? CYAN : 'transparent',
                color: activeFilter === filter ? '#0a1628' : TEXT_SECONDARY,
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {KPI_DATA.map((kpi, idx) => {
          const borderColors = [CYAN, EMERALD, YELLOW, CYAN, EMERALD, YELLOW];
          return (
            <GlassCard key={kpi.label}>
              <div
                className="px-4 pb-4 pt-4"
                style={{ borderTop: `3px solid ${borderColors[idx]}` }}
              >
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider" style={{ color: TEXT_SECONDARY }}>
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
                  {kpi.value}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: kpi.up ? EMERALD : CRIMSON }}>
                  <span>{kpi.up ? '\u2191' : '\u2193'}</span>
                  {kpi.trend}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── Conversion Funnel ────────────────────────────────────────────── */}
      <GlassCard className="p-5">
        <h2 className="mb-5 text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
          Conversion Funnel
        </h2>
        <div className="space-y-3">
          {FUNNEL_STEPS.map((step, idx) => (
            <div key={step.step} className="flex items-center gap-4">
              <div className="w-28 text-right text-sm font-medium" style={{ color: TEXT_SECONDARY }}>
                {step.step}
              </div>
              <div className="flex-1">
                <div
                  className="relative h-10 overflow-hidden rounded-lg"
                  style={{ backgroundColor: 'rgba(10,22,40,0.5)' }}
                >
                  <div
                    className="flex h-full items-center rounded-lg px-3 transition-all duration-700"
                    style={{
                      width: `${step.pct}%`,
                      backgroundColor: `${step.color}20`,
                      borderLeft: `3px solid ${step.color}`,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: step.color }}>
                      {step.count.toLocaleString()} ({step.pct}%)
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-20 text-right text-xs" style={{ color: TEXT_SECONDARY }}>
                {idx > 0
                  ? `${((FUNNEL_STEPS[idx].count / FUNNEL_STEPS[idx - 1].count) * 100).toFixed(0)}% conv.`
                  : ''}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Dimension Breakdown ──────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
          Dimension Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DimensionCard
            title="Financial Reality"
            avgScore={58}
            weakest={false}
            color={CYAN}
            data={FINANCIAL_DIST}
          />
          <DimensionCard
            title="Emotional Truth"
            avgScore={47}
            weakest={true}
            color={EMERALD}
            data={EMOTIONAL_DIST}
          />
          <DimensionCard
            title="Perfect Timing"
            avgScore={52}
            weakest={false}
            color={YELLOW}
            data={TIMING_DIST}
          />
        </div>
      </div>

      {/* ── Verdict Distribution + Assessment Volume ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Verdict Donut */}
        <GlassCard className="p-5">
          <h2 className="mb-2 text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
            Verdict Distribution
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={VERDICT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={renderPieLabel}
                labelLine={false}
                stroke="none"
              >
                {VERDICT_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0];
                  return (
                    <div
                      className="rounded-lg border px-3 py-2 text-xs shadow-xl"
                      style={{ backgroundColor: '#0f172a', borderColor: CARD_BORDER }}
                    >
                      <p className="font-semibold" style={{ color: d.payload?.color || CYAN }}>
                        {d.name}: {Number(d.value).toLocaleString()}
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-[-60px] flex flex-col items-center">
            <span className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
              {VERDICT_TOTAL.toLocaleString()}
            </span>
            <span className="text-[11px]" style={{ color: TEXT_SECONDARY }}>
              total assessments
            </span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {VERDICT_DATA.map((v) => (
              <div key={v.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                <span style={{ color: TEXT_SECONDARY }}>{v.name}</span>
                <span className="font-semibold" style={{ color: TEXT_PRIMARY }}>
                  {v.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Assessment Volume */}
        <GlassCard className="p-5">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
            Assessment Volume Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={VOLUME_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" />
              <XAxis
                dataKey="date"
                tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(51,65,85,0.5)' }}
              />
              <YAxis
                tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(51,65,85,0.5)' }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="assessments"
                stroke={CYAN}
                strokeWidth={2}
                dot={{ fill: CYAN, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: CYAN, stroke: '#0a1628', strokeWidth: 2 }}
                name="Assessments"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-3 text-xs" style={{ color: TEXT_SECONDARY }}>
            Trend:{' '}
            <span className="font-semibold" style={{ color: EMERALD }}>
              +22.8% week-over-week
            </span>
          </p>
        </GlassCard>
      </div>

      {/* ── Cohort Retention Table ────────────────────────────────────────── */}
      <GlassCard>
        <div className="border-b px-5 py-4" style={{ borderColor: CARD_BORDER }}>
          <h2 className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
            Cohort Retention by Signup Month
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                {['Cohort', 'Users', 'M+1', 'M+2', 'M+3', 'M+4', 'M+5', 'M+6'].map(
                  (header) => (
                    <th
                      key={header}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                        header === 'Cohort' || header === 'Users'
                          ? 'text-left'
                          : 'text-center'
                      }`}
                      style={{ color: TEXT_SECONDARY }}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {COHORT_DATA.map((row, idx) => {
                const months = [row.m1, row.m2, row.m3, row.m4, row.m5, row.m6];
                return (
                  <tr
                    key={row.month}
                    style={{
                      borderBottom: '1px solid rgba(34,211,238,0.06)',
                      backgroundColor:
                        idx % 2 === 0 ? 'rgba(10,22,40,0.3)' : 'rgba(15,23,42,0.3)',
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: TEXT_PRIMARY }}>
                      {row.month}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: CYAN }}>
                      {row.users.toLocaleString()}
                    </td>
                    {months.map((val, i) => (
                      <td
                        key={i}
                        className="px-4 py-3 text-center font-medium"
                        style={{
                          color: cohortColor(val),
                          backgroundColor: cohortBg(val),
                        }}
                      >
                        {val < 0 ? '\u2014' : `${val}%`}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
