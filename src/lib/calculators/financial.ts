// ─── Sprint 8 Financial Calculators ─────────────────────────────────────────
export { formatCurrency } from './mortgage'

// ─── Net Worth Tracker ────────────────────────────────────────────────────────
export interface NetWorthAsset {
  label: string
  value: number
  category: 'cash' | 'investment' | 'retirement' | 'real_estate' | 'other_asset'
}

export interface NetWorthLiability {
  label: string
  balance: number
  rate: number       // APR %
  minPayment: number // monthly
  category: 'mortgage' | 'auto' | 'student' | 'credit_card' | 'other_debt'
}

export interface NetWorthResult {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  debtToAsset: number
  liquidAssets: number
  investedAssets: number
  retirementAssets: number
  realEstateAssets: number
  assetAllocation: { label: string; amount: number; pct: number; color: string; bgClass: string }[]
  debtBreakdown: { label: string; balance: number; rate: number; minPayment: number; color: string; bgClass: string }[]
  highestRateDebt: NetWorthLiability | null
  totalMinPayment: number
  debtFreeIn: number  // months at min payment (simplified)
}

export function calcNetWorth(
  assets: NetWorthAsset[],
  liabilities: NetWorthLiability[],
): NetWorthResult {
  const totalAssets = assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0)
  const netWorth = totalAssets - totalLiabilities
  const debtToAsset = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0

  const sum = (cat: NetWorthAsset['category']) => assets.filter(a => a.category === cat).reduce((s, a) => s + a.value, 0)
  const liquidAssets = sum('cash')
  const investedAssets = sum('investment')
  const retirementAssets = sum('retirement')
  const realEstateAssets = sum('real_estate')
  const otherAssets = sum('other_asset')

  const pct = (n: number) => totalAssets > 0 ? (n / totalAssets) * 100 : 0

  const assetAllocation = [
    { label: 'Cash & Savings',   amount: liquidAssets,     pct: pct(liquidAssets),     color: '#22d3ee', bgClass: 'bg-brand-cyan'    },
    { label: 'Investments',      amount: investedAssets,   pct: pct(investedAssets),   color: '#34d399', bgClass: 'bg-brand-emerald' },
    { label: 'Retirement',       amount: retirementAssets, pct: pct(retirementAssets), color: '#fab633', bgClass: 'bg-brand-amber'   },
    { label: 'Real Estate',      amount: realEstateAssets, pct: pct(realEstateAssets), color: '#facc15', bgClass: 'bg-brand-yellow'  },
    { label: 'Other Assets',     amount: otherAssets,      pct: pct(otherAssets),      color: '#94a3b8', bgClass: 'bg-slate-400'     },
  ].filter(c => c.amount > 0)

  const debtColors: Record<NetWorthLiability['category'], { color: string; bgClass: string }> = {
    mortgage:     { color: '#f24822', bgClass: 'bg-brand-crimson' },
    auto:         { color: '#f87171', bgClass: 'bg-red-400'       },
    student:      { color: '#fb923c', bgClass: 'bg-orange-400'    },
    credit_card:  { color: '#fbbf24', bgClass: 'bg-yellow-400'    },
    other_debt:   { color: '#94a3b8', bgClass: 'bg-slate-400'     },
  }

  const debtBreakdown = liabilities.map(l => ({
    label: l.label,
    balance: l.balance,
    rate: l.rate,
    minPayment: l.minPayment,
    ...debtColors[l.category],
  }))

  const highestRateDebt = liabilities.length > 0
    ? liabilities.reduce((max, l) => l.rate > max.rate ? l : max, liabilities[0])
    : null

  const totalMinPayment = liabilities.reduce((s, l) => s + l.minPayment, 0)

  // Rough average payoff estimate at min payments (simple avg rate)
  let debtFreeIn = 0
  if (totalLiabilities > 0 && totalMinPayment > 0) {
    const avgRate = liabilities.reduce((s, l) => s + l.rate * l.balance, 0) / totalLiabilities
    const r = avgRate / 100 / 12
    if (r > 0 && totalMinPayment > totalLiabilities * r) {
      debtFreeIn = Math.ceil(
        -Math.log(1 - (totalLiabilities * r) / totalMinPayment) / Math.log(1 + r)
      )
    }
  }

  return {
    totalAssets, totalLiabilities, netWorth, debtToAsset,
    liquidAssets, investedAssets, retirementAssets, realEstateAssets,
    assetAllocation, debtBreakdown, highestRateDebt, totalMinPayment, debtFreeIn,
  }
}

