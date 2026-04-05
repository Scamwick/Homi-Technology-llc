/**
 * Plaid-to-Scoring Adapter
 * ==========================
 *
 * Bridges Plaid financial snapshots to the HoMI-Score engine inputs.
 * Handles the translation from real-time bank data to the scoring
 * schema, replacing self-reported financial data with Plaid-verified data.
 *
 * The emotional and timing dimensions remain self-reported — only the
 * financial dimension is Plaid-enhanced.
 */

import type { FinancialSnapshot } from '@/lib/plaid/derive-snapshot';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlaidScoringInputs {
  financial: {
    annualIncome: number;
    monthlyDebt: number;
    downPaymentSaved: number;
    targetHomePrice: number;
    emergencyFundMonths: number;
    creditScore: number;
  };
  emotional: {
    lifeStability: number;
    confidenceLevel: number;
    partnerAlignment: number | null;
    fomoLevel: number;
  };
  timing: {
    timeHorizonMonths: number;
    monthlySavingsRate: number;
    downPaymentProgress: number;
  };
  dataSource: 'plaid' | 'self_reported' | 'hybrid';
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Converts a Plaid financial snapshot + user-provided emotional/timing data
 * into the format expected by the scoring API.
 *
 * Financial data comes from Plaid (verified).
 * Emotional and timing data come from the user's most recent assessment.
 */
export function snapshotToScoringInputs(
  snapshot: FinancialSnapshot,
  targetHomePrice: number,
  creditScore: number,
  emotionalInputs: PlaidScoringInputs['emotional'],
  timingInputs: {
    timeHorizonMonths: number;
  },
): PlaidScoringInputs {
  // Down payment progress: how close to 20% of target
  const targetDownPayment = targetHomePrice * 0.20;
  const downPaymentProgress = targetDownPayment > 0
    ? Math.min(100, (snapshot.downPaymentAvailable / targetDownPayment) * 100)
    : 0;

  return {
    financial: {
      annualIncome: snapshot.estimatedMonthlyIncome * 12,
      monthlyDebt: snapshot.totalMonthlyDebtPayments,
      downPaymentSaved: snapshot.downPaymentAvailable,
      targetHomePrice,
      emergencyFundMonths: snapshot.emergencyFundMonths,
      creditScore,
    },
    emotional: emotionalInputs,
    timing: {
      timeHorizonMonths: timingInputs.timeHorizonMonths,
      // Use Plaid-derived savings rate instead of self-reported
      monthlySavingsRate: Math.round(snapshot.savingsRate * 100),
      downPaymentProgress: Math.round(downPaymentProgress),
    },
    dataSource: 'plaid',
  };
}

/**
 * Merges Plaid snapshot data with self-reported data, preferring Plaid
 * where available. Used for hybrid scoring when Plaid is connected but
 * some data comes from the assessment questionnaire.
 */
export function mergeWithSelfReported(
  plaidInputs: PlaidScoringInputs | null,
  selfReported: PlaidScoringInputs,
): PlaidScoringInputs {
  if (!plaidInputs) return { ...selfReported, dataSource: 'self_reported' };

  return {
    financial: {
      // Prefer Plaid for financial data
      annualIncome: plaidInputs.financial.annualIncome || selfReported.financial.annualIncome,
      monthlyDebt: plaidInputs.financial.monthlyDebt || selfReported.financial.monthlyDebt,
      downPaymentSaved: plaidInputs.financial.downPaymentSaved || selfReported.financial.downPaymentSaved,
      targetHomePrice: selfReported.financial.targetHomePrice, // Always user-provided
      emergencyFundMonths: plaidInputs.financial.emergencyFundMonths || selfReported.financial.emergencyFundMonths,
      creditScore: plaidInputs.financial.creditScore || selfReported.financial.creditScore,
    },
    // Emotional is always self-reported
    emotional: selfReported.emotional,
    timing: {
      timeHorizonMonths: selfReported.timing.timeHorizonMonths, // Always user-provided
      // Prefer Plaid-derived savings rate
      monthlySavingsRate: plaidInputs.timing.monthlySavingsRate || selfReported.timing.monthlySavingsRate,
      downPaymentProgress: plaidInputs.timing.downPaymentProgress || selfReported.timing.downPaymentProgress,
    },
    dataSource: 'hybrid',
  };
}
