'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/* ── Mock Data ────────────────────────────────────────────────────────────── */

// Cohort Retention Table
const COHORT_DATA = [
  { month: 'Oct 2025', users: 210, m1: '72%', m2: '58%', m3: '49%', m4: '43%', m5: '38%', m6: '34%' },
  { month: 'Nov 2025', users: 285, m1: '75%', m2: '61%', m3: '52%', m4: '46%', m5: '41%', m6: '-' },
  { month: 'Dec 2025', users: 320, m1: '70%', m2: '55%', m3: '47%', m4: '42%', m5: '-', m6: '-' },
  { month: 'Jan 2026', users: 410, m1: '78%', m2: '63%', m3: '54%', m4: '-', m5: '-', m6: '-' },
  { month: 'Feb 2026', users: 485, m1: '76%', m2: '60%', m3: '-', m4: '-', m5: '-', m6: '-' },
  { month: 'Mar 2026', users: 530, m1: '80%', m2: '-', m3: '-', m4: '-', m5: '-', m6: '-' },
];

// Funnel Data
const FUNNEL_STEPS = [
  { step: 'Signup', count: 2847, pct: 100, color: '#22d3ee' },
  { step: 'Onboard', count: 2275, pct: 79.9, color: '#22d3ee' },
  { step: 'Assess', count: 1820, pct: 63.9, color: '#34d399' },
  { step: 'Verdict', count: 1530, pct: 53.7, color: '#facc15' },
  { step: 'Transform', count: 612, pct: 21.5, color: '#fb923c' },
];

// Dimension Analysis
const DIMENSION_DATA = [
  { dimension: 'Financial', avgScore: 58, color: '#22d3ee' },
  { dimension: 'Emotional', avgScore: 52, color: '#34d399' },
  { dimension: 'Knowledge', avgScore: 67, color: '#facc15' },
  { dimension: 'Timing', avgScore: 45, color: '#fb923c' },
  { dimension: 'Support', avgScore: 71, color: '#22d3ee' },
];

// Time-to-READY Distribution
const TTR_DISTRIBUTION = [
  { range: '< 1 week', count: 42 },
  { range: '1-2 weeks', count: 89 },
  { range: '2-4 weeks', count: 156 },
  { range: '1-2 months', count: 203 },
  { range: '2-3 months', count: 134 },
  { range: '3-6 months', count: 87 },
  { range: '6+ months', count: 51 },
];

/* ── Custom Tooltip ───────────────────────────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[rgba(34,211,238,0.2)] bg-[#0f172a] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 text-[#94a3b8]">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Deep Analytics</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Cohort, funnel, and dimension analysis
        </p>
      </div>

      {/* Cohort Retention Table */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#e2e8f0]">
            Cohort Retention by Signup Month
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(34,211,238,0.1)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Cohort
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Users
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  M+1
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  M+2
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  M+3
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  M+4
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  M+5
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  M+6
                </th>
              </tr>
            </thead>
            <tbody>
              {COHORT_DATA.map((row, idx) => (
                <tr
                  key={row.month}
                  className={`border-b border-[rgba(34,211,238,0.05)] ${
                    idx % 2 === 0
                      ? 'bg-[rgba(10,22,40,0.3)]'
                      : 'bg-[rgba(15,23,42,0.3)]'
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-[#e2e8f0]">
                    {row.month}
                  </td>
                  <td className="px-5 py-3 text-[#22d3ee] font-semibold">
                    {row.users}
                  </td>
                  {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map(
                    (val, i) => {
                      const num = parseInt(val);
                      let color = 'text-[#94a3b8]';
                      if (val !== '-') {
                        if (num >= 70) color = 'text-[#34d399]';
                        else if (num >= 50) color = 'text-[#facc15]';
                        else if (num >= 35) color = 'text-[#fb923c]';
                        else color = 'text-[#ef4444]';
                      }
                      return (
                        <td
                          key={i}
                          className={`px-4 py-3 text-center font-medium ${color}`}
                        >
                          {val}
                        </td>
                      );
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
        <h2 className="mb-5 text-sm font-semibold text-[#e2e8f0]">
          Conversion Funnel
        </h2>
        <div className="space-y-3">
          {FUNNEL_STEPS.map((step, idx) => (
            <div key={step.step} className="flex items-center gap-4">
              <div className="w-24 text-right text-sm font-medium text-[#94a3b8]">
                {step.step}
              </div>
              <div className="flex-1">
                <div className="relative h-10 overflow-hidden rounded-lg bg-[rgba(10,22,40,0.5)]">
                  <div
                    className="flex h-full items-center rounded-lg px-3 transition-all duration-700"
                    style={{
                      width: `${step.pct}%`,
                      backgroundColor: `${step.color}25`,
                      borderLeft: `3px solid ${step.color}`,
                    }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: step.color }}
                    >
                      {step.count.toLocaleString()} ({step.pct}%)
                    </span>
                  </div>
                </div>
              </div>
              {idx > 0 && (
                <div className="w-16 text-right text-xs text-[#94a3b8]">
                  {(
                    (FUNNEL_STEPS[idx].count / FUNNEL_STEPS[idx - 1].count) *
                    100
                  ).toFixed(0)}
                  % conv.
                </div>
              )}
              {idx === 0 && <div className="w-16" />}
            </div>
          ))}
        </div>
      </div>

      {/* Dimension + TTR Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weakest Dimensions */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Dimension Weakness Analysis
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={DIMENSION_DATA}
              layout="vertical"
              margin={{ left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(51,65,85,0.5)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                type="category"
                dataKey="dimension"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                width={80}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
                {DIMENSION_DATA.map((entry) => (
                  <Cell key={entry.dimension} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-xs text-[#94a3b8]">
            Weakest dimension across all users:{' '}
            <span className="font-semibold text-[#fb923c]">
              Timing (avg 45)
            </span>
          </p>
        </div>

        {/* Time-to-READY Distribution */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Time-to-READY Distribution
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={TTR_DISTRIBUTION}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(51,65,85,0.5)"
              />
              <XAxis
                dataKey="range"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-xs text-[#94a3b8]">
            Median time to READY verdict:{' '}
            <span className="font-semibold text-[#22d3ee]">5.3 weeks</span>
          </p>
        </div>
      </div>
    </div>
  );
}
