'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcNetWorth, formatCurrency, type NetWorthAsset, type NetWorthLiability } from '@/lib/calculators/financial'
import { Scale, ChevronLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

const ASSET_CATEGORIES: { value: NetWorthAsset['category']; label: string }[] = [
  { value: 'cash', label: 'Cash & Savings' },
  { value: 'investment', label: 'Taxable Investments' },
  { value: 'retirement', label: 'Retirement Accounts' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other_asset', label: 'Other Assets' },
]

const LIABILITY_CATEGORIES: { value: NetWorthLiability['category']; label: string }[] = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'student', label: 'Student Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other_debt', label: 'Other Debt' },
]

const DEFAULT_ASSETS: NetWorthAsset[] = [
  { label: 'Checking & Savings', value: 25000, category: 'cash' },
  { label: 'Brokerage Account', value: 80000, category: 'investment' },
  { label: '401(k)', value: 200000, category: 'retirement' },
  { label: 'Roth IRA', value: 60000, category: 'retirement' },
  { label: 'Home', value: 450000, category: 'real_estate' },
]

const DEFAULT_LIABILITIES: NetWorthLiability[] = [
  { label: 'Mortgage', balance: 320000, rate: 6.5, minPayment: 2100, category: 'mortgage' },
  { label: 'Auto Loan', balance: 22000, rate: 7.2, minPayment: 450, category: 'auto' },
]

