'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { compareLoanProducts, formatCurrency, US_STATES } from '@/lib/calculators/mortgage'
import { CreditCard, ChevronLeft, Check, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function LoanComparisonPage() {
  const [homePrice, setHomePrice] = useState(400000)
  const [baseRate, setBaseRate] = useState(6.75)
  const [downPct, setDownPct] = useState(20)
  const [state, setState] = useState('TX')
  const [selected, setSelected] = useState<string | null>(null)

  const results = useMemo(
    () => compareLoanProducts(homePrice, baseRate, downPct, state),
    [homePrice, baseRate, downPct, state]
  )

  const baseline = results.find((r) => r.product.id === '30yr_fixed')!
  const highlight = (id: string) => id === '15yr_fixed' ? 'border-brand-emerald/40 bg-brand-emerald/5'
    : id === 'interest_only' ? 'border-brand-crimson/30 bg-brand-crimson/5' : ''

  function NumInput({ label, value, onChange, prefix = '', suffix = '', step = 1 }: any) {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-text-2">{label}</label>
        <div className="flex items-center gap-1 px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 focus-within:border-brand-cyan transition-colors">
          {prefix && <span className="text-text-3 text-sm">{prefix}</span>}
          <input type="number" step={step} value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="flex-1 bg-transparent text-sm text-text-1 outline-none min-w-0" />
          {suffix && <span className="text-text-3 text-sm">{suffix}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-3 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-emerald" />
            Loan Comparison
          </h1>
          <p className="text-text-2 text-sm mt-0.5">Compare 6 mortgage products side by side.</p>
        </div>
      </div>

      {/* Inputs */}
      <Card variant="elevated" className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NumInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} />
          <NumInput label="Down Payment" value={downPct} onChange={setDownPct} suffix="%" step={0.5} />
          <NumInput label="Base Rate (30yr)" value={baseRate} onChange={setBaseRate} suffix="%" step={0.125} />
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">State</label>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan transition-colors">
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((r) => {
          const isSelected = selected === r.product.id
          const monthlySavings = baseline.totalMonthly - r.totalMonthly
          const interestSavings = baseline.totalInterest - r.totalInterest

          return (
            <Card
              key={r.product.id}
              variant="elevated"
              className={`p-5 cursor-pointer transition-all ${highlight(r.product.id)} ${
                isSelected ? 'ring-2 ring-brand-cyan' : 'hover:border-surface-4'
              }`}
              onClick={() => setSelected(isSelected ? null : r.product.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-text-1">{r.product.name}</p>
                  <p className="text-xs text-text-3 mt-0.5">{r.product.description}</p>
                </div>
                {r.product.id === '15yr_fixed' && (
                  <Badge variant="emerald" size="sm">Best Value</Badge>
                )}
                {r.product.id === 'interest_only' && (
                  <Badge variant="amber" size="sm">Risky</Badge>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-text-3">Monthly Payment</span>
                  <span className="text-xl font-bold font-mono text-brand-cyan">
                    {formatCurrency(r.totalMonthly)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-3">Rate</span>
                  <span className="font-mono text-text-1">{r.rate.toFixed(3)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-3">Total Interest</span>
                  <span className={`font-mono font-medium ${interestSavings > 0 ? 'text-brand-emerald' : interestSavings < 0 ? 'text-brand-amber' : 'text-text-1'}`}>
                    {formatCurrency(r.totalInterest, true)}
                  </span>
                </div>
                {r.product.upfrontFee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-3">Upfront Fee</span>
                    <span className="font-mono text-brand-amber">{formatCurrency(r.upfrontFeeAmount, true)} ({r.product.upfrontFee}%)</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-text-3">Equity @ 5yr</span>
                  <span className="font-mono text-text-2">{formatCurrency(r.equityAt5yr, true)}</span>
                </div>
              </div>

              {/* vs 30yr comparison */}
              {r.product.id !== '30yr_fixed' && (
                <div className={`text-xs p-2 rounded-brand-sm border ${
                  monthlySavings < 0 ? 'border-brand-amber/30 bg-brand-amber/5 text-brand-amber'
                  : 'border-brand-emerald/30 bg-brand-emerald/5 text-brand-emerald'
                }`}>
                  {monthlySavings < 0
                    ? `${formatCurrency(Math.abs(monthlySavings))}/mo more than 30yr`
                    : `${formatCurrency(monthlySavings)}/mo less than 30yr`}
                  {interestSavings > 0 && ` · saves ${formatCurrency(interestSavings, true)} interest`}
                </div>
              )}

              {/* Pros/Cons on expand */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-surface-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-brand-emerald mb-1">Pros</p>
                    {r.product.prosBullets.map((b) => (
                      <div key={b} className="flex items-start gap-1.5 text-xs text-text-2 mb-1">
                        <Check className="w-3 h-3 text-brand-emerald mt-0.5 flex-shrink-0" />{b}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-amber mb-1">Cons</p>
                    {r.product.consBullets.map((b) => (
                      <div key={b} className="flex items-start gap-1.5 text-xs text-text-2 mb-1">
                        <X className="w-3 h-3 text-brand-amber mt-0.5 flex-shrink-0" />{b}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Key insight */}
      <Card variant="elevated" className="p-5 border-brand-cyan/20 bg-brand-cyan/5">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-text-1">15-Year vs 30-Year: The Real Number</p>
            {(() => {
              const yr30 = results.find((r) => r.product.id === '30yr_fixed')!
              const yr15 = results.find((r) => r.product.id === '15yr_fixed')!
              const interestSaved = yr30.totalInterest - yr15.totalInterest
              const extraMonthly = yr15.totalMonthly - yr30.totalMonthly
              return (
                <p className="text-sm text-text-2 mt-0.5">
                  The 15-year costs <span className="font-semibold text-brand-amber">{formatCurrency(extraMonthly)}/mo more</span> but
                  saves <span className="font-semibold text-brand-emerald">{formatCurrency(interestSaved, true)} in total interest</span> and
                  builds equity twice as fast. At a {baseRate.toFixed(2)}% base rate,
                  the 15-year rate is ~{yr15.rate.toFixed(3)}%.
                </p>
              )
            })()}
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Link href="/tools/financial/piti">
          <Button variant="outline" size="sm">PITI Calculator</Button>
        </Link>
        <Link href="/tools/financial/tco">
          <Button variant="outline" size="sm">Rent vs Buy</Button>
        </Link>
      </div>
    </div>
  )
}
