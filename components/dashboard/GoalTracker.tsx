'use client';

import { Target, CheckCircle2, Clock } from 'lucide-react';
import { Card, ProgressBar } from '@/components/ui';
import type { TransformationPathRow } from '@/types/database';

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  transformationPath: TransformationPathRow | null;
}

export function GoalTracker({ transformationPath }: Props) {
  if (!transformationPath || transformationPath.steps.length === 0) {
    return (
      <Card padding="md">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target size={32} className="mb-3 text-[#94a3b8]" />
          <p className="text-sm font-medium text-[#e2e8f0]">No active goals</p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Complete an assessment to get your personalized roadmap.
          </p>
        </div>
      </Card>
    );
  }

  const steps = transformationPath.steps;

  return (
    <Card
      padding="md"
      header={
        <div className="flex items-center gap-2">
          <Target size={18} style={{ color: '#34d399' }} />
          <span className="text-sm font-semibold text-[#e2e8f0]">
            Goal Progress
          </span>
          <span className="ml-auto text-xs text-[#94a3b8]">
            {transformationPath.progress_percent}% complete
          </span>
        </div>
      }
    >
      <div className="mb-3">
        <ProgressBar value={transformationPath.progress_percent} color="gradient" size="sm" />
      </div>
      <ul className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            {step.completed ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#34d399]" />
            ) : (
              <Clock size={16} className="mt-0.5 shrink-0 text-[#94a3b8]" />
            )}
            <div className="flex-1">
              <span
                className={`text-sm ${
                  step.completed ? 'text-[#94a3b8] line-through' : 'text-[#e2e8f0]'
                }`}
              >
                {step.title}
              </span>
              <p className="text-xs text-[#94a3b8]">{step.description}</p>
            </div>
            <span className="text-xs text-[#22d3ee]">
              +{step.estimated_score_impact} pts
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
