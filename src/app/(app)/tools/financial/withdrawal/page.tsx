'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcWithdrawalSequence, formatCurrency, type FilingStatus } from '@/lib/calculators/retirement'
import { US_STATES } from '@/lib/calculators/mortgage'
import { Layers, ChevronLeft, ArrowRight, AlertCircle, Info } from 'lucide-react'
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

const SOURCE_COLORS: Record<string, string> = {
  taxable: 'text-brand-cyan',
  'tax-deferred': 'text-brand-yellow',
  roth: 'text-brand-emerald',
  mixed: 'text-brand-amber',
}
const SOURCE_BADGE: Record<string, 'cyan' | 'yellow' | 'emerald' | 'amber'> = {
  taxable: 'cyan', 'tax-deferred': 'yellow', roth: 'emerald', mixed: 'amber',
}

export default function WithdrawalPage() {
  const [currentAge, setCurrentAge] = useState(45)
  const [retirementAge, setRetirementAge] = useState(65)
  const [taxable, setTaxable] = useState(150000)
  const [taxDeferred, setTaxDeferred] = useState(400000)
  const [roth, setRoth] = useState(80000)
  const [annualSpend, setAnnualSpend] = useState(80000)
  const [returnRate, setReturnRate] = useState(7)
  const [filing, setFiling] = useState<FilingStatus>('single')
  const [state, setState] = useState('TX')

  const result = useMemo(() => calcWithdrawalSequence({
    currentAge, retirementAge, taxableBalance: taxable,
    taxDeferredBalance: taxDeferred, rothBalance: roth,
    annualRetirementSpend: annualSpend, expectedReturn: returnRate,
    filingStatus: filing, state,
  }), [currentAge, retirementAge, taxable, taxDeferred, roth, annualSpend, returnRate, filing, state])

  const totalBalance = taxable + taxDeferred + roth
  const maxBalance = Math.max(...result.years.map((y) => y.totalBalance), totalBalance)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-3 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-cyan" />
            Withdrawal Sequencing
          </h1>
          <p className="text-text-2 text-sm mt-0.5">Optimal retirement account withdrawal order. RMD projections. Tax minimization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <Card variant="elevated" className="lg:col-span-2 p-5 space-y-4">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Your Accounts</p>

          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Current Age" value={currentAge} onChange={setCurrentAge} step={1} />
            <NumInput label="Retirement Age" value={retirementAge} onChange={setRetirementAge} step={1} />
          </div>

          <NumInput label="Taxable (Brokerage)" value={taxable} onChange={setTaxable} prefix="$"
            hint="Savings, brokerage, after-tax accounts" />
          <NumInput label="Tax-Deferred (401k / IRA)" value={taxDeferred} onChange={setTaxDeferred} prefix="$"
            hint="Traditional 401k, IRA, 403b" />
          <NumInput label="Roth (IRA / 401k)" value={roth} onChange={setRoth} prefix="$"
            hint="Roth IRA, Roth 401k" />

          <div className="pt-2 border-t border-surface-3 space-y-4">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Retirement Details</p>
            <NumInput label="Annual Spending" value={annualSpend} onChange={setAnnualSpend} prefix="$" />
            <NumInput label="Expected Return" value={returnRate} onChange={setReturnRate} suffix="%" step={0.5} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-2">Filing Status</label>
              <select value={filing} onChange={(e) => setFiling(e.target.value as FilingStatus)}
                className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan transition-colors">
                {FILING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-2">State</label>
              <select value={state} onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan transition-colors">
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'RMD Starts',           value: `Age ${result.rmdStartAge}`,                        color: 'text-brand-amber'   },
              { label: 'First RMD Est.',        value: formatCurrency(result.firstRMDAmount, true),        color: 'text-brand-yellow'  },
              { label: 'Est. Total Tax Paid',   value: formatCurrency(result.totalTaxPaid, true),          color: 'text-brand-crimson' },
              { label: 'Roth Preserved',        value: `${result.rothPreservationYears} yrs`,              color: 'text-brand-emerald' },
            ].map((kpi) => (
              <Card key={kpi.label} variant="elevated" className="p-4 text-center space-y-1">
                <p className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-text-3">{kpi.label}</p>
              </Card>
            ))}
          </div>

          {/* Optimal sequence */}
          <Card variant="elevated" className="p-5 space-y-3">
            <p className="text-sm font-semibold text-text-1">Optimal Withdrawal Order</p>
            <div className="space-y-2">
              {[
                { step: 1, label: 'Taxable Accounts First', sub: 'Brokerage, savings — most flexible, favored capital gains rates', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
                { step: 2, label: 'Tax-Deferred (after RMDs)', sub: 'Fill lower tax brackets — convert to Roth before RMDs begin', color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' },
                { step: 3, label: 'Roth Last', sub: 'Tax-free growth, no RMDs — preserve for highest-value years', color: 'text-brand-emerald', bg: 'bg-brand-emerald/10' },
              ].map((s) => (
                <div key={s.step} className={`flex items-start gap-3 p-3 rounded-brand ${s.bg}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.color} border border-current`}>
                    {s.step}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
                    <p className="text-xs text-text-3 mt-0.5">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pre-RMD Roth conversion */}
          {result.preRMDConversionOpportunity > 0 && (
            <Card variant="elevated" className="p-4 border-brand-cyan/30 bg-brand-cyan/5">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-1">Pre-RMD Roth Conversion Opportunity</p>
                  <p className="text-sm text-text-2 mt-0.5">
                    Convert ~<span className="font-semibold text-brand-cyan">{formatCurrency(result.preRMDConversionOpportunity)}/year</span> from
                    tax-deferred to Roth before age {result.rmdStartAge} to reduce forced RMD income and future tax burden.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Portfolio depletion warning */}
          {result.depletionAge && (
            <Card variant="elevated" className="p-4 border-brand-amber/30 bg-brand-amber/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-brand-amber mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-1">Portfolio Depletes at Age {result.depletionAge}</p>
                  <p className="text-sm text-text-2 mt-0.5">
                    At {formatCurrency(annualSpend)}/year spending with {returnRate}% returns, your portfolio runs out at age {result.depletionAge}.
                    Consider reducing spending by {formatCurrency(annualSpend * 0.1)}/year or increasing savings rate.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Year-by-year table */}
          <Card variant="elevated">
            <div className="px-5 pt-4 pb-3 border-b border-surface-3">
              <p className="text-sm font-semibold text-text-1">Withdrawal Schedule (first 20 years)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-3">
                    {['Age', 'Total Balance', 'Taxable', 'Tax-Def.', 'Roth', 'Source', 'RMD'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-text-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {result.years.slice(0, 20).map((row) => (
                    <tr key={row.age}
                      className={`hover:bg-surface-2 transition-colors ${row.isRMDYear ? 'bg-brand-yellow/5' : ''}`}>
                      <td className="px-3 py-2 font-mono text-text-2">
                        {row.age}
                        {row.isRMDYear && <span className="ml-1 text-brand-yellow text-xs">RMD</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-text-1">{formatCurrency(row.totalBalance, true)}</td>
                      <td className="px-3 py-2 font-mono text-brand-cyan">{formatCurrency(row.taxableBalance, true)}</td>
                      <td className="px-3 py-2 font-mono text-brand-yellow">{formatCurrency(row.taxDeferredBalance, true)}</td>
                      <td className="px-3 py-2 font-mono text-brand-emerald">{formatCurrency(row.rothBalance, true)}</td>
                      <td className="px-3 py-2">
                        <Badge variant={SOURCE_BADGE[row.source]} size="sm" className="whitespace-nowrap">
                          {row.source.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-text-3">
                        {row.rmdAmount > 0 ? formatCurrency(row.rmdAmount, true) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
