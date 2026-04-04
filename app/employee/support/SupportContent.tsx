'use client';

import { useState } from 'react';
import { AlertTriangle, Search, HeadphonesIcon, Clock, CheckCircle2, Users } from 'lucide-react';
import type { SupportDashboardData } from '@/lib/data/employee';

interface Props {
  data: SupportDashboardData | null;
}

export default function SupportContent({ data }: Props) {
  const [search, setSearch] = useState('');

  const filteredUsers = (data?.recentUsers ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const kpis = [
    { label: 'Open Tickets', value: data?.totalOpen ?? 0, icon: HeadphonesIcon, color: '#22d3ee' },
    { label: 'Crisis Alerts', value: data?.crisisAlerts.length ?? 0, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Avg Resolution', value: data?.avgResolutionTime ? `${data.avgResolutionTime}h` : '—', icon: Clock, color: '#facc15' },
    { label: 'Users Tracked', value: data?.recentUsers.length ?? 0, icon: Users, color: '#34d399' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Support Queue</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">Customer support and crisis management</p>
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

      {/* Crisis Alerts */}
      {data && data.crisisAlerts.length > 0 && (
        <div className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-[rgba(239,68,68,0.2)] px-5 py-4">
            <AlertTriangle className="h-4.5 w-4.5 text-[#ef4444]" />
            <h2 className="text-sm font-semibold text-[#ef4444]">Crisis Alerts</h2>
            <span className="ml-auto rounded-full bg-[rgba(239,68,68,0.15)] px-2 py-0.5 text-[11px] font-bold text-[#ef4444]">
              {data.crisisAlerts.length} active
            </span>
          </div>
          <div className="divide-y divide-[rgba(239,68,68,0.1)]">
            {data.crisisAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-[#e2e8f0]">{alert.user_name ?? alert.user_id.slice(0, 8)}</p>
                  <p className="mt-0.5 text-xs text-[#94a3b8]">
                    Score: {alert.overall_score} — Crisis signal detected in assessment
                  </p>
                </div>
                <span className="text-xs text-[#94a3b8]">{new Date(alert.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Lookup */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
        <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">User Lookup</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(10,22,40,0.5)] py-2.5 pl-10 pr-4 text-sm text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-[#22d3ee]"
          />
        </div>
        {filteredUsers.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredUsers.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg bg-[rgba(10,22,40,0.5)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)] text-xs font-bold text-[#22d3ee]">
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">{user.name}</p>
                    <p className="text-xs text-[#94a3b8]">{user.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[rgba(34,211,238,0.1)] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#22d3ee]">
                  {user.tier}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-[#94a3b8]">
            {search ? 'No users match your search.' : 'No user data available.'}
          </p>
        )}
      </div>
    </div>
  );
}
