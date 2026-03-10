'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcEstate, formatCurrency } from '@/lib/calculators/financial'
import { Landmark, ChevronLeft, Info, TrendingDown } from 'lucide-react'
import Link from 'next/link'

function NumInput({ label, value, onChange, prefix = '', suffix = '', step = 10000, hint }: any) {
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

export default function EstateTaxPage() {
  const [totalEstate, setTotalEstate]           = useState(5000000)
  const [mortgages, setMortgages]               = useState(300000)
  const [charitableGifts, setCharitableGifts]   = useState(0)
  const [spouseTransfer, setSpouseTransfer]     = useState(0)
  const [priorGifts, setPriorGifts]             = useState(0)
  const [filing, setFiling]                     = useState<'single' | 'married'>('married')
  const [rothBalance, setRothBalance]           = useState(500000)
  const [traditionalIra, setTraditionalIra]     = useState(1200000)
  const [taxableBalance, setTaxableBalance]     = useState(800000)
  const [taxableBasis, setTaxableBasis]         = useState(400000)
  const [realEstateFMV, setRealEstateFMV]       = useState(1500000)
  const [realEstateBasis, setRealEstateBasis]   = useState(400000)

  const result = useMemo(() => calcEstate({
    totalEstate, mortgages, charitableGifts, spouseTransfer, priorGifts,
    filingStatus: filing,
    rothBalance, traditionalIraBalance: traditionalIra,
    taxableAccountBalance: taxableBalance, taxableAccountBasis: taxableBasis,
    realEstateFMV, realEstateBasis,
  }), [totalEstate, mortgages, charitableGifts, spouseTransfer, priorGifts, filing,
       rothBalance, traditionalIra, taxableBalance, taxableBasis, realEstateFMV, realEstateBasis])

  const EXEMPTION = filing === 'married' ? 27220000 : 13610000
  const exemptionPct = Math.min(100, (result.taxableEstate / EXEMPTION) * 100)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools/financial" className="text-text-4 hover:text-text-2 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-brand bg-brand-crimson/10 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-brand-crimson" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Estate Tax & Step-Up Basis</h1>
          <p className="text-text-3 text-sm">2024 exemptions, inheritance strategies, and step-up savings</p>
        </div>
      </div>

      {/* Inputs */}
      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Estate Overview</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-2">Filing / Marital Status</label>
            <select value={filing} onChange={(e) => setFiling(e.target.value as 'single' | 'married')}
              className="w-full px-3 py-2 rounded-brand border border-surface-3 bg-surface-1 text-sm text-text-1 outline-none focus:border-brand-cyan">
              <option value="single">Single</option>
              <option value="married">Married (DSUE portability)</option>
            </select>
          </div>
          <NumInput label="Gross Estate Value" value={totalEstate} onChange={setTotalEstate} prefix="$" />
          <NumInput label="Mortgages & Debts" value={mortgages} onChange={setMortgages} prefix="$" />
          <NumInput label="Charitable Bequests" value={charitableGifts} onChange={setCharitableGifts} prefix="$" />
          <NumInput label="Marital Deduction" value={spouseTransfer} onChange={setSpouseTransfer} prefix="$" hint="Transfer to surviving spouse" />
          <NumInput label="Prior Taxable Gifts" value={priorGifts} onChange={setPriorGifts} prefix="$" hint="Lifetime gifts above annual exclusion" />
        </div>
      </Card>

      {/* Estate Tax Result */}
      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Estate Tax Calculation (2024)</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            {[
              { label: 'Gross Estate', value: result.grossEstate, color: 'text-text-1' },
              { label: '− Debts', value: -mortgages, color: 'text-brand-crimson' },
              { label: '− Charitable Gifts', value: -charitableGifts, color: 'text-brand-emerald' },
              { label: '− Marital Deduction', value: -spouseTransfer, color: 'text-brand-emerald' },
              { label: '= Taxable Estate', value: result.taxableEstate, color: 'text-text-1', bold: true },
              { label: '− Exemption Used', value: -Math.min(EXEMPTION - priorGifts, result.taxableEstate), color: 'text-brand-cyan' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center text-sm">
                <span className="text-text-3">{row.label}</span>
                <span className={`font-medium ${row.color} ${row.bold ? 'font-bold' : ''}`}>
                  {row.value < 0 ? `(${formatCurrency(Math.abs(row.value))})` : formatCurrency(row.value)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm border-t border-surface-3 pt-2">
              <span className="font-semibold text-text-1">Estate Tax Due</span>
              <span className={`font-bold text-lg ${result.estateTax > 0 ? 'text-brand-crimson' : 'text-brand-emerald'}`}>
                {result.estateTax > 0 ? formatCurrency(result.estateTax) : 'None'}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-4">Exemption Used</p>
              <ProgressBar value={result.taxableEstate + priorGifts} max={EXEMPTION} colorClass="bg-brand-amber" />
              <div className="flex justify-between text-xs text-text-4 mt-1">
                <span>{formatCurrency(result.taxableEstate + priorGifts)} used</span>
                <span>{formatCurrency(EXEMPTION)} total</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span className="text-text-3">Exemption Remaining</span><span className="text-brand-emerald font-medium">{formatCurrency(result.exemptionRemaining)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-3">Effective Rate</span><span className="text-text-1 font-medium">{result.effectiveRate.toFixed(1)}%</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-3">2024 Exemption</span><span className="text-text-3">{formatCurrency(EXEMPTION)}</span></div>
              {result.exemptionRemaining > 0 && (
                <Badge variant="cyan" size="sm">Below exemption threshold</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Asset Breakdown for Step-Up */}
      <Card variant="elevated" className="p-5 space-y-4">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Asset Breakdown (Step-Up Analysis)</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput label="Roth IRA Balance" value={rothBalance} onChange={setRothBalance} prefix="$" hint="Tax-free to heirs (10-yr rule)" />
          <NumInput label="Traditional IRA / 401(k)" value={traditionalIra} onChange={setTraditionalIra} prefix="$" hint="Fully taxable when inherited" />
          <NumInput label="Taxable Account FMV" value={taxableBalance} onChange={setTaxableBalance} prefix="$" />
          <NumInput label="Taxable Account Basis" value={taxableBasis} onChange={setTaxableBasis} prefix="$" hint="Original cost — gains eliminated at death" />
          <NumInput label="Real Estate FMV" value={realEstateFMV} onChange={setRealEstateFMV} prefix="$" />
          <NumInput label="Real Estate Basis" value={realEstateBasis} onChange={setRealEstateBasis} prefix="$" />
        </div>
      </Card>

      {/* Step-Up Benefit */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="elevated" className="p-4 border-brand-emerald/30 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-brand-emerald" />
            <p className="text-xs font-semibold text-text-1">Taxable Account Step-Up</p>
          </div>
          <p className="text-xs text-text-3">Embedded gain eliminated</p>
          <p className="text-xl font-bold text-brand-emerald">{formatCurrency(result.taxableStepUpSavings)}</p>
          <p className="text-xs text-text-4">{formatCurrency(result.taxableStepUpGain)} gain × 23.8%</p>
        </Card>
        <Card variant="elevated" className="p-4 border-brand-emerald/30 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-brand-emerald" />
            <p className="text-xs font-semibold text-text-1">Real Estate Step-Up</p>
          </div>
          <p className="text-xs text-text-3">Embedded gain eliminated</p>
          <p className="text-xl font-bold text-brand-emerald">{formatCurrency(result.realEstateStepUpSavings)}</p>
          <p className="text-xs text-text-4">{formatCurrency(result.realEstateStepUpGain)} gain × 23.8%</p>
        </Card>
      </div>

      {/* Inheritance Strategies */}
      <Card variant="elevated" className="p-5 space-y-3">
        <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Inheritance Strategies</p>
        <div className="space-y-3">
          {result.inheritanceStrategies.map((s) => (
            <div key={s.label} className="flex items-start gap-3 p-3 rounded-brand bg-surface-1">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-1">{s.label}</p>
                <p className="text-xs text-text-3 mt-0.5">{s.note}</p>
              </div>
              <Badge variant="cyan" size="sm">{s.value}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          2024 federal estate tax exemption: $13.61M/person ($27.22M married with portability). Exemption sunsets to ~$7M in 2026 without congressional action.
          Step-up basis eliminates unrealized capital gains at death. Consult an estate attorney and CPA for personalized planning.
        </p>
      </Card>
    </div>
  )
}
