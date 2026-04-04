'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';
import type { ScoreHistoryEntry } from '@/lib/data/dashboard';

/* ── Tooltip ──────────────────────────────────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  return (
    <div className="rounded-lg border border-[rgba(34,211,238,0.2)] bg-[#0f172a] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 text-[#94a3b8]">{label}</p>
      <p
        className="font-bold"
        style={{
          color: score >= 70 ? '#34d399' : score >= 50 ? '#facc15' : '#ef4444',
        }}
      >
        Score: {score}
      </p>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  history: ScoreHistoryEntry[];
}

export function AssessmentHistoryChart({ history }: Props) {
  if (history.length === 0) {
    return (
      <Card padding="md">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <TrendingUp size={32} className="mb-3 text-[#94a3b8]" />
          <p className="text-sm font-medium text-[#e2e8f0]">No score history yet</p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Complete your first assessment to start tracking your progress.
          </p>
        </div>
      </Card>
    );
  }

  const firstScore = history[0].score;
  const lastScore = history[history.length - 1].score;
  const diff = lastScore - firstScore;

  return (
    <Card
      padding="md"
      header={
        <div className="flex items-center gap-2">
          <TrendingUp size={18} style={{ color: '#22d3ee' }} />
          <span className="text-sm font-semibold text-[#e2e8f0]">
            Score History
          </span>
          {diff !== 0 && (
            <span
              className="ml-auto text-xs font-medium"
              style={{ color: diff > 0 ? '#34d399' : '#ef4444' }}
            >
              {diff > 0 ? '+' : ''}{diff} pts
            </span>
          )}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={history}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine y={70} stroke="#34d399" strokeDasharray="4 4" strokeOpacity={0.4} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={{ r: 4, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#22d3ee' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-[11px] text-[#94a3b8]">
        Dashed line = READY threshold (70)
      </p>
    </Card>
  );
}