// ─── Bond / CD Ladder ────────────────────────────────────────────────────────
export interface LadderRung {
  year: number
  maturityDate: string
  principal: number
  couponRate: number    // %
  annualIncome: number
  maturityValue: number
  reinvestedAt?: number // % — if reinvesting
}

export interface LadderResult {
  rungs: LadderRung[]
  totalPrincipal: number
  totalAnnualIncome: number
  blendedYield: number
  durationYears: number
  avgCoupon: number
  incomeByYear: { year: number; income: number }[]
}

export function calcBondLadder(
  principal: number,
  rungs: number,            // how many rungs (years)
  yieldCurve: number[],     // yield for each rung (% per year), length = rungs
  reinvestRate: number,     // % — rate to reinvest maturing proceeds
): LadderResult {
  const perRung = principal / rungs
  const today = new Date()

  const rungList: LadderRung[] = yieldCurve.slice(0, rungs).map((rate, i) => {
    const year = i + 1
    const maturity = new Date(today.getFullYear() + year, today.getMonth(), today.getDate())
    const annualIncome = perRung * (rate / 100)
    return {
      year,
      maturityDate: maturity.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      principal: perRung,
      couponRate: rate,
      annualIncome,
      maturityValue: perRung,
      reinvestedAt: reinvestRate,
    }
  })

  const totalPrincipal = principal
  const totalAnnualIncome = rungList.reduce((s, r) => s + r.annualIncome, 0)
  const blendedYield = totalPrincipal > 0 ? (totalAnnualIncome / totalPrincipal) * 100 : 0
  const avgCoupon = rungList.length > 0 ? rungList.reduce((s, r) => s + r.couponRate, 0) / rungList.length : 0

  // Income by year — each rung pays coupon each year it's alive
  const incomeByYear: { year: number; income: number }[] = []
  for (let y = 1; y <= rungs; y++) {
    const income = rungList.filter(r => r.year >= y).reduce((s, r) => s + r.annualIncome, 0)
    incomeByYear.push({ year: y, income })
  }

  return {
    rungs: rungList,
    totalPrincipal,
    totalAnnualIncome,
    blendedYield,
    durationYears: rungs,
    avgCoupon,
    incomeByYear,
  }
}

// ─── Home Equity Optimizer ───────────────────────────────────────────────────
export interface HomeEquityInputs {
  homeValue: number
  mortgageBalance: number
  mortgageRate: number      // % current
  mortgageMonthsLeft: number
  cashNeeded: number        // how much equity to tap
  helocRate: number         // % variable
  cashOutRate: number       // % new fixed
  cashOutTermYears: number  // new loan term
  investmentReturn: number  // % opportunity cost if not tapping
}

export interface HomeEquityScenario {
  label: string
  description: string
  monthlyPaymentDelta: number   // vs current
  totalInterestCost: number
  breakEvenMonths: number
  pros: string[]
  cons: string[]
  recommended: boolean
}

export interface HomeEquityResult {
  currentEquity: number
  ltv: number
  availableEquity: number   // up to 80% LTV
  maxHeloc: number
  maxCashOut: number
  scenarios: HomeEquityScenario[]
}

