'use client';

import {
  Users,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AdminOverviewData } from '@/lib/data/admin';

/* ── Constants ────────────────────────────────────────────────────────────── */

const VERDICT_COLORS: Record<string, string> = {
  READY: '#34d399',
  ALMOST_THERE: '#facc15',
  BUILD_FIRST: '#fb923c',
  NOT_YET: '#ef4444',
};

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  data: AdminOverviewData | null;
}

export default function AdminOverviewContent({ data }: Props) {
  const kpis = data?.kpis;

  const kpiCards = [
    {
      label: 'Total Users',
      value: kpis ? kpis.totalUsers.toLocaleString() : '—',
      change: kpis ? `+${kpis.newUsersToday} today` : '',
      trend: 'up' as const,
      icon: Users,
      color: '#22d3ee',
    },
    {
      label: 'Assessments',
      value: kpis ? kpis.activeAssessments.toLocaleString() : '—',
      change: kpis ? `+${kpis.assessmentsToday} today` : '',
      trend: 'up' as const,
      icon: ClipboardCheck,
      color: '#34d399',
    },
    {
      label: 'READY Rate',
      value: kpis ? `${kpis.readyRate}%` : '—',
      change: '',
      trend: 'up' as const,
      icon: TrendingUp,
      color: '#facc15',
    },
    {
      label: 'MRR',
      value: kpis ? `$${kpis.monthlyRevenue.toLocaleString()}/mo` : '—',
      change: '',
      trend: 'up' as const,
      icon: DollarSign,
      color: '#22d3ee',
    },
  ];

  const pieData = (data?.verdictDistribution ?? []).map((v) => ({
    name: v.verdict.replace('_', ' '),
    value: v.count,
    color: VERDICT_COLORS[v.verdict] ?? '#94a3b8',
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Admin Overview</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          H&#x14D;MI platform metrics and activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
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
            {kpi.change && (
              <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 text-[#34d399]" />
                <span className="text-[#34d399]">{kpi.change}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Verdict Distribution */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Verdict Distribution
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name} ${value}`}
                >
                  {pieData.map((entry) => (
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
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-[#94a3b8]">
              No assessment data yet.
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Recent Activity
          </h2>
          {data && data.recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {data.recentActivity.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between rounded-lg bg-[rgba(10,22,40,0.5)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">
                      {entry.action.replace(/\./g, ' — ')}
                    </p>
                    <p className="mt-0.5 text-xs text-[#94a3b8]">
                      {entry.resource_type}: {entry.resource_id.slice(0, 8)}...
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#94a3b8]">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-[#94a3b8]">
              No activity recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-4.5 w-4.5 text-[#22d3ee]" />
          <h2 className="text-sm font-semibold text-[#e2e8f0]">
            New Users
          </h2>
        </div>
        {data && data.recentUsers.length > 0 ? (
          <ul className="space-y-3">
            {data.recentUsers.slice(0, 5).map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-lg bg-[rgba(10,22,40,0.5)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)] text-xs font-bold text-[#22d3ee]">
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">{user.name}</p>
                    <p className="text-xs text-[#94a3b8]">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[rgba(34,211,238,0.1)] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#22d3ee]">
                    {user.tier}
                  </span>
                  <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-[#94a3b8]">
            No users yet. Connect Supabase to view platform data.
          </p>
        )}
      </div>
    </div>
  );
}
