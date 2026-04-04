'use client';

import { AlertTriangle, Clock, Target, CheckCircle2 } from 'lucide-react';
import type { AssessmentRow } from '@/types/database';

const VERDICT_STYLES: Record<string, string> = {
  READY: 'bg-[rgba(52,211,153,0.1)] text-[#34d399] border-[#34d399]',
  ALMOST_THERE: 'bg-[rgba(250,204,21,0.1)] text-[#facc15] border-[#facc15]',
  BUILD_FIRST: 'bg-[rgba(251,146,60,0.1)] text-[#fb923c] border-[#fb923c]',
  NOT_YET: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[#ef4444]',
};

interface EnrichedAssessment extends AssessmentRow {
  user_name?: string;
  user_email?: string;
}

interface Props {
  assessments: EnrichedAssessment[];
  avgScore: number;
  crisisCount: number;
}

export default function AdminAssessmentsContent({ assessments, avgScore, crisisCount }: Props) {
  const redFlags = assessments.filter((a) => a.overall_score < 30 || a.crisis_detected);

  const stats = [
    { label: 'Avg Score', value: avgScore > 0 ? avgScore.toString() : '—', sub: 'out of 100', icon: Target, color: '#22d3ee' },
    { label: 'Total Assessments', value: assessments.length.toString(), sub: 'tracked', icon: CheckCircle2, color: '#34d399' },
    { label: 'Crisis Detected', value: crisisCount.toString(), sub: 'flagged assessments', icon: AlertTriangle, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Assessment Analytics</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">{assessments.length} assessments tracked</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-[#e2e8f0]">{stat.value}</p>
                <p className="mt-0.5 text-xs text-[#94a3b8]">{stat.sub}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#e2e8f0]">All Assessments</h2>
        </div>
        {assessments.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(34,211,238,0.1)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Score</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Verdict</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Date</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, idx) => (
                <tr key={a.id} className={`border-b border-[rgba(34,211,238,0.05)] ${idx % 2 === 0 ? 'bg-[rgba(10,22,40,0.3)]' : 'bg-[rgba(15,23,42,0.3)]'}`}>
                  <td className="px-5 py-3 font-medium text-[#e2e8f0]">{a.user_name ?? a.user_email ?? a.user_id.slice(0, 8)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${a.overall_score >= 70 ? 'text-[#34d399]' : a.overall_score >= 50 ? 'text-[#facc15]' : 'text-[#ef4444]'}`}>
                      {a.overall_score}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${VERDICT_STYLES[a.verdict] ?? ''}`}>
                      {a.verdict.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#94a3b8]">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-sm text-[#94a3b8]">
            No assessments yet. Connect Supabase to view assessment data.
          </div>
        )}
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-[rgba(239,68,68,0.2)] px-5 py-4">
            <AlertTriangle className="h-4.5 w-4.5 text-[#ef4444]" />
            <h2 className="text-sm font-semibold text-[#ef4444]">Red Flag Report</h2>
            <span className="ml-auto rounded-full bg-[rgba(239,68,68,0.15)] px-2 py-0.5 text-[11px] font-bold text-[#ef4444]">
              {redFlags.length} flagged
            </span>
          </div>
          <div className="divide-y divide-[rgba(239,68,68,0.1)]">
            {redFlags.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-[#e2e8f0]">{a.user_name ?? a.user_id.slice(0, 8)}</p>
                  <p className="mt-0.5 text-xs text-[#94a3b8]">
                    Score: {a.overall_score}{a.crisis_detected ? ' — Crisis signal detected' : ''}
                  </p>
                </div>
                <span className="text-xs text-[#94a3b8]">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
