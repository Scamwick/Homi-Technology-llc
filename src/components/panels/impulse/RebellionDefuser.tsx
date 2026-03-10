'use client'

import { useState } from 'react'
import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Flame, ChevronDown, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Rebellion {
  id: string
  trigger: string
  impulse: string
  defuse: string
  urgency: 'critical' | 'high' | 'moderate'
  resolved: boolean
}

interface RebellionDefuserProps {
  rebellionIndex: number
  rebellions: Rebellion[]
  onResolve?: (id: string) => void
}

const urgencyConfig = {
  critical: { variant: 'red'     as const, border: 'border-brand-crimson/30 bg-brand-crimson/5' },
  high:     { variant: 'yellow'  as const, border: 'border-brand-yellow/30 bg-brand-yellow/5'   },
  moderate: { variant: 'emerald' as const, border: 'border-brand-emerald/30 bg-brand-emerald/5' },
}

function rebellionColor(index: number): 'crimson' | 'amber' | 'yellow' | 'emerald' {
  if (index >= 70) return 'crimson'
  if (index >= 50) return 'amber'
  if (index >= 30) return 'yellow'
  return 'emerald'
}

export function RebellionDefuser({ rebellionIndex, rebellions, onResolve }: RebellionDefuserProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [resolved, setResolved] = useState<Set<string>>(new Set())

  const handleResolve = (id: string) => {
    setResolved((prev) => new Set(prev).add(id))
    onResolve?.(id)
  }

  const active = rebellions.filter((r) => !resolved.has(r.id) && !r.resolved)
  const isHigh = rebellionIndex >= 50

  return (
    <div className="space-y-4">
      {/* Rebellion index */}
      <PanelCard
        title="Rebellion Defuser"
        description="Identifies your impulse triggers and defuses them before they fire."
        icon={<Flame className="w-4 h-4" />}
        accentColor={isHigh ? 'amber' : 'emerald'}
      >
        <div className={cn(
          'flex items-center justify-between p-3 rounded-brand-sm border',
          isHigh
            ? 'border-brand-amber/30 bg-brand-amber/5'
            : 'border-brand-emerald/30 bg-brand-emerald/5'
        )}>
          <div>
            <p className="text-xs text-text-3 font-mono uppercase tracking-wide mb-1">Rebellion Index</p>
            <p className={cn('text-3xl font-bold', isHigh ? 'text-brand-amber' : 'text-brand-emerald')}>
              {rebellionIndex}
            </p>
          </div>
          <Badge variant={isHigh ? 'yellow' : 'emerald'} size="sm">
            {rebellionIndex >= 70 ? 'Critical' : rebellionIndex >= 50 ? 'Elevated' : rebellionIndex >= 30 ? 'Moderate' : 'Calm'}
          </Badge>
        </div>
      </PanelCard>

      {/* Rebellion list */}
      <PanelCard
        title="Active Triggers"
        icon={<AlertTriangle className="w-4 h-4" />}
        empty={active.length === 0}
        emptyMessage="No active rebellion triggers. You're in a clear decision state."
      >
        <div className="space-y-2">
          {active.map((r) => {
            const cfg = urgencyConfig[r.urgency]
            const isOpen = expanded === r.id
            return (
              <div key={r.id}>
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-brand-sm border text-left transition-all',
                    cfg.border
                  )}
                >
                  <Flame className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-1">{r.impulse}</p>
                    <p className="text-xs text-text-3 mt-0.5 font-mono">Trigger: {r.trigger}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={cfg.variant} size="sm">{r.urgency.toUpperCase()}</Badge>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-text-3" />
                      : <ChevronRight className="w-4 h-4 text-text-3" />
                    }
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-1 rounded-b-brand-sm border border-t-0 border-brand-cyan/20 bg-surface-2 p-4 space-y-3">
                    <div>
                      <p className="text-xs text-text-3 font-mono uppercase tracking-wide mb-1">Defuse Strategy</p>
                      <p className="text-sm text-text-2">{r.defuse}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(r.id)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Mark Resolved
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </PanelCard>
    </div>
  )
}
