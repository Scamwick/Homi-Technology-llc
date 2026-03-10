'use client'

import { Ring } from '@/components/ui/Ring'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { PanelCard } from '@/components/panels/PanelCard'
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

interface SignalDimension {
  label: string
  value: number
  colorKey: 'cyan' | 'emerald' | 'yellow' | 'amber'
}

interface SignalUIProps {
  overallSignal: number
  confidence: number
  signals: SignalDimension[]
  recommendation: string
  lastUpdated?: string
}

function TrendIcon({ value }: { value: number }) {
  if (value >= 70) return <TrendingUp className="w-4 h-4 text-brand-emerald" />
  if (value >= 50) return <Minus className="w-4 h-4 text-text-3" />
  return <TrendingDown className="w-4 h-4 text-brand-crimson" />
}

function scoreColor(v: number) {
  if (v >= 70) return 'emerald' as const
  if (v >= 50) return 'yellow' as const
  return 'red' as const
}

function scoreRingColor(v: number): 'emerald' | 'yellow' | 'amber' | 'crimson' {
  if (v >= 70) return 'emerald'
  if (v >= 50) return 'yellow'
  if (v >= 35) return 'amber'
  return 'crimson'
}

const barColorMap: Record<string, 'cyan' | 'emerald' | 'yellow'> = {
  cyan:    'cyan',
  emerald: 'emerald',
  yellow:  'yellow',
  amber:   'cyan',
}

export function SignalUI({ overallSignal, confidence, signals, recommendation, lastUpdated }: SignalUIProps) {
  return (
    <div className="space-y-4">
      {/* Overall ring + recommendation */}
      <PanelCard
        title="Overall Signal"
        icon={<Activity className="w-4 h-4" />}
        accentColor="cyan"
      >
        <div className="flex items-center gap-6">
          <Ring
            value={overallSignal}
            size={96}
            color={scoreRingColor(overallSignal)}
            label="Signal"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={scoreColor(confidence)} size="sm">
                {confidence}% Confidence
              </Badge>
            </div>
            <p className="text-sm text-text-2 leading-relaxed">{recommendation}</p>
            {lastUpdated && (
              <p className="text-xs text-text-3">Updated {lastUpdated}</p>
            )}
          </div>
        </div>
      </PanelCard>

      {/* Signal breakdown */}
      <PanelCard title="Signal Components" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="space-y-4">
          {signals.map((signal) => (
            <div key={signal.label} className="flex items-center gap-3">
              <span className="text-xs text-text-3 w-36 flex-shrink-0">{signal.label}</span>
              <ProgressBar
                value={signal.value}
                color={barColorMap[signal.colorKey] ?? 'cyan'}
                size="sm"
                className="flex-1"
              />
              <span className="text-xs font-semibold text-text-1 w-8 text-right">{signal.value}</span>
              <TrendIcon value={signal.value} />
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  )
}
