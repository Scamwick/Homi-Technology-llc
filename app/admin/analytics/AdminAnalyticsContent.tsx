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
import type { AssessmentRow } from '@/types/database';

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ProfileSummary {
  id: string;
  created_at: string;
  onboarding_complete: boolean;
  tier: string;
}

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

interface Props {
  assessments: AssessmentRow[];
  profiles: ProfileSummary[];
}

export default function AdminAnalyticsContent({ assessments, profiles }: Props) {
  // Build funnel data from real profiles
  const totalSignups = profiles.length;
  const onboarded = profiles.filter((p) => p.onboarding_complete).length;
  const assessed = new Set(assessments.map((a) => a.user_id)).size;
  const readyUsers = new Set(
    assessments.filter((a) => a.verdict === 'READY').map((a) => a.user_id),
  ).size;

  const funnelSteps = [
    { step: 'Signup', count: totalSignups, pct: 100, color: '#22d3ee' },
    { step: 'Onboard', count: onboarded, pct: totalSignups > 0 ? Math.round((onboarded / totalSignups) * 100) : 0, color: '#22d3ee' },
    { step: 'Assessed', count: assessed, pct: totalSignups > 0 ? Math.round((assessed / totalSignups) * 100) : 0, color: '#34d399' },
    { step: 'READY', count: readyUsers, pct: totalSignups > 0 ? Math.round((readyUsers / totalSignups) * 100) : 0, color: '#facc15' },
  ];

  // Dimension weakness analysis from real assessments
  const dimensionTotals = { financial: 0, emotional: 0, timing: 0 };
  assessments.forEach((a) => {
    dimensionTotals.financial += a.financial_score;
    dimensionTotals.emotional += a.emotional_score;
    dimensionTotals.timing += a.timing_score;
  });
  const count = assessments.length || 1;
  const dimensionData = [
    { dimension: 'Financial', avgScore: Math.round(dimensionTotals.financial / count), color: '#22d3ee' },
    { dimension: 'Emotional', avgScore: Math.round(dimensionTotals.emotional / count), color: '#34d399' },
    { dimension: 'Timing', avgScore: Math.round(dimensionTotals.timing / count), color: '#facc15' },
  ];

  const weakest = dimensionData.reduce((min, d) =>
    d.avgScore < min.avgScore ? d : min,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Deep Analytics</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Funnel and dimension analysis &mdash; {assessments.length} assessments, {profiles.length} users
        </p>
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
        <h2 className="mb-5 text-sm font-semibold text-[#e2e8f0]">Conversion Funnel</h2>
        {totalSignups > 0 ? (
          <div className="space-y-3">
            {funnelSteps.map((step, idx) => (
              <div key={step.step} className="flex items-center gap-4">
                <div className="w-24 text-right text-sm font-medium text-[#94a3b8]">{step.step}</div>
                <div className="flex-1">
                  <div className="relative h-10 overflow-hidden rounded-lg bg-[rgba(10,22,40,0.5)]">
                    <div
                      className="flex h-full items-center rounded-lg px-3 transition-all duration-700"
                      style={{
                        width: `${Math.max(step.pct, 2)}%`,
                        backgroundColor: `${step.color}25`,
                        borderLeft: `3px solid ${step.color}`,
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: step.color }}>
                        {step.count.toLocaleString()} ({step.pct}%)
                      </span>
                    </div>
                  </div>
                </div>
                {idx > 0 && (
                  <div className="w-16 text-right text-xs text-[#94a3b8]">
                    {funnelSteps[idx - 1].count > 0
                      ? `${Math.round((step.count / funnelSteps[idx - 1].count) * 100)}% conv.`
                      : '—'}
                  </div>
                )}
                {idx === 0 && <div className="w-16" />}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[#94a3b8]">
            No user data available. Connect Supabase to view funnel analytics.
          </p>
        )}
      </div>

      {/* Dimension Analysis */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl">
        <h2 className="mb-4 text-sm font-semibold text-[#e2e8f0]">Dimension Weakness Analysis</h2>
        {assessments.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dimensionData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <YAxis type="category" dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
                  {dimensionData.map((entry) => (
                    <Cell key={entry.dimension} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-3 text-xs text-[#94a3b8]">
              Weakest dimension:{' '}
              <span className="font-semibold" style={{ color: weakest.color }}>
                {weakest.dimension} (avg {weakest.avgScore})
              </span>
            </p>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-[#94a3b8]">
            No assessment data available.
          </p>
        )}
      </div>
    </div>
  );
}
