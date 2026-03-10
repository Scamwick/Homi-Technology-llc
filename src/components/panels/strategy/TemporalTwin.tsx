'use client'

import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { Clock, Info } from 'lucide-react'

interface Scenario {
  timeline: string
  description: string
  checkpoints: string[]
  sentiment: string
}

interface TemporalTwinProps {
  currentScenario: string
  scenarios: Scenario[]
}

function sentimentVariant(s: string): 'cyan' | 'emerald' | 'yellow' {
  const lower = s.toLowerCase()
  if (lower.includes('excit') || lower.includes('confid')) return 'emerald'
  if (lower.includes('content') || lower.includes('stable')) return 'cyan'
  return 'yellow'
}

export function TemporalTwin({ currentScenario, scenarios }: TemporalTwinProps) {
  return (
    <div className="space-y-4">
      {/* Context */}
      <PanelCard title="Temporal Twin Projection" icon={<Clock className="w-4 h-4" />} accentColor="emerald">
        <p className="text-sm text-text-1 font-medium">{currentScenario}</p>
        <p className="text-xs text-text-3 mt-1">How your decision unfolds across time</p>
      </PanelCard>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-brand-cyan/20" />

        <div className="space-y-3">
          {scenarios.map((scenario, i) => (
            <div key={i} className="relative pl-10">
              {/* Dot */}
              <div className="absolute left-[10px] top-5 w-[18px] h-[18px] rounded-full bg-brand-cyan border-2 border-surface-1 z-10" />

              <PanelCard
                title={scenario.timeline}
                description={scenario.description}
                accentColor="cyan"
                headerRight={
                  <Badge variant={sentimentVariant(scenario.sentiment)} size="sm">
                    {scenario.sentiment}
                  </Badge>
                }
              >
                <ul className="space-y-1.5 pt-1 border-t border-surface-3 mt-1">
                  {scenario.checkpoints.map((point, j) => (
                    <li key={j} className="text-sm text-text-2 flex gap-2">
                      <span className="text-brand-cyan mt-0.5 flex-shrink-0">›</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </PanelCard>
            </div>
          ))}
        </div>
      </div>

      {/* Explainer */}
      <PanelCard title="How Temporal Twin Works" icon={<Info className="w-4 h-4" />}>
        <p className="text-sm text-text-2 leading-relaxed">
          We project your decision forward in time, showing you how it likely unfolds at 3 months, 1 year, and 5 years. This helps you envision the future you're committing to and spot red flags before you commit.
        </p>
      </PanelCard>
    </div>
  )
}
