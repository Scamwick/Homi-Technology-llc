'use client';

import Link from 'next/link';
import {
  Crown,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Shield,
  BarChart3,
  ScrollText,
  Settings,
  UserCheck,
} from 'lucide-react';
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
import type { CEOCommandCenterData } from '@/lib/data/admin';

/* ── Tooltip ──────────────────────────────────────────────────────────────── */

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

/* ── Component ────────────────────────────────────────────────────────────── */

const TIER_COLORS: Record<string, string> = {
  free: '#94a3b8',
  plus: '#22d3ee',
  pro: '#34d399',
  family: '#facc15',
};

interface Props {
  data: CEOCommandCenterData | null;
}

export default function CommandCenterContent({ data }: Props) {
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#facc15] to-[#fb923c]">
              <Crown className="h-5 w-5 text-[#0a1628]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#e2e8f0]">
                {greeting}, Founder
              </h1>
              <p className="text-sm text-[#94a3b8]">
                H&#x14D;MI Command Center &mdash;{' '}
                {now.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         STRATEGIC KPIs
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {[
          {
            label: 'MRR',
            value: data ? `$${data.mrr.toLocaleString()}` : '$0',
            sub: 'Monthly Recurring Revenue',
            icon: DollarSign,
            color: '#34d399',
          },
          {
            label: 'ARR',
            value: data ? `$${data.arr.toLocaleString()}` : '$0',
            sub: 'Annual Run Rate',
            icon: TrendingUp,
            color: '#22d3ee',
          },
          {
            label: 'Total Users',
            value: data ? data.totalUsers.toLocaleString() : '0',
            sub: data ? `+${data.userGrowthPct}% this month` : 'Awaiting data',
            icon: Users,
            color: '#22d3ee',
          },
          {
            label: 'Churn Rate',
            value: data ? `${data.churnRate}%` : '0%',
            sub: 'Monthly churn',
            icon: UserCheck,
            color: '#facc15',
          },
          {
            label: 'Est. LTV',
            value: data ? `$${data.ltv}` : '$0',
            sub: 'Lifetime Value per user',
            icon: Zap,
            color: '#fb923c',
          },
          {
            label: 'Active Subs',
            value: data ? data.activeSubscriptions.toLocaleString() : '0',
            sub: 'Paid subscriptions',
            icon: Shield,
            color: '#34d399',
          },
        ].map((kpi) => (
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
                <p className="mt-0.5 text-xs text-[#94a3b8]">{kpi.sub}</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${kpi.color}15` }}
              >
                <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         TIER BREAKDOWN + RECENT SIGNUPS
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tier Revenue Breakdown Chart */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            Revenue by Tier
          </h2>
          {data && data.tierBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.tierBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                <XAxis
                  dataKey="tier"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {(data.tierBreakdown).map((entry) => (
                    <Cell key={entry.tier} fill={TIER_COLORS[entry.tier] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-[#94a3b8]">
              No subscription data available. Connect Supabase to view revenue breakdown.
            </div>
          )}
        </div>

        {/* Tier User Distribution */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
            User Distribution by Tier
          </h2>
          {data && data.tierBreakdown.length > 0 ? (
            <div className="space-y-4">
              {data.tierBreakdown.map((tier) => {
                const pct = data.totalUsers > 0
                  ? Math.round((tier.count / data.totalUsers) * 100)
                  : 0;
                return (
                  <div key={tier.tier}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-[#e2e8f0]">
                        {tier.tier}
                      </span>
                      <span className="text-xs text-[#94a3b8]">
                        {tier.count} users ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(30,41,59,0.8)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: TIER_COLORS[tier.tier] ?? '#94a3b8',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-[#94a3b8]">
              No user data available.
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         RECENT SIGNUPS
         ════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
        <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
          Recent Signups
        </h2>
        {data && data.recentSignups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(34,211,238,0.1)]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentSignups.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-[rgba(34,211,238,0.05)] ${
                      idx % 2 === 0 ? 'bg-[rgba(10,22,40,0.3)]' : 'bg-[rgba(15,23,42,0.3)]'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[#e2e8f0]">{user.name}</td>
                    <td className="px-4 py-3 text-[#94a3b8]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
                        style={{
                          backgroundColor: `${TIER_COLORS[user.tier] ?? '#94a3b8'}15`,
                          color: TIER_COLORS[user.tier] ?? '#94a3b8',
                        }}
                      >
                        {user.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#94a3b8]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[#94a3b8]">
            No signup data available. Connect Supabase to view users.
          </p>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         QUICK ACTIONS
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'All Users', href: '/admin/users', icon: Users, color: '#22d3ee' },
          { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: '#34d399' },
          { label: 'Audit Log', href: '/admin/audit-log', icon: ScrollText, color: '#facc15' },
          { label: 'Settings', href: '/admin/content', icon: Settings, color: '#fb923c' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-3 rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl transition-all hover:border-[rgba(34,211,238,0.2)]"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <action.icon className="h-5 w-5" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium text-[#e2e8f0]">{action.label}</span>
            <ArrowUpRight className="ml-auto h-4 w-4 text-[#94a3b8] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
