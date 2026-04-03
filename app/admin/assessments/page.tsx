'use client';

import { AlertTriangle, Clock, Target, CheckCircle2 } from 'lucide-react';

/* ── Mock Data ────────────────────────────────────────────────────────────── */

const AGGREGATE_STATS = [
  {
    label: 'Avg Score',
    value: '62.4',
    sub: 'out of 100',
    icon: Target,
    color: '#22d3ee',
  },
  {
    label: 'Avg Time to Complete',
    value: '8.2 min',
    sub: 'per assessment',
    icon: Clock,
    color: '#34d399',
  },
  {
    label: 'Completion Rate',
    value: '84%',
    sub: 'of started assessments',
    icon: CheckCircle2,
    color: '#facc15',
  },
];

interface MockAssessment {
  id: string;
  user: string;
  type: string;
  score: number;
  verdict: 'READY' | 'ALMOST_THERE' | 'BUILD_FIRST' | 'NOT_YET';
  date: string;
  crisis: boolean;
}

const MOCK_ASSESSMENTS: MockAssessment[] = [
  { id: 'a1', user: 'Sarah Chen', type: 'Home Buying', score: 82, verdict: 'READY', date: '2026-04-01', crisis: false },
  { id: 'a2', user: 'Marcus Williams', type: 'Career Change', score: 38, verdict: 'BUILD_FIRST', date: '2026-03-28', crisis: false },
  { id: 'a3', user: 'Ana Rodriguez', type: 'Investment', score: 91, verdict: 'READY', date: '2026-04-02', crisis: false },
  { id: 'a4', user: 'James Park', type: 'Home Buying', score: 67, verdict: 'ALMOST_THERE', date: '2026-03-30', crisis: false },
  { id: 'a5', user: 'Priya Sharma', type: 'Career Change', score: 24, verdict: 'NOT_YET', date: '2026-03-15', crisis: true },
  { id: 'a6', user: 'David Kim', type: 'Career Change', score: 59, verdict: 'ALMOST_THERE', date: '2026-04-01', crisis: false },
  { id: 'a7', user: 'Elena Vasquez', type: 'Home Buying', score: 44, verdict: 'BUILD_FIRST', date: '2026-03-25', crisis: false },
  { id: 'a8', user: 'Robert Taylor', type: 'Investment', score: 22, verdict: 'NOT_YET', date: '2026-02-10', crisis: true },
  { id: 'a9', user: 'Michelle Okafor', type: 'Home Buying', score: 88, verdict: 'READY', date: '2026-04-02', crisis: false },
  { id: 'a10', user: 'Tom Brennan', type: 'Investment', score: 65, verdict: 'ALMOST_THERE', date: '2026-03-29', crisis: false },
];

const VERDICT_STYLES: Record<string, string> = {
  READY: 'bg-[rgba(52,211,153,0.1)] text-[#34d399] border-[#34d399]',
  ALMOST_THERE: 'bg-[rgba(250,204,21,0.1)] text-[#facc15] border-[#facc15]',
  BUILD_FIRST: 'bg-[rgba(251,146,60,0.1)] text-[#fb923c] border-[#fb923c]',
  NOT_YET: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[#ef4444]',
};

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function AdminAssessments() {
  const redFlags = MOCK_ASSESSMENTS.filter((a) => a.score < 30 || a.crisis);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">
          Assessment Analytics
        </h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          {MOCK_ASSESSMENTS.length} assessments tracked
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {AGGREGATE_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#e2e8f0]">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-[#94a3b8]">{stat.sub}</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon
                  className="h-5 w-5"
                  style={{ color: stat.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Table */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#e2e8f0]">
            All Assessments
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(34,211,238,0.1)]">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                User
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Score
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Verdict
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ASSESSMENTS.map((a, idx) => (
              <tr
                key={a.id}
                className={`border-b border-[rgba(34,211,238,0.05)] ${
                  idx % 2 === 0
                    ? 'bg-[rgba(10,22,40,0.3)]'
                    : 'bg-[rgba(15,23,42,0.3)]'
                }`}
              >
                <td className="px-5 py-3 font-medium text-[#e2e8f0]">
                  {a.user}
                </td>
                <td className="px-5 py-3 text-[#94a3b8]">{a.type}</td>
                <td className="px-5 py-3">
                  <span
                    className={`font-bold ${
                      a.score >= 70
                        ? 'text-[#34d399]'
                        : a.score >= 50
                          ? 'text-[#facc15]'
                          : 'text-[#ef4444]'
                    }`}
                  >
                    {a.score}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${VERDICT_STYLES[a.verdict]}`}
                  >
                    {a.verdict.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#94a3b8]">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Red Flag Report */}
      <div className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-[rgba(239,68,68,0.2)] px-5 py-4">
          <AlertTriangle className="h-4.5 w-4.5 text-[#ef4444]" />
          <h2 className="text-sm font-semibold text-[#ef4444]">
            Red Flag Report
          </h2>
          <span className="ml-auto rounded-full bg-[rgba(239,68,68,0.15)] px-2 py-0.5 text-[11px] font-bold text-[#ef4444]">
            {redFlags.length} flagged
          </span>
        </div>
        <div className="divide-y divide-[rgba(239,68,68,0.1)]">
          {redFlags.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between px-5 py-3.5"
            >
              <div>
                <p className="text-sm font-medium text-[#e2e8f0]">
                  {a.user}
                </p>
                <p className="mt-0.5 text-xs text-[#94a3b8]">
                  {a.type} — Score: {a.score}
                  {a.crisis && ' — Crisis signal detected'}
                </p>
              </div>
              <span className="text-xs text-[#94a3b8]">{a.date}</span>
            </div>
          ))}
          {redFlags.length === 0 && (
            <div className="py-8 text-center text-sm text-[#94a3b8]">
              No red flags detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
