'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { compareRates, formatCurrency, type RateQuote } from '@/lib/calculators/homebuying'
import { TrendingDown, Plus, X, Star, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const SAMPLE_QUOTES: RateQuote[] = [
  {
    id: '1',
    lenderName: 'First National Bank',
    date: '2026-03-08',
    rate: 6.875,
    apr: 7.012,
    points: 0,
    originationFee: 1200,
    loanType: '30yr Fixed',
    lockPeriod: 30,
    notes: 'No prepayment penalty',
  },
  {
    id: '2',
    lenderName: 'Credit Union Direct',
    date: '2026-03-09',
    rate: 6.75,
    apr: 6.92,
    points: 0.5,
    originationFee: 800,
    loanType: '30yr Fixed',
    lockPeriod: 45,
    notes: 'Member discount applied',
  },
]

const BLANK_QUOTE = (): Omit<RateQuote, 'id'> => ({
  lenderName: '',
  date: new Date().toISOString().split('T')[0],
  rate: 7.0,
  apr: 7.15,
  points: 0,
  originationFee: 0,
  loanType: '30yr Fixed',
  lockPeriod: 30,
  notes: '',
})

export default function RateTrackerPage() {
  const [quotes, setQuotes] = useState<RateQuote[]>(SAMPLE_QUOTES)
  const [loanAmount, setLoanAmount] = useState(400000)
  const [showForm, setShowForm] = useState(false)
  const [newQuote, setNewQuote] = useState(BLANK_QUOTE())

  const result = useMemo(() => compareRates(quotes, loanAmount), [quotes, loanAmount])

  function addQuote() {
    setQuotes(prev => [...prev, { ...newQuote, id: Date.now().toString() }])
    setNewQuote(BLANK_QUOTE())
    setShowForm(false)
  }

  function deleteQuote(id: string) {
    setQuotes(prev => prev.filter(q => q.id !== id))
  }

  function updateNew(field: keyof Omit<RateQuote, 'id'>, value: string | number) {
    setNewQuote(prev => ({ ...prev, [field]: value }))
  }

  function isBestRate(q: RateQuote) { return result.bestRate?.id === q.id }
  function isBestAPR(q: RateQuote) { return result.bestAPR?.id === q.id }
  function isLowestFees(q: RateQuote) { return result.lowestFees?.id === q.id }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/tools/homebuying" className="flex items-center gap-1 text-sm text-text-3 hover:text-text-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> Homebuying Tools
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-brand bg-brand-amber/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-brand-amber" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mortgage Rate Tracker</h1>
              <p className="text-sm text-text-2">Log and compare lender quotes side by side.</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 px-3 py-1.5 rounded text-sm font-medium hover:bg-brand-cyan/30 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Quote
          </button>
        </div>
      </div>

      {/* Loan amount */}
      <Card variant="elevated" className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-text-2 flex-shrink-0">Loan Amount for Comparison:</label>
          <div className="relative w-40">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-sm">$</span>
            <input type="number" value={loanAmount} step={10000}
              onChange={e => setLoanAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-2 border border-surface-3 rounded pl-5 pr-2 py-1.5 text-sm text-text-1" />
          </div>
        </div>
      </Card>

      {/* Summary cards */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <Card variant="elevated" className="p-3 border-brand-emerald/30">
            <p className="text-xs text-text-4 mb-1">Best Rate</p>
            <p className="text-xl font-bold text-brand-emerald">{result.bestRate?.rate.toFixed(3)}%</p>
            <p className="text-xs text-text-3">{result.bestRate?.lenderName}</p>
          </Card>
          <Card variant="elevated" className="p-3 border-brand-cyan/30">
            <p className="text-xs text-text-4 mb-1">Best APR</p>
            <p className="text-xl font-bold text-brand-cyan">{result.bestAPR?.apr.toFixed(3)}%</p>
            <p className="text-xs text-text-3">{result.bestAPR?.lenderName}</p>
          </Card>
          <Card variant="elevated" className="p-3 border-brand-amber/30">
            <p className="text-xs text-text-4 mb-1">Lowest Fees</p>
            <p className="text-xl font-bold text-brand-amber">{formatCurrency(result.lowestFees?.originationFee ?? 0)}</p>
            <p className="text-xs text-text-3">{result.lowestFees?.lenderName}</p>
          </Card>
          <Card variant="elevated" className="p-3">
            <p className="text-xs text-text-4 mb-1">Monthly Payment Diff</p>
            <p className="text-xl font-bold text-text-1">{formatCurrency(result.monthlyPaymentDiff)}</p>
            <p className="text-xs text-text-4">best vs worst rate</p>
          </Card>
        </div>
      )}

      {/* Add quote form */}
      {showForm && (
        <Card variant="elevated" className="p-5 border-brand-cyan/20">
          <p className="font-semibold text-text-1 mb-4">New Quote</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-text-3 block mb-1">Lender Name</label>
              <input value={newQuote.lenderName} onChange={e => updateNew('lenderName', e.target.value)}
                className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1" />
            </div>
            <div>
              <label className="text-xs text-text-3 block mb-1">Date</label>
              <input type="date" value={newQuote.date} onChange={e => updateNew('date', e.target.value)}
                className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1" />
            </div>
            <div>
              <label className="text-xs text-text-3 block mb-1">Loan Type</label>
              <select value={newQuote.loanType} onChange={e => updateNew('loanType', e.target.value)}
                className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1">
                {['30yr Fixed', '15yr Fixed', '5/1 ARM', 'FHA'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {[
              { label: 'Rate %', field: 'rate' as const, step: 0.125 },
              { label: 'APR %', field: 'apr' as const, step: 0.01 },
              { label: 'Points', field: 'points' as const, step: 0.125 },
            ].map(({ label, field, step }) => (
              <div key={field}>
                <label className="text-xs text-text-3 block mb-1">{label}</label>
                <input type="number" value={newQuote[field]} step={step}
                  onChange={e => updateNew(field, parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1" />
              </div>
            ))}
            <div>
              <label className="text-xs text-text-3 block mb-1">Origination Fee ($)</label>
              <input type="number" value={newQuote.originationFee} step={100}
                onChange={e => updateNew('originationFee', parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1" />
            </div>
            <div>
              <label className="text-xs text-text-3 block mb-1">Lock Period (days)</label>
              <select value={newQuote.lockPeriod} onChange={e => updateNew('lockPeriod', parseInt(e.target.value))}
                className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1">
                {[30, 45, 60].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-3">
              <label className="text-xs text-text-3 block mb-1">Notes</label>
              <input value={newQuote.notes} onChange={e => updateNew('notes', e.target.value)}
                className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addQuote}
              className="bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 px-4 py-1.5 rounded text-sm font-medium hover:bg-brand-cyan/30">
              Save Quote
            </button>
            <button onClick={() => setShowForm(false)}
              className="text-text-3 hover:text-text-1 px-4 py-1.5 rounded text-sm">
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Quotes table */}
      <Card variant="elevated" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-4 border-b border-surface-3 bg-surface-2/50">
                <th className="px-4 py-3">Lender</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">APR</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Orig. Fee</th>
                <th className="px-4 py-3">Lock</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {quotes.map(q => (
                <tr key={q.id} className="hover:bg-surface-2/30">
                  <td className="px-4 py-3 font-medium text-text-1">{q.lenderName}</td>
                  <td className="px-4 py-3 text-text-3">{q.date}</td>
                  <td className="px-4 py-3 text-text-3">{q.loanType}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={isBestRate(q) ? 'text-brand-emerald font-bold' : 'text-text-1'}>
                      {q.rate.toFixed(3)}%
                    </span>
                    {isBestRate(q) && <Star className="w-3 h-3 text-brand-emerald inline ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={isBestAPR(q) ? 'text-brand-cyan font-bold' : 'text-text-1'}>
                      {q.apr.toFixed(3)}%
                    </span>
                    {isBestAPR(q) && <Star className="w-3 h-3 text-brand-cyan inline ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-right text-text-2">{q.points}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={isLowestFees(q) ? 'text-brand-amber font-bold' : 'text-text-2'}>
                      {formatCurrency(q.originationFee)}
                    </span>
                    {isLowestFees(q) && <Star className="w-3 h-3 text-brand-amber inline ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-text-3">{q.lockPeriod}d</td>
                  <td className="px-4 py-3 text-text-4 text-xs max-w-32 truncate">{q.notes}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteQuote(q.id)} className="text-text-4 hover:text-brand-crimson">
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-text-4">No quotes yet. Add your first quote above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
