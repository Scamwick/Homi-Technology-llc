'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { calcBondLadder, formatCurrency } from '@/lib/calculators/financial'
import { Grid3X3, ChevronLeft, Info } from 'lucide-react'
import Link from 'next/link'

// Default yield curve (approximate 2024 Treasury/CD rates)
const DEFAULT_YIELDS = [5.3, 5.1, 4.9, 4.7, 4.6, 4.5, 4.4, 4.35, 4.3, 4.25]

function NumInput({ label, value, onChange, prefix = '', suffix = '', step = 1000, hint }: any) {
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
      {hint && <p className="text-xs text-text-4">{hint}</p>}
    </div>
  )
}

export default function BondLadderPage() {
  const [principal, setPrincipal]       = useState(200000)
  const [rungs, setRungs]               = useState(10)
  const [reinvestRate, setReinvestRate] = useState(4.5)
  const [yields, setYields]             = useState<number[]>(DEFAULT_YIELDS)

  const curve = useMemo(() => yields.slice(0, rungs), [yields, rungs])

  const result = useMemo(() => calcBondLadder(principal, rungs, curve, reinvestRate), [principal, rungs, curve, reinvestRate])

  const updateYield = (i: number, val: number) => {
    setYields(prev => {
      const next = [...prev]
      while (next.length <= i) next.push(4.0)
      next[i] = val
      return next
    })
  }

  const maxIncome = Math.max(...result.incomeByYear.map(y => y.income))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-4 hover:text-text-2 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-brand bg-brand-amber/10 flex items-center justify-center">
          <Grid3X3 className="w-5 h-5 text-brand-amber" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Bond / CD Ladder</h1>
          <p className="text-text-3 text-sm">Staggered maturities for predictable income and reinvestment</p>
        </div>
      </div>

      {/* Inputs */}
      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Ladder Setup</p>
        <div className="grid grid-cols-3 gap-4">
          <NumInput label="Total Principal" value={principal} onChange={setPrincipal} prefix="$" />
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">Number of Rungs</label>
            <select value={rungs} onChange={(e) => setRungs(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan">
              {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} years</option>)}
            </select>
          </div>
          <NumInput label="Reinvest Rate" value={reinvestRate} onChange={setReinvestRate} suffix="%" step={0.1} hint="Rate when rungs mature" />
        </div>
      </Card>

      {/* Yield Curve Editor */}
      <Card variant="elevated" className="p-5 space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Yield by Maturity (editable)</p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: rungs }).map((_, i) => (
            <div key={i} className="space-y-1">
              <label className="text-xs text-text-4">Yr {i + 1}</label>
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 focus-within:border-brand-amber">
                <input type="number" step={0.05} value={yields[i] ?? 4.0}
                  onChange={(e) => updateYield(i, parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-xs text-text-1 outline-none" />
                <span className="text-text-4 text-xs">%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Blended Yield</p>
          <p className="text-2xl font-bold text-brand-amber">{result.blendedYield.toFixed(2)}%</p>
          <p className="text-xs text-text-3">weighted avg coupon</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Annual Income (Yr 1)</p>
          <p className="text-2xl font-bold text-brand-emerald">{formatCurrency(result.totalAnnualIncome)}</p>
          <p className="text-xs text-text-3">{formatCurrency(result.totalAnnualIncome / 12)}/mo</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Per Rung</p>
          <p className="text-2xl font-bold text-brand-cyan">{formatCurrency(principal / rungs)}</p>
          <p className="text-xs text-text-3">equal allocation</p>
        </Card>
      </div>

      {/* Annual Income Decay Chart */}
      <Card variant="elevated" className="p-5 space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Income by Year (rungs maturing reduces coupon payments)</p>
        <div className="space-y-1.5">
          {result.incomeByYear.map((y) => (
            <div key={y.year} className="flex items-center gap-3">
              <span className="text-xs text-text-4 w-10">Yr {y.year}</span>
              <div className="flex-1 h-4 bg-surface-1 rounded overflow-hidden">
                <div className="h-full bg-brand-amber rounded transition-all"
                  style={{ width: `${maxIncome > 0 ? (y.income / maxIncome) * 100 : 0}%` }} />
              </div>
              <span className="text-xs text-text-2 w-24 text-right">{formatCurrency(y.income)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Rung Table */}
      <Card variant="elevated" className="p-5 space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Ladder Rungs</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-4 border-b border-surface-3">
                <th className="text-left py-2">Rung</th>
                <th className="text-left py-2">Matures</th>
                <th className="text-right py-2">Principal</th>
                <th className="text-right py-2">Coupon</th>
                <th className="text-right py-2">Annual Income</th>
                <th className="text-right py-2">Reinvest At</th>
              </tr>
            </thead>
            <tbody>
              {result.rungs.map((r) => (
                <tr key={r.year} className="border-b border-surface-2 hover:bg-surface-1 transition-colors">
                  <td className="py-2 font-medium">Year {r.year}</td>
                  <td className="py-2 text-text-3">{r.maturityDate}</td>
                  <td className="py-2 text-right text-text-2">{formatCurrency(r.principal)}</td>
                  <td className="py-2 text-right text-brand-amber font-medium">{r.couponRate.toFixed(2)}%</td>
                  <td className="py-2 text-right text-brand-emerald">{formatCurrency(r.annualIncome)}</td>
                  <td className="py-2 text-right text-text-3">{reinvestRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Equal-weight ladder — each rung holds {formatCurrency(principal / rungs)}.
          Yields reflect approximate 2024 Treasury/CD rates; edit directly for your quotes.
          Income decreases each year as rungs mature and are reinvested.
        </p>
      </Card>
    </div>
  )
}
