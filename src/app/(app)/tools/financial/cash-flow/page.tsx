'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { calcCashFlow, formatCurrency, type FilingStatus } from '@/lib/calculators/retirement'
import { US_STATES } from '@/lib/calculators/mortgage'
import { Waves, ChevronLeft, Info } from 'lucide-react'
import Link from 'next/link'

const FILING_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'mfj',    label: 'Married Filing Jointly' },
  { value: 'mfs',    label: 'Married Filing Separately' },
  { value: 'hoh',    label: 'Head of Household' },
]

function NumInput({ label, value, onChange, prefix = '', suffix = '', step = 1000 }: any) {
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

function FlowBar({ label, amount, pct, bgClass, textClass }: { label: string; amount: number; pct: number; bgClass: string; textClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-3 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-surface-1 rounded overflow-hidden">
        <div className={`h-full ${bgClass} rounded transition-all duration-300`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className={`text-xs font-medium ${textClass} w-20 text-right`}>{formatCurrency(amount)}</span>
      <span className="text-xs text-text-4 w-10 text-right">{pct.toFixed(1)}%</span>
    </div>
  )
}

export default function CashFlowPage() {
  const [grossIncome, setGrossIncome]       = useState(120000)
  const [filing, setFiling]                 = useState<FilingStatus>('single')
  const [state, setState]                   = useState('TX')
  const [housing, setHousing]               = useState(24000)
  const [transportation, setTransportation] = useState(9600)
  const [food, setFood]                     = useState(7200)
  const [healthcare, setHealthcare]         = useState(4800)
  const [entertainment, setEntertainment]   = useState(3600)
  const [otherExpenses, setOtherExpenses]   = useState(6000)
  const [k401, setK401]                     = useState(7500)
  const [roth, setRoth]                     = useState(7000)
  const [taxable, setTaxable]               = useState(5000)
  const [emergency, setEmergency]           = useState(2000)

  const result = useMemo(() => calcCashFlow({
    grossIncome, filingStatus: filing, state,
    housing, transportation, food, healthcare, entertainment, otherExpenses,
    contribution401k: k401, rothContribution: roth, taxableInvesting: taxable, emergencyFund: emergency,
  }), [grossIncome, filing, state, housing, transportation, food, healthcare, entertainment, otherExpenses, k401, roth, taxable, emergency])

  const savingsRateColor = result.savingsRate >= 20 ? 'text-brand-emerald' : result.savingsRate >= 10 ? 'text-brand-amber' : 'text-brand-crimson'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-4 hover:text-text-2 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-brand bg-brand-cyan/10 flex items-center justify-center">
          <Waves className="w-5 h-5 text-brand-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Cash Flow Diagram</h1>
          <p className="text-text-3 text-sm">Income → Taxes → Expenses → Savings breakdown</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="elevated" className="p-5 space-y-4">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Income & Tax</p>
          <NumInput label="Gross Annual Income" value={grossIncome} onChange={setGrossIncome} prefix="$" />
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
        </Card>

        <Card variant="elevated" className="p-5 space-y-4">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Annual Expenses</p>
          <NumInput label="Housing (rent/mortgage)" value={housing} onChange={setHousing} prefix="$" />
          <NumInput label="Transportation" value={transportation} onChange={setTransportation} prefix="$" />
          <NumInput label="Food & Dining" value={food} onChange={setFood} prefix="$" />
          <NumInput label="Healthcare" value={healthcare} onChange={setHealthcare} prefix="$" />
          <NumInput label="Entertainment" value={entertainment} onChange={setEntertainment} prefix="$" />
          <NumInput label="Other Expenses" value={otherExpenses} onChange={setOtherExpenses} prefix="$" />
        </Card>

        <Card variant="elevated" className="p-5 space-y-4 md:col-span-2">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Annual Savings & Investing</p>
          <div className="grid grid-cols-2 gap-4">
            <NumInput label="401(k) / 403(b)" value={k401} onChange={setK401} prefix="$" hint="2024 limit: $23,000" />
            <NumInput label="Roth IRA" value={roth} onChange={setRoth} prefix="$" hint="2024 limit: $7,000" />
            <NumInput label="Taxable Investing" value={taxable} onChange={setTaxable} prefix="$" />
            <NumInput label="Emergency Fund" value={emergency} onChange={setEmergency} prefix="$" />
          </div>
        </Card>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Gross Income</p>
          <p className="text-lg font-bold text-text-1">{formatCurrency(result.grossIncome)}</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Total Tax</p>
          <p className="text-lg font-bold text-brand-crimson">{formatCurrency(result.totalTax)}</p>
          <p className="text-xs text-text-3">{result.grossIncome > 0 ? ((result.totalTax / result.grossIncome) * 100).toFixed(1) : 0}% effective</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Net Income</p>
          <p className="text-lg font-bold text-brand-cyan">{formatCurrency(result.netIncome)}</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Savings Rate</p>
          <p className={`text-lg font-bold ${savingsRateColor}`}>{result.savingsRate.toFixed(1)}%</p>
          <p className="text-xs text-text-3">{result.savingsRate >= 20 ? 'On track' : result.savingsRate >= 10 ? 'Good start' : 'Increase savings'}</p>
        </Card>
      </div>

      {/* Tax Breakdown */}
      <Card variant="elevated" className="p-5 space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Tax Breakdown</p>
        <div className="space-y-2">
          {result.taxCategories.map((c) => (
            <FlowBar key={c.label} label={c.label} amount={c.amount} pct={c.pct} bgClass={c.bgClass} textClass={c.textClass} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-3 pt-2 border-t border-surface-3">
          <span>Total Tax</span>
          <span className="font-medium text-brand-crimson">{formatCurrency(result.totalTax)}</span>
        </div>
      </Card>

      {/* Expense Breakdown */}
      {result.expenseCategories.length > 0 && (
        <Card variant="elevated" className="p-5 space-y-3">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Expense Breakdown</p>
          <div className="space-y-2">
            {result.expenseCategories.map((c) => (
              <FlowBar key={c.label} label={c.label} amount={c.amount} pct={c.pct} bgClass={c.bgClass} textClass={c.textClass} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-text-3 pt-2 border-t border-surface-3">
            <span>Total Expenses</span>
            <span className="font-medium text-brand-amber">{formatCurrency(result.totalExpenses)}</span>
          </div>
        </Card>
      )}

      {/* Savings Breakdown */}
      {result.savingsCategories.length > 0 && (
        <Card variant="elevated" className="p-5 space-y-3">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Savings Breakdown</p>
          <div className="space-y-2">
            {result.savingsCategories.map((c) => (
              <FlowBar key={c.label} label={c.label} amount={c.amount} pct={c.pct} bgClass={c.bgClass} textClass={c.textClass} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-text-3 pt-2 border-t border-surface-3">
            <span>Total Savings</span>
            <span className="font-medium text-brand-emerald">{formatCurrency(result.totalSavings)}</span>
          </div>
        </Card>
      )}

      {/* Unallocated */}
      {result.unallocated > 0 && (
        <Card variant="elevated" className="p-4 border-brand-cyan/30">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-1">Unallocated Cash</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-brand-cyan">{formatCurrency(result.unallocated)}</p>
              <Badge variant="cyan" size="sm">{((result.unallocated / result.grossIncome) * 100).toFixed(1)}%</Badge>
            </div>
          </div>
          <p className="text-xs text-text-4 mt-1">After taxes, expenses, and savings — consider investing or paying down debt.</p>
        </Card>
      )}

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Uses 2024 federal and state tax rates including FICA (7.65% on wages up to $168,600).
          Pre-tax 401(k) contributions are not deducted from taxable income in this simplified model.
          Results are estimates — consult a financial advisor for personalized planning.
        </p>
      </Card>
    </div>
  )
}
