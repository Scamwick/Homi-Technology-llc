'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcTCO, formatCurrency, US_STATES, type TCOInputs } from '@/lib/calculators/mortgage'
import { BarChart2, ChevronLeft, Home, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

const DEFAULT: TCOInputs = {
  homePrice: 400000,
  downPaymentPct: 20,
  interestRate: 6.75,
  termYears: 30,
  state: 'TX',
  appreciationRate: 3,
  monthlyRent: 2200,
  rentIncreaseRate: 4,
  maintenancePct: 1,
  monthlyHOA: 0,
  annualInsurancePct: 0.5,
  investmentReturn: 7,
  sellingCostPct: 6,
  yearsToHold: 10,
}

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

export default function TCOPage() {
  const [inputs, setInputs] = useState<TCOInputs>(DEFAULT)
  const set = (k: keyof TCOInputs) => (v: number | string) =>
    setInputs((p) => ({ ...p, [k]: v }))

  const result = useMemo(() => calcTCO(inputs), [inputs])

  const maxCost = Math.max(result.totalBuyingCost, result.totalRentingCost)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-3 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-yellow" />
            Rent vs. Buy Analysis
          </h1>
          <p className="text-text-2 text-sm mt-0.5">30-year total cost of ownership vs. renting.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <Card variant="elevated" className="lg:col-span-2 p-5 space-y-5">
          <div className="space-y-4">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Home</p>
            <NumInput label="Home Price" value={inputs.homePrice} onChange={set('homePrice')} prefix="$" step={5000} />
            <NumInput label="Down Payment" value={inputs.downPaymentPct} onChange={set('downPaymentPct')} suffix="%" step={1} />
            <NumInput label="Interest Rate" value={inputs.interestRate} onChange={set('interestRate')} suffix="%" step={0.125} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-2">State</label>
              <select value={inputs.state} onChange={(e) => set('state')(e.target.value)}
                className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan transition-colors">
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-surface-3">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Rent</p>
            <NumInput label="Current Monthly Rent" value={inputs.monthlyRent} onChange={set('monthlyRent')} prefix="$" step={50} />
          </div>

          <div className="space-y-4 pt-2 border-t border-surface-3">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Assumptions</p>
            <Slider label="Years to Hold" value={inputs.yearsToHold} onChange={set('yearsToHold')}
              min={3} max={30} step={1} format={(v) => `${v} yr`} />
            <Slider label="Home Appreciation" value={inputs.appreciationRate} onChange={set('appreciationRate')}
              min={0} max={8} step={0.5} format={(v) => `${v}%/yr`} />
            <Slider label="Rent Increase Rate" value={inputs.rentIncreaseRate} onChange={set('rentIncreaseRate')}
              min={0} max={8} step={0.5} format={(v) => `${v}%/yr`} />
            <Slider label="Investment Return" value={inputs.investmentReturn} onChange={set('investmentReturn')}
              min={2} max={12} step={0.5} format={(v) => `${v}%/yr`} />
            <Slider label="Annual Maintenance" value={inputs.maintenancePct} onChange={set('maintenancePct')}
              min={0.5} max={3} step={0.25} format={(v) => `${v}% of value`} />
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Verdict */}
          <Card variant="elevated" className={`p-5 border ${result.buyingWins ? 'border-brand-emerald/30 bg-brand-emerald/5' : 'border-brand-yellow/30 bg-brand-yellow/5'}`}>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={result.buyingWins ? 'emerald' : 'yellow'} size="sm" className="mb-2">
                  {result.buyingWins ? 'Buying Wins' : 'Renting Wins'} Over {inputs.yearsToHold} Years
                </Badge>
                <p className="text-3xl font-bold font-mono text-text-1">
                  {formatCurrency(Math.abs(result.netBuyingWealth - result.netRentingWealth), true)}
                </p>
                <p className="text-sm text-text-2 mt-1">
                  {result.buyingWins
                    ? `Buying leaves you ${formatCurrency(Math.abs(result.netBuyingWealth - result.netRentingWealth), true)} better off`
                    : `Renting leaves you ${formatCurrency(Math.abs(result.netRentingWealth - result.netBuyingWealth), true)} better off`}
                </p>
              </div>
              {result.buyingWins ? <Home className="w-8 h-8 text-brand-emerald opacity-60" /> : <TrendingUp className="w-8 h-8 text-brand-yellow opacity-60" />}
            </div>

            {result.breakEvenYear && (
              <div className="mt-3 pt-3 border-t border-surface-3">
                <p className="text-xs text-text-3">
                  Break-even: <span className="font-semibold text-text-1">Year {result.breakEvenYear}</span> — buying becomes better than renting after {result.breakEvenYear} year{result.breakEvenYear !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </Card>

          {/* Cost comparison */}
          <Card variant="elevated" className="p-5 space-y-4">
            <p className="text-sm font-semibold text-text-1">Cost Comparison Over {inputs.yearsToHold} Years</p>
            <div className="space-y-3">
              {[
                { label: 'Total Buying Costs',  value: result.totalBuyingCost,  color: 'cyan'    as const },
                { label: 'Total Renting Costs', value: result.totalRentingCost, color: 'yellow'  as const },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-2">{item.label}</span>
                    <span className="font-mono font-bold text-text-1">{formatCurrency(item.value, true)}</span>
                  </div>
                  <ProgressBar value={item.value} max={maxCost} color={item.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* Net wealth */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Net Buying Wealth',  value: result.netBuyingWealth,  sub: `${formatCurrency(result.netProceedsAfterSale, true)} proceeds after sale`, color: 'text-brand-cyan'    },
              { label: 'Net Renting Wealth', value: result.netRentingWealth, sub: `${formatCurrency(result.opportunityCostOfDownPayment, true)} investment growth`, color: 'text-brand-yellow'  },
            ].map((item) => (
              <Card key={item.label} variant="elevated" className="p-4">
                <p className="text-xs text-text-3 mb-1">{item.label}</p>
                <p className={`text-xl font-bold font-mono ${item.value >= 0 ? item.color : 'text-brand-crimson'}`}>
                  {item.value < 0 ? '-' : ''}{formatCurrency(Math.abs(item.value), true)}
                </p>
                <p className="text-xs text-text-4 mt-1">{item.sub}</p>
              </Card>
            ))}
          </div>

          {/* Up-front summary */}
          <Card variant="elevated" className="p-5">
            <p className="text-sm font-semibold text-text-1 mb-3">Up-Front to Buy</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Down Payment',   value: result.summary.downPayment   },
                { label: 'Closing Costs',  value: result.summary.closingCosts  },
                { label: 'Total Cash Out', value: result.summary.totalOutOfPocket },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-brand-sm bg-surface-2 border border-surface-3 text-center">
                  <p className="text-base font-bold font-mono text-brand-cyan">{formatCurrency(item.value, true)}</p>
                  <p className="text-xs text-text-3 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Year by year table (condensed) */}
          <Card variant="elevated">
            <div className="px-5 pt-4 pb-3 border-b border-surface-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-cyan" />
              <p className="text-sm font-semibold text-text-1">Year-by-Year Breakdown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-3">
                    {['Year', 'Home Value', 'Equity', 'Cum. Buy Cost', 'Cum. Rent', 'Winner'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left font-medium text-text-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {result.yearlyBreakdown
                    .filter((_, i) => i === 0 || (i + 1) % 2 === 0)
                    .map((row) => (
                    <tr key={row.year} className={`hover:bg-surface-2 transition-colors ${row.year === result.breakEvenYear ? 'bg-brand-cyan/5' : ''}`}>
                      <td className="px-4 py-2 font-mono text-text-2">
                        {row.year}
                        {row.year === result.breakEvenYear && <span className="ml-1 text-brand-cyan">★</span>}
                      </td>
                      <td className="px-4 py-2 font-mono text-text-1">{formatCurrency(row.homeValue, true)}</td>
                      <td className="px-4 py-2 font-mono text-brand-emerald">{formatCurrency(row.equity, true)}</td>
                      <td className="px-4 py-2 font-mono text-text-2">{formatCurrency(row.cumulativeBuyingCost, true)}</td>
                      <td className="px-4 py-2 font-mono text-text-2">{formatCurrency(row.cumulativeRentCost, true)}</td>
                      <td className="px-4 py-2">
                        <Badge variant={row.buyingAhead ? 'emerald' : 'yellow'} size="sm">
                          {row.buyingAhead ? 'Buy' : 'Rent'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex gap-3">
            <Link href="/tools/financial/piti">
              <Button variant="outline" size="sm">PITI Calculator</Button>
            </Link>
            <Link href="/tools/financial/loans">
              <Button variant="outline" size="sm">Loan Comparison</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
