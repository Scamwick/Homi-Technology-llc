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

// ─── Roth Conversion Optimizer ───────────────────────────────────────────────
export interface RothConversionInputs {
  currentAge: number
  retirementAge: number
  taxDeferredBalance: number
  otherIncome: number        // SS, pension, part-time during conversion years
  targetBracketRate: number  // fill up to this marginal rate (e.g. 0.22)
  filingStatus: FilingStatus
  state: string
  expectedReturn: number     // %
}

export interface RothConversionYear {
  age: number
  startBalance: number
  conversionAmount: number
  taxCost: number
  endBalance: number
  cumulativeConverted: number
  cumulativeTax: number
}

export interface RothConversionResult {
  years: RothConversionYear[]
  totalConverted: number
  totalTaxCost: number
  conversionWindow: number
  projectedFirstRMDWithout: number
  projectedFirstRMDWith: number
  rmdReductionPct: number
  annualConversionTarget: number
  effectiveRateOnConversions: number
}

export function calcRothConversion(inputs: RothConversionInputs): RothConversionResult {
  const { currentAge, retirementAge, otherIncome, targetBracketRate, filingStatus, state, expectedReturn } = inputs
  const RMD_AGE = 73
  const r = expectedReturn / 100

  const bracketList = FEDERAL_BRACKETS[filingStatus]
  const targetBracket = bracketList.find(b => b.rate === targetBracketRate) ?? bracketList[2]
  const deduction = STANDARD_DEDUCTION[filingStatus]
  const grossCeiling = targetBracket.max + deduction

  let balance = inputs.taxDeferredBalance * Math.pow(1 + r, Math.max(0, retirementAge - currentAge))
  const RMD_DIV: Record<number, number> = { 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0 }
  const projectedFirstRMDWithout = balance * Math.pow(1 + r, Math.max(0, RMD_AGE - retirementAge)) / (RMD_DIV[73] ?? 26.5)

  const conversionWindow = Math.max(0, RMD_AGE - retirementAge)
  const years: RothConversionYear[] = []
  let cumConverted = 0
  let cumTax = 0

  for (let age = retirementAge; age < Math.min(RMD_AGE, retirementAge + 25); age++) {
    if (balance <= 0) break
    const startBalance = balance
    const conversionRoom = Math.max(0, grossCeiling - otherIncome)
    const conversionAmount = Math.min(balance, conversionRoom)

    const taxFull = calcTax(otherIncome + conversionAmount, filingStatus, state)
    const taxBase = calcTax(otherIncome, filingStatus, state)
    const taxCost = taxFull.totalTax - taxBase.totalTax

    cumConverted += conversionAmount
    cumTax += taxCost
    balance = Math.max(0, (balance - conversionAmount) * (1 + r))

    years.push({ age, startBalance, conversionAmount, taxCost, endBalance: balance, cumulativeConverted: cumConverted, cumulativeTax: cumTax })
  }

  const projectedFirstRMDWith = balance * Math.pow(1 + r, Math.max(0, RMD_AGE - (retirementAge + years.length))) / (RMD_DIV[73] ?? 26.5)
  const rmdReductionPct = projectedFirstRMDWithout > 0
    ? Math.max(0, (1 - projectedFirstRMDWith / projectedFirstRMDWithout) * 100)
    : 0

  return {
    years,
    totalConverted: cumConverted,
    totalTaxCost: cumTax,
    conversionWindow,
    projectedFirstRMDWithout,
    projectedFirstRMDWith,
    rmdReductionPct,
    annualConversionTarget: years.length > 0 ? cumConverted / years.length : 0,
    effectiveRateOnConversions: cumConverted > 0 ? (cumTax / cumConverted) * 100 : 0,
  }
}

// ─── Coast FIRE Calculator ───────────────────────────────────────────────────
export interface CoastFIREInputs {
  currentAge: number
  retirementAge: number
  currentSavings: number
  annualRetirementSpend: number
  expectedReturn: number   // %
  withdrawalRate: number   // % default 4
}

export interface CoastFIREResult {
  fiNumber: number
  leanFINumber: number
  fatFINumber: number
  coastNumber: number
  isCoasting: boolean
  gap: number
  projectedAtRetirement: number
  fireAge: number
  scenarios: { returnRate: number; coastNumber: number; isCoasting: boolean; gap: number }[]
}

