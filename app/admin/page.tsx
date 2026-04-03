'use client';

import {
  Users,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* ── Mock Data ────────────────────────────────────────────────────────────── */

const KPI_CARDS = [
  {
    label: 'Total Users',
    value: '2,847',
    change: '+12.3%',
    trend: 'up' as const,
    icon: Users,
    color: '#22d3ee',
  },
  {
    label: 'Active Assessments',
    value: '1,203',
    change: '+8.1%',
    trend: 'up' as const,
    icon: ClipboardCheck,
    color: '#34d399',
  },
  {
    label: 'READY Rate',
    value: '27%',
    change: '-2.4%',
    trend: 'down' as const,
    icon: TrendingUp,
    color: '#facc15',
  },
  {
    label: 'Revenue',
    value: '$14,200/mo',
    change: '+18.7%',
    trend: 'up' as const,
    icon: DollarSign,
    color: '#22d3ee',
  },
];

const assessmentVolume = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  assessments: Math.floor(25 + Math.random() * 35 + i * 0.5),
}));

const verdictDistribution = [
  { name: 'READY', value: 27, color: '#34d399' },
  { name: 'ALMOST_THERE', value: 31, color: '#facc15' },
  { name: 'BUILD_FIRST', value: 28, color: '#fb923c' },
  { name: 'NOT_YET', value: 14, color: '#ef4444' },
];

const revenueTrend = [
  { month: 'Nov', revenue: 8200 },
  { month: 'Dec', revenue: 9100 },
  { month: 'Jan', revenue: 10400 },
  { month: 'Feb', revenue: 11800 },
  { month: 'Mar', revenue: 13100 },
  { month: 'Apr', revenue: 14200 },
];

const recentActivity = [
  {
    id: 1,
    event: 'New user signup',
    user: 'sarah.chen@gmail.com',
    time: '2 min ago',
  },
  {
    id: 2,
    event: 'Assessment completed',
    user: 'marcus.w@outlook.com',
    time: '8 min ago',
  },
  {
    id: 3,
    event: 'Verdict: READY',
    user: 'ana.rodriguez@gmail.com',
    time: '15 min ago',
  },
  {
    id: 4,
    event: 'Subscription upgrade to Pro',
    user: 'james.park@icloud.com',
    time: '23 min ago',
  },
  {
    id: 5,
    event: 'Partner API key generated',
    user: 'Meridian Financial',
    time: '1 hr ago',
  },
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
          {entry.name}: {typeof entry.value === 'number' && entry.name === 'revenue' ? `$${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function AdminOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">
          Admin Overview
        </h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          H&#x14D;MI platform metrics and activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl transition-all duration-200 hover:border-[rgba(34,211,238,0.2)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                  {kpi.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#e2e8f0]">
                  {kpi.value}
                </p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${kpi.color}15` }}
              >
                <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium">
              {kpi.trend === 'up' ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-[#34d399]" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-[#ef4444]" />
              )}
              <span
                className={
                  kpi.trend === 'up' ? 'text-[#34d399]' : 'text-[#ef4444]'
                }
              >
                {kpi.change}
              </span>
              <span className="text-[#94a3b8]">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assessment Volume — Line Chart */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Assessment Volume (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={assessmentVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval={5}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<ChartTooltip />} />
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

        {/* Verdict Distribution — Pie Chart */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Verdict Distribution
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={verdictDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name} ${value}%`}
              >
                {verdictDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(34,211,238,0.2)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue + Activity Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend — Bar Chart */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Revenue Trend (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Feed */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Recent Activity
          </h2>
          <ul className="space-y-3">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between rounded-lg bg-[rgba(10,22,40,0.5)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#e2e8f0]">
                    {item.event}
                  </p>
                  <p className="mt-0.5 text-xs text-[#94a3b8]">{item.user}</p>
                </div>
                <span className="shrink-0 text-[11px] text-[#94a3b8]">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
