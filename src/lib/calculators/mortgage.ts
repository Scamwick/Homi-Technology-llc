// ─── State Property Tax Rates (% of assessed value, 2024) ──────────────────
export const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.42, AK: 1.19, AZ: 0.62, AR: 0.63, CA: 0.76, CO: 0.52, CT: 2.14,
  DE: 0.57, FL: 0.89, GA: 0.92, HI: 0.28, ID: 0.69, IL: 2.27, IN: 0.85,
  IA: 1.57, KS: 1.41, KY: 0.83, LA: 0.55, ME: 1.36, MD: 1.09, MA: 1.23,
  MI: 1.54, MN: 1.12, MS: 0.81, MO: 1.01, MT: 0.84, NE: 1.73, NV: 0.60,
  NH: 2.18, NJ: 2.49, NM: 0.80, NY: 1.73, NC: 0.84, ND: 0.98, OH: 1.62,
  OK: 0.90, OR: 0.97, PA: 1.58, RI: 1.53, SC: 0.57, SD: 1.22, TN: 0.71,
  TX: 1.80, UT: 0.58, VT: 1.90, VA: 0.82, WA: 1.03, WV: 0.59, WI: 1.76,
  WY: 0.61, DC: 0.56,
}

export const US_STATES = Object.keys(STATE_TAX_RATES).sort()

// ─── Amortization ───────────────────────────────────────────────────────────
export function monthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (annualRate === 0) return principal / (termYears * 12)
  const r = annualRate / 100 / 12
  const n = termYears * 12
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function totalInterest(principal: number, annualRate: number, termYears: number): number {
  return monthlyPayment(principal, annualRate, termYears) * termYears * 12 - principal
}

// ─── PITI ────────────────────────────────────────────────────────────────────
export interface PITIInputs {
  homePrice: number
  downPaymentPct: number   // 0-100
  interestRate: number     // e.g. 6.5
  termYears: number        // 15 or 30
  state: string            // 2-letter code
  annualInsurance?: number // default: 0.5% of home price
  monthlyHOA?: number      // default: 0
  annualIncome?: number    // for DTI calc
  monthlyOtherDebt?: number
}

export interface PITIResult {
  principal: number
  loanAmount: number
  downPayment: number
  // Monthly breakdown
  monthlyPI: number
  monthlyTax: number
  monthlyInsurance: number
  monthlyHOA: number
  monthlyPMI: number
  totalMonthly: number
  // Over life of loan
  totalInterestPaid: number
  totalTaxPaid30yr: number
  totalInsurancePaid30yr: number
  // Rates
  effectiveTaxRate: number
  ltv: number
  hasPMI: boolean
  pmiRemovalMonth: number | null
  // DTI
  frontEndDTI: number | null
  backEndDTI: number | null
  dtiStatus: 'excellent' | 'good' | 'caution' | 'high' | 'unknown'
  // Affordability
  verdict: 'affordable' | 'stretch' | 'over-budget'
}

