'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcMonteCarlo, formatCurrency } from '@/lib/calculators/retirement'
import { Dice5, ChevronLeft, RefreshCw, Info } from 'lucide-react'
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

function SurvivalBadge({ rate }: { rate: number }) {
  if (rate >= 90) return <Badge variant="cyan" size="sm">Excellent</Badge>
  if (rate >= 75) return <Badge variant="cyan" size="sm">Good</Badge>
  return <Badge variant="cyan" size="sm">Review Plan</Badge>
}

export default function MonteCarloPage() {
  const [currentBalance, setCurrentBalance]   = useState(200000)
  const [monthly, setMonthly]                 = useState(2000)
  const [currentAge, setCurrentAge]           = useState(35)
  const [retirementAge, setRetirementAge]     = useState(65)
  const [annualSpend, setAnnualSpend]         = useState(80000)
  const [meanReturn, setMeanReturn]           = useState(7)
  const [stdDev, setStdDev]                   = useState(15)
  const [seed, setSeed]                       = useState(0)  // trigger reruns

  const result = useMemo(() => {
    void seed
    return calcMonteCarlo({
      currentBalance, monthlyContribution: monthly, currentAge, retirementAge,
      retirementAnnualSpend: annualSpend, meanReturn, stdDev, simCount: 500,
    })
  }, [currentBalance, monthly, currentAge, retirementAge, annualSpend, meanReturn, stdDev, seed])

  const retYear = result.retirementYear
  const endYear = result.yearsSimulated

  // Sample chart points at 5-year intervals
  const chartPoints = result.chartData.filter((_, i) => i % 5 === 0 || i === retYear || i === endYear)

  const maxVal = Math.max(...result.chartData.map(d => d.p90))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-4 hover:text-text-2 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-brand bg-brand-crimson/10 flex items-center justify-center">
          <Dice5 className="w-5 h-5 text-brand-crimson" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Monte Carlo Simulation</h1>
          <p className="text-text-3 text-sm">500-scenario portfolio survival analysis</p>
        </div>
        <button
          onClick={() => setSeed(s => s + 1)}
          className="flex items-center gap-1.5 text-xs text-text-4 hover:text-text-2 transition-colors px-3 py-1.5 rounded-brand border border-surface-3 hover:border-surface-4"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-run
        </button>
      </div>

      {/* Inputs */}
      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Inputs</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput label="Current Balance" value={currentBalance} onChange={setCurrentBalance} prefix="$" />
          <NumInput label="Monthly Contribution" value={monthly} onChange={setMonthly} prefix="$" step={100} />
          <NumInput label="Current Age" value={currentAge} onChange={setCurrentAge} step={1} />
          <NumInput label="Retirement Age" value={retirementAge} onChange={setRetirementAge} step={1} />
          <NumInput label="Annual Retirement Spend" value={annualSpend} onChange={setAnnualSpend} prefix="$" />
          <div />
          <NumInput label="Mean Annual Return" value={meanReturn} onChange={setMeanReturn} suffix="%" step={0.5} hint="S&P 500 avg ~10%, conservative ~6%" />
          <NumInput label="Volatility (Std Dev)" value={stdDev} onChange={setStdDev} suffix="%" step={0.5} hint="S&P 500 ~15%, bonds ~5%" />
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="elevated" className={`p-4 space-y-1 ${result.survivalRate >= 90 ? 'border-brand-emerald/30' : result.survivalRate >= 75 ? 'border-brand-amber/30' : 'border-brand-crimson/30'}`}>
          <div className="flex items-center gap-2">
            <p className="text-xs text-text-4">Survival Rate</p>
            <SurvivalBadge rate={result.survivalRate} />
          </div>
          <p className={`text-2xl font-bold ${result.survivalRate >= 90 ? 'text-brand-emerald' : result.survivalRate >= 75 ? 'text-brand-amber' : 'text-brand-crimson'}`}>
            {result.survivalRate.toFixed(1)}%
          </p>
          <p className="text-xs text-text-3">portfolio intact at 95</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Success Rate</p>
          <p className="text-2xl font-bold text-brand-cyan">{result.successRate.toFixed(1)}%</p>
          <p className="text-xs text-text-3">hit target at retirement</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Risk of Ruin</p>
          <p className={`text-2xl font-bold ${result.riskOfRuin < 10 ? 'text-brand-emerald' : result.riskOfRuin < 25 ? 'text-brand-amber' : 'text-brand-crimson'}`}>
            {result.riskOfRuin.toFixed(1)}%
          </p>
          <p className="text-xs text-text-3">portfolio depletes before 95</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Median at Retirement</p>
          <p className="text-lg font-bold text-text-1">{formatCurrency(result.medianAtRetirement)}</p>
          <p className="text-xs text-text-3">50th percentile</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Median at Age 95</p>
          <p className="text-lg font-bold text-text-1">{formatCurrency(result.medianAtEnd)}</p>
          <p className="text-xs text-text-3">50th percentile</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Scenarios Run</p>
          <p className="text-lg font-bold text-text-3">500</p>
          <p className="text-xs text-text-3">random paths</p>
        </Card>
      </div>

      {/* Percentile Fan Chart (text-based) */}
      <Card variant="elevated" className="p-5 space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Percentile Fan — Balance Over Time</p>
        <div className="space-y-1">
          {chartPoints.map((d) => {
            const isRetirement = d.year === retYear
            const p50pct = maxVal > 0 ? (d.p50 / maxVal) * 100 : 0
            const p25pct = maxVal > 0 ? (d.p25 / maxVal) * 100 : 0
            const p75pct = maxVal > 0 ? (d.p75 / maxVal) * 100 : 0
            return (
              <div key={d.year} className="group">
                {isRetirement && (
                  <p className="text-xs text-brand-amber font-medium mb-1 mt-2">── Retirement (age {d.age}) ──</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-4 w-10">Age {d.age}</span>
                  <div className="flex-1 relative h-5 bg-surface-1 rounded overflow-hidden">
                    {/* p25–p75 band */}
                    <div
                      className="absolute top-0 h-full bg-brand-cyan/20 rounded"
                      style={{ left: `${p25pct}%`, width: `${Math.max(0, p75pct - p25pct)}%` }}
                    />
                    {/* p50 line */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-brand-cyan"
                      style={{ left: `${p50pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-3 w-24 text-right">{formatCurrency(d.p50)}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 text-xs text-text-4 mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-brand-cyan inline-block rounded" /> Median (p50)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-brand-cyan/20 inline-block rounded" /> p25–p75 range</span>
        </div>
      </Card>

      {/* Percentile Table */}
      <Card variant="elevated" className="p-5 space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Percentile Outcomes</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-4 border-b border-surface-3">
                <th className="text-left py-2">Age</th>
                <th className="text-right py-2">p10 (Bad)</th>
                <th className="text-right py-2">p25</th>
                <th className="text-right py-2">p50 (Median)</th>
                <th className="text-right py-2">p75</th>
                <th className="text-right py-2">p90 (Good)</th>
              </tr>
            </thead>
            <tbody>
              {chartPoints.filter((_, i) => i < 12).map((d) => (
                <tr key={d.year} className={`border-b border-surface-2 hover:bg-surface-1 transition-colors ${d.year === retYear ? 'text-brand-amber' : ''}`}>
                  <td className="py-2 font-medium">{d.age}{d.year === retYear ? ' *' : ''}</td>
                  <td className="py-2 text-right text-brand-crimson">{formatCurrency(d.p10)}</td>
                  <td className="py-2 text-right text-text-3">{formatCurrency(d.p25)}</td>
                  <td className="py-2 text-right text-text-1 font-medium">{formatCurrency(d.p50)}</td>
                  <td className="py-2 text-right text-text-3">{formatCurrency(d.p75)}</td>
                  <td className="py-2 text-right text-brand-emerald">{formatCurrency(d.p90)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-4">* Retirement year</p>
      </Card>

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          500 simulations using log-normal returns with the specified mean and volatility. Each re-run generates new random paths.
          Past market distributions do not guarantee future results. Consult a financial advisor for personalized planning.
        </p>
      </Card>
    </div>
  )
}
