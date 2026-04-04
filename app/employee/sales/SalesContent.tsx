'use client';

import { Users, UserCheck, TrendingUp, Target } from 'lucide-react';
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
import type { SalesDashboardData } from '@/lib/data/employee';

const TIER_COLORS: Record<string, string> = {
  free: '#94a3b8',
  plus: '#22d3ee',
  pro: '#34d399',
  family: '#facc15',
};

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

interface Props {
  data: SalesDashboardData | null;
}

export default function SalesContent({ data }: Props) {
  const kpis = [
    { label: 'Total Leads', value: data?.totalLeads ?? 0, icon: Users, color: '#22d3ee' },
    { label: 'Recent Signups', value: data?.qualified ?? 0, icon: TrendingUp, color: '#34d399' },
    { label: 'Paid Users', value: data?.converted ?? 0, icon: UserCheck, color: '#facc15' },
    { label: 'Conversion Rate', value: data ? `${data.conversionRate}%` : '—', icon: Target, color: '#fb923c' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Sales Pipeline</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">Lead tracking, conversions, and growth metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold text-[#e2e8f0]">{kpi.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tier Distribution Chart */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
        <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">User Distribution by Tier</h2>
        {data && data.tierDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.tierDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="tier" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.tierDistribution.map((entry) => (
                  <Cell key={entry.tier} fill={TIER_COLORS[entry.tier] ?? '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-sm text-[#94a3b8]">No data available.</p>
        )}
      </div>

      {/* Recent Signups Table */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#e2e8f0]">Recent Signups (30 days)</h2>
        </div>
        {data && data.recentSignups.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(34,211,238,0.1)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Tier</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSignups.map((user, idx) => (
                <tr key={user.id} className={`border-b border-[rgba(34,211,238,0.05)] ${idx % 2 === 0 ? 'bg-[rgba(10,22,40,0.3)]' : 'bg-[rgba(15,23,42,0.3)]'}`}>
                  <td className="px-5 py-3 font-medium text-[#e2e8f0]">{user.name}</td>
                  <td className="px-5 py-3 text-[#94a3b8]">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize" style={{ backgroundColor: `${TIER_COLORS[user.tier] ?? '#94a3b8'}15`, color: TIER_COLORS[user.tier] ?? '#94a3b8' }}>
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#94a3b8]">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="py-8 text-center text-sm text-[#94a3b8]">No recent signups.</p>
        )}
      </div>
    </div>
  );
}