export function calcPITI(inputs: PITIInputs): PITIResult {
  const {
    homePrice,
    downPaymentPct,
    interestRate,
    termYears,
    state,
    annualInsurance = homePrice * 0.005,
    monthlyHOA = 0,
    annualIncome,
    monthlyOtherDebt = 0,
  } = inputs

  const downPayment = homePrice * (downPaymentPct / 100)
  const loanAmount = homePrice - downPayment
  const ltv = (loanAmount / homePrice) * 100

  const monthlyPI = monthlyPayment(loanAmount, interestRate, termYears)
  const taxRate = STATE_TAX_RATES[state] ?? 1.1
  const monthlyTax = (homePrice * (taxRate / 100)) / 12
  const monthlyInsurance = annualInsurance / 12
  const hasPMI = ltv > 80
  // PMI: ~0.5–1% of loan annually when LTV > 80%
  const monthlyPMI = hasPMI ? (loanAmount * 0.008) / 12 : 0

  // PMI removal month: when balance reaches 80% LTV (78% auto)
  let pmiRemovalMonth: number | null = null
  if (hasPMI) {
    const r = interestRate / 100 / 12
    const targetBalance = homePrice * 0.80
    for (let m = 1; m <= termYears * 12; m++) {
      const balance = loanAmount * Math.pow(1 + r, m) - monthlyPI * (Math.pow(1 + r, m) - 1) / r
      if (balance <= targetBalance) { pmiRemovalMonth = m; break }
    }
  }

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA + monthlyPMI

  // DTI
  let frontEndDTI: number | null = null
  let backEndDTI: number | null = null
  if (annualIncome && annualIncome > 0) {
    const grossMonthly = annualIncome / 12
    frontEndDTI = (totalMonthly / grossMonthly) * 100
    backEndDTI = ((totalMonthly + monthlyOtherDebt) / grossMonthly) * 100
  }

  const dtiStatus: PITIResult['dtiStatus'] =
    frontEndDTI === null ? 'unknown' :
    frontEndDTI <= 28 && (backEndDTI ?? 0) <= 36 ? 'excellent' :
    frontEndDTI <= 31 && (backEndDTI ?? 0) <= 43 ? 'good' :
    frontEndDTI <= 36 && (backEndDTI ?? 0) <= 50 ? 'caution' : 'high'

  const verdict: PITIResult['verdict'] =
    frontEndDTI === null ? 'affordable' :
    frontEndDTI <= 28 ? 'affordable' :
    frontEndDTI <= 36 ? 'stretch' : 'over-budget'

  return {
    principal: loanAmount,
    loanAmount,
    downPayment,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    monthlyHOA,
    monthlyPMI,
    totalMonthly,
    totalInterestPaid: totalInterest(loanAmount, interestRate, termYears),
    totalTaxPaid30yr: monthlyTax * 12 * 30 * Math.pow(1.03, 15), // 3% annual tax growth
    totalInsurancePaid30yr: monthlyInsurance * 12 * 30 * Math.pow(1.05, 15),
    effectiveTaxRate: taxRate,
    ltv,
    hasPMI,
    pmiRemovalMonth,
    frontEndDTI,
    backEndDTI,
    dtiStatus,
    verdict,
  }
}

// ─── Loan Products ───────────────────────────────────────────────────────────
export type LoanType = '30yr_fixed' | '15yr_fixed' | '5_1_arm' | 'fha' | 'va' | 'interest_only'

export interface LoanProduct {
  id: LoanType
  name: string
  description: string
  termYears: number
  rateAdjustment: number   // offset from base 30yr rate
  upfrontFee: number       // % of loan (e.g. FHA 1.75, VA 2.3)
  monthlyMipPct: number    // annual MIP/PMI % (FHA: 0.85, others: 0)
  minDown: number          // % minimum down
  prosBullets: string[]
  consBullets: string[]
}

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: '30yr_fixed', name: '30-Year Fixed', description: 'Most common. Predictable payments over 30 years.',
    termYears: 30, rateAdjustment: 0, upfrontFee: 0, monthlyMipPct: 0, minDown: 3,
    prosBullets: ['Lowest monthly payment', 'Rate never changes', 'Maximum flexibility'],
    consBullets: ['Pays most total interest', 'Slow equity build'],
  },
  {
    id: '15yr_fixed', name: '15-Year Fixed', description: 'Pay off faster, save ~$190K in interest on a $280K loan.',
    termYears: 15, rateAdjustment: -0.75, upfrontFee: 0, monthlyMipPct: 0, minDown: 3,
    prosBullets: ['Saves ~$190K interest vs 30yr', 'Lower rate', 'Builds equity 2× faster'],
    consBullets: ['~35% higher monthly payment', 'Less cash flow flexibility'],
  },
  {
    id: '5_1_arm', name: '5/1 ARM', description: 'Fixed for 5 years, then adjusts annually. Risky if rates rise.',
    termYears: 30, rateAdjustment: -0.5, upfrontFee: 0, monthlyMipPct: 0, minDown: 5,
    prosBullets: ['Lower initial rate', 'Good if moving within 5 years'],
    consBullets: ['Rate can spike after year 5', 'Worst case: +5% rate adjustment'],
  },
  {
    id: 'fha', name: 'FHA Loan', description: '3.5% down. Requires MIP (mortgage insurance premium) for life.',
    termYears: 30, rateAdjustment: 0.25, upfrontFee: 1.75, monthlyMipPct: 0.85, minDown: 3.5,
    prosBullets: ['Only 3.5% down', 'Flexible credit requirements', 'Assumable loan'],
    consBullets: ['MIP for life of loan', 'More expensive than conventional', '1.75% upfront fee'],
  },
  {
    id: 'va', name: 'VA Loan', description: '0% down for eligible veterans. Funding fee applies.',
    termYears: 30, rateAdjustment: -0.25, upfrontFee: 2.3, monthlyMipPct: 0, minDown: 0,
    prosBullets: ['No down payment required', 'No PMI', 'Competitive rates'],
    consBullets: ['VA eligibility required', '2.3% funding fee', 'VA appraisal required'],
  },
  {
    id: 'interest_only', name: 'Interest-Only', description: 'Pay only interest for 10 years. Risky — avoid unless sophisticated.',
    termYears: 30, rateAdjustment: 0.5, upfrontFee: 0, monthlyMipPct: 0, minDown: 10,
    prosBullets: ['Lowest initial payment', 'Maximum short-term cash flow'],
    consBullets: ['Zero equity built for 10 years', 'Payment shock at year 10', 'High default risk'],
  },
]

