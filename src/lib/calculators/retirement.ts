// ─── 2024 Federal Tax Brackets ──────────────────────────────────────────────
export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh'

export const FEDERAL_BRACKETS: Record<FilingStatus, { rate: number; min: number; max: number }[]> = {
  single: [
    { rate: 0.10, min: 0,       max: 11600   },
    { rate: 0.12, min: 11600,   max: 47150   },
    { rate: 0.22, min: 47150,   max: 100525  },
    { rate: 0.24, min: 100525,  max: 191950  },
    { rate: 0.32, min: 191950,  max: 243725  },
    { rate: 0.35, min: 243725,  max: 609350  },
    { rate: 0.37, min: 609350,  max: Infinity },
  ],
  mfj: [
    { rate: 0.10, min: 0,       max: 23200   },
    { rate: 0.12, min: 23200,   max: 94300   },
    { rate: 0.22, min: 94300,   max: 201050  },
    { rate: 0.24, min: 201050,  max: 383900  },
    { rate: 0.32, min: 383900,  max: 487450  },
    { rate: 0.35, min: 487450,  max: 731200  },
    { rate: 0.37, min: 731200,  max: Infinity },
  ],
  mfs: [
    { rate: 0.10, min: 0,       max: 11600   },
    { rate: 0.12, min: 11600,   max: 47150   },
    { rate: 0.22, min: 47150,   max: 100525  },
    { rate: 0.24, min: 100525,  max: 191950  },
    { rate: 0.32, min: 191950,  max: 243725  },
    { rate: 0.35, min: 243725,  max: 365600  },
    { rate: 0.37, min: 365600,  max: Infinity },
  ],
  hoh: [
    { rate: 0.10, min: 0,       max: 16550   },
    { rate: 0.12, min: 16550,   max: 63100   },
    { rate: 0.22, min: 63100,   max: 100500  },
    { rate: 0.24, min: 100500,  max: 191950  },
    { rate: 0.32, min: 191950,  max: 243700  },
    { rate: 0.35, min: 243700,  max: 609350  },
    { rate: 0.37, min: 609350,  max: Infinity },
  ],
}

// Standard deductions 2024
export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  mfj:    29200,
  mfs:    14600,
  hoh:    21900,
}

// State income tax rates (flat or approximate top marginal, 2024)
export const STATE_INCOME_TAX: Record<string, number> = {
  AL: 5.0,  AK: 0,    AZ: 2.5,  AR: 4.4,  CA: 13.3, CO: 4.4,  CT: 6.99,
  DE: 6.6,  FL: 0,    GA: 5.49, HI: 11.0, ID: 5.8,  IL: 4.95, IN: 3.15,
  IA: 6.0,  KS: 5.7,  KY: 4.5,  LA: 4.25, ME: 7.15, MD: 5.75, MA: 5.0,
  MI: 4.25, MN: 9.85, MS: 5.0,  MO: 4.95, MT: 6.75, NE: 6.64, NV: 0,
  NH: 0,    NJ: 10.75,NM: 5.9,  NY: 10.9, NC: 4.75, ND: 2.5,  OH: 3.99,
  OK: 4.75, OR: 9.9,  PA: 3.07, RI: 5.99, SC: 6.5,  SD: 0,    TN: 0,
  TX: 0,    UT: 4.65, VT: 8.75, VA: 5.75, WA: 0,    WV: 6.5,  WI: 7.65,
  WY: 0,    DC: 10.75,
}

export interface TaxResult {
  grossIncome: number
  adjustedGrossIncome: number
  taxableIncome: number
  federalTax: number
  stateTax: number
  totalTax: number
  effectiveFederalRate: number
  effectiveStateRate: number
  effectiveTotalRate: number
  marginalRate: number
  brackets: { rate: number; min: number; max: number; taxOwed: number; filled: boolean; partial: boolean; roomLeft: number }[]
  rothConversionRoom: number   // dollars until next bracket
  capitalGainsRate: number
}

export function calcTax(
  grossIncome: number,
  filingStatus: FilingStatus,
  state: string,
  useStandardDeduction = true,
  additionalDeductions = 0,
): TaxResult {
  const deduction = useStandardDeduction
    ? STANDARD_DEDUCTION[filingStatus]
    : additionalDeductions

  const taxableIncome = Math.max(0, grossIncome - deduction)
  const brackets = FEDERAL_BRACKETS[filingStatus]

  let federalTax = 0
  let marginalRate = 0.10
  const bracketDetails = brackets.map((b) => {
    const bracketIncome = Math.min(Math.max(0, taxableIncome - b.min), b.max - b.min)
    const taxOwed = bracketIncome * b.rate
    federalTax += taxOwed
    if (bracketIncome > 0) marginalRate = b.rate
    return {
      ...b,
      taxOwed,
      filled: taxableIncome >= b.max,
      partial: taxableIncome > b.min && taxableIncome < b.max,
      roomLeft: Math.max(0, Math.min(b.max, Infinity) - taxableIncome),
    }
  })

  const stateTaxRate = STATE_INCOME_TAX[state] ?? 0
  const stateTax = taxableIncome * (stateTaxRate / 100)
  const totalTax = federalTax + stateTax

  // Current bracket room
  const currentBracket = bracketDetails.find((b) => b.partial)
  const rothConversionRoom = currentBracket
    ? Math.min(currentBracket.roomLeft, 100000)
    : 0

  // Capital gains rate (simplified)
  const capitalGainsRate =
    marginalRate <= 0.12 ? 0 :
    marginalRate <= 0.35 ? 0.15 : 0.20

  return {
    grossIncome,
    adjustedGrossIncome: grossIncome,
    taxableIncome,
    federalTax,
    stateTax,
    totalTax,
    effectiveFederalRate: grossIncome > 0 ? (federalTax / grossIncome) * 100 : 0,
    effectiveStateRate: grossIncome > 0 ? (stateTax / grossIncome) * 100 : 0,
    effectiveTotalRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
    marginalRate,
    brackets: bracketDetails,
    rothConversionRoom,
    capitalGainsRate,
  }
}

