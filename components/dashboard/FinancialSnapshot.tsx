'use client';

import { Wallet } from 'lucide-react';
import { Card } from '@/components/ui';
import type { AssessmentRow } from '@/types/database';

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  latestAssessment: AssessmentRow | null;
}

export function FinancialSnapshot({ latestAssessment }: Props) {
  if (!latestAssessment) {
    return (
      <Card padding="md">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Wallet size={32} className="mb-3 text-[#94a3b8]" />
          <p className="text-sm font-medium text-[#e2e8f0]">No financial data</p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Complete an assessment to see your financial snapshot.
          </p>
        </div>
      </Card>
    );
  }

  const dimensions = [
    {
      label: 'Financial Score',
      value: latestAssessment.financial_score,
      color: '#22d3ee',
    },
    {
      label: 'Emotional Score',
      value: latestAssessment.emotional_score,
      color: '#34d399',
    },
    {
      label: 'Timing Score',
      value: latestAssessment.timing_score,
      color: '#facc15',
    },
  ];

  return (
    <Card
      padding="md"
      header={
        <div className="flex items-center gap-2">
          <Wallet size={18} style={{ color: '#22d3ee' }} />
          <span className="text-sm font-semibold text-[#e2e8f0]">
            Dimension Breakdown
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        {dimensions.map((dim) => (
          <div
            key={dim.label}
            className="flex items-center justify-between rounded-lg bg-[rgba(10,22,40,0.5)] px-4 py-3"
          >
            <div>
              <p className="text-xs font-medium text-[#94a3b8]">{dim.label}</p>
              <p className="text-lg font-bold text-[#e2e8f0]">{dim.value}/100</p>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${dim.color}20` }}
            >
              <span className="text-sm font-bold" style={{ color: dim.color }}>
                {dim.value >= 70 ? 'A' : dim.value >= 50 ? 'B' : 'C'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
