'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { calcClosingCosts, formatCurrency } from '@/lib/calculators/homebuying'
import { US_STATES } from '@/lib/calculators/mortgage'
import { DollarSign, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type LoanType = 'conventional' | 'fha' | 'va' | 'usda'

const LOAN_TYPES: { value: LoanType; label: string }[] = [
  { value: 'conventional', label: 'Conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'usda', label: 'USDA' },
]

const CATEGORY_COLORS: Record<string, string> = {
  Lender: 'text-brand-cyan',
  'Third Party': 'text-brand-emerald',
  Prepaids: 'text-brand-amber',
  'Transfer Tax': 'text-brand-yellow',
}

export default function ClosingCostsPage() {
  const [purchasePrice, setPurchasePrice] = useState(450000)
  const [loanAmount, setLoanAmount] = useState(360000)
  const [state, setState] = useState('TX')
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [loanType, setLoanType] = useState<LoanType>('conventional')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const result = useMemo(
    () => calcClosingCosts({ purchasePrice, loanAmount, state, isFirstTime, loanType }),
    [purchasePrice, loanAmount, state, isFirstTime, loanType]
  )

  const categories = ['Lender', 'Third Party', 'Prepaids', 'Transfer Tax']
  const categoryTotals: Record<string, number> = {
    Lender: result.totalLenderFees,
    'Third Party': result.totalThirdParty,
    Prepaids: result.totalPrepaids,
    'Transfer Tax': result.totalTransferTaxes,
  }

  function toggleCategory(cat: string) {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/tools/homebuying" className="flex items-center gap-1 text-sm text-text-3 hover:text-text-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> Homebuying Tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-brand bg-brand-cyan/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Closing Cost Estimator</h1>
            <p className="text-sm text-text-2">Itemized closing costs by state and loan type.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Inputs */}
        <div className="col-span-1 space-y-4">
          <Card variant="elevated" className="p-4 space-y-3">
            <p className="font-semibold text-text-1 text-sm">Purchase Details</p>

            <div>
              <label className="text-xs text-text-3 block mb-1">Purchase Price</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
                <input type="number" value={purchasePrice} step={5000}
                  onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-2 border border-surface-3 rounded pl-5 pr-2 py-1.5 text-sm text-text-1" />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-3 block mb-1">Loan Amount</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
                <input type="number" value={loanAmount} step={5000}
                  onChange={e => setLoanAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-2 border border-surface-3 rounded pl-5 pr-2 py-1.5 text-sm text-text-1" />
              </div>
              <p className="text-xs text-text-4 mt-1">Down: {formatCurrency(purchasePrice - loanAmount)} ({((purchasePrice - loanAmount) / purchasePrice * 100).toFixed(1)}%)</p>
            </div>

            <div>
              <label className="text-xs text-text-3 block mb-1">State</label>
              <select value={state} onChange={e => setState(e.target.value)}
                className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1">
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-text-3 block mb-1">Loan Type</label>
              <div className="grid grid-cols-2 gap-1">
                {LOAN_TYPES.map(lt => (
                  <button key={lt.value}
                    onClick={() => setLoanType(lt.value)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${loanType === lt.value ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30' : 'bg-surface-2 text-text-3 border border-surface-3 hover:text-text-1'}`}>
                    {lt.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFirstTime} onChange={e => setIsFirstTime(e.target.checked)} className="rounded" />
              <span className="text-sm text-text-2">First-Time Buyer</span>
            </label>
          </Card>

          {/* Summary */}
          <Card variant="elevated" className="p-4 space-y-2">
            <p className="font-semibold text-text-1 text-sm">Summary</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-text-3">Down Payment</span><span className="font-medium text-text-1">{formatCurrency(result.downPayment)}</span></div>
              <div className="flex justify-between"><span className="text-text-3">Closing Costs</span><span className="font-medium text-text-1">{formatCurrency(result.grandTotal)}</span></div>
              <div className="flex justify-between text-xs text-text-4"><span>% of purchase</span><span>{result.pctOfPurchase.toFixed(1)}%</span></div>
              <div className="border-t border-surface-3 pt-2 flex justify-between">
                <span className="font-semibold text-text-1">Total Cash Needed</span>
                <span className="font-bold text-brand-cyan text-lg">{formatCurrency(result.cashNeeded)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Itemized breakdown */}
        <div className="col-span-2 space-y-3">
          {categories.map(cat => {
            const catLines = result.lines.filter(l => l.category === cat)
            if (catLines.length === 0) return null
            const isOpen = !collapsed[cat]
            return (
              <Card key={cat} variant="elevated" className="overflow-hidden">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between p-4 hover:bg-surface-2/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-text-4" /> : <ChevronRight className="w-4 h-4 text-text-4" />}
                    <span className={`font-semibold text-sm ${CATEGORY_COLORS[cat] ?? 'text-text-1'}`}>{cat}</span>
                  </div>
                  <span className="font-semibold text-text-1">{formatCurrency(categoryTotals[cat])}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-surface-3">
                    {catLines.map((line, i) => (
                      <div key={i} className="flex items-start justify-between px-4 py-2.5 hover:bg-surface-2/30 border-b border-surface-3/50 last:border-0">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-2">{line.label}</span>
                            {line.negotiable && <Badge variant="amber" size="sm">Negotiable</Badge>}
                          </div>
                          <p className="text-xs text-text-4 mt-0.5">{line.note}</p>
                        </div>
                        <span className="text-sm font-medium text-text-1 flex-shrink-0">{formatCurrency(line.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