// ─── Social Security ─────────────────────────────────────────────────────────
export interface SSInputs {
  fraMonthlyBenefit: number   // PIA — benefit at full retirement age
  currentAge: number
  lifeExpectancy: number      // default 85
}

export interface SSClaimOption {
  claimAge: number
  label: string
  monthlyBenefit: number
  annualBenefit: number
  lifetimeTotal: number
  breakEvenVsPrevious: number | null  // age at which this option surpasses previous
  yearsOfPayments: number
  reduction: number   // % vs FRA (negative = reduction, positive = increase)
}

export interface SSResult {
  options: SSClaimOption[]
  recommended: number  // claim age
  recommendedReason: string
}

export function calcSocialSecurity(inputs: SSInputs): SSResult {
  const { fraMonthlyBenefit, currentAge, lifeExpectancy } = inputs

  // Adjustment factors (FRA = 67 for those born 1960+)
  const FRA = 67
  const adjustments: Record<number, number> = {
    62: 0.70,    // 30% reduction
    63: 0.75,
    64: 0.80,
    65: 0.867,
    66: 0.933,
    67: 1.00,    // FRA — full benefit
    68: 1.08,
    69: 1.16,
    70: 1.24,    // max — 8%/yr delayed credits
  }

  const claimAges = [62, 64, 67, 70]
  const options: SSClaimOption[] = claimAges.map((age, i) => {
    const factor = adjustments[age] ?? 1.0
    const monthly = fraMonthlyBenefit * factor
    const annual = monthly * 12
    const yearsOfPayments = Math.max(0, lifeExpectancy - age)
    const lifetime = annual * yearsOfPayments
    const reduction = (factor - 1) * 100

    // Breakeven vs previous option
    let breakEvenVsPrevious: number | null = null
    if (i > 0) {
      const prev = options[i - 1]
      const monthlyDiff = monthly - prev.monthlyBenefit
      if (monthlyDiff > 0) {
        // How long until cumulative benefit exceeds previous?
        const prevCumAtAge = (age - claimAges[i - 1]) * 12 * prev.monthlyBenefit
        const monthsToBreakEven = prevCumAtAge / monthlyDiff
        breakEvenVsPrevious = age + monthsToBreakEven / 12
      }
    }

    return { claimAge: age, label: age === 67 ? 'Full Retirement Age' : age === 62 ? 'Earliest' : age === 70 ? 'Maximum Benefit' : `Age ${age}`, monthly, annualBenefit: annual, monthlyBenefit: monthly, lifetimeTotal: lifetime, breakEvenVsPrevious, yearsOfPayments, reduction }
  })

  // Recommendation logic
  let recommended = 67
  let recommendedReason = 'FRA provides full benefit with no reduction.'

  if (lifeExpectancy >= 83) {
    recommended = 70
    recommendedReason = `With a ${lifeExpectancy}-year life expectancy, delaying to 70 maximizes lifetime benefits by ${Math.round((options[3].lifetimeTotal - options[2].lifetimeTotal) / 1000)}K.`
  } else if (lifeExpectancy <= 75) {
    recommended = 62
    recommendedReason = `With a ${lifeExpectancy}-year life expectancy, claiming at 62 captures more total payments.`
  } else if (currentAge >= 65) {
    recommended = 67
    recommendedReason = 'Claiming at FRA avoids early reduction without a long delay.'
  }

  return { options, recommended, recommendedReason }
}

// ─── Withdrawal Sequencing ──────────────────────────────────────────────────
export interface WithdrawalInputs {
  currentAge: number
  retirementAge: number
  taxableBalance: number       // brokerage/savings
  taxDeferredBalance: number   // 401k, Traditional IRA
  rothBalance: number          // Roth IRA/401k
  annualRetirementSpend: number
  expectedReturn: number       // % annual growth
  filingStatus: FilingStatus
  state: string
}

export interface WithdrawalYear {
  age: number
  taxableBalance: number
  taxDeferredBalance: number
  rothBalance: number
  totalBalance: number
  withdrawal: number
  source: 'taxable' | 'tax-deferred' | 'roth' | 'mixed'
  isRMDYear: boolean
  rmdAmount: number
  estimatedTax: number
}

