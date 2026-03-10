'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcDebtPayoff, formatCurrency, type DebtItem } from '@/lib/calculators/financial'
import { TrendingDown, Zap, ChevronLeft, Plus, X, Info } from 'lucide-react'
import Link from 'next/link'

const DEFAULT_DEBTS: DebtItem[] = [
  { label: 'Credit Card', balance: 8000, rate: 19.9, minPayment: 200 },
  { label: 'Auto Loan', balance: 18000, rate: 7.2, minPayment: 350 },
  { label: 'Student Loan', balance: 25000, rate: 5.5, minPayment: 280 },
]

export default function DebtPayoffPage() {
  const [debts, setDebts] = useState<DebtItem[]>(DEFAULT_DEBTS)
  const [extraPayment, setExtraPayment] = useState(500)

  const result = useMemo(() => calcDebtPayoff(debts, extraPayment), [debts, extraPayment])

  function addDebt() {
    setDebts(prev => [...prev, { label: 'New Debt', balance: 5000, rate: 10, minPayment: 100 }])
  }

  function removeDebt(i: number) {
    setDebts(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateDebt(i: number, field: keyof DebtItem, value: string | number) {
    setDebts(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  // Sample chart data every 12 months
  const chartData = useMemo(() => {
    const avMonths = result.avalanche.monthlyData
    const snMonths = result.snowball.monthlyData
    const maxMonths = Math.max(avMonths.length, snMonths.length)
    const points: { label: string; avalanche: number; snowball: number }[] = []
    for (let m = 0; m <= maxMonths; m += 12) {
      const avBalance = m === 0 ? debts.reduce((s, d) => s + d.balance, 0) : (avMonths[m - 1]?.totalBalance ?? 0)
      const snBalance = m === 0 ? debts.reduce((s, d) => s + d.balance, 0) : (snMonths[m - 1]?.totalBalance ?? 0)
      points.push({ label: `Mo ${m}`, avalanche: avBalance, snowball: snBalance })
    }
    return points
  }, [result, debts])

  const maxBalance = debts.reduce((s, d) => s + d.balance, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/tools/financial" className="flex items-center gap-1 text-sm text-text-3 hover:text-text-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> Financial Tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-brand bg-brand-crimson/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-brand-crimson" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Debt Avalanche vs Snowball</h1>
            <p className="text-sm text-text-2">Compare payoff strategies and see interest savings.</p>
          </div>
        </div>
      </div>

      {/* Debt Inputs */}
      <Card variant="elevated" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-text-1">Your Debts</p>
          <button onClick={addDebt} className="flex items-center gap-1 text-sm text-brand-cyan hover:text-brand-cyan/80">
            <Plus className="w-4 h-4" /> Add Debt
          </button>
        </div>

        <div className="space-y-3">
          {debts.map((debt, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_80px_100px_32px] gap-2 items-center">
              <input
                className="bg-surface-2 rounded px-2 py-1.5 text-sm text-text-1 border border-surface-3"
                value={debt.label}
                onChange={e => updateDebt(i, 'label', e.target.value)}
                placeholder="Label"
              />
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
                <input
                  type="number"
                  className="w-full bg-surface-2 rounded pl-5 pr-2 py-1.5 text-sm text-text-1 border border-surface-3"
                  value={debt.balance}
                  onChange={e => updateDebt(i, 'balance', parseFloat(e.target.value) || 0)}
                  placeholder="Balance"
                />
              </div>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-surface-2 rounded pl-2 pr-5 py-1.5 text-sm text-text-1 border border-surface-3"
                  value={debt.rate}
                  onChange={e => updateDebt(i, 'rate', parseFloat(e.target.value) || 0)}
                  step="0.1"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">%</span>
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
                <input
                  type="number"
                  className="w-full bg-surface-2 rounded pl-5 pr-2 py-1.5 text-sm text-text-1 border border-surface-3"
                  value={debt.minPayment}
                  onChange={e => updateDebt(i, 'minPayment', parseFloat(e.target.value) || 0)}
                  placeholder="Min Pmt"
                />
              </div>
              <button onClick={() => removeDebt(i)} className="text-text-4 hover:text-brand-crimson">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="text-xs text-text-4 grid grid-cols-[1fr_100px_80px_100px_32px] gap-2">
            <span className="pl-1">Debt Label</span>
            <span className="pl-5">Balance</span>
            <span className="pl-2">APR</span>
            <span className="pl-5">Min Pmt</span>
          </div>
        </div>

        <div className="border-t border-surface-3 pt-4">
          <label className="text-sm text-text-2 block mb-1">Extra Monthly Payment</label>
          <div className="relative w-40">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
            <input
              type="number"
              className="w-full bg-surface-2 rounded pl-5 pr-2 py-1.5 text-sm text-text-1 border border-surface-3"
              value={extraPayment}
              onChange={e => setExtraPayment(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </Card>

      {/* Side-by-side results */}
      <div className="grid grid-cols-2 gap-4">
        {/* Avalanche */}
        <Card variant="elevated" className="p-5 space-y-4 border-brand-crimson/30">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-brand-crimson" />
            <p className="font-semibold text-text-1">Avalanche</p>
            <span className="text-xs text-text-4">(Highest rate first)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-2 rounded p-3">
              <p className="text-xs text-text-4 mb-1">Months to Payoff</p>
              <p className="text-2xl font-bold text-text-1">{result.avalanche.months}</p>
              <p className="text-xs text-brand-emerald">–{result.avalanche.monthsVsMinimum} mo vs minimum</p>
            </div>
            <div className="bg-surface-2 rounded p-3">
              <p className="text-xs text-text-4 mb-1">Total Interest</p>
              <p className="text-xl font-bold text-brand-crimson">{formatCurrency(result.avalanche.totalInterest)}</p>
            </div>
            <div className="bg-surface-2 rounded p-3 col-span-2">
              <p className="text-xs text-text-4 mb-1">Interest Saved vs Minimum Only</p>
              <p className="text-xl font-bold text-brand-emerald">{formatCurrency(result.avalanche.savingsVsMinimum)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-text-4 mb-2">Payoff Order</p>
            <div className="flex flex-col gap-1">
              {result.avalanche.payoffOrder.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-crimson/20 text-brand-crimson text-xs flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm text-text-2">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Snowball */}
        <Card variant="elevated" className="p-5 space-y-4 border-brand-cyan/30">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-cyan" />
            <p className="font-semibold text-text-1">Snowball</p>
            <span className="text-xs text-text-4">(Lowest balance first)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-2 rounded p-3">
              <p className="text-xs text-text-4 mb-1">Months to Payoff</p>
              <p className="text-2xl font-bold text-text-1">{result.snowball.months}</p>
              <p className="text-xs text-brand-emerald">–{result.snowball.monthsVsMinimum} mo vs minimum</p>
            </div>
            <div className="bg-surface-2 rounded p-3">
              <p className="text-xs text-text-4 mb-1">Total Interest</p>
              <p className="text-xl font-bold text-brand-crimson">{formatCurrency(result.snowball.totalInterest)}</p>
            </div>
            <div className="bg-surface-2 rounded p-3 col-span-2">
              <p className="text-xs text-text-4 mb-1">Interest Saved vs Minimum Only</p>
              <p className="text-xl font-bold text-brand-emerald">{formatCurrency(result.snowball.savingsVsMinimum)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-text-4 mb-2">Payoff Order</p>
            <div className="flex flex-col gap-1">
              {result.snowball.payoffOrder.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm text-text-2">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Balance over time chart */}
      <Card variant="elevated" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <p className="font-semibold text-text-1">Balance Over Time</p>
          <div className="flex items-center gap-4 text-xs text-text-4 ml-auto">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-crimson inline-block" /> Avalanche</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-cyan inline-block" /> Snowball</span>
          </div>
        </div>
        <div className="space-y-2">
          {chartData.map((point, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-4 w-14 text-right">{point.label}</span>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div
                    className="h-3 bg-brand-crimson/70 rounded-sm transition-all"
                    style={{ width: `${maxBalance > 0 ? (point.avalanche / maxBalance) * 100 : 0}%` }}
                  />
                  <div
                    className="h-3 bg-brand-cyan/70 rounded-sm transition-all"
                    style={{ width: `${maxBalance > 0 ? (point.snowball / maxBalance) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-text-3 w-20 text-right">{formatCurrency(point.avalanche)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="elevated" className="p-4 border-surface-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-text-4 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-4">
            Avalanche method saves the most interest. Snowball provides quicker early wins for motivation.
            Both assume you maintain minimum payments on all debts and apply the extra payment to one debt at a time.
          </p>
        </div>
      </Card>
    </div>
  )
}
