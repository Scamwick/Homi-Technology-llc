export { formatCurrency } from './mortgage'

// ─── Closing Cost Estimator ───────────────────────────────────────────────────
export interface ClosingCostInputs {
  purchasePrice: number
  loanAmount: number
  state: string
  isFirstTime: boolean
  loanType: 'conventional' | 'fha' | 'va' | 'usda'
}

export interface ClosingCostLine {
  category: string
  label: string
  amount: number
  note: string
  negotiable: boolean
}

export interface ClosingCostResult {
  lines: ClosingCostLine[]
  totalBuyerCosts: number
  totalLenderFees: number
  totalThirdParty: number
  totalPrepaids: number
  totalTransferTaxes: number
  grandTotal: number
  pctOfPurchase: number
  cashNeeded: number
  downPayment: number
}

// State transfer tax rates (buyer's share, approximate)
const TRANSFER_TAX: Record<string, number> = {
  AL:0, AK:0, AZ:0, AR:0, CA:0.0011, CO:0.001, CT:0.0075, DE:0.02,
  FL:0.007, GA:0.001, HI:0.002, ID:0, IL:0.005, IN:0, IA:0.0016,
  KS:0, KY:0.001, LA:0, ME:0.0044, MD:0.005, MA:0.00456, MI:0.0075,
  MN:0.0033, MS:0, MO:0, MT:0, NE:0.00225, NV:0.00195, NH:0.015,
  NJ:0.01, NM:0, NY:0.004, NC:0.002, ND:0, OH:0.001, OK:0.0025,
  OR:0.001, PA:0.01, RI:0.00046, SC:0.004, SD:0, TN:0.0037, TX:0,
  UT:0, VT:0.015, VA:0.0025, WA:0.0128, WV:0.005, WI:0.003, WY:0,
  DC:0.0133,
}

export function calcClosingCosts(inputs: ClosingCostInputs): ClosingCostResult {
  const { purchasePrice, loanAmount, state, isFirstTime, loanType } = inputs
  const downPayment = purchasePrice - loanAmount
  const lines: ClosingCostLine[] = []

  // Lender fees
  lines.push({ category: 'Lender', label: 'Origination Fee (1%)', amount: loanAmount * 0.01, note: 'Charged by lender to process loan', negotiable: true })
  lines.push({ category: 'Lender', label: 'Underwriting Fee', amount: 795, note: 'Loan underwriting and approval', negotiable: false })
  lines.push({ category: 'Lender', label: 'Credit Report', amount: 30, note: 'Tri-merge credit pull', negotiable: false })

  if (loanType === 'fha') {
    lines.push({ category: 'Lender', label: 'FHA Upfront MIP (1.75%)', amount: loanAmount * 0.0175, note: 'FHA mortgage insurance premium', negotiable: false })
  }
  if (loanType === 'va') {
    const vaFee = isFirstTime ? loanAmount * 0.0215 : loanAmount * 0.033
    lines.push({ category: 'Lender', label: `VA Funding Fee (${isFirstTime ? '2.15' : '3.3'}%)`, amount: vaFee, note: 'VA loan guarantee fee', negotiable: false })
  }

  // Third party
  lines.push({ category: 'Third Party', label: 'Appraisal', amount: 550, note: 'Licensed appraiser', negotiable: false })
  lines.push({ category: 'Third Party', label: 'Home Inspection', amount: 450, note: 'General home inspection', negotiable: false })
  lines.push({ category: 'Third Party', label: 'Title Search & Insurance', amount: purchasePrice * 0.005, note: "Lender's title policy required; owner's optional", negotiable: true })
  lines.push({ category: 'Third Party', label: 'Escrow / Settlement Fee', amount: 750, note: 'Title/escrow company closing service', negotiable: true })
  lines.push({ category: 'Third Party', label: 'Recording Fees', amount: 125, note: 'County deed and mortgage recording', negotiable: false })
  lines.push({ category: 'Third Party', label: 'Survey', amount: 400, note: 'Property boundary survey', negotiable: false })
  lines.push({ category: 'Third Party', label: 'Pest Inspection', amount: 120, note: 'Termite/wood-destroying organism report', negotiable: false })

  // Prepaids
  const monthlyInsurance = (purchasePrice * 0.005) / 12
  lines.push({ category: 'Prepaids', label: "Homeowner's Insurance (12 mo)", amount: monthlyInsurance * 12, note: 'First year premium paid at closing', negotiable: false })
  lines.push({ category: 'Prepaids', label: 'Property Tax Escrow (3 mo)', amount: (purchasePrice * 0.012) / 12 * 3, note: 'Escrow cushion for property taxes', negotiable: false })
  lines.push({ category: 'Prepaids', label: 'Prepaid Interest (15 days)', amount: loanAmount * 0.07 / 365 * 15, note: 'Interest from closing to first payment', negotiable: false })

  // Transfer taxes
  const taxRate = TRANSFER_TAX[state] ?? 0.002
  if (taxRate > 0) {
    lines.push({ category: 'Transfer Tax', label: `${state} Transfer Tax (${(taxRate * 100).toFixed(3)}%)`, amount: purchasePrice * taxRate, note: 'State/local deed transfer tax', negotiable: false })
  }

  const totalLenderFees = lines.filter(l => l.category === 'Lender').reduce((s, l) => s + l.amount, 0)
  const totalBuyerCosts = totalLenderFees
  const totalThirdParty = lines.filter(l => l.category === 'Third Party').reduce((s, l) => s + l.amount, 0)
  const totalPrepaids = lines.filter(l => l.category === 'Prepaids').reduce((s, l) => s + l.amount, 0)
  const totalTransferTaxes = lines.filter(l => l.category === 'Transfer Tax').reduce((s, l) => s + l.amount, 0)
  const grandTotal = lines.reduce((s, l) => s + l.amount, 0)

  return {
    lines, totalBuyerCosts, totalLenderFees, totalThirdParty, totalPrepaids,
    totalTransferTaxes, grandTotal, pctOfPurchase: (grandTotal / purchasePrice) * 100,
    cashNeeded: downPayment + grandTotal, downPayment,
  }
}

