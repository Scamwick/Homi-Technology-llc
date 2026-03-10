'use client'

import { ProgressBar } from '@/components/ui/ProgressBar'
import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { Brain, Lightbulb } from 'lucide-react'

interface Trait {
  label: string
  value: number
  colorKey: 'cyan' | 'emerald' | 'yellow' | 'amber'
}

interface BehavioralGenomeProps {
  profile: string
  description: string
  traits: Trait[]
  insights?: string[]
}

const barColorMap: Record<string, 'cyan' | 'emerald' | 'yellow'> = {
  cyan: 'cyan', emerald: 'emerald', yellow: 'yellow', amber: 'cyan',
}

function traitBadge(value: number): 'emerald' | 'yellow' | 'red' {
  if (value >= 70) return 'emerald'
  if (value >= 45) return 'yellow'
  return 'red'
}

export function BehavioralGenome({ profile, description, traits, insights }: BehavioralGenomeProps) {
  return (
    <div className="space-y-4">
      {/* Profile summary */}
      <PanelCard title="Your Behavioral Profile" icon={<Brain className="w-4 h-4" />} accentColor="cyan">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-1 mb-2">{profile}</h3>
            <p className="text-sm text-text-2 leading-relaxed">{description}</p>
          </div>
          <Badge variant="cyan" size="sm" className="flex-shrink-0">Profile</Badge>
        </div>
      </PanelCard>

      {/* Trait bars */}
      <PanelCard title="Behavioral Traits" icon={<Brain className="w-4 h-4" />}>
        <div className="space-y-4">
          {traits.map((trait) => (
            <div key={trait.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-2">{trait.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={traitBadge(trait.value)} size="sm">{trait.value}</Badge>
                </div>
              </div>
              <ProgressBar
                value={trait.value}
                color={barColorMap[trait.colorKey] ?? 'cyan'}
                size="sm"
              />
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <PanelCard title="Insights For Your Type" icon={<Lightbulb className="w-4 h-4" />} accentColor="emerald">
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-2">
                <span className="text-brand-emerald flex-shrink-0 mt-0.5">›</span>
                {insight}
              </li>
            ))}
          </ul>
        </PanelCard>
      )}
    </div>
  )
}