export function calcHomeEquity(inputs: HomeEquityInputs): HomeEquityResult {
  const { homeValue, mortgageBalance, mortgageRate, mortgageMonthsLeft, cashNeeded,
          helocRate, cashOutRate, cashOutTermYears } = inputs

  const currentEquity = homeValue - mortgageBalance
  const ltv = homeValue > 0 ? (mortgageBalance / homeValue) * 100 : 0
  const maxLtv80 = homeValue * 0.80
  const availableEquity = Math.max(0, maxLtv80 - mortgageBalance)
  const maxHeloc = availableEquity
  const maxCashOut = availableEquity

  const canTap = cashNeeded <= availableEquity

  // Current monthly payment
  const mr = mortgageRate / 100 / 12
  const currentPayment = mr > 0
    ? mortgageBalance * mr / (1 - Math.pow(1 + mr, -mortgageMonthsLeft))
    : mortgageBalance / mortgageMonthsLeft

  // HELOC: interest-only on drawn amount
  const helocMonthly = cashNeeded * (helocRate / 100 / 12)
  const helocInterest10Yr = helocMonthly * 12 * 10  // 10-year draw period

  // Cash-out refi: new loan = balance + cashNeeded
  const newBalance = mortgageBalance + cashNeeded
  const cr = cashOutRate / 100 / 12
  const cashOutMonths = cashOutTermYears * 12
  const cashOutPayment = cr > 0
    ? newBalance * cr / (1 - Math.pow(1 + cr, -cashOutMonths))
    : newBalance / cashOutMonths
  const cashOutTotalInterest = cashOutPayment * cashOutMonths - newBalance

  // Remaining interest on current mortgage
  const remainingInterest = currentPayment * mortgageMonthsLeft - mortgageBalance

  const cashOutExtraInterest = cashOutTotalInterest - remainingInterest
  const helocExtraCost = helocInterest10Yr

  const scenarios: HomeEquityScenario[] = [
    {
      label: 'Leave Alone',
      description: 'Keep current mortgage, fund needs from other sources or savings.',
      monthlyPaymentDelta: 0,
      totalInterestCost: 0,
      breakEvenMonths: 0,
      pros: ['No new debt', 'Preserves equity', 'No closing costs'],
      cons: ['Must find alternative funding', 'Opportunity cost of locked equity'],
      recommended: !canTap,
    },
    {
      label: 'HELOC',
      description: `Draw ${cashNeeded > 0 ? `$${cashNeeded.toLocaleString()}` : 'as needed'} at ${helocRate}% variable.`,
      monthlyPaymentDelta: helocMonthly,
      totalInterestCost: helocExtraCost,
      breakEvenMonths: 0,
      pros: ['Flexible draw schedule', 'Pay interest only on what you use', 'No closing costs on draws'],
      cons: ['Variable rate risk', 'Requires good credit', 'Can be frozen by lender'],
      recommended: canTap && cashOutRate > mortgageRate + 1,
    },
    {
      label: 'Cash-Out Refi',
      description: `New ${cashOutTermYears}-yr loan at ${cashOutRate}%. +${formatCurrency(cashNeeded)} cash.`,
      monthlyPaymentDelta: cashOutPayment - currentPayment,
      totalInterestCost: cashOutExtraInterest,
      breakEvenMonths: cashOutExtraInterest > 0 ? 0 : 0,
      pros: ['Fixed rate certainty', 'Single monthly payment', 'Potentially lower rate if rates dropped'],
      cons: ['Closing costs 2–3%', 'Resets amortization clock', 'Higher balance'],
      recommended: canTap && cashOutRate <= mortgageRate + 0.5,
    },
  ]

  return { currentEquity, ltv, availableEquity, maxHeloc, maxCashOut, scenarios }
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// ─── Estate Tax / Step-Up Basis ──────────────────────────────────────────────
export interface EstateInputs {
  totalEstate: number          // gross estate value
  mortgages: number            // deductible debts
  charitableGifts: number
  spouseTransfer: number       // marital deduction
  priorGifts: number           // lifetime taxable gifts used
  filingStatus: 'single' | 'married'
  // Asset breakdown for step-up analysis
  rothBalance: number
  traditionalIraBalance: number
  taxableAccountBalance: number
  taxableAccountBasis: number  // cost basis in taxable accounts
  realEstateFMV: number
  realEstateBasis: number
}

export interface EstateResult {
  grossEstate: number
  adjustedGrossEstate: number
  taxableEstate: number
  exemptionUsed: number
  exemptionRemaining: number
  estateTax: number
  effectiveRate: number
  // Inheritance analysis
  rothToHeir: number           // tax-free
  traditionalIraToHeir: number // fully taxable at heir's rate
  taxableStepUpGain: number    // embedded gain eliminated by step-up
  taxableStepUpSavings: number // at 20% LTCG + 3.8% NIIT
  realEstateStepUpGain: number
  realEstateStepUpSavings: number
  inheritanceStrategies: { label: string; value: string; note: string }[]
}

const ESTATE_EXEMPTION_2024 = 13_610_000  // per person
const ESTATE_TAX_RATE = 0.40

export function calcEstate(inputs: EstateInputs): EstateResult {
  const {
    totalEstate, mortgages, charitableGifts, spouseTransfer, priorGifts,
    filingStatus, rothBalance, traditionalIraBalance,
    taxableAccountBalance, taxableAccountBasis, realEstateFMV, realEstateBasis,
  } = inputs

  const exemption = filingStatus === 'married' ? ESTATE_EXEMPTION_2024 * 2 : ESTATE_EXEMPTION_2024
  const adjustedGrossEstate = Math.max(0, totalEstate - mortgages)
  const taxableEstate = Math.max(0, adjustedGrossEstate - charitableGifts - spouseTransfer)
  const exemptionUsed = Math.min(exemption, taxableEstate + priorGifts)
  const exemptionRemaining = Math.max(0, exemption - priorGifts - taxableEstate)
  const taxableAfterExemption = Math.max(0, taxableEstate - Math.max(0, exemption - priorGifts))
  const estateTax = taxableAfterExemption * ESTATE_TAX_RATE
  const effectiveRate = adjustedGrossEstate > 0 ? (estateTax / adjustedGrossEstate) * 100 : 0

  // Step-up analysis
  const LTCG_PLUS_NIIT = 0.238  // 20% + 3.8%
  const taxableStepUpGain = Math.max(0, taxableAccountBalance - taxableAccountBasis)
  const taxableStepUpSavings = taxableStepUpGain * LTCG_PLUS_NIIT
  const realEstateStepUpGain = Math.max(0, realEstateFMV - realEstateBasis)
  const realEstateStepUpSavings = realEstateStepUpGain * LTCG_PLUS_NIIT

  const strategies = [
    {
      label: 'Leave Roth to Youngest Heir',
      value: formatCurrency(rothBalance),
      note: 'Tax-free growth for 10 more years under SECURE 2.0 10-year rule.',
    },
    {
      label: 'Step-Up Savings (Taxable Accounts)',
      value: formatCurrency(taxableStepUpSavings),
      note: `$${taxableStepUpGain.toLocaleString()} of embedded gain eliminated at death. Heirs inherit at FMV basis.`,
    },
    {
      label: 'Step-Up Savings (Real Estate)',
      value: formatCurrency(realEstateStepUpSavings),
      note: `$${realEstateStepUpGain.toLocaleString()} of embedded gain eliminated at death.`,
    },
    {
      label: 'Annual Gift Exclusion',
      value: '$18,000/recipient',
      note: '2024 annual exclusion. Removes assets from estate with no gift tax filing required.',
    },
    {
      label: '529 Superfunding',
      value: '$90,000/child',
      note: '5-year front-loading of annual exclusion. Tax-free education funding.',
    },
  ]

  return {
    grossEstate: totalEstate,
    adjustedGrossEstate,
    taxableEstate,
    exemptionUsed,
    exemptionRemaining,
    estateTax,
    effectiveRate,
    rothToHeir: rothBalance,
    traditionalIraToHeir: traditionalIraBalance,
    taxableStepUpGain,
    taxableStepUpSavings,
    realEstateStepUpGain,
    realEstateStepUpSavings,
    inheritanceStrategies: strategies,
  }
}
