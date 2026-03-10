'use client'

import { PanelCard } from '@/components/panels/PanelCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Ring } from '@/components/ui/Ring'
import { Star, Trophy, TrendingUp } from 'lucide-react'

interface ReputationCategory {
  label: string
  value: number
  colorKey: 'cyan' | 'emerald' | 'yellow' | 'amber'
}

interface Achievement {
  id: string
  label: string
  earned: boolean
}

interface ReputationScoreProps {
  score: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  categories: ReputationCategory[]
  achievements: Achievement[]
  streak?: number
  percentile?: number
}

const tierConfig = {
  bronze:   { variant: 'yellow'  as const, label: 'Bronze',   color: 'amber'   as const },
  silver:   { variant: 'default' as const, label: 'Silver',   color: 'cyan'    as const },
  gold:     { variant: 'yellow'  as const, label: 'Gold',     color: 'yellow'  as const },
  platinum: { variant: 'emerald' as const, label: 'Platinum', color: 'emerald' as const },
}

const barColors: Record<string, 'cyan' | 'emerald' | 'yellow'> = {
  cyan: 'cyan', emerald: 'emerald', yellow: 'yellow', amber: 'cyan',
}

export function ReputationScore({
  score, tier, categories, achievements, streak, percentile,
}: ReputationScoreProps) {
  const cfg = tierConfig[tier]

  return (
    <div className="space-y-4">
      {/* Main score */}
      <PanelCard
        title="Reputation Score"
        description="Your trust level based on decision quality and consistency."
        icon={<Star className="w-4 h-4" />}
        accentColor={tier === 'platinum' || tier === 'gold' ? 'emerald' : 'cyan'}
      >
        <div className="flex items-center gap-5">
          <Ring value={score} size={80} color={cfg.color} label="Rep" />
          <div className="space-y-2">
            <Badge variant={cfg.variant} size="sm">{cfg.label} Tier</Badge>
            {streak !== undefined && (
              <p className="text-xs text-text-3 font-mono">{streak}-day streak</p>
            )}
            {percentile !== undefined && (
              <p className="text-xs text-text-2">Top {100 - percentile}% of users</p>
            )}
          </div>
        </div>
      </PanelCard>

      {/* Category breakdown */}
      <PanelCard title="Score Breakdown" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-2">{cat.label}</span>
                <span className="text-text-1 font-semibold">{cat.value}</span>
              </div>
              <ProgressBar value={cat.value} color={barColors[cat.colorKey] ?? 'cyan'} size="sm" />
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Achievements */}
      {achievements.length > 0 && (
        <PanelCard title="Achievements" icon={<Trophy className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`p-2 rounded-brand-sm border text-xs font-medium text-center transition-opacity ${
                  a.earned
                    ? 'border-brand-emerald/30 bg-brand-emerald/5 text-brand-emerald'
                    : 'border-surface-3 bg-surface-2 text-text-4 opacity-50'
                }`}
              >
                {a.label}
              </div>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  )
}
