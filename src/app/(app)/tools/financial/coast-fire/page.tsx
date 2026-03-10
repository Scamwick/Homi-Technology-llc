'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcCoastFIRE, formatCurrency } from '@/lib/calculators/retirement'
import { Anchor, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react'
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

export default function CoastFIREPage() {
  const [currentAge, setCurrentAge]             = useState(35)
  const [retirementAge, setRetirementAge]       = useState(65)
  const [currentSavings, setCurrentSavings]     = useState(150000)
  const [annualSpend, setAnnualSpend]           = useState(60000)
  const [expectedReturn, setExpectedReturn]     = useState(7)
  const [withdrawalRate, setWithdrawalRate]     = useState(4)

  const result = useMemo(() => calcCoastFIRE({
    currentAge, retirementAge, currentSavings,
    annualRetirementSpend: annualSpend,
    expectedReturn, withdrawalRate,
  }), [currentAge, retirementAge, currentSavings, annualSpend, expectedReturn, withdrawalRate])

  const coastPct = result.coastNumber > 0 ? Math.min(100, (currentSavings / result.coastNumber) * 100) : 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-4 hover:text-text-2 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-brand bg-brand-yellow/10 flex items-center justify-center">
          <Anchor className="w-5 h-5 text-brand-yellow" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Coast FIRE Calculator</h1>
          <p className="text-text-3 text-sm">How much do you need now to coast to retirement?</p>
        </div>
      </div>

      {/* Inputs */}
      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Inputs</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput label="Current Age" value={currentAge} onChange={setCurrentAge} step={1} />
          <NumInput label="Retirement Age" value={retirementAge} onChange={setRetirementAge} step={1} />
          <NumInput label="Current Savings" value={currentSavings} onChange={setCurrentSavings} prefix="$" />
          <NumInput label="Annual Retirement Spend" value={annualSpend} onChange={setAnnualSpend} prefix="$" hint="in today's dollars" />
          <NumInput label="Expected Return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" step={0.5} />
          <NumInput label="Safe Withdrawal Rate" value={withdrawalRate} onChange={setWithdrawalRate} suffix="%" step={0.5} hint="typically 3–5%" />
        </div>
      </Card>

      {/* Coast Status */}
      <Card variant="elevated" className={`p-5 border ${result.isCoasting ? 'border-brand-emerald/40' : 'border-surface-3'}`}>
        <div className="flex items-center gap-3 mb-4">
          {result.isCoasting ? (
            <CheckCircle className="w-6 h-6 text-brand-emerald" />
          ) : (
            <AlertCircle className="w-6 h-6 text-brand-amber" />
          )}
          <div>
            <p className="font-semibold text-text-1">
              {result.isCoasting ? 'You are Coast FIRE!' : 'Not Yet Coasting'}
            </p>
            <p className="text-sm text-text-3">
              {result.isCoasting
                ? 'Your savings will grow to your FI number without additional contributions.'
                : `You need ${formatCurrency(result.gap)} more to reach Coast FIRE.`}
            </p>
          </div>
        </div>
        <ProgressBar
          value={currentSavings}
          max={result.coastNumber}
          colorClass={result.isCoasting ? 'bg-brand-emerald' : 'bg-brand-cyan'}
        />
        <div className="flex justify-between text-xs text-text-4 mt-1">
          <span>{formatCurrency(currentSavings)} saved</span>
          <span>{coastPct.toFixed(0)}% of Coast Number</span>
          <span>Coast: {formatCurrency(result.coastNumber)}</span>
        </div>
      </Card>

      {/* Key Numbers */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">FI Number</p>
          <p className="text-lg font-bold text-text-1">{formatCurrency(result.fiNumber)}</p>
          <p className="text-xs text-text-3">at {withdrawalRate}% SWR</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Lean FIRE</p>
          <p className="text-lg font-bold text-brand-cyan">{formatCurrency(result.leanFINumber)}</p>
          <p className="text-xs text-text-3">at 5% SWR</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Fat FIRE</p>
          <p className="text-lg font-bold text-brand-amber">{formatCurrency(result.fatFINumber)}</p>
          <p className="text-xs text-text-3">at 3% SWR</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Projected at Retirement</p>
          <p className="text-lg font-bold text-brand-emerald">{formatCurrency(result.projectedAtRetirement)}</p>
          <p className="text-xs text-text-3">at {expectedReturn}% growth</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">FIRE Age (no contrib.)</p>
          <p className="text-lg font-bold text-brand-yellow">{result.fireAge > 100 ? '100+' : result.fireAge}</p>
          <p className="text-xs text-text-3">savings-only growth</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Years to Retirement</p>
          <p className="text-lg font-bold text-text-2">{Math.max(0, retirementAge - currentAge)}</p>
          <p className="text-xs text-text-3">growth runway</p>
        </Card>
      </div>

      {/* Return Rate Scenarios */}
      <Card variant="elevated" className="p-5 space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Coast Number by Return Rate</p>
        <div className="space-y-2">
          {result.scenarios.map((s) => (
            <div key={s.returnRate} className="flex items-center gap-3">
              <span className="text-xs text-text-3 w-8">{s.returnRate}%</span>
              <div className="flex-1">
                <ProgressBar
                  value={Math.min(currentSavings, s.coastNumber)}
                  max={s.coastNumber}
                  colorClass={s.isCoasting ? 'bg-brand-emerald' : 'bg-surface-3'}
                />
              </div>
              <span className="text-xs text-text-2 w-28 text-right">{formatCurrency(s.coastNumber)}</span>
              {s.isCoasting && <Badge variant="cyan" size="sm">✓</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4">
          Coast FIRE means your current savings, growing at the assumed rate, will reach your FI number by retirement age
          without additional contributions. All projections assume constant nominal returns. Consult a financial advisor before stopping contributions.
        </p>
      </Card>
    </div>
  )
}
