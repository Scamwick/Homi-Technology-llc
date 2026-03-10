'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcSocialSecurity, formatCurrency } from '@/lib/calculators/retirement'
import { Users, ChevronLeft, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'

function Slider({ label, value, onChange, min, max, step, format }: {
  label: string; value: number; onChange: (v: number) => void
  min: number; max: number; step: number; format: (v: number) => string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <label className="text-xs font-medium text-text-2">{label}</label>
        <span className="text-xs font-mono text-brand-cyan">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-surface-3 rounded-full appearance-none cursor-pointer accent-brand-cyan" />
      <div className="flex justify-between text-xs text-text-4">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  )
}

function NumInput({ label, value, onChange, prefix = '', step = 100 }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <div className="flex items-center gap-1 px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 focus-within:border-brand-cyan transition-colors">
        {prefix && <span className="text-text-3 text-sm">{prefix}</span>}
        <input type="number" step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent text-sm text-text-1 outline-none min-w-0" />
      </div>
    </div>
  )
}

const OPTION_COLORS = ['text-brand-yellow', 'text-brand-cyan', 'text-brand-emerald', 'text-brand-cyan']
const OPTION_VARIANTS = ['yellow', 'cyan', 'emerald', 'cyan'] as const

export default function SocialSecurityPage() {
  const [fraMonthlyBenefit, setFraBenefit] = useState(2400)
  const [currentAge, setCurrentAge] = useState(55)
  const [lifeExpectancy, setLifeExpectancy] = useState(85)

  const result = useMemo(() =>
    calcSocialSecurity({ fraMonthlyBenefit, currentAge, lifeExpectancy }),
    [fraMonthlyBenefit, currentAge, lifeExpectancy]
  )

  const maxLifetime = Math.max(...result.options.map((o) => o.lifetimeTotal))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-3 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-emerald" />
            Social Security Claiming Strategy
          </h1>
          <p className="text-text-2 text-sm mt-0.5">Compare claiming at 62, 64, 67, and 70. Find your optimal strategy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <Card variant="elevated" className="lg:col-span-2 p-5 space-y-5">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Your Details</p>

          <NumInput label="FRA Monthly Benefit (PIA)" value={fraMonthlyBenefit} onChange={setFraBenefit} prefix="$"
          />
          <p className="text-xs text-text-4 -mt-3">Your Social Security statement shows this as your age-67 benefit.</p>

          <Slider label="Current Age" value={currentAge} onChange={setCurrentAge}
            min={50} max={70} step={1} format={(v) => `${v} yrs`} />

          <Slider label="Life Expectancy" value={lifeExpectancy} onChange={setLifeExpectancy}
            min={70} max={100} step={1} format={(v) => `${v} yrs`} />

          <div className="pt-3 border-t border-surface-3 space-y-2">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Quick Reference</p>
            {[
              { age: 62, label: 'Earliest — 30% reduction' },
              { age: 67, label: 'Full Retirement Age — 100%' },
              { age: 70, label: 'Maximum — 24% bonus' },
            ].map((ref) => (
              <div key={ref.age} className="flex justify-between text-xs">
                <span className="text-text-3">{ref.label}</span>
                <span className="font-mono text-text-1">{formatCurrency(fraMonthlyBenefit * (ref.age === 62 ? 0.70 : ref.age === 70 ? 1.24 : 1.0))}/mo</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Recommendation */}
          <Card variant="elevated" className="p-5 border-brand-emerald/30 bg-brand-emerald/5">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-brand-emerald mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-1">Recommended: Age {result.recommended}</p>
                  <Badge variant="emerald" size="sm">Optimal</Badge>
                </div>
                <p className="text-sm text-text-2">{result.recommendedReason}</p>
              </div>
            </div>
          </Card>

          {/* Option cards */}
          <div className="grid grid-cols-2 gap-3">
            {result.options.map((opt, i) => {
              const isRecommended = opt.claimAge === result.recommended
              return (
                <Card key={opt.claimAge} variant="elevated"
                  className={`p-4 space-y-3 ${isRecommended ? 'ring-2 ring-brand-emerald' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-text-3">{opt.label}</p>
                      <p className="text-2xl font-bold font-mono text-brand-cyan mt-0.5">
                        {formatCurrency(opt.monthlyBenefit)}<span className="text-sm text-text-3">/mo</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={opt.reduction < 0 ? 'yellow' : opt.reduction > 0 ? 'emerald' : 'cyan'} size="sm">
                        {opt.reduction > 0 ? '+' : ''}{opt.reduction.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-3">Annual</span>
                      <span className="font-mono text-text-1">{formatCurrency(opt.annualBenefit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-3">Years of payments</span>
                      <span className="font-mono text-text-1">{opt.yearsOfPayments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-3">Lifetime total</span>
                      <span className={`font-mono font-bold ${OPTION_COLORS[i]}`}>
                        {formatCurrency(opt.lifetimeTotal, true)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-text-4 mb-1">Lifetime value</p>
                    <ProgressBar value={opt.lifetimeTotal} max={maxLifetime} color={OPTION_VARIANTS[i]} size="sm" />
                  </div>

                  {opt.breakEvenVsPrevious && (
                    <p className="text-xs text-text-4">
                      Breaks even vs previous at age {opt.breakEvenVsPrevious.toFixed(1)}
                    </p>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Breakeven chart */}
          <Card variant="elevated" className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-cyan" />
              <p className="text-sm font-semibold text-text-1">Breakeven Analysis</p>
            </div>
            <div className="space-y-2">
              {result.options.slice(1).map((opt, i) => {
                const prev = result.options[i]
                if (!opt.breakEvenVsPrevious) return null
                return (
                  <div key={opt.claimAge} className="flex items-center justify-between text-sm">
                    <span className="text-text-2">
                      Age {prev.claimAge} vs Age {opt.claimAge}
                    </span>
                    <div className="text-right">
                      <span className="font-mono text-text-1">
                        Break even at age {opt.breakEvenVsPrevious.toFixed(1)}
                      </span>
                      <p className="text-xs text-text-4">
                        If you live past {opt.breakEvenVsPrevious.toFixed(0)}, age {opt.claimAge} wins
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Key insight */}
          <Card variant="elevated" className="p-4 border-brand-cyan/20 bg-brand-cyan/5">
            <p className="text-sm text-text-2">
              <span className="font-semibold text-text-1">The 8% Rule:</span> Every year you delay past 67 increases
              your benefit by 8%. On a {formatCurrency(fraMonthlyBenefit)}/mo FRA benefit, delaying from 67 to 70
              adds {formatCurrency(fraMonthlyBenefit * 0.24)}/mo permanently —{' '}
              {formatCurrency(fraMonthlyBenefit * 0.24 * 12)}/year for life.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
