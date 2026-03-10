'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcPITI, US_STATES, formatCurrency, type PITIInputs } from '@/lib/calculators/mortgage'
import { Home, ChevronLeft, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import Link from 'next/link'

const DEFAULT: PITIInputs = {
  homePrice: 400000,
  downPaymentPct: 20,
  interestRate: 6.75,
  termYears: 30,
  state: 'TX',
  monthlyHOA: 0,
  annualIncome: 120000,
  monthlyOtherDebt: 500,
}

function NumInput({ label, value, onChange, prefix = '', suffix = '', step = 1, min = 0, hint }: {
  label: string; value: number; onChange: (v: number) => void
  prefix?: string; suffix?: string; step?: number; min?: number; hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <div className="flex items-center gap-1 px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 focus-within:border-brand-cyan transition-colors">
        {prefix && <span className="text-text-3 text-sm">{prefix}</span>}
        <input
          type="number" step={step} min={min} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent text-sm text-text-1 outline-none min-w-0"
        />
        {suffix && <span className="text-text-3 text-sm">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-text-4">{hint}</p>}
    </div>
  )
}

export default function PITIPage() {
  const [inputs, setInputs] = useState<PITIInputs>(DEFAULT)
  const set = (k: keyof PITIInputs) => (v: number | string) =>
    setInputs((p) => ({ ...p, [k]: v }))

  const result = useMemo(() => calcPITI(inputs), [inputs])

  const dtiColor: Record<string, 'emerald' | 'cyan' | 'yellow' | 'amber'> = {
    excellent: 'emerald', good: 'cyan', caution: 'yellow', high: 'amber', unknown: 'cyan',
  }

  const verdictConfig = {
    affordable:   { color: 'emerald' as const, label: 'Affordable',   icon: <CheckCircle2 className="w-4 h-4" /> },
    stretch:      { color: 'yellow'  as const, label: 'Stretch',      icon: <AlertCircle className="w-4 h-4" /> },
    'over-budget':{ color: 'amber'   as const, label: 'Over Budget',  icon: <AlertCircle className="w-4 h-4" /> },
  }[result.verdict]

  const breakdown = [
    { label: 'Principal & Interest', value: result.monthlyPI,       color: 'cyan'    as const },
    { label: 'Property Tax',         value: result.monthlyTax,      color: 'yellow'  as const },
    { label: 'Insurance',            value: result.monthlyInsurance,color: 'emerald' as const },
    { label: 'HOA',                  value: result.monthlyHOA,      color: 'default' as const },
    ...(result.hasPMI ? [{ label: 'PMI', value: result.monthlyPMI, color: 'amber' as const }] : []),
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-3 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-brand-cyan" />
            PITI Calculator
          </h1>
          <p className="text-text-2 text-sm mt-0.5">Principal, Interest, Taxes & Insurance — your true monthly cost.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <Card variant="elevated" className="lg:col-span-2 p-5 space-y-4">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Loan Details</p>

          <NumInput label="Home Price" value={inputs.homePrice} onChange={set('homePrice')} prefix="$" step={5000} />
          <NumInput label="Down Payment" value={inputs.downPaymentPct} onChange={set('downPaymentPct')} suffix="%" step={0.5} min={0}
            hint={`${formatCurrency(inputs.homePrice * inputs.downPaymentPct / 100)} · LTV ${(100 - inputs.downPaymentPct).toFixed(0)}%`} />
          <NumInput label="Interest Rate" value={inputs.interestRate} onChange={set('interestRate')} suffix="%" step={0.125} />

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">Loan Term</label>
            <div className="flex gap-2">
              {[30, 15].map((t) => (
                <button key={t} onClick={() => set('termYears')(t)}
                  className={`flex-1 py-2 rounded-brand border text-sm font-medium transition-colors ${
                    inputs.termYears === t ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan' : 'border-surface-3 text-text-2 hover:border-surface-4'
                  }`}>
                  {t}-Year
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">State</label>
            <select value={inputs.state} onChange={(e) => set('state')(e.target.value as any)}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan transition-colors">
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="pt-2 border-t border-surface-3 space-y-4">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Optional</p>
            <NumInput label="Monthly HOA" value={inputs.monthlyHOA ?? 0} onChange={set('monthlyHOA')} prefix="$" />
            <NumInput label="Annual Income" value={inputs.annualIncome ?? 0} onChange={set('annualIncome')} prefix="$" step={5000} hint="For DTI calculation" />
            <NumInput label="Other Monthly Debt" value={inputs.monthlyOtherDebt ?? 0} onChange={set('monthlyOtherDebt')} prefix="$" hint="Car, student loans, etc." />
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Total monthly */}
          <Card variant="elevated" className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-text-4 uppercase tracking-wider mb-1">Total Monthly Payment</p>
                <p className="text-4xl font-bold font-mono text-brand-cyan">{formatCurrency(result.totalMonthly)}</p>
                <p className="text-xs text-text-3 mt-1">{formatCurrency(result.loanAmount)} loan · {result.ltv.toFixed(0)}% LTV</p>
              </div>
              <Badge variant={verdictConfig.color} size="sm" className="flex items-center gap-1">
                {verdictConfig.icon}{verdictConfig.label}
              </Badge>
            </div>

            {/* Breakdown bars */}
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-2">{item.label}</span>
                    <span className="font-mono font-medium text-text-1">{formatCurrency(item.value)}/mo</span>
                  </div>
                  <ProgressBar value={item.value} max={result.totalMonthly} color={item.color} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* PMI notice */}
          {result.hasPMI && (
            <Card variant="elevated" className="p-4 border-brand-amber/30 bg-brand-amber/5">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-brand-amber mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-1">PMI Required</p>
                  <p className="text-xs text-text-2 mt-0.5">
                    Your LTV is {result.ltv.toFixed(0)}% — PMI adds {formatCurrency(result.monthlyPMI)}/mo.
                    {result.pmiRemovalMonth
                      ? ` Removes after month ${result.pmiRemovalMonth} (~${(result.pmiRemovalMonth / 12).toFixed(1)} years) when LTV reaches 80%.`
                      : ' Reaches 80% LTV during loan term.'}
                    {' '}Put {formatCurrency(inputs.homePrice * 0.2)} down to avoid it entirely.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* DTI */}
          {result.frontEndDTI !== null && (
            <Card variant="elevated" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-1">Debt-to-Income Ratios</p>
                <Badge variant={dtiColor[result.dtiStatus]} size="sm" className="capitalize">{result.dtiStatus}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Front-End DTI', value: result.frontEndDTI, threshold: 28, description: 'Housing costs ÷ gross income' },
                  { label: 'Back-End DTI',  value: result.backEndDTI!, threshold: 36, description: 'All debt ÷ gross income' },
                ].map((d) => (
                  <div key={d.label} className="p-3 rounded-brand-sm border border-surface-3 bg-surface-2">
                    <p className="text-xs text-text-3 mb-1">{d.label}</p>
                    <p className={`text-xl font-bold font-mono ${d.value <= d.threshold ? 'text-brand-emerald' : d.value <= d.threshold * 1.3 ? 'text-brand-yellow' : 'text-brand-amber'}`}>
                      {d.value.toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-4 mt-0.5">Ideal: ≤{d.threshold}%</p>
                    <p className="text-xs text-text-4">{d.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 30-year totals */}
          <Card variant="elevated" className="p-5">
            <p className="text-sm font-semibold text-text-1 mb-3">Over {inputs.termYears} Years</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Interest Paid',  value: result.totalInterestPaid,    color: 'text-brand-amber'   },
                { label: 'Down Payment',         value: result.downPayment,           color: 'text-brand-cyan'    },
                { label: 'Est. Property Taxes',  value: result.totalTaxPaid30yr,      color: 'text-brand-yellow'  },
                { label: 'Est. Insurance',        value: result.totalInsurancePaid30yr,color: 'text-text-2'        },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-brand-sm bg-surface-2 border border-surface-3">
                  <p className="text-xs text-text-3 mb-1">{item.label}</p>
                  <p className={`text-base font-bold font-mono ${item.color}`}>{formatCurrency(item.value, true)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <div className="flex gap-3">
            <Link href="/tools/financial/loans" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">Compare Loan Types</Button>
            </Link>
            <Link href="/tools/financial/tco" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">Rent vs Buy Analysis</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
