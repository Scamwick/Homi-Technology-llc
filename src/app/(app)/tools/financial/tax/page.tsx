'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  calcTax, FEDERAL_BRACKETS, STATE_INCOME_TAX, STANDARD_DEDUCTION,
  type FilingStatus, formatCurrency,
} from '@/lib/calculators/retirement'
import { US_STATES } from '@/lib/calculators/mortgage'
import { Receipt, ChevronLeft, TrendingUp, Info } from 'lucide-react'
import Link from 'next/link'

const FILING_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'mfj',    label: 'Married Filing Jointly' },
  { value: 'mfs',    label: 'Married Filing Separately' },
  { value: 'hoh',    label: 'Head of Household' },
]

const BRACKET_COLORS = [
  'bg-brand-emerald', 'bg-brand-cyan', 'bg-brand-yellow',
  'bg-brand-amber', 'bg-orange-400', 'bg-red-400', 'bg-brand-crimson',
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

export default function TaxBracketPage() {
  const [income, setIncome] = useState(120000)
  const [filing, setFiling] = useState<FilingStatus>('single')
  const [state, setState] = useState('TX')
  const [additionalIncome, setAdditionalIncome] = useState(0)  // e.g. Roth conversion

  const result = useMemo(() => calcTax(income + additionalIncome, filing, state), [income, filing, state, additionalIncome])
  const baseResult = useMemo(() => calcTax(income, filing, state), [income, filing, state])

  const maxBracketTax = Math.max(...result.brackets.map((b) => b.taxOwed), 1)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-3 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-amber" />
            Tax Bracket Analysis
          </h1>
          <p className="text-text-2 text-sm mt-0.5">2024 federal + state brackets. Marginal vs effective rate. Roth conversion room.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <Card variant="elevated" className="lg:col-span-2 p-5 space-y-4">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Your Situation</p>

          <NumInput label="Annual Income" value={income} onChange={setIncome} prefix="$"
            hint={`Taxable income after standard deduction: ${formatCurrency(Math.max(0, income - STANDARD_DEDUCTION[filing]))}`} />

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">Filing Status</label>
            <select value={filing} onChange={(e) => setFiling(e.target.value as FilingStatus)}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan transition-colors">
              {FILING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-xs text-text-4">Standard deduction: {formatCurrency(STANDARD_DEDUCTION[filing])}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">State</label>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan transition-colors">
              {US_STATES.map((s) => <option key={s} value={s}>{s} — {STATE_INCOME_TAX[s] ?? 0}%</option>)}
            </select>
          </div>

          <div className="pt-3 border-t border-surface-3 space-y-3">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Roth Conversion Simulator</p>
            <NumInput label="Additional Roth Conversion" value={additionalIncome} onChange={setAdditionalIncome}
              prefix="$" step={1000}
              hint={additionalIncome > 0 ? `Extra tax: ${formatCurrency(result.federalTax - baseResult.federalTax)}` : 'Model additional income or Roth conversion'} />
            {result.rothConversionRoom > 0 && (
              <div className="p-3 rounded-brand-sm border border-brand-cyan/30 bg-brand-cyan/5">
                <p className="text-xs font-medium text-brand-cyan">Bracket Room Available</p>
                <p className="text-xs text-text-2 mt-1">
                  Convert up to <span className="font-semibold">{formatCurrency(result.rothConversionRoom)}</span> to Roth
                  while staying in the {(result.marginalRate * 100).toFixed(0)}% bracket.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Rate summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Marginal Rate',   value: `${(result.marginalRate * 100).toFixed(0)}%`, color: 'text-brand-amber',   sub: 'Next dollar taxed at' },
              { label: 'Effective Rate',  value: `${result.effectiveFederalRate.toFixed(1)}%`, color: 'text-brand-cyan',    sub: 'Average federal rate' },
              { label: 'Total Rate',      value: `${result.effectiveTotalRate.toFixed(1)}%`,   color: 'text-brand-yellow',  sub: 'Federal + state' },
            ].map((item) => (
              <Card key={item.label} variant="elevated" className="p-4 text-center space-y-1">
                <p className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}</p>
                <p className="text-xs text-text-3">{item.label}</p>
                <p className="text-xs text-text-4">{item.sub}</p>
              </Card>
            ))}
          </div>

          {/* Tax breakdown */}
          <Card variant="elevated" className="p-5 space-y-3">
            <p className="text-sm font-semibold text-text-1">Tax Breakdown</p>
            <div className="space-y-2">
              {[
                { label: 'Gross Income',        value: result.grossIncome,        color: 'text-text-1'         },
                { label: 'Standard Deduction',  value: -STANDARD_DEDUCTION[filing], color: 'text-brand-emerald' },
                { label: 'Taxable Income',       value: result.taxableIncome,      color: 'text-text-1',  bold: true },
                { label: 'Federal Tax',          value: -result.federalTax,        color: 'text-brand-amber'    },
                { label: 'State Tax',            value: -result.stateTax,          color: 'text-brand-yellow'   },
                { label: 'Take-Home Pay',        value: result.grossIncome - result.totalTax, color: 'text-brand-cyan', bold: true },
              ].map((row) => (
                <div key={row.label} className={`flex justify-between text-sm ${row.bold ? 'pt-2 border-t border-surface-3' : ''}`}>
                  <span className="text-text-2">{row.label}</span>
                  <span className={`font-mono font-medium ${row.color}`}>
                    {row.value < 0 ? '-' : ''}{formatCurrency(Math.abs(row.value))}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Bracket visualization */}
          <Card variant="elevated" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-1">Federal Bracket Breakdown</p>
              <Badge variant="cyan" size="sm">2024</Badge>
            </div>
            <div className="space-y-2">
              {result.brackets.filter((b) => b.filled || b.partial).map((b, i) => (
                <div key={b.rate}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${BRACKET_COLORS[i]}`} />
                      <span className="text-text-2">{(b.rate * 100).toFixed(0)}% bracket</span>
                      {b.partial && (
                        <span className="text-text-4 font-mono">
                          {formatCurrency(result.rothConversionRoom)} room left
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-text-1">{formatCurrency(b.taxOwed)}</span>
                  </div>
                  <div className="relative h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${BRACKET_COLORS[i]} ${b.partial ? 'opacity-70' : ''}`}
                      style={{ width: `${Math.min(100, (b.taxOwed / maxBracketTax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Stacked bracket bar */}
            <div className="mt-3">
              <p className="text-xs text-text-4 mb-1.5">Income distribution across brackets</p>
              <div className="flex h-4 rounded-full overflow-hidden">
                {result.brackets.map((b, i) => {
                  const filledWidth = b.filled
                    ? ((b.max - b.min) / result.grossIncome) * 100
                    : b.partial
                    ? ((result.taxableIncome - b.min) / result.grossIncome) * 100
                    : 0
                  return filledWidth > 0 ? (
                    <div key={b.rate} className={`${BRACKET_COLORS[i]} h-full`}
                      style={{ width: `${filledWidth}%` }}
                      title={`${(b.rate * 100).toFixed(0)}%`} />
                  ) : null
                })}
              </div>
              <div className="flex justify-between text-xs text-text-4 mt-1">
                <span>10%</span>
                <span>Your income →</span>
                <span>{(result.marginalRate * 100).toFixed(0)}%</span>
              </div>
            </div>
          </Card>

          {/* Capital gains rate */}
          <Card variant="elevated" className="p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-1">Long-Term Capital Gains Rate</p>
              <p className="text-sm text-text-2 mt-0.5">
                At your income level, long-term capital gains are taxed at{' '}
                <span className="font-semibold text-brand-cyan">{(result.capitalGainsRate * 100).toFixed(0)}%</span> federally
                (vs {(result.marginalRate * 100).toFixed(0)}% for ordinary income).{' '}
                {result.capitalGainsRate === 0 && 'Tax-free gains — consider harvesting gains this year.'}
                {result.capitalGainsRate === 0.15 && 'Holding investments >1 year saves significantly vs ordinary income rate.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
