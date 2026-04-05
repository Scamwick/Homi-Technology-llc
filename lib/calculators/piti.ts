/**
 * PITI Calculator — Shared Library
 * ==================================
 *
 * Pure functions for computing Principal, Interest, Taxes, Insurance
 * mortgage payment breakdowns. Extracted from the standalone tools page
 * for use in both the UI and the scoring pipeline.
 *
 * All functions are pure — no side effects, deterministic output.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PITIInputs {
  /** Home purchase price in USD. */
  homePrice: number;
  /** Down payment as a percentage (0-100). */
  downPaymentPercent: number;
  /** Annual interest rate as a percentage (e.g. 6.5 = 6.5%). */
  interestRate: number;
  /** Loan term in years (15 or 30). */
  loanTermYears: number;
  /** Annual property tax rate as a percentage of home value. */
  propertyTaxRate: number;
  /** Annual homeowner's insurance in USD. */
  annualInsurance: number;
  /** Monthly HOA dues in USD. */
  monthlyHOA: number;
  /** Gross monthly income (optional, for affordability ratio). */
  grossMonthlyIncome?: number;
}

export interface PITIResult {
  /** Monthly principal + interest payment. */
  principalAndInterest: number;
  /** Monthly property tax. */
  monthlyPropertyTax: number;
  /** Monthly homeowner's insurance. */
  monthlyInsurance: number;
  /** Monthly HOA dues. */
  monthlyHOA: number;
  /** Monthly PMI (if down payment < 20%). */
  monthlyPMI: number;
  /** Total monthly PITI payment. */
  totalMonthly: number;
  /** Loan amount after down payment. */
  loanAmount: number;
  /** Down payment in dollars. */
  downPaymentDollars: number;
  /** Loan-to-value ratio. */
  ltv: number;
  /** Whether PMI is required. */
  pmiRequired: boolean;
  /** Total interest paid over loan life. */
  totalInterest: number;
  /** Total cost over loan life (principal + interest + taxes + insurance). */
  totalCost: number;
  /** Housing ratio: totalMonthly / grossMonthlyIncome (null if income not provided). */
  housingRatio: number | null;
  /** Whether housing ratio exceeds 28% guideline. */
  exceedsGuideline: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Conventional lending guideline: housing should be <= 28% of gross income. */
const HOUSING_RATIO_GUIDELINE = 0.28;

/** PMI rate estimate: 0.5% of loan amount annually. */
const PMI_ANNUAL_RATE = 0.005;

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Computes a full PITI breakdown from the given inputs.
 * Pure function — no side effects.
 */
export function computePITI(inputs: PITIInputs): PITIResult {
  const {
    homePrice,
    downPaymentPercent,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    annualInsurance,
    monthlyHOA,
    grossMonthlyIncome,
  } = inputs;

  // Down payment
  const downPaymentDollars = homePrice * (downPaymentPercent / 100);
  const loanAmount = homePrice - downPaymentDollars;
  const ltv = homePrice > 0 ? loanAmount / homePrice : 0;

  // Monthly P&I (amortization formula)
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;

  let principalAndInterest: number;
  if (monthlyRate === 0) {
    principalAndInterest = numPayments > 0 ? loanAmount / numPayments : 0;
  } else {
    principalAndInterest =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // Taxes and insurance
  const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = annualInsurance / 12;

  // PMI (required if LTV > 80%)
  const pmiRequired = ltv > 0.8;
  const monthlyPMI = pmiRequired ? (loanAmount * PMI_ANNUAL_RATE) / 12 : 0;

  // Total monthly
  const totalMonthly =
    principalAndInterest +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyHOA +
    monthlyPMI;

  // Total interest over loan life
  const totalInterest = principalAndInterest * numPayments - loanAmount;

  // Total cost
  const totalCost =
    (principalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyHOA + monthlyPMI) *
    numPayments;

  // Affordability check
  let housingRatio: number | null = null;
  let exceedsGuideline = false;

  if (grossMonthlyIncome && grossMonthlyIncome > 0) {
    housingRatio = totalMonthly / grossMonthlyIncome;
    exceedsGuideline = housingRatio > HOUSING_RATIO_GUIDELINE;
  }

  return {
    principalAndInterest: round2(principalAndInterest),
    monthlyPropertyTax: round2(monthlyPropertyTax),
    monthlyInsurance: round2(monthlyInsurance),
    monthlyHOA: round2(monthlyHOA),
    monthlyPMI: round2(monthlyPMI),
    totalMonthly: round2(totalMonthly),
    loanAmount: round2(loanAmount),
    downPaymentDollars: round2(downPaymentDollars),
    ltv: Math.round(ltv * 10000) / 10000,
    pmiRequired,
    totalInterest: round2(totalInterest),
    totalCost: round2(totalCost),
    housingRatio: housingRatio !== null ? Math.round(housingRatio * 10000) / 10000 : null,
    exceedsGuideline,
  };
}

/**
 * Computes PITI using Plaid-derived data for auto-population.
 * Fills in real income and debt data from a financial snapshot.
 */
export function computePITIFromSnapshot(
  snapshot: {
    estimatedMonthlyIncome: number;
    totalMonthlyDebtPayments: number;
  },
  targetHomePrice: number,
  downPaymentPercent: number,
  interestRate: number,
  loanTermYears: number = 30,
): PITIResult {
  return computePITI({
    homePrice: targetHomePrice,
    downPaymentPercent,
    interestRate,
    loanTermYears,
    propertyTaxRate: 1.1, // National average
    annualInsurance: targetHomePrice * 0.004, // ~0.4% of home value
    monthlyHOA: 0,
    grossMonthlyIncome: snapshot.estimatedMonthlyIncome,
  });
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