export interface LoanComparisonResult {
  product: LoanProduct
  rate: number
  loanAmount: number
  upfrontFeeAmount: number
  monthlyPI: number
  monthlyMIP: number
  totalMonthly: number
  totalInterest: number
  totalCost: number           // principal + interest + upfront + MIP
  equityAt5yr: number
  equityAt10yr: number
  breakEvenVs30yr: number | null  // months until cheaper than 30yr fixed
}

export function compareLoanProducts(
  homePrice: number,
  baseRate: number,      // 30yr fixed rate as anchor
  downPaymentPct: number,
  state: string,
): LoanComparisonResult[] {
  const downPayment = homePrice * (downPaymentPct / 100)
  const baseLoan = homePrice - downPayment

  return LOAN_PRODUCTS.map((product) => {
    const rate = baseRate + product.rateAdjustment
    const loanAmount = product.id === 'va' ? homePrice : baseLoan  // VA: no down
    const upfrontFeeAmount = loanAmount * (product.upfrontFee / 100)
    const effectiveLoan = loanAmount + upfrontFeeAmount  // roll into loan for FHA/VA

    const pi = monthlyPayment(effectiveLoan, rate, product.termYears)
    const monthlyMIP = (loanAmount * (product.monthlyMipPct / 100)) / 12
    const totalMonthly = pi + monthlyMIP

    const totalInt = totalInterest(effectiveLoan, rate, product.termYears)
    const totalCost = effectiveLoan + totalInt + (monthlyMIP * product.termYears * 12)

    // Equity at 5yr & 10yr
    const r = rate / 100 / 12
    const equityCalc = (months: number) => {
      if (r === 0) return pi * months
      const balance = effectiveLoan * Math.pow(1 + r, months) - pi * (Math.pow(1 + r, months) - 1) / r
      return effectiveLoan - balance
    }
    const equityAt5yr = equityCalc(60)
    const equityAt10yr = equityCalc(120)

    return {
      product,
      rate,
      loanAmount,
      upfrontFeeAmount,
      monthlyPI: pi,
      monthlyMIP,
      totalMonthly,
      totalInterest: totalInt,
      totalCost,
      equityAt5yr,
      equityAt10yr,
      breakEvenVs30yr: null,  // calculated below
    }
  })
}

// ─── TCO (Total Cost of Ownership vs Rent) ──────────────────────────────────
export interface TCOInputs {
  homePrice: number
  downPaymentPct: number
  interestRate: number
  termYears: number
  state: string
  appreciationRate: number      // % annual (default 3)
  monthlyRent: number
  rentIncreaseRate: number      // % annual (default 4)
  maintenancePct: number        // % of home value annual (default 1)
  monthlyHOA: number
  annualInsurancePct: number    // % of home value (default 0.5)
  investmentReturn: number      // % annual if down payment invested (default 7)
  sellingCostPct: number        // % of sale price (default 6)
  yearsToHold: number           // analysis horizon (5–30)
}

export interface TCOYear {
  year: number
  // Buying costs
  mortgagePayments: number
  propertyTax: number
  insurance: number
  maintenance: number
  hoa: number
  cumulativeBuyingCost: number
  homeValue: number
  equity: number
  // Renting costs
  monthlyRent: number
  annualRent: number
  cumulativeRentCost: number
  // Comparison
  netBuyingPosition: number   // equity - cumulative costs
  netRentingPosition: number  // -(cumulative rent) + invested down payment growth
  buyingAhead: boolean
}

export interface TCOResult {
  breakEvenYear: number | null
  totalBuyingCost: number
  totalRentingCost: number
  finalHomeValue: number
  netProceedsAfterSale: number
  opportunityCostOfDownPayment: number
  netBuyingWealth: number
  netRentingWealth: number
  buyingWins: boolean
  yearlyBreakdown: TCOYear[]
  summary: {
    downPayment: number
    closingCosts: number
    totalOutOfPocket: number
  }
}

