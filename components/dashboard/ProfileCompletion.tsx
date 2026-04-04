'use client';

import { UserCircle, CheckCircle2, Circle } from 'lucide-react';
import { Card, ProgressBar } from '@/components/ui';
import type { ProfileRow } from '@/types/database';

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  profile: ProfileRow | null;
  assessmentCount: number;
  hasCoupleLink: boolean;
}

export function ProfileCompletion({ profile, assessmentCount, hasCoupleLink }: Props) {
  if (!profile) {
    return (
      <Card padding="md">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <UserCircle size={32} className="mb-3 text-[#94a3b8]" />
          <p className="text-sm font-medium text-[#e2e8f0]">Profile not loaded</p>
          <p className="mt-1 text-xs text-[#94a3b8]">Sign in to view your profile.</p>
        </div>
      </Card>
    );
  }

  const steps = [
    { label: 'Account created', completed: true },
    { label: 'Profile photo added', completed: !!profile.avatar_url },
    { label: 'Onboarding completed', completed: profile.onboarding_complete },
    { label: 'First assessment taken', completed: assessmentCount > 0 },
    { label: 'Partner linked (couples mode)', completed: hasCoupleLink },
    { label: 'Preferences configured', completed: !!profile.preferences },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const completionPct = Math.round((completedCount / steps.length) * 100);

  return (
    <Card
      padding="md"
      header={
        <div className="flex items-center gap-2">
          <UserCircle size={18} style={{ color: '#facc15' }} />
          <span className="text-sm font-semibold text-[#e2e8f0]">
            Profile Completion
          </span>
          <span className="ml-auto text-xs font-bold text-[#22d3ee]">
            {completionPct}%
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        <ProgressBar value={completionPct} color="gradient" />

        <ul className="space-y-2">
          {steps.filter((s) => !s.completed).map((step, i) => (
            <li key={i} className="flex items-center gap-2">
              <Circle size={14} className="shrink-0 text-[#94a3b8]" />
              <span className="text-xs text-[#94a3b8]">{step.label}</span>
            </li>
          ))}
          {steps.filter((s) => s.completed).slice(0, 3).map((step, i) => (
            <li key={`done-${i}`} className="flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-[#34d399]" />
              <span className="text-xs text-[#94a3b8] line-through opacity-60">
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
