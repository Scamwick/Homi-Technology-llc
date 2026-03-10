'use client'

import { PanelCard } from '@/components/panels/PanelCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Ring } from '@/components/ui/Ring'
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MarginCard {
  id: string
  label: string
  amount: number
  target: number
  health: 'healthy' | 'watch' | 'critical'
  absorbed?: number
}

interface SafetyMarginProps {
  safetyScore: number
  totalMargin: number
  absorbedThisMonth: number
  margins: MarginCard[]
}

const healthConfig = {
  healthy:  { variant: 'emerald' as const, border: 'border-brand-emerald/30 bg-brand-emerald/5', color: 'emerald' as const },
  watch:    { variant: 'yellow'  as const, border: 'border-brand-yellow/30 bg-brand-yellow/5',   color: 'yellow'  as const },
  critical: { variant: 'red'     as const, border: 'border-brand-crimson/30 bg-brand-crimson/5', color: 'amber'   as const },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

function ringColor(score: number): 'emerald' | 'yellow' | 'amber' | 'crimson' {
  if (score >= 70) return 'emerald'
  if (score >= 55) return 'yellow'
  if (score >= 40) return 'amber'
  return 'crimson'
}

export function SafetyMargin({ safetyScore, totalMargin, absorbedThisMonth, margins }: SafetyMarginProps) {
  const allHealthy = margins.every((m) => m.health === 'healthy')

  return (
    <div className="space-y-4">
      {/* Score header */}
      <PanelCard
        title="Safety Margin"
        description="Your financial buffer absorbs volatility so you don't have to feel it."
        icon={<ShieldCheck className="w-4 h-4" />}
        accentColor={safetyScore >= 65 ? 'emerald' : 'amber'}
      >
        <div className="flex items-center gap-5">
          <Ring value={safetyScore} size={80} color={ringColor(safetyScore)} label="Safety" />
          <div className="space-y-2">
            <div>
              <p className="text-xl font-bold text-text-1">{fmt(totalMargin)}</p>
              <p className="text-xs text-text-3">Total buffer available</p>
            </div>
            {absorbedThisMonth > 0 && (
              <p className="text-xs text-brand-emerald font-mono">
                ✓ Absorbed {fmt(absorbedThisMonth)} this month
              </p>
            )}
          </div>
        </div>
      </PanelCard>

      {/* Margin breakdown */}
      <PanelCard title="Buffer Breakdown" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="space-y-3">
          {margins.map((m) => {
            const cfg = healthConfig[m.health]
            const pct = Math.min(100, Math.round((m.amount / m.target) * 100))
            return (
              <div key={m.id} className={cn('p-3 rounded-brand-sm border space-y-2', cfg.border)}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-1">{m.label}</p>
                  <Badge variant={cfg.variant} size="sm">{m.health.charAt(0).toUpperCase() + m.health.slice(1)}</Badge>
                </div>
                <div className="flex items-end justify-between text-xs text-text-3">
                  <span className="text-text-1 font-semibold">{fmt(m.amount)}</span>
                  <span>target: {fmt(m.target)}</span>
                </div>
                <ProgressBar
                  value={pct}
                  color={cfg.color === 'amber' ? 'cyan' : cfg.color}
                  size="sm"
                />
                {m.absorbed !== undefined && m.absorbed > 0 && (
                  <p className="text-xs text-text-3 font-mono">Absorbed {fmt(m.absorbed)} this period</p>
                )}
              </div>
            )
          })}
        </div>
      </PanelCard>
    </div>
  )
}