export interface WithdrawalResult {
  years: WithdrawalYear[]
  rmdStartAge: number
  firstRMDAmount: number
  totalTaxPaid: number
  depletionAge: number | null
  rothPreservationYears: number
  preRMDConversionOpportunity: number  // annual Roth conversion suggested
  summary: string
}

export function calcWithdrawalSequence(inputs: WithdrawalInputs): WithdrawalResult {
  const {
    currentAge, retirementAge, annualRetirementSpend,
    expectedReturn, filingStatus, state,
  } = inputs

  const RMD_AGE = 73
  const r = expectedReturn / 100

  // RMD divisors (simplified Uniform Lifetime Table)
  const RMD_DIVISORS: Record<number, number> = {
    73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
    79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8,
    85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2,
  }

  let taxable = inputs.taxableBalance
  let taxDeferred = inputs.taxDeferredBalance
  let roth = inputs.rothBalance
  let totalTaxPaid = 0
  const years: WithdrawalYear[] = []

  // Grow balances from current to retirement
  const yearsToRetirement = Math.max(0, retirementAge - currentAge)
  taxable *= Math.pow(1 + r, yearsToRetirement)
  taxDeferred *= Math.pow(1 + r, yearsToRetirement)
  roth *= Math.pow(1 + r, yearsToRetirement)

  let depletionAge: number | null = null

  for (let age = retirementAge; age <= 100; age++) {
    const totalBalance = taxable + taxDeferred + roth
    if (totalBalance <= 0 && depletionAge === null) { depletionAge = age; break }

    const isRMDYear = age >= RMD_AGE
    const rmdDivisor = RMD_DIVISORS[age] ?? 10
    const rmdAmount = isRMDYear ? Math.max(0, taxDeferred / rmdDivisor) : 0

    // Withdrawal sequence:
    // 1. Meet RMD from tax-deferred first
    // 2. Pull remaining need from taxable
    // 3. Only tap tax-deferred if taxable is depleted
    // 4. Preserve Roth for last
    let withdrawal = annualRetirementSpend
    let source: WithdrawalYear['source'] = 'taxable'
    let taxableWithdrawal = 0
    let taxDeferredWithdrawal = rmdAmount  // always take RMD
    let rothWithdrawal = 0

    const remainingNeed = withdrawal - rmdAmount
    if (remainingNeed > 0) {
      if (taxable >= remainingNeed) {
        taxableWithdrawal = remainingNeed
        source = isRMDYear ? 'mixed' : 'taxable'
      } else {
        taxableWithdrawal = taxable
        const stillNeeded = remainingNeed - taxable
        if (taxDeferred - rmdAmount >= stillNeeded) {
          taxDeferredWithdrawal += stillNeeded
          source = 'tax-deferred'
        } else {
          taxDeferredWithdrawal = taxDeferred
          const fromRoth = stillNeeded - (taxDeferred - rmdAmount)
          rothWithdrawal = Math.min(roth, fromRoth)
          source = 'roth'
        }
      }
    }

    // Estimate tax on ordinary income (RMD + tax-deferred withdrawals)
    const ordinaryIncome = taxDeferredWithdrawal
    const taxResult = calcTax(ordinaryIncome, filingStatus, state)
    const estimatedTax = taxResult.federalTax + taxResult.stateTax
    totalTaxPaid += estimatedTax

    taxable = Math.max(0, (taxable - taxableWithdrawal) * (1 + r))
    taxDeferred = Math.max(0, (taxDeferred - taxDeferredWithdrawal) * (1 + r))
    roth = Math.max(0, (roth - rothWithdrawal) * (1 + r))

    years.push({
      age, taxableBalance: taxable, taxDeferredBalance: taxDeferred, rothBalance: roth,
      totalBalance: taxable + taxDeferred + roth,
      withdrawal, source, isRMDYear, rmdAmount, estimatedTax,
    })
  }

  const balanceAtRMD = inputs.taxDeferredBalance * Math.pow(1 + r, Math.max(0, RMD_AGE - currentAge))
  const firstRMDAmount = balanceAtRMD / (RMD_DIVISORS[RMD_AGE] ?? 26.5)

  // Pre-RMD conversion: how much to convert annually to reduce RMD burden
  const yearsUntilRMD = Math.max(0, RMD_AGE - retirementAge)
  const preRMDConversion = yearsUntilRMD > 0
    ? Math.min(50000, firstRMDAmount * 0.3 / yearsUntilRMD * 3)
    : 0

  const rothPreservationYears = years.filter((y) => y.source !== 'roth').length

  return {
    years: years.slice(0, 30),
    rmdStartAge: RMD_AGE,
    firstRMDAmount,
    totalTaxPaid,
    depletionAge,
    rothPreservationYears,
    preRMDConversionOpportunity: preRMDConversion,
    summary: depletionAge
      ? `Portfolio depletes at age ${depletionAge}. Consider reducing spending or increasing savings.`
      : `Portfolio sustains through age ${Math.min(retirementAge + years.length, 100)} with optimal withdrawal sequence.`,
  }
}

export { formatCurrency } from './mortgage'