export function calcCoastFIRE(inputs: CoastFIREInputs): CoastFIREResult {
  const { currentAge, retirementAge, currentSavings, annualRetirementSpend, expectedReturn, withdrawalRate } = inputs
  const r = expectedReturn / 100
  const years = Math.max(1, retirementAge - currentAge)

  const fiNumber = annualRetirementSpend / (withdrawalRate / 100)
  const leanFINumber = annualRetirementSpend / 0.05
  const fatFINumber = annualRetirementSpend / 0.03
  const coastNumber = fiNumber / Math.pow(1 + r, years)
  const gap = coastNumber - currentSavings
  const isCoasting = currentSavings >= coastNumber
  const projectedAtRetirement = currentSavings * Math.pow(1 + r, years)

  let fireAge = retirementAge + 30
  if (currentSavings > 0 && r > 0) {
    const yearsToFI = Math.log(fiNumber / currentSavings) / Math.log(1 + r)
    if (yearsToFI > 0) fireAge = Math.ceil(currentAge + yearsToFI)
  }

  const scenarios = [5, 6, 7, 8, 9, 10].map((returnRate) => {
    const rr = returnRate / 100
    const cn = fiNumber / Math.pow(1 + rr, years)
    return { returnRate, coastNumber: cn, isCoasting: currentSavings >= cn, gap: cn - currentSavings }
  })

  return { fiNumber, leanFINumber, fatFINumber, coastNumber, isCoasting, gap, projectedAtRetirement, fireAge, scenarios }
}

// ─── Monte Carlo Simulation ──────────────────────────────────────────────────
export interface MonteCarloInputs {
  currentBalance: number
  monthlyContribution: number
  currentAge: number
  retirementAge: number
  retirementAnnualSpend: number
  meanReturn: number   // % annual
  stdDev: number       // % volatility
  simCount?: number    // default 500
}

export interface MonteCarloResult {
  chartData: { year: number; age: number; p10: number; p25: number; p50: number; p75: number; p90: number }[]
  survivalRate: number
  successRate: number
  riskOfRuin: number
  medianAtRetirement: number
  medianAtEnd: number
  yearsSimulated: number
  retirementYear: number
}

function gaussRandom(mean: number, std: number): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

export function calcMonteCarlo(inputs: MonteCarloInputs): MonteCarloResult {
  const { currentBalance, monthlyContribution, currentAge, retirementAge, retirementAnnualSpend, meanReturn, stdDev, simCount = 500 } = inputs
  const mean = meanReturn / 100
  const std = stdDev / 100
  const endAge = 95
  const totalYears = endAge - currentAge
  const retirementYears = retirementAge - currentAge

  const allPaths: number[][] = []
  for (let sim = 0; sim < simCount; sim++) {
    let balance = currentBalance
    const path: number[] = [balance]
    for (let year = 0; year < totalYears; year++) {
      const ret = gaussRandom(mean, std)
      if (year >= retirementYears) {
        balance = Math.max(0, balance * (1 + ret) - retirementAnnualSpend)
      } else {
        balance = balance * (1 + ret) + monthlyContribution * 12
      }
      path.push(balance)
    }
    allPaths.push(path)
  }

  const chartData = Array.from({ length: totalYears + 1 }, (_, i) => {
    const vals = allPaths.map(p => p[i]).sort((a, b) => a - b)
    const pick = (pct: number) => vals[Math.floor(vals.length * pct)] ?? 0
    return { year: i, age: currentAge + i, p10: pick(0.10), p25: pick(0.25), p50: pick(0.50), p75: pick(0.75), p90: pick(0.90) }
  })

  const survivalRate = (allPaths.filter(p => p[totalYears] > 0).length / simCount) * 100
  const retirementTarget = retirementAnnualSpend / 0.04
  const successRate = (allPaths.filter(p => p[retirementYears] >= retirementTarget).length / simCount) * 100
  const retirementBalances = allPaths.map(p => p[retirementYears]).sort((a, b) => a - b)
  const endBalances = allPaths.map(p => p[totalYears]).sort((a, b) => a - b)

  return {
    chartData,
    survivalRate,
    successRate,
    riskOfRuin: 100 - survivalRate,
    medianAtRetirement: retirementBalances[Math.floor(retirementBalances.length / 2)] ?? 0,
    medianAtEnd: endBalances[Math.floor(endBalances.length / 2)] ?? 0,
    yearsSimulated: totalYears,
    retirementYear: retirementYears,
  }
}

// ─── Cash Flow Diagram ───────────────────────────────────────────────────────
export interface CashFlowInputs {
  grossIncome: number
  filingStatus: FilingStatus
  state: string
  housing: number
  transportation: number
  food: number
  healthcare: number
  entertainment: number
  otherExpenses: number
  contribution401k: number
  rothContribution: number
  taxableInvesting: number
  emergencyFund: number
}

