'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcOfferStrategy, formatCurrency } from '@/lib/calculators/homebuying'
import { Target, ChevronLeft, CheckCircle, XCircle, MinusCircle } from 'lucide-react'
import Link from 'next/link'

type MarketCondition = 'hot' | 'balanced' | 'cool'

export default function OfferStrategyPage() {
  const [listPrice, setListPrice] = useState(450000)
  const [estimatedFMV, setEstimatedFMV] = useState(445000)
  const [competingOffers, setCompetingOffers] = useState(3)
  const [marketCondition, setMarketCondition] = useState<MarketCondition>('hot')
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [hasEscalation, setHasEscalation] = useState(false)
  const [escalationCap, setEscalationCap] = useState(480000)
  const [escalationIncrement, setEscalationIncrement] = useState(5000)
  const [hasInspectionContingency, setHasInspectionContingency] = useState(true)
  const [hasFinancingContingency, setHasFinancingContingency] = useState(true)
  const [hasAppraisalContingency, setHasAppraisalContingency] = useState(true)
  const [offerPrice, setOfferPrice] = useState(465000)

  const result = useMemo(() => calcOfferStrategy({
    listPrice, estimatedFMV, competingOffers, marketCondition, downPaymentPct,
    hasEscalation, escalationCap, escalationIncrement, hasInspectionContingency,
    hasFinancingContingency, hasAppraisalContingency, offerPrice,
  }), [listPrice, estimatedFMV, competingOffers, marketCondition, downPaymentPct,
       hasEscalation, escalationCap, escalationIncrement, hasInspectionContingency,
       hasFinancingContingency, hasAppraisalContingency, offerPrice])

  const scoreColor = result.strengthScore >= 75 ? 'text-brand-emerald' : result.strengthScore >= 50 ? 'text-brand-amber' : 'text-brand-crimson'
  const scoreBorderColor = result.strengthScore >= 75 ? 'border-brand-emerald/30' : result.strengthScore >= 50 ? 'border-brand-amber/30' : 'border-brand-crimson/30'

  function winProbColor(pct: number) {
    if (pct >= 60) return 'bg-brand-emerald'
    if (pct >= 40) return 'bg-brand-amber'
    return 'bg-brand-crimson'
  }

  function impactIcon(impact: 'positive' | 'negative' | 'neutral') {
    if (impact === 'positive') return <CheckCircle className="w-4 h-4 text-brand-emerald flex-shrink-0" />
    if (impact === 'negative') return <XCircle className="w-4 h-4 text-brand-crimson flex-shrink-0" />
    return <MinusCircle className="w-4 h-4 text-text-4 flex-shrink-0" />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/tools/homebuying" className="flex items-center gap-1 text-sm text-text-3 hover:text-text-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> Homebuying Tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-brand bg-brand-emerald/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-brand-emerald" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Offer Strategy Simulator</h1>
            <p className="text-sm text-text-2">Win probability by price with offer strength analysis.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Inputs */}
        <div className="col-span-1 space-y-4">
          <Card variant="elevated" className="p-4 space-y-3">
            <p className="font-semibold text-text-1 text-sm">Property</p>
            {[
              { label: 'List Price', value: listPrice, setter: setListPrice },
              { label: 'Estimated FMV', value: estimatedFMV, setter: setEstimatedFMV },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="text-xs text-text-3 block mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
                  <input type="number" value={value} step={1000}
                    onChange={e => setter(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-2 border border-surface-3 rounded pl-5 pr-2 py-1.5 text-sm text-text-1" />
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs text-text-3 block mb-1">Competing Offers</label>
              <input type="number" value={competingOffers} min={0} max={20}
                onChange={e => setCompetingOffers(parseInt(e.target.value) || 0)}
                className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1" />
            </div>
          </Card>

          <Card variant="elevated" className="p-4 space-y-3">
            <p className="font-semibold text-text-1 text-sm">Market</p>
            <div className="flex gap-1">
              {(['hot', 'balanced', 'cool'] as MarketCondition[]).map(m => (
                <button key={m}
                  onClick={() => setMarketCondition(m)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium capitalize transition-colors ${marketCondition === m ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30' : 'bg-surface-2 text-text-3 border border-surface-3 hover:text-text-1'}`}>
                  {m}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-text-3 block mb-1">Your Offer Price</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
                <input type="number" value={offerPrice} step={1000}
                  onChange={e => setOfferPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-2 border border-surface-3 rounded pl-5 pr-2 py-1.5 text-sm text-text-1" />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-3 block mb-1">Down Payment %</label>
              <div className="relative">
                <input type="number" value={downPaymentPct} step={5} min={3} max={100}
                  onChange={e => setDownPaymentPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-2 border border-surface-3 rounded px-2 pr-6 py-1.5 text-sm text-text-1" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">%</span>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-4 space-y-2">
            <p className="font-semibold text-text-1 text-sm">Contingencies</p>
            {[
              { label: 'Inspection', value: hasInspectionContingency, setter: setHasInspectionContingency },
              { label: 'Financing', value: hasFinancingContingency, setter: setHasFinancingContingency },
              { label: 'Appraisal', value: hasAppraisalContingency, setter: setHasAppraisalContingency },
            ].map(({ label, value, setter }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={value} onChange={e => setter(e.target.checked)} className="rounded" />
                <span className="text-sm text-text-2">{label} Contingency</span>
              </label>
            ))}
          </Card>

          <Card variant="elevated" className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-text-1 text-sm">Escalation Clause</p>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={hasEscalation} onChange={e => setHasEscalation(e.target.checked)} className="rounded" />
                <span className="text-xs text-text-3">Enable</span>
              </label>
            </div>
            {hasEscalation && (
              <>
                {[
                  { label: 'Escalation Cap', value: escalationCap, setter: setEscalationCap },
                  { label: 'Increment', value: escalationIncrement, setter: setEscalationIncrement },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <label className="text-xs text-text-3 block mb-1">{label}</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
                      <input type="number" value={value} step={1000}
                        onChange={e => setter(parseFloat(e.target.value) || 0)}
                        className="w-full bg-surface-2 border border-surface-3 rounded pl-5 pr-2 py-1.5 text-sm text-text-1" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-text-4">{result.escalationRange}</p>
              </>
            )}
          </Card>
        </div>

        {/* Results */}
        <div className="col-span-2 space-y-4">
          {/* Strength Score */}
          <Card variant="elevated" className={`p-5 ${scoreBorderColor}`}>
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-black ${scoreColor}`}>{result.strengthScore}</div>
              <div className="flex-1">
                <p className="font-semibold text-text-1 mb-1">Offer Strength Score</p>
                <ProgressBar value={result.strengthScore} max={100} className="h-2 mb-2" />
                <p className="text-xs text-text-4">Recommended offer: {formatCurrency(result.recommendedOffer)}</p>
              </div>
            </div>
          </Card>

          {/* Strength factors */}
          <Card variant="elevated" className="p-4 space-y-2">
            <p className="font-semibold text-text-1 text-sm mb-3">Strength Factors</p>
            {result.strengthFactors.map((f, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-surface-3/50 last:border-0">
                {impactIcon(f.impact)}
                <div>
                  <p className="text-sm font-medium text-text-1">{f.label}</p>
                  <p className="text-xs text-text-4">{f.detail}</p>
                </div>
              </div>
            ))}
          </Card>

          {/* Scenario cards */}
          <div className="space-y-2">
            <p className="font-semibold text-text-1 text-sm">Offer Scenarios</p>
            {result.scenarios.map((s, i) => (
              <Card key={i} variant="elevated" className={`p-4 ${s.label === 'Your Offer' ? 'border-brand-cyan/30' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-1">{s.label}</p>
                      {s.label === 'Your Offer' && <Badge variant="cyan" size="sm">Custom</Badge>}
                      <span className="text-sm text-text-3">{formatCurrency(s.offerPrice)}</span>
                      <span className={`text-xs ${s.overList > 0 ? 'text-brand-crimson' : 'text-brand-emerald'}`}>
                        {s.overList > 0 ? '+' : ''}{s.overList.toFixed(1)}% vs list
                      </span>
                    </div>
                    <p className="text-xs text-text-4">~{formatCurrency(s.monthlyPayment)}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${s.winProbability >= 60 ? 'text-brand-emerald' : s.winProbability >= 40 ? 'text-brand-amber' : 'text-brand-crimson'}`}>
                      {Math.round(s.winProbability)}%
                    </p>
                    <p className="text-xs text-text-4">win probability</p>
                  </div>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${winProbColor(s.winProbability)}`}
                    style={{ width: `${s.winProbability}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    {s.pros.map((p, j) => <p key={j} className="text-xs text-brand-emerald">+ {p}</p>)}
                  </div>
                  <div>
                    {s.cons.map((c, j) => <p key={j} className="text-xs text-brand-crimson">– {c}</p>)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