// ─── Offer Strategy Simulator ─────────────────────────────────────────────────
export interface OfferInputs {
  listPrice: number
  estimatedFMV: number
  competingOffers: number
  marketCondition: 'hot' | 'balanced' | 'cool'
  downPaymentPct: number
  hasEscalation: boolean
  escalationCap: number
  escalationIncrement: number
  hasInspectionContingency: boolean
  hasFinancingContingency: boolean
  hasAppraisalContingency: boolean
  offerPrice: number
}

export interface OfferScenario {
  offerPrice: number
  label: string
  winProbability: number
  monthlyPayment: number
  overList: number
  overFMV: number
  pros: string[]
  cons: string[]
}

export interface OfferResult {
  scenarios: OfferScenario[]
  recommendedOffer: number
  escalationRange: string
  strengthScore: number
  strengthFactors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[]
}

function roughMonthly(price: number, downPct: number): number {
  const loan = price * (1 - downPct / 100)
  const r = 0.07 / 12
  const n = 360
  return loan * r / (1 - Math.pow(1 + r, -n)) + price * 0.012 / 12 + price * 0.005 / 12
}

export function calcOfferStrategy(inputs: OfferInputs): OfferResult {
  const { listPrice, estimatedFMV, competingOffers, marketCondition, downPaymentPct,
          hasEscalation, escalationCap, escalationIncrement, hasInspectionContingency,
          hasFinancingContingency, hasAppraisalContingency, offerPrice } = inputs

  const marketMultiplier = marketCondition === 'hot' ? 1.04 : marketCondition === 'cool' ? 0.97 : 1.0
  const baseWinPrice = listPrice * marketMultiplier

  function winProb(price: number): number {
    const edge = (price - baseWinPrice) / baseWinPrice
    const base = Math.min(95, Math.max(5, 50 + edge * 500))
    const competitionAdjust = Math.max(0, competingOffers * 8)
    return Math.min(95, Math.max(5, base - competitionAdjust + (hasEscalation ? 10 : 0) + (downPaymentPct >= 20 ? 5 : 0) + (!hasInspectionContingency ? 8 : 0)))
  }

  const scenarios: OfferScenario[] = [
    {
      offerPrice: Math.round(listPrice * 0.97 / 1000) * 1000,
      label: 'Under List',
      winProbability: winProb(listPrice * 0.97),
      monthlyPayment: roughMonthly(listPrice * 0.97, downPaymentPct),
      overList: -3,
      overFMV: ((listPrice * 0.97 - estimatedFMV) / estimatedFMV) * 100,
      pros: ['Leaves room to negotiate', 'Lower monthly payment'],
      cons: ['Low win probability in competitive markets', 'May signal low motivation'],
    },
    {
      offerPrice: listPrice,
      label: 'At List',
      winProbability: winProb(listPrice),
      monthlyPayment: roughMonthly(listPrice, downPaymentPct),
      overList: 0,
      overFMV: ((listPrice - estimatedFMV) / estimatedFMV) * 100,
      pros: ['Clean round number', 'Within appraisal range if priced right'],
      cons: ["Won't stand out in a hot market"],
    },
    {
      offerPrice: Math.round(listPrice * 1.03 / 1000) * 1000,
      label: '3% Over',
      winProbability: winProb(listPrice * 1.03),
      monthlyPayment: roughMonthly(listPrice * 1.03, downPaymentPct),
      overList: 3,
      overFMV: ((listPrice * 1.03 - estimatedFMV) / estimatedFMV) * 100,
      pros: ['Competitive without going maximum', 'Shows strong motivation'],
      cons: ['Appraisal gap risk if FMV is at list'],
    },
    {
      offerPrice: Math.round(listPrice * 1.06 / 1000) * 1000,
      label: '6% Over',
      winProbability: winProb(listPrice * 1.06),
      monthlyPayment: roughMonthly(listPrice * 1.06, downPaymentPct),
      overList: 6,
      overFMV: ((listPrice * 1.06 - estimatedFMV) / estimatedFMV) * 100,
      pros: ['High win probability', 'Best for highly competitive listings'],
      cons: ['Appraisal gap likely', 'Higher monthly payment'],
    },
    {
      offerPrice: offerPrice,
      label: 'Your Offer',
      winProbability: winProb(offerPrice),
      monthlyPayment: roughMonthly(offerPrice, downPaymentPct),
      overList: ((offerPrice - listPrice) / listPrice) * 100,
      overFMV: ((offerPrice - estimatedFMV) / estimatedFMV) * 100,
      pros: ['Custom to your situation'],
      cons: [],
    },
  ]

  // Strength score
  let score = 50
  if (downPaymentPct >= 20) score += 15
  else if (downPaymentPct >= 10) score += 8
  if (!hasInspectionContingency) score += 12
  if (!hasFinancingContingency) score += 10
  if (!hasAppraisalContingency) score += 8
  if (hasEscalation) score += 10
  score = Math.min(100, score)

  const strengthFactors = [
    { label: `Down Payment: ${downPaymentPct}%`, impact: (downPaymentPct >= 20 ? 'positive' : downPaymentPct >= 10 ? 'neutral' : 'negative') as 'positive' | 'negative' | 'neutral', detail: downPaymentPct >= 20 ? 'Avoids PMI, signals strength' : 'PMI required, consider 20%+' },
    { label: 'Inspection Contingency', impact: (!hasInspectionContingency ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral', detail: !hasInspectionContingency ? 'Waived — increases offer strength significantly' : 'Present — protects you but weakens offer' },
    { label: 'Financing Contingency', impact: (!hasFinancingContingency ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral', detail: !hasFinancingContingency ? 'Waived — only do if fully pre-approved' : 'Present — standard protection' },
    { label: 'Appraisal Contingency', impact: (!hasAppraisalContingency ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral', detail: !hasAppraisalContingency ? 'Waived — you cover any appraisal gap' : 'Present — protects against overpaying' },
    { label: 'Escalation Clause', impact: (hasEscalation ? 'positive' : 'neutral') as 'positive' | 'negative' | 'neutral', detail: hasEscalation ? `Beats any offer by $${escalationIncrement.toLocaleString()} up to $${escalationCap.toLocaleString()}` : 'Not included' },
  ]

  const recommendedOffer = marketCondition === 'hot' ? Math.round(listPrice * 1.04 / 1000) * 1000
    : marketCondition === 'cool' ? Math.round(listPrice * 0.97 / 1000) * 1000
    : listPrice

  return {
    scenarios,
    recommendedOffer,
    escalationRange: hasEscalation ? `$${offerPrice.toLocaleString()} to $${escalationCap.toLocaleString()} (+$${escalationIncrement.toLocaleString()})` : 'Not using escalation',
    strengthScore: score,
    strengthFactors,
  }
}

// ─── Mortgage Rate Tracker ────────────────────────────────────────────────────
export interface RateQuote {
  id: string
  lenderName: string
  date: string
  rate: number
  apr: number
  points: number
  originationFee: number
  loanType: string
  lockPeriod: number
  notes: string
}

export interface RateComparisonResult {
  quotes: RateQuote[]
  bestRate: RateQuote | null
  bestAPR: RateQuote | null
  lowestFees: RateQuote | null
  monthlyPaymentDiff: number
}

export function compareRates(quotes: RateQuote[], loanAmount = 400000): RateComparisonResult {
  if (quotes.length === 0) return { quotes, bestRate: null, bestAPR: null, lowestFees: null, monthlyPaymentDiff: 0 }

  const bestRate = [...quotes].sort((a, b) => a.rate - b.rate)[0]
  const bestAPR = [...quotes].sort((a, b) => a.apr - b.apr)[0]
  const lowestFees = [...quotes].sort((a, b) => (a.originationFee + a.points * loanAmount * 0.01) - (b.originationFee + b.points * loanAmount * 0.01))[0]

  const calcPayment = (rate: number) => {
    const r = rate / 100 / 12
    return loanAmount * r / (1 - Math.pow(1 + r, -360))
  }

  const rates = quotes.map(q => q.rate)
  const monthlyPaymentDiff = calcPayment(Math.max(...rates)) - calcPayment(Math.min(...rates))

  return { quotes, bestRate, bestAPR, lowestFees, monthlyPaymentDiff }
}