export interface CashFlowCategory {
  label: string
  amount: number
  pct: number
  color: string
  bgClass: string
  textClass: string
}

export interface CashFlowResult {
  grossIncome: number
  federalTax: number
  stateTax: number
  ficaTax: number
  totalTax: number
  netIncome: number
  totalSavings: number
  totalExpenses: number
  unallocated: number
  savingsRate: number
  taxCategories: CashFlowCategory[]
  expenseCategories: CashFlowCategory[]
  savingsCategories: CashFlowCategory[]
}

export function calcCashFlow(inputs: CashFlowInputs): CashFlowResult {
  const { grossIncome, filingStatus, state, housing, transportation, food, healthcare, entertainment, otherExpenses, contribution401k, rothContribution, taxableInvesting, emergencyFund } = inputs
  const taxResult = calcTax(grossIncome, filingStatus, state)
  const ficaTax = Math.min(grossIncome, 168600) * 0.0765
  const { federalTax, stateTax } = taxResult
  const totalTax = federalTax + stateTax + ficaTax
  const netIncome = Math.max(0, grossIncome - totalTax)
  const totalExpenses = housing + transportation + food + healthcare + entertainment + otherExpenses
  const totalSavings = contribution401k + rothContribution + taxableInvesting + emergencyFund
  const unallocated = Math.max(0, netIncome - totalExpenses - totalSavings)
  const savingsRate = grossIncome > 0 ? (totalSavings / grossIncome) * 100 : 0
  const pct = (n: number) => grossIncome > 0 ? (n / grossIncome) * 100 : 0

  return {
    grossIncome, federalTax, stateTax, ficaTax, totalTax,
    netIncome, totalSavings, totalExpenses, unallocated, savingsRate,
    taxCategories: [
      { label: 'Federal Tax',       amount: federalTax, pct: pct(federalTax), color: '#f24822', bgClass: 'bg-brand-crimson', textClass: 'text-brand-crimson' },
      { label: 'State Tax',         amount: stateTax,   pct: pct(stateTax),   color: '#f87171', bgClass: 'bg-red-400',       textClass: 'text-red-400'       },
      { label: 'FICA',              amount: ficaTax,    pct: pct(ficaTax),    color: '#fb923c', bgClass: 'bg-orange-400',    textClass: 'text-orange-400'    },
    ].filter(c => c.amount > 0),
    expenseCategories: [
      { label: 'Housing',       amount: housing,       pct: pct(housing),       color: '#fab633', bgClass: 'bg-brand-amber',  textClass: 'text-brand-amber'  },
      { label: 'Transportation',amount: transportation, pct: pct(transportation),color: '#facc15', bgClass: 'bg-brand-yellow', textClass: 'text-brand-yellow' },
      { label: 'Food',          amount: food,          pct: pct(food),          color: '#fde68a', bgClass: 'bg-yellow-200',   textClass: 'text-yellow-600'   },
      { label: 'Healthcare',    amount: healthcare,    pct: pct(healthcare),    color: '#2dd4bf', bgClass: 'bg-teal-400',     textClass: 'text-teal-400'     },
      { label: 'Entertainment', amount: entertainment, pct: pct(entertainment), color: '#22d3ee', bgClass: 'bg-brand-cyan',   textClass: 'text-brand-cyan'   },
      { label: 'Other',         amount: otherExpenses, pct: pct(otherExpenses), color: '#94a3b8', bgClass: 'bg-slate-400',    textClass: 'text-slate-400'    },
    ].filter(c => c.amount > 0),
    savingsCategories: [
      { label: '401(k)',    amount: contribution401k,  pct: pct(contribution401k),  color: '#34d399', bgClass: 'bg-brand-emerald', textClass: 'text-brand-emerald' },
      { label: 'Roth IRA',  amount: rothContribution,  pct: pct(rothContribution),  color: '#6ee7b7', bgClass: 'bg-emerald-300',   textClass: 'text-emerald-400'   },
      { label: 'Taxable',   amount: taxableInvesting,  pct: pct(taxableInvesting),  color: '#67e8f9', bgClass: 'bg-cyan-300',      textClass: 'text-cyan-400'      },
      { label: 'Emergency', amount: emergencyFund,     pct: pct(emergencyFund),     color: '#60a5fa', bgClass: 'bg-blue-400',      textClass: 'text-blue-400'      },
    ].filter(c => c.amount > 0),
  }
}

export { formatCurrency } from './mortgage'
