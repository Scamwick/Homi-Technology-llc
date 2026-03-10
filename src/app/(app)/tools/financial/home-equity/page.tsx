'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcHomeEquity, formatCurrency } from '@/lib/calculators/financial'
import { Home, ChevronLeft, CheckCircle, Info } from 'lucide-react'
import Link from 'next/link'

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

export default function HomeEquityPage() {
  const [homeValue, setHomeValue]             = useState(450000)
  const [mortgageBalance, setMortgageBalance] = useState(280000)
  const [mortgageRate, setMortgageRate]       = useState(3.5)
  const [monthsLeft, setMonthsLeft]           = useState(300)
  const [cashNeeded, setCashNeeded]           = useState(50000)
  const [helocRate, setHelocRate]             = useState(8.5)
  const [cashOutRate, setCashOutRate]         = useState(6.8)
  const [cashOutTerm, setCashOutTerm]         = useState(30)

  const result = useMemo(() => calcHomeEquity({
    homeValue, mortgageBalance, mortgageRate, mortgageMonthsLeft: monthsLeft,
    cashNeeded, helocRate, cashOutRate, cashOutTermYears: cashOutTerm, investmentReturn: 7,
  }), [homeValue, mortgageBalance, mortgageRate, monthsLeft, cashNeeded, helocRate, cashOutRate, cashOutTerm])

  const equityPct = homeValue > 0 ? (result.currentEquity / homeValue) * 100 : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-4 hover:text-text-2 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-brand bg-brand-yellow/10 flex items-center justify-center">
          <Home className="w-5 h-5 text-brand-yellow" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Home Equity Optimizer</h1>
          <p className="text-text-3 text-sm">HELOC vs cash-out refi vs leave alone — side-by-side</p>
        </div>
      </div>

      {/* Current Equity */}
      <Card variant="elevated" className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Current Equity Position</p>
          <Badge variant="cyan" size="sm">LTV: {result.ltv.toFixed(1)}%</Badge>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-text-4">Home Value</p>
            <p className="text-lg font-bold text-text-1">{formatCurrency(homeValue)}</p>
          </div>
          <div>
            <p className="text-xs text-text-4">Mortgage Balance</p>
            <p className="text-lg font-bold text-brand-crimson">{formatCurrency(mortgageBalance)}</p>
          </div>
          <div>
            <p className="text-xs text-text-4">Equity</p>
            <p className="text-lg font-bold text-brand-emerald">{formatCurrency(result.currentEquity)}</p>
          </div>
        </div>
        <ProgressBar value={result.currentEquity} max={homeValue} colorClass="bg-brand-emerald" />
        <div className="flex justify-between text-xs text-text-4">
          <span>Mortgage: {((mortgageBalance / homeValue) * 100).toFixed(1)}%</span>
          <span>Equity: {equityPct.toFixed(1)}%</span>
          <span>Tappable (80% LTV): {formatCurrency(result.availableEquity)}</span>
        </div>
      </Card>

      {/* Inputs */}
      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Your Situation</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput label="Home Value" value={homeValue} onChange={setHomeValue} prefix="$" />
          <NumInput label="Mortgage Balance" value={mortgageBalance} onChange={setMortgageBalance} prefix="$" />
          <NumInput label="Current Rate" value={mortgageRate} onChange={setMortgageRate} suffix="%" step={0.125} />
          <NumInput label="Months Remaining" value={monthsLeft} onChange={setMonthsLeft} step={12} hint="360 = 30yr from now" />
          <NumInput label="Cash Needed" value={cashNeeded} onChange={setCashNeeded} prefix="$" hint="amount to tap" />
        </div>
      </Card>

      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Option Rates</p>
        <div className="grid grid-cols-3 gap-4">
          <NumInput label="HELOC Rate (variable)" value={helocRate} onChange={setHelocRate} suffix="%" step={0.25} />
          <NumInput label="Cash-Out Refi Rate" value={cashOutRate} onChange={setCashOutRate} suffix="%" step={0.125} />
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">Cash-Out Term</label>
            <select value={cashOutTerm} onChange={(e) => setCashOutTerm(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan">
              <option value={10}>10 years</option>
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Scenario Cards */}
      <div className="space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Scenario Comparison</p>
        {result.scenarios.map((s) => (
          <Card key={s.label} variant="elevated" className={`p-5 space-y-3 ${s.recommended ? 'border-brand-cyan/40' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text-1">{s.label}</p>
                  {s.recommended && <Badge variant="cyan" size="sm">Recommended</Badge>}
                </div>
                <p className="text-xs text-text-3 mt-0.5">{s.description}</p>
              </div>
              <div className="text-right">
                {s.monthlyPaymentDelta !== 0 && (
                  <p className={`text-sm font-bold ${s.monthlyPaymentDelta > 0 ? 'text-brand-crimson' : 'text-brand-emerald'}`}>
                    {s.monthlyPaymentDelta > 0 ? '+' : ''}{formatCurrency(s.monthlyPaymentDelta)}/mo
                  </p>
                )}
                {s.totalInterestCost > 0 && (
                  <p className="text-xs text-text-3">{formatCurrency(s.totalInterestCost)} interest cost</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-4 mb-1">Pros</p>
                <ul className="space-y-0.5">
                  {s.pros.map((p, i) => (
                    <li key={i} className="text-xs text-brand-emerald flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-text-4 mb-1">Cons</p>
                <ul className="space-y-0.5">
                  {s.cons.map((c, i) => (
                    <li key={i} className="text-xs text-text-3 flex items-start gap-1">
                      <span className="text-brand-crimson mt-0.5">×</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Tappable equity limited to 80% LTV. HELOC cost modeled as 10-year interest-only draw.
          Cash-out refi recommendation based on rate spread vs current mortgage rate. Consult a lender before proceeding.
        </p>
      </Card>
    </div>
  )
}
