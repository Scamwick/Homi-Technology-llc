'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcRothConversion, formatCurrency, FEDERAL_BRACKETS, type FilingStatus } from '@/lib/calculators/retirement'
import { US_STATES } from '@/lib/calculators/mortgage'
import { RefreshCw, ChevronLeft, TrendingDown, Info } from 'lucide-react'
import Link from 'next/link'

const FILING_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'mfj',    label: 'Married Filing Jointly' },
  { value: 'mfs',    label: 'Married Filing Separately' },
  { value: 'hoh',    label: 'Head of Household' },
]

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

export default function RothConversionPage() {
  const [currentAge, setCurrentAge]         = useState(55)
  const [retirementAge, setRetirementAge]   = useState(65)
  const [taxDeferred, setTaxDeferred]       = useState(800000)
  const [otherIncome, setOtherIncome]       = useState(0)
  const [filing, setFiling]                 = useState<FilingStatus>('single')
  const [state, setState]                   = useState('TX')
  const [expectedReturn, setExpectedReturn] = useState(6)

  const brackets = FEDERAL_BRACKETS[filing]
  const [targetRate, setTargetRate] = useState(0.22)

  const result = useMemo(() => calcRothConversion({
    currentAge, retirementAge, taxDeferredBalance: taxDeferred,
    otherIncome, targetBracketRate: targetRate, filingStatus: filing,
    state, expectedReturn,
  }), [currentAge, retirementAge, taxDeferred, otherIncome, targetRate, filing, state, expectedReturn])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-4 hover:text-text-2 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-brand bg-brand-emerald/10 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-brand-emerald" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Roth Conversion Optimizer</h1>
          <p className="text-text-3 text-sm">Year-by-year conversion ladder to minimize RMD exposure</p>
        </div>
      </div>

      {/* Inputs */}
      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Inputs</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput label="Current Age" value={currentAge} onChange={setCurrentAge} step={1} />
          <NumInput label="Retirement Age" value={retirementAge} onChange={setRetirementAge} step={1} />
          <NumInput label="Tax-Deferred Balance" value={taxDeferred} onChange={setTaxDeferred} prefix="$" />
          <NumInput label="Other Annual Income" value={otherIncome} onChange={setOtherIncome} prefix="$" hint="SS, pension, part-time work" />
          <NumInput label="Expected Return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" step={0.5} />
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">Filing Status</label>
            <select value={filing} onChange={(e) => setFiling(e.target.value as FilingStatus)}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan">
              {FILING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">State</label>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan">
              {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">Fill Up To Bracket</label>
            <select value={targetRate} onChange={(e) => setTargetRate(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan">
              {brackets.map(b => (
                <option key={b.rate} value={b.rate}>{(b.rate * 100).toFixed(0)}% bracket (up to {b.max >= 1e9 ? '∞' : formatCurrency(b.max)})</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Conversion Window</p>
          <p className="text-2xl font-bold text-brand-emerald">{result.conversionWindow} yrs</p>
          <p className="text-xs text-text-3">Before RMDs begin at 73</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Annual Target</p>
          <p className="text-2xl font-bold text-brand-cyan">{formatCurrency(result.annualConversionTarget)}</p>
          <p className="text-xs text-text-3">to fill {(targetRate * 100).toFixed(0)}% bracket</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Total Converted</p>
          <p className="text-2xl font-bold text-text-1">{formatCurrency(result.totalConverted)}</p>
          <p className="text-xs text-text-3">Tax cost: {formatCurrency(result.totalTaxCost)}</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Effective Rate on Conversions</p>
          <p className="text-2xl font-bold text-brand-amber">{result.effectiveRateOnConversions.toFixed(1)}%</p>
          <p className="text-xs text-text-3">blended across all years</p>
        </Card>
      </div>

      {/* RMD Impact */}
      <Card variant="elevated" className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-brand-emerald" />
          <p className="text-sm font-semibold">RMD Impact at Age 73</p>
          {result.rmdReductionPct > 0 && (
            <Badge variant="cyan" size="sm">{result.rmdReductionPct.toFixed(0)}% reduction</Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-text-4">Without Conversions</p>
            <p className="text-lg font-bold text-brand-crimson">{formatCurrency(result.projectedFirstRMDWithout)}/yr</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-text-4">With Conversions</p>
            <p className="text-lg font-bold text-brand-emerald">{formatCurrency(result.projectedFirstRMDWith)}/yr</p>
          </div>
        </div>
        <ProgressBar
          value={Math.max(0, result.projectedFirstRMDWithout - result.projectedFirstRMDWith)}
          max={result.projectedFirstRMDWithout}
          colorClass="bg-brand-emerald"
        />
        <p className="text-xs text-text-4 flex items-start gap-1">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Lower RMDs reduce your taxable income in retirement and may lower Medicare IRMAA surcharges.
        </p>
      </Card>

      {/* Year-by-Year Table */}
      {result.years.length > 0 && (
        <Card variant="elevated" className="p-5 space-y-3">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Year-by-Year Conversion Schedule</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-4 border-b border-surface-3">
                  <th className="text-left py-2">Age</th>
                  <th className="text-right py-2">Start Balance</th>
                  <th className="text-right py-2">Convert</th>
                  <th className="text-right py-2">Tax Cost</th>
                  <th className="text-right py-2">End Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.years.map((y) => (
                  <tr key={y.age} className="border-b border-surface-2 hover:bg-surface-1 transition-colors">
                    <td className="py-2 font-medium">{y.age}</td>
                    <td className="py-2 text-right text-text-2">{formatCurrency(y.startBalance)}</td>
                    <td className="py-2 text-right text-brand-cyan font-medium">{formatCurrency(y.conversionAmount)}</td>
                    <td className="py-2 text-right text-brand-crimson">{formatCurrency(y.taxCost)}</td>
                    <td className="py-2 text-right text-text-1">{formatCurrency(y.endBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4">
          Projections use 2024 federal brackets and state tax rates. Conversions fill the selected bracket each year
          until the tax-deferred account is depleted or RMD age (73) is reached. Consult a tax professional before executing conversions.
        </p>
      </Card>
    </div>
  )
}
