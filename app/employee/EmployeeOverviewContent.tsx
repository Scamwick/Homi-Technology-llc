'use client';

import Link from 'next/link';
import {
  Users,
  ListTodo,
  Target,
  CheckCircle2,
  ArrowUpRight,
  HeadphonesIcon,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import type { EmployeeOverviewData } from '@/lib/data/employee';

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  data: EmployeeOverviewData | null;
}

export default function EmployeeOverviewContent({ data }: Props) {
  const kpis = data?.kpis;

  const kpiCards = [
    {
      label: 'Total Users',
      value: kpis ? kpis.assignedClients.toLocaleString() : '—',
      icon: Users,
      color: '#22d3ee',
    },
    {
      label: 'Tasks Due Today',
      value: kpis ? kpis.tasksDueToday.toString() : '—',
      icon: ListTodo,
      color: '#facc15',
    },
    {
      label: 'Avg Client Score',
      value: kpis ? kpis.avgClientScore.toString() : '—',
      icon: Target,
      color: '#34d399',
    },
    {
      label: 'Completion Rate',
      value: kpis ? `${kpis.completionRate}%` : '—',
      icon: CheckCircle2,
      color: '#22d3ee',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Employee Dashboard</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
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
                <p className="mt-2 text-2xl font-bold text-[#e2e8f0]">{kpi.value}</p>
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

      {/* Recent Assessments */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
        <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">Recent Assessments</h2>
        {data && data.recentAssessments.length > 0 ? (
          <div className="space-y-3">
            {data.recentAssessments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg bg-[rgba(10,22,40,0.5)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#e2e8f0]">
                    {a.user_name ?? a.user_id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    Score: {a.overall_score} — {a.verdict.replace('_', ' ')}
                  </p>
                </div>
                <span className="text-xs text-[#94a3b8]">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-[#94a3b8]">
            No assessment data available. Connect Supabase to view recent assessments.
          </p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Support Queue', href: '/employee/support', icon: HeadphonesIcon, color: '#22d3ee' },
          { label: 'Sales Pipeline', href: '/employee/sales', icon: TrendingUp, color: '#34d399' },
          { label: 'Schedule', href: '/employee/schedule', icon: CalendarDays, color: '#facc15' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-3 rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl transition-all hover:border-[rgba(34,211,238,0.2)]"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${link.color}15` }}
            >
              <link.icon className="h-5 w-5" style={{ color: link.color }} />
            </div>
            <span className="text-sm font-medium text-[#e2e8f0]">{link.label}</span>
            <ArrowUpRight className="ml-auto h-4 w-4 text-[#94a3b8] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