export default function NetWorthPage() {
  const [assets, setAssets] = useState<NetWorthAsset[]>(DEFAULT_ASSETS)
  const [liabilities, setLiabilities] = useState<NetWorthLiability[]>(DEFAULT_LIABILITIES)

  const result = useMemo(() => calcNetWorth(assets, liabilities), [assets, liabilities])

  const updateAsset = (i: number, field: keyof NetWorthAsset, val: string | number) => {
    setAssets(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a))
  }
  const removeAsset = (i: number) => setAssets(prev => prev.filter((_, idx) => idx !== i))
  const addAsset = () => setAssets(prev => [...prev, { label: 'New Asset', value: 0, category: 'cash' }])

  const updateLiability = (i: number, field: keyof NetWorthLiability, val: string | number) => {
    setLiabilities(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l))
  }
  const removeLiability = (i: number) => setLiabilities(prev => prev.filter((_, idx) => idx !== i))
  const addLiability = () => setLiabilities(prev => [...prev, { label: 'New Debt', balance: 0, rate: 0, minPayment: 0, category: 'other_debt' }])

  const nwColor = result.netWorth >= 0 ? 'text-brand-emerald' : 'text-brand-crimson'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-4 hover:text-text-2 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-brand bg-brand-cyan/10 flex items-center justify-center">
          <Scale className="w-5 h-5 text-brand-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Net Worth Tracker</h1>
          <p className="text-text-3 text-sm">Assets, liabilities, allocation, and debt payoff timeline</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Total Assets</p>
          <p className="text-xl font-bold text-brand-emerald">{formatCurrency(result.totalAssets)}</p>
        </Card>
        <Card variant="elevated" className="p-4 space-y-1">
          <p className="text-xs text-text-4">Total Liabilities</p>
          <p className="text-xl font-bold text-brand-crimson">{formatCurrency(result.totalLiabilities)}</p>
        </Card>
        <Card variant="elevated" className={`p-4 space-y-1 ${result.netWorth >= 0 ? 'border-brand-emerald/30' : 'border-brand-crimson/30'}`}>
          <p className="text-xs text-text-4">Net Worth</p>
          <p className={`text-xl font-bold ${nwColor}`}>{formatCurrency(result.netWorth)}</p>
          <p className="text-xs text-text-3">D/A: {result.debtToAsset.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Asset Allocation */}
      {result.assetAllocation.length > 0 && (
        <Card variant="elevated" className="p-5 space-y-3">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Asset Allocation</p>
          <div className="space-y-2">
            {result.assetAllocation.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs text-text-3 w-32 flex-shrink-0">{c.label}</span>
                <div className="flex-1 h-4 bg-surface-1 rounded overflow-hidden">
                  <div className={`h-full ${c.bgClass} rounded transition-all`} style={{ width: `${c.pct}%` }} />
                </div>
                <span className="text-xs text-text-2 w-24 text-right">{formatCurrency(c.amount)}</span>
                <span className="text-xs text-text-4 w-10 text-right">{c.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Assets Input */}
      <Card variant="elevated" className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Assets</p>
          <button onClick={addAsset} className="flex items-center gap-1 text-xs text-brand-cyan hover:text-brand-cyan/80 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {assets.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={a.label} onChange={(e) => updateAsset(i, 'label', e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 text-xs text-text-1 outline-none focus:border-brand-cyan" />
              <select value={a.category} onChange={(e) => updateAsset(i, 'category', e.target.value)}
                className="px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 text-xs text-text-1 outline-none focus:border-brand-cyan">
                {ASSET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 focus-within:border-brand-cyan">
                <span className="text-text-3 text-xs">$</span>
                <input type="number" value={a.value} step={1000}
                  onChange={(e) => updateAsset(i, 'value', parseFloat(e.target.value) || 0)}
                  className="w-24 bg-transparent text-xs text-text-1 outline-none" />
              </div>
              <button onClick={() => removeAsset(i)} className="text-text-4 hover:text-brand-crimson transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Liabilities Input */}
      <Card variant="elevated" className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Liabilities</p>
          <button onClick={addLiability} className="flex items-center gap-1 text-xs text-brand-cyan hover:text-brand-cyan/80 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        {liabilities.length === 0 ? (
          <p className="text-xs text-text-4">No liabilities added.</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-1 text-xs text-text-4 pb-1">
              <span className="col-span-3">Label</span>
              <span className="col-span-3">Category</span>
              <span className="col-span-2 text-right">Balance</span>
              <span className="col-span-2 text-right">Rate%</span>
              <span className="col-span-1 text-right">Min/mo</span>
              <span className="col-span-1" />
            </div>
            {liabilities.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-1 items-center">
                <input value={l.label} onChange={(e) => updateLiability(i, 'label', e.target.value)}
                  className="col-span-3 px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 text-xs text-text-1 outline-none focus:border-brand-cyan" />
                <select value={l.category} onChange={(e) => updateLiability(i, 'category', e.target.value)}
                  className="col-span-3 px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 text-xs text-text-1 outline-none focus:border-brand-cyan">
                  {LIABILITY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input type="number" value={l.balance} step={1000} onChange={(e) => updateLiability(i, 'balance', parseFloat(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 text-xs text-text-1 outline-none focus:border-brand-cyan text-right" />
                <input type="number" value={l.rate} step={0.1} onChange={(e) => updateLiability(i, 'rate', parseFloat(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 text-xs text-text-1 outline-none focus:border-brand-cyan text-right" />
                <input type="number" value={l.minPayment} step={50} onChange={(e) => updateLiability(i, 'minPayment', parseFloat(e.target.value) || 0)}
                  className="col-span-1 px-2 py-1.5 rounded-brand border border-surface-3 bg-surface-1 text-xs text-text-1 outline-none focus:border-brand-cyan text-right" />
                <button onClick={() => removeLiability(i)} className="col-span-1 flex justify-center text-text-4 hover:text-brand-crimson transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Debt Summary */}
      {liabilities.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card variant="elevated" className="p-4 space-y-1">
            <p className="text-xs text-text-4">Min Monthly Payments</p>
            <p className="text-lg font-bold text-brand-amber">{formatCurrency(result.totalMinPayment)}</p>
          </Card>
          {result.highestRateDebt && (
            <Card variant="elevated" className="p-4 space-y-1">
              <p className="text-xs text-text-4">Highest Rate Debt</p>
              <p className="text-lg font-bold text-brand-crimson">{result.highestRateDebt.rate}%</p>
              <p className="text-xs text-text-3">{result.highestRateDebt.label} — pay first</p>
            </Card>
          )}
          {result.debtFreeIn > 0 && (
            <Card variant="elevated" className="p-4 space-y-1">
              <p className="text-xs text-text-4">Debt-Free In (min pmt)</p>
              <p className="text-lg font-bold text-text-2">
                {result.debtFreeIn > 360 ? '30+ yrs' : `${Math.floor(result.debtFreeIn / 12)}y ${result.debtFreeIn % 12}m`}
              </p>
            </Card>
          )}
        </div>
      )}

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4">
          Net worth snapshot — all values in today's dollars. Debt payoff estimate uses blended average interest rate at minimum payments.
        </p>
      </Card>
    </div>
  )
}
