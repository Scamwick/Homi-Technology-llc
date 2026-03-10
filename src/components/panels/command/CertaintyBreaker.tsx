'use client'

import { useState } from 'react'
import { PanelCard } from '@/components/panels/PanelCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ring } from '@/components/ui/Ring'
import { ChevronDown, ChevronRight, Zap, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface CertaintyDimension {
  label: string
  value: number
  colorKey: 'emerald' | 'cyan' | 'amber'
}

interface Doubt {
  id: string
  doubt: string
  reasoning: string
  resolution: string
  priority: 'high' | 'medium' | 'low'
}

interface CertaintyBreakerProps {
  certaintyScore: number
  breakdown: CertaintyDimension[]
  doubts: Doubt[]
  assessmentId?: string
}

const priorityConfig = {
  high:   { variant: 'red'     as const, border: 'border-brand-crimson/30 bg-brand-crimson/5' },
  medium: { variant: 'yellow'  as const, border: 'border-brand-yellow/30 bg-brand-yellow/5'  },
  low:    { variant: 'emerald' as const, border: 'border-brand-emerald/30 bg-brand-emerald/5' },
}

const barColors: Record<string, 'cyan' | 'emerald' | 'yellow'> = {
  emerald: 'emerald', cyan: 'cyan', amber: 'cyan',
}

function ringColor(score: number): 'emerald' | 'yellow' | 'amber' | 'crimson' {
  if (score >= 70) return 'emerald'
  if (score >= 55) return 'yellow'
  if (score >= 40) return 'amber'
  return 'crimson'
}

export function CertaintyBreaker({ certaintyScore, breakdown, doubts, assessmentId }: CertaintyBreakerProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {/* Score header */}
      <PanelCard
        title="Decision Certainty"
        description="Address your doubts head-on before committing."
        icon={<Zap className="w-4 h-4" />}
        accentColor={certaintyScore >= 70 ? 'emerald' : 'amber'}
      >
        <div className="flex items-center gap-5">
          <Ring value={certaintyScore} size={80} color={ringColor(certaintyScore)} label="Certainty" />
          <div className="space-y-1">
            <p className="text-sm text-text-2">
              {certaintyScore >= 70
                ? 'Strong certainty. Your doubts are mostly resolved.'
                : certaintyScore >= 50
                ? 'Moderate certainty. Some doubts need addressing.'
                : 'Low certainty. Work through your doubts before proceeding.'}
            </p>
            <Badge variant={certaintyScore >= 70 ? 'emerald' : 'yellow'} size="sm">
              {certaintyScore >= 70 ? 'Ready to Proceed' : 'Needs Attention'}
            </Badge>
          </div>
        </div>
      </PanelCard>

      {/* Breakdown bars */}
      <PanelCard title="Certainty Components" icon={<Zap className="w-4 h-4" />}>
        <div className="space-y-4">
          {breakdown.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-2">{item.label}</span>
                <span className="text-text-1 font-semibold">{item.value}</span>
              </div>
              <ProgressBar value={item.value} color={barColors[item.colorKey] ?? 'cyan'} size="sm" />
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Doubts accordion */}
      <PanelCard title="Your Doubts — Resolved" icon={<CheckCircle className="w-4 h-4" />}>
        <div className="space-y-2">
          {doubts.map((doubt) => {
            const config = priorityConfig[doubt.priority]
            const isOpen = expanded === doubt.id
            return (
              <div key={doubt.id}>
                <button
                  onClick={() => setExpanded(isOpen ? null : doubt.id)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-brand-sm border text-left transition-all',
                    config.border
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-1">{doubt.doubt}</p>
                    <p className="text-xs text-text-3 mt-0.5 font-mono">
                      Root: {doubt.reasoning}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={config.variant} size="sm">{doubt.priority.toUpperCase()}</Badge>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-text-3" />
                      : <ChevronRight className="w-4 h-4 text-text-3" />
                    }
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-1 rounded-b-brand-sm border border-t-0 border-brand-emerald/30 bg-brand-emerald/5 p-4 space-y-3">
                    <p className="text-sm text-text-2">{doubt.resolution}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </PanelCard>

      {/* CTA */}
      {certaintyScore >= 65 && (
        <PanelCard title="Ready to Move Forward?" accentColor="emerald" icon={<CheckCircle className="w-4 h-4" />}>
          <p className="text-sm text-text-2 mb-4">All major doubts resolved. Your certainty score supports proceeding.</p>
          {assessmentId && (
            <Link href={`/assessments/${assessmentId}`}>
              <Button variant="primary" size="sm">View Full Assessment</Button>
            </Link>
          )}
        </PanelCard>
      )}
    </div>
  )
}