export function calcTCO(inputs: TCOInputs): TCOResult {
  const {
    homePrice, downPaymentPct, interestRate, termYears, state,
    appreciationRate, monthlyRent, rentIncreaseRate, maintenancePct,
    monthlyHOA, annualInsurancePct, investmentReturn, sellingCostPct, yearsToHold,
  } = inputs

  const downPayment = homePrice * (downPaymentPct / 100)
  const loanAmount = homePrice - downPayment
  const closingCosts = homePrice * 0.03  // ~3% closing costs
  const taxRate = STATE_TAX_RATES[state] ?? 1.1

  const monthlyPI = monthlyPayment(loanAmount, interestRate, termYears)
  const r = interestRate / 100 / 12

  let cumulativeBuying = downPayment + closingCosts
  let cumulativeRent = 0
  let currentRent = monthlyRent
  let investedDownPayment = downPayment + closingCosts  // opportunity cost tracking
  let breakEvenYear: number | null = null

  const yearlyBreakdown: TCOYear[] = []

  for (let year = 1; year <= yearsToHold; year++) {
    const homeValue = homePrice * Math.pow(1 + appreciationRate / 100, year)
    const prevHomeValue = homePrice * Math.pow(1 + appreciationRate / 100, year - 1)

    // Mortgage balance at start of year
    const monthsElapsed = (year - 1) * 12
    const balance = monthsElapsed === 0
      ? loanAmount
      : loanAmount * Math.pow(1 + r, monthsElapsed) - monthlyPI * (Math.pow(1 + r, monthsElapsed) - 1) / r

    const annualPI = monthlyPI * 12
    const annualTax = (homeValue * taxRate / 100)
    const annualInsurance = homeValue * (annualInsurancePct / 100)
    const annualMaintenance = homeValue * (maintenancePct / 100)
    const annualHOA = monthlyHOA * 12

    const annualBuyingCost = annualPI + annualTax + annualInsurance + annualMaintenance + annualHOA
    cumulativeBuying += annualBuyingCost

    const equity = homeValue - Math.max(0, balance - annualPI * 0.5)  // approx mid-year

    const annualRent = currentRent * 12
    cumulativeRent += annualRent
    currentRent *= (1 + rentIncreaseRate / 100)

    // Opportunity cost: what the down payment would have grown to
    investedDownPayment *= (1 + investmentReturn / 100)

    const netBuyingPosition = equity - cumulativeBuying + (downPayment + closingCosts)
    const netRentingPosition = investedDownPayment - cumulativeRent

    if (breakEvenYear === null && netBuyingPosition > netRentingPosition) {
      breakEvenYear = year
    }

    yearlyBreakdown.push({
      year,
      mortgagePayments: annualPI,
      propertyTax: annualTax,
      insurance: annualInsurance,
      maintenance: annualMaintenance,
      hoa: annualHOA,
      cumulativeBuyingCost: cumulativeBuying,
      homeValue,
      equity,
      monthlyRent: currentRent / (1 + rentIncreaseRate / 100),
      annualRent,
      cumulativeRentCost: cumulativeRent,
      netBuyingPosition,
      netRentingPosition,
      buyingAhead: netBuyingPosition > netRentingPosition,
    })
  }

  const finalYear = yearlyBreakdown[yearlyBreakdown.length - 1]
  const finalHomeValue = finalYear.homeValue
  const sellingCosts = finalHomeValue * (sellingCostPct / 100)
  const finalBalance = r === 0
    ? Math.max(0, loanAmount - monthlyPI * yearsToHold * 12)
    : Math.max(0, loanAmount * Math.pow(1 + r, yearsToHold * 12) - monthlyPI * (Math.pow(1 + r, yearsToHold * 12) - 1) / r)
  const netProceedsAfterSale = finalHomeValue - sellingCosts - finalBalance

  const netBuyingWealth = netProceedsAfterSale - (cumulativeBuying - (downPayment + closingCosts))
  const netRentingWealth = investedDownPayment - cumulativeRent

  return {
    breakEvenYear,
    totalBuyingCost: cumulativeBuying,
    totalRentingCost: cumulativeRent,
    finalHomeValue,
    netProceedsAfterSale,
    opportunityCostOfDownPayment: investedDownPayment - (downPayment + closingCosts),
    netBuyingWealth,
    netRentingWealth,
    buyingWins: netBuyingWealth > netRentingWealth,
    yearlyBreakdown,
    summary: { downPayment, closingCosts, totalOutOfPocket: downPayment + closingCosts },
  }
}

export function formatCurrency(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (compact && Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
