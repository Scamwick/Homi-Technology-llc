'use client';

import { Award, Flame, Lightbulb, Star } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { BehavioralGenomeRow } from '@/types/database';

/* ── Component ────────────────────────────────────────────────────────────── */

interface AchievementBadge {
  id: string;
  label: string;
  icon: typeof Award;
  earned: boolean;
  color: string;
  description: string;
}

interface Props {
  genome: BehavioralGenomeRow | null;
  assessmentCount: number;
}

export function EngagementSection({ genome, assessmentCount }: Props) {
  // Derive badges from real behavioral data
  const badges: AchievementBadge[] = [
    {
      id: 'b1',
      label: 'First Assessment',
      icon: Star,
      earned: assessmentCount >= 1,
      color: assessmentCount >= 1 ? '#22d3ee' : '#94a3b8',
      description: 'Completed your first assessment',
    },
    {
      id: 'b2',
      label: 'Score Improver',
      icon: Award,
      earned: (genome?.score_trajectory?.length ?? 0) >= 3 &&
        isImproving(genome?.score_trajectory ?? []),
      color: '#34d399',
      description: 'Improved your score 3 times in a row',
    },
    {
      id: 'b3',
      label: 'Consistent Tracker',
      icon: Flame,
      earned: assessmentCount >= 4,
      color: assessmentCount >= 4 ? '#facc15' : '#94a3b8',
      description: 'Completed 4+ assessments',
    },
    {
      id: 'b4',
      label: 'Agent Power User',
      icon: Lightbulb,
      earned: (genome?.preferred_skills?.length ?? 0) >= 3,
      color: (genome?.preferred_skills?.length ?? 0) >= 3 ? '#fb923c' : '#94a3b8',
      description: 'Used 3+ agent skills',
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Achievement Badges */}
      <Card
        padding="md"
        header={
          <div className="flex items-center gap-2">
            <Award size={18} style={{ color: '#facc15' }} />
            <span className="text-sm font-semibold text-[#e2e8f0]">
              Achievements
            </span>
            <span className="ml-auto text-xs text-[#94a3b8]">
              {earnedCount}/{badges.length} earned
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-all ${
                badge.earned
                  ? 'bg-[rgba(10,22,40,0.5)]'
                  : 'bg-[rgba(10,22,40,0.3)] opacity-40'
              }`}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${badge.color}20` }}
              >
                <badge.icon size={20} style={{ color: badge.color }} />
              </div>
              <span className="text-xs font-medium text-[#e2e8f0]">
                {badge.label}
              </span>
              <span className="text-[10px] text-[#94a3b8]">
                {badge.description}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Stats */}
      <div className="flex flex-col gap-4">
        {/* Assessment Count */}
        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)]">
              <Star size={28} style={{ color: '#22d3ee' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e2e8f0]">
                {assessmentCount}
              </p>
              <p className="text-xs text-[#94a3b8]">Total assessments completed</p>
            </div>
          </div>
        </Card>

        {/* Genome Insight */}
        <Card padding="md">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(34,211,238,0.1)]">
              <Lightbulb size={18} style={{ color: '#22d3ee' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#22d3ee]">Insight</p>
              <p className="mt-1 text-sm leading-relaxed text-[#e2e8f0]">
                {genome
                  ? `You've completed ${genome.assessment_count} assessments with ${genome.deflection_count} safety checks. ${
                      genome.preferred_skills.length > 0
                        ? `Your favorite skills: ${genome.preferred_skills.slice(0, 3).join(', ')}.`
                        : 'Start using agent skills to personalize your experience.'
                    }`
                  : 'Complete more assessments to unlock personalized behavioral insights.'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Check if the score trajectory shows improvement. */
function isImproving(trajectory: number[]): boolean {
  if (trajectory.length < 3) return false;
  const last3 = trajectory.slice(-3);
  return last3[1] > last3[0] && last3[2] > last3[1];
}
