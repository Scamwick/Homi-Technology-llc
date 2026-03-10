'use client'

import { ProgressBar } from '@/components/ui/ProgressBar'
import { PanelCard } from '@/components/panels/PanelCard'
import { TrendingUp, Info, ShieldCheck } from 'lucide-react'

interface Outcome {
  label: string
  value: number
  colorKey: 'emerald' | 'cyan' | 'amber'
}

interface Equity5y {
  best: number
  expected: number
  worst: number
}

interface MonteCarloChartProps {
  simulation: string
  outcomes: Outcome[]
  equity5y: Equity5y
  description: string
  downside: string
}

const barColorMap = { emerald: 'emerald', cyan: 'cyan', amber: 'cyan' } as const

function formatCurrency(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
}

export function MonteCarloChart({ simulation, outcomes, equity5y, description, downside }: MonteCarloChartProps) {
  const maxOutcome = Math.max(...outcomes.map((o) => o.value)) * 1.1

  return (
    <div className="space-y-4">
      {/* Header */}
      <PanelCard title="Monte Carlo Simulation" icon={<TrendingUp className="w-4 h-4" />} accentColor="cyan">
        <p className="text-sm text-text-2">{description}</p>
        <p className="text-xs text-text-3 mt-2 font-mono">{simulation}</p>
      </PanelCard>

      {/* Outcome distribution */}
      <PanelCard title="Projected Outcomes" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="space-y-4">
          {outcomes.map((outcome) => (
            <div key={outcome.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-2">{outcome.label}</span>
                <span className="text-text-1 font-semibold font-mono">
                  {formatCurrency(outcome.value)}
                </span>
              </div>
              <ProgressBar
                value={(outcome.value / maxOutcome) * 100}
                color={barColorMap[outcome.colorKey]}
                size="md"
              />
            </div>
          ))}
        </div>
      </PanelCard>

      {/* 5-year equity */}
      <PanelCard title="5-Year Equity Projection" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Best Case',   value: equity5y.best,     color: 'border-brand-emerald/30 bg-brand-emerald/5 text-brand-emerald' },
            { label: 'Expected',    value: equity5y.expected,  color: 'border-brand-cyan/30 bg-brand-cyan/5 text-brand-cyan' },
            { label: 'Worst Case',  value: equity5y.worst,    color: 'border-brand-amber/30 bg-brand-amber/5 text-brand-amber' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-brand-sm border p-3 text-center ${color}`}>
              <p className="text-xs font-mono uppercase mb-1 opacity-80">{label}</p>
              <p className="text-lg font-bold text-text-1 font-mono">{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Downside protection */}
      <PanelCard title="Downside Protection" icon={<ShieldCheck className="w-4 h-4" />} accentColor="emerald">
        <p className="text-sm text-text-2">{downside}</p>
      </PanelCard>

      {/* Explainer */}
      <PanelCard title="What Is Monte Carlo?" icon={<Info className="w-4 h-4" />}>
        <p className="text-sm text-text-2 leading-relaxed">
          We run 10,000 simulations with different market variables—interest rates, appreciation, recession—to show the range of possible outcomes. This reveals your true risk exposure across scenarios.
        </p>
      </PanelCard>
    </div>
  )
}
