'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calc529, formatCurrency } from '@/lib/calculators/financial'
import { GraduationCap, ChevronLeft, CheckCircle, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'

export default function College529Page() {
  const [childAge, setChildAge] = useState(8)
  const [collegeStartAge, setCollegeStartAge] = useState(18)
  const [currentSavings, setCurrentSavings] = useState(15000)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [targetCost, setTargetCost] = useState(120000)
  const [inflationRate, setInflationRate] = useState(5.5)
  const [stateTaxDeduction, setStateTaxDeduction] = useState(true)
  const [stateTaxRate, setStateTaxRate] = useState(5)

  const result = useMemo(() => calc529({
    childAge, collegeStartAge, currentSavings, monthlyContribution,
    expectedReturn, targetCost, inflationRate, stateTaxDeduction, stateTaxRate,
  }), [childAge, collegeStartAge, currentSavings, monthlyContribution,
       expectedReturn, targetCost, inflationRate, stateTaxDeduction, stateTaxRate])

  function field(label: string, value: number, setter: (v: number) => void, opts?: { prefix?: string; suffix?: string; step?: number; min?: number; max?: number }) {
    return (
      <div>
        <label className="text-xs text-text-3 block mb-1">{label}</label>
        <div className="relative">
          {opts?.prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">{opts.prefix}</span>}
          <input
            type="number"
            value={value}
            step={opts?.step ?? 1}
            min={opts?.min}
            max={opts?.max}
            onChange={e => setter(parseFloat(e.target.value) || 0)}
            className={`w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1 ${opts?.prefix ? 'pl-5' : ''} ${opts?.suffix ? 'pr-8' : ''}`}
          />
          {opts?.suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">{opts.suffix}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/tools/financial" className="flex items-center gap-1 text-sm text-text-3 hover:text-text-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> Financial Tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-brand bg-brand-yellow/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-brand-yellow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">529 College Savings</h1>
            <p className="text-sm text-text-2">Project your 529 balance vs projected college costs.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Inputs */}
        <div className="col-span-1 space-y-4">
          <Card variant="elevated" className="p-4 space-y-3">
            <p className="font-semibold text-text-1 text-sm">Child & Timeline</p>
            {field("Child's Current Age", childAge, setChildAge, { min: 0, max: 17 })}
            {field('College Start Age', collegeStartAge, setCollegeStartAge, { min: 14, max: 22 })}
          </Card>

          <Card variant="elevated" className="p-4 space-y-3">
            <p className="font-semibold text-text-1 text-sm">Savings</p>
            {field('Current 529 Balance', currentSavings, setCurrentSavings, { prefix: '$', step: 1000 })}
            {field('Monthly Contribution', monthlyContribution, setMonthlyContribution, { prefix: '$', step: 50 })}
            {field('Expected Return', expectedReturn, setExpectedReturn, { suffix: '%', step: 0.5, min: 1, max: 12 })}
          </Card>

          <Card variant="elevated" className="p-4 space-y-3">
            <p className="font-semibold text-text-1 text-sm">Costs</p>
            {field('Target Cost (Today $)', targetCost, setTargetCost, { prefix: '$', step: 5000 })}
            {field('College Inflation Rate', inflationRate, setInflationRate, { suffix: '%', step: 0.5 })}
          </Card>

          <Card variant="elevated" className="p-4 space-y-3">
            <p className="font-semibold text-text-1 text-sm">State Tax Benefit</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={stateTaxDeduction} onChange={e => setStateTaxDeduction(e.target.checked)} className="rounded" />
              <span className="text-sm text-text-2">State Tax Deduction</span>
            </label>
            {stateTaxDeduction && field('State Tax Rate', stateTaxRate, setStateTaxRate, { suffix: '%', step: 0.5, min: 0, max: 15 })}
          </Card>
        </div>

        {/* Results */}
        <div className="col-span-2 space-y-4">
          {/* On-track status */}
          <Card variant="elevated" className={`p-5 border-${result.onTrack ? 'brand-emerald' : 'brand-crimson'}/30`}>
            <div className="flex items-center gap-3 mb-4">
              {result.onTrack
                ? <CheckCircle className="w-6 h-6 text-brand-emerald" />
                : <AlertCircle className="w-6 h-6 text-brand-crimson" />
              }
              <div>
                <p className="font-semibold text-text-1">
                  {result.onTrack ? 'On Track!' : 'Funding Gap Detected'}
                </p>
                <p className="text-sm text-text-2">{result.yearsToCollege} years until college</p>
              </div>
              <Badge variant={result.onTrack ? 'emerald' : 'crimson'} size="sm" className="ml-auto">
                {result.coveragePct.toFixed(0)}% Funded
              </Badge>
            </div>
            <ProgressBar value={result.coveragePct} max={100} className="h-3 mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-2 rounded p-3">
                <p className="text-xs text-text-4 mb-1">Projected Balance</p>
                <p className="text-xl font-bold text-brand-emerald">{formatCurrency(result.projectedBalance)}</p>
              </div>
              <div className="bg-surface-2 rounded p-3">
                <p className="text-xs text-text-4 mb-1">Projected Cost</p>
                <p className="text-xl font-bold text-text-1">{formatCurrency(result.projectedCost)}</p>
              </div>
              {!result.onTrack && (
                <>
                  <div className="bg-surface-2 rounded p-3">
                    <p className="text-xs text-text-4 mb-1">Funding Gap</p>
                    <p className="text-xl font-bold text-brand-crimson">{formatCurrency(result.gap)}</p>
                  </div>
                  <div className="bg-surface-2 rounded p-3">
                    <p className="text-xs text-text-4 mb-1">Monthly Needed to Close Gap</p>
                    <p className="text-xl font-bold text-brand-amber">{formatCurrency(result.monthlyNeeded)}/mo</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Tax savings */}
          {stateTaxDeduction && result.taxSavingsEstimate > 0 && (
            <Card variant="elevated" className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-brand-yellow" />
                <p className="font-semibold text-text-1 text-sm">Estimated State Tax Savings</p>
              </div>
              <p className="text-2xl font-bold text-brand-yellow">{formatCurrency(result.taxSavingsEstimate)}</p>
              <p className="text-xs text-text-4 mt-1">
                Based on {formatCurrency(monthlyContribution * 12)}/yr contribution × {stateTaxRate}% state rate × {result.yearsToCollege} years.
                Actual savings depend on your state's 529 deduction rules.
              </p>
            </Card>
          )}

          {/* Year-by-year table */}
          <Card variant="elevated" className="p-5">
            <p className="font-semibold text-text-1 mb-3">Year-by-Year Projection</p>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-4 border-b border-surface-3">
                    <th className="pb-2 pr-3">Age</th>
                    <th className="pb-2 pr-3 text-right">Contribution</th>
                    <th className="pb-2 pr-3 text-right">Growth</th>
                    <th className="pb-2 pr-3 text-right">Balance</th>
                    <th className="pb-2 text-right">Proj. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {result.rows.map((row, i) => (
                    <tr key={i} className="text-text-2 hover:bg-surface-2/50">
                      <td className="py-2 pr-3 font-medium text-text-1">{row.age}</td>
                      <td className="py-2 pr-3 text-right text-brand-cyan">{formatCurrency(row.contribution)}</td>
                      <td className="py-2 pr-3 text-right text-brand-emerald">{formatCurrency(row.growth)}</td>
                      <td className="py-2 pr-3 text-right font-semibold text-text-1">{formatCurrency(row.balance)}</td>
                      <td className="py-2 text-right text-text-3">{formatCurrency(row.projectedCost)}</td>
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
