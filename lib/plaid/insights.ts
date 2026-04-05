// =============================================================================
// lib/plaid/insights.ts — Readiness Intelligence Engine
// =============================================================================
// Derives financial readiness metrics from verified Plaid transaction data.
// Every metric feeds back into the HōMI Score's three rings:
//   Ring 1 — Financial Reality (DTI, reserves, savings rate)
//   Ring 3 — Perfect Timing (cash flow forecast, danger zones)
//   Behavioral Genome — confidence calibration, anomaly response
// =============================================================================

import type { BankTransactionRow } from '@/types/plaid';
import type { LinkedAccountView, BankConnectionView } from '@/types/plaid';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FinancialMetrics {
  // Core readiness metrics (Ring 1 — Financial Reality)
  verifiedMonthlyIncome: number;
  incomeVolatility: number; // std deviation as % of mean — replaces Monte Carlo's generic 2%
  verifiedMonthlyDebt: number;
  actualDTI: number; // verifiedMonthlyDebt / verifiedMonthlyIncome
  liquidReserves: number; // checking + savings balances
  emergencyFundMonths: number; // liquidReserves / avgMonthlyExpenses
  savingsRate: number; // (income - expenses) / income

  // Recurring obligations discovery
  recurringObligations: RecurringObligation[];
  totalRecurringMonthly: number;
  hiddenObligationGap: number; // difference from self-reported

  // Cash flow projection (Ring 3 — Perfect Timing)
  cashFlowForecast: DailyBalance[];
  dangerZones: DangerZone[];

  // Subscription audit
  subscriptions: SubscriptionItem[];
  totalSubscriptionMonthly: number;
  totalSubscriptionAnnual: number;
  priceIncreases: PriceIncrease[];

  // Bill timing alignment
  billTimingScore: number; // 0-100, higher = better aligned
  billTimingSuggestions: TimingSuggestion[];

  // Anomaly detection
  anomalies: TransactionAnomaly[];

  // Milestone detection
  milestones: ReadinessMilestone[];
}

export interface RecurringObligation {
  merchantName: string;
  amount: number;
  dayOfMonth: number;
  category: string;
  streamId: string | null;
}

export interface DailyBalance {
  date: string; // YYYY-MM-DD
  projected: number;
  isProjected: boolean;
}

export interface DangerZone {
  date: string;
  projectedBalance: number;
  threshold: number;
  upcomingBill: string | null;
  upcomingBillAmount: number | null;
  suggestion: string;
}

export interface SubscriptionItem {
  merchantName: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  monthlyEquivalent: number;
  lastCharged: string;
  streamId: string | null;
}

export interface PriceIncrease {
  merchantName: string;
  previousAmount: number;
  currentAmount: number;
  increasePct: number;
  detectedDate: string;
}

export interface TimingSuggestion {
  billName: string;
  currentDay: number;
  suggestedDay: number;
  reason: string;
  deficitPrevented: number;
}

export interface TransactionAnomaly {
  transactionId: string;
  merchantName: string;
  amount: number;
  averageAmount: number;
  deviationPct: number;
  date: string;
  readinessImpact: string;
}

export interface ReadinessMilestone {
  type: 'emergency_fund' | 'dti_threshold' | 'savings_rate' | 'debt_payoff' | 'net_worth';
  title: string;
  description: string;
  achievedDate: string;
  scoreImpact: number; // estimated HōMI Score point increase
}

// Couple alignment types
export interface CoupleAlignment {
  combinedDTI: number;
  savingsRateDifferential: number;
  partnerASavingsRate: number;
  partnerBSavingsRate: number;
  sharedObligations: number;
  individualObligationsA: number;
  individualObligationsB: number;
  alignmentScore: number; // 0-100
  combinedReadiness: string; // 'READY' | 'ALMOST_READY' | 'NOT_READY'
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

/**
 * Derives comprehensive financial readiness metrics from verified transaction
 * data and account balances. This is the intelligence layer that powers the
 * HōMI Score's Financial Reality and Perfect Timing rings.
 */
export function deriveFinancialMetrics(
  transactions: BankTransactionRow[],
  connections: BankConnectionView[],
  options: {
    selfReportedDebt?: number; // for hidden obligation gap calculation
    balanceThreshold?: number; // danger zone threshold (default: $500)
    forecastDays?: number; // how many days to project (default: 30)
  } = {},
): FinancialMetrics {
  const { selfReportedDebt = 0, balanceThreshold = 500, forecastDays = 30 } = options;

  // Flatten all accounts
  const allAccounts = connections.flatMap((c) => c.accounts);

  // ── Income analysis ──
  const incomeTransactions = transactions.filter((t) => t.amount < 0); // Plaid: negative = income
  const incomeAmounts = incomeTransactions.map((t) => Math.abs(t.amount));
  const verifiedMonthlyIncome = median(incomeAmounts) || 0;
  const incomeStdDev = standardDeviation(incomeAmounts);
  const incomeVolatility = verifiedMonthlyIncome > 0
    ? (incomeStdDev / verifiedMonthlyIncome) * 100
    : 0;

  // ── Recurring obligations ──
  const recurringTxns = transactions.filter((t) => t.is_recurring && t.amount > 0);
  const obligationMap = new Map<string, RecurringObligation>();

  for (const txn of recurringTxns) {
    const key = txn.recurring_stream_id ?? txn.merchant_name ?? txn.name;
    if (!obligationMap.has(key)) {
      const dayOfMonth = parseInt(txn.transaction_date.slice(8, 10), 10);
      obligationMap.set(key, {
        merchantName: txn.merchant_name ?? txn.name,
        amount: txn.amount,
        dayOfMonth,
        category: txn.category_primary ?? 'Unknown',
        streamId: txn.recurring_stream_id,
      });
    }
  }
  const recurringObligations = Array.from(obligationMap.values());
  const totalRecurringMonthly = recurringObligations.reduce((sum, o) => sum + o.amount, 0);

  // ── Debt (recurring loan + rent payments) ──
  const debtCategories = ['LOAN_PAYMENTS', 'RENT_AND_UTILITIES'];
  const debtObligations = recurringObligations.filter((o) => debtCategories.includes(o.category));
  const verifiedMonthlyDebt = debtObligations.reduce((sum, o) => sum + o.amount, 0);
  const actualDTI = verifiedMonthlyIncome > 0 ? verifiedMonthlyDebt / verifiedMonthlyIncome : 0;

  // ── Liquid reserves ──
  const liquidTypes = new Set(['checking', 'savings']);
  const liquidReserves = allAccounts
    .filter((a) => liquidTypes.has(a.account_type))
    .reduce((sum, a) => sum + (a.balance_current ?? 0), 0);

  // ── Emergency fund ──
  const allExpenses = transactions.filter((t) => t.amount > 0);
  const avgMonthlyExpenses = allExpenses.length > 0
    ? allExpenses.reduce((sum, t) => sum + t.amount, 0)
    : 1; // prevent division by zero
  const emergencyFundMonths = liquidReserves / avgMonthlyExpenses;

  // ── Savings rate ──
  const totalIncome = incomeAmounts.reduce((sum, a) => sum + a, 0);
  const totalExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;

  // ── Hidden obligation gap ──
  const hiddenObligationGap = selfReportedDebt > 0
    ? totalRecurringMonthly - selfReportedDebt
    : 0;

  // ── Subscription audit ──
  const subscriptionCategories = new Set(['ENTERTAINMENT', 'GENERAL_SERVICES']);
  const subscriptionTxns = recurringTxns.filter(
    (t) => subscriptionCategories.has(t.category_primary ?? '') || t.category_detailed?.includes('SUBSCRIPTION'),
  );

  const subscriptions: SubscriptionItem[] = subscriptionTxns.map((t) => ({
    merchantName: t.merchant_name ?? t.name,
    amount: t.amount,
    frequency: 'monthly' as const,
    monthlyEquivalent: t.amount,
    lastCharged: t.transaction_date,
    streamId: t.recurring_stream_id,
  }));

  const totalSubscriptionMonthly = subscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0);
  const totalSubscriptionAnnual = totalSubscriptionMonthly * 12;

  // ── Price increases (from metadata) ──
  const priceIncreases: PriceIncrease[] = transactions
    .filter((t) => {
      const meta = t.metadata as Record<string, unknown>;
      return meta?.average_amount && t.amount > (meta.average_amount as number) * 1.1;
    })
    .map((t) => {
      const meta = t.metadata as Record<string, unknown>;
      const avg = meta.average_amount as number;
      return {
        merchantName: t.merchant_name ?? t.name,
        previousAmount: avg,
        currentAmount: t.amount,
        increasePct: ((t.amount - avg) / avg) * 100,
        detectedDate: t.transaction_date,
      };
    });

  // ── Bill timing analysis ──
  const { billTimingScore, billTimingSuggestions } = analyzeBillTiming(
    recurringObligations,
    incomeTransactions,
  );

  // ── Cash flow projection ──
  const startBalance = allAccounts
    .filter((a) => a.account_type === 'checking')
    .reduce((sum, a) => sum + (a.balance_available ?? a.balance_current ?? 0), 0);

  const today = new Date().toISOString().slice(0, 10);
  const { cashFlowForecast, dangerZones } = projectCashFlow(
    startBalance,
    recurringObligations,
    incomeTransactions,
    today,
    forecastDays,
    balanceThreshold,
  );

  // ── Anomaly detection ──
  const anomalies: TransactionAnomaly[] = transactions
    .filter((t) => {
      const meta = t.metadata as Record<string, unknown>;
      return meta?.anomaly === true;
    })
    .map((t) => {
      const meta = t.metadata as Record<string, unknown>;
      const avg = (meta.average_amount as number) ?? t.amount;
      const deviation = avg > 0 ? ((t.amount - avg) / avg) * 100 : 0;
      const monthlyImpact = t.amount - avg;
      const efImpact = avgMonthlyExpenses > 0 ? monthlyImpact / avgMonthlyExpenses : 0;

      return {
        transactionId: t.plaid_transaction_id,
        merchantName: t.merchant_name ?? t.name,
        amount: t.amount,
        averageAmount: avg,
        deviationPct: deviation,
        date: t.transaction_date,
        readinessImpact: monthlyImpact > 50
          ? `If this persists, monthly expenses increase by $${monthlyImpact.toFixed(0)}, dropping emergency fund from ${emergencyFundMonths.toFixed(1)} to ${((liquidReserves) / (avgMonthlyExpenses + monthlyImpact)).toFixed(1)} months.`
          : 'Minimal readiness impact.',
      };
    });

  // ── Milestone detection ──
  const milestones = detectMilestones(emergencyFundMonths, actualDTI, savingsRate);

  return {
    verifiedMonthlyIncome,
    incomeVolatility,
    verifiedMonthlyDebt,
    actualDTI,
    liquidReserves,
    emergencyFundMonths,
    savingsRate,
    recurringObligations,
    totalRecurringMonthly,
    hiddenObligationGap,
    cashFlowForecast,
    dangerZones,
    subscriptions,
    totalSubscriptionMonthly,
    totalSubscriptionAnnual,
    priceIncreases,
    billTimingScore,
    billTimingSuggestions,
    anomalies,
    milestones,
  };
}

// ---------------------------------------------------------------------------
// Bill timing analysis
// ---------------------------------------------------------------------------

function analyzeBillTiming(
  obligations: RecurringObligation[],
  incomeTransactions: BankTransactionRow[],
): { billTimingScore: number; billTimingSuggestions: TimingSuggestion[] } {
  if (obligations.length === 0 || incomeTransactions.length === 0) {
    return { billTimingScore: 100, billTimingSuggestions: [] };
  }

  // Determine pay days
  const payDays = [...new Set(
    incomeTransactions.map((t) => parseInt(t.transaction_date.slice(8, 10), 10)),
  )].sort((a, b) => a - b);

  if (payDays.length === 0) {
    return { billTimingScore: 50, billTimingSuggestions: [] };
  }

  // Score: bills should be distributed after pay days
  const suggestions: TimingSuggestion[] = [];
  let alignedCount = 0;

  for (const bill of obligations) {
    // Find nearest following payday
    const nearestPayDay = payDays.find((d) => d <= bill.dayOfMonth) ?? payDays[payDays.length - 1];
    const daysAfterPay = bill.dayOfMonth >= nearestPayDay
      ? bill.dayOfMonth - nearestPayDay
      : bill.dayOfMonth + 30 - nearestPayDay;

    // Bills within 5 days after payday are well-aligned
    if (daysAfterPay <= 5) {
      alignedCount++;
    } else {
      // Suggest moving to 2 days after nearest payday
      const suggestedDay = Math.min((nearestPayDay + 2) % 28 || 28, 28);
      if (suggestedDay !== bill.dayOfMonth) {
        suggestions.push({
          billName: bill.merchantName,
          currentDay: bill.dayOfMonth,
          suggestedDay,
          reason: `Currently ${daysAfterPay} days after your payday on the ${nearestPayDay}th. Moving it closer prevents a cash gap.`,
          deficitPrevented: bill.amount,
        });
      }
    }
  }

  const billTimingScore = obligations.length > 0
    ? Math.round((alignedCount / obligations.length) * 100)
    : 100;

  return { billTimingScore, billTimingSuggestions: suggestions };
}

// ---------------------------------------------------------------------------
// Cash flow projection
// ---------------------------------------------------------------------------

function projectCashFlow(
  startBalance: number,
  obligations: RecurringObligation[],
  incomeTransactions: BankTransactionRow[],
  startDate: string,
  days: number,
  threshold: number,
): { cashFlowForecast: DailyBalance[]; dangerZones: DangerZone[] } {
  const forecast: DailyBalance[] = [];
  const dangerZones: DangerZone[] = [];

  // Build income schedule (day of month → amount)
  const incomeByDay = new Map<number, number>();
  for (const txn of incomeTransactions) {
    const day = parseInt(txn.transaction_date.slice(8, 10), 10);
    incomeByDay.set(day, (incomeByDay.get(day) ?? 0) + Math.abs(txn.amount));
  }

  let balance = startBalance;

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const dayOfMonth = parseInt(date.slice(8, 10), 10);

    // Add income
    const dayIncome = incomeByDay.get(dayOfMonth) ?? 0;
    balance += dayIncome;

    // Subtract obligations
    const dayExpenses = obligations
      .filter((o) => o.dayOfMonth === dayOfMonth)
      .reduce((sum, o) => sum + o.amount, 0);
    balance -= dayExpenses;

    forecast.push({
      date,
      projected: Math.round(balance * 100) / 100,
      isProjected: i > 0,
    });

    // Check for danger zone
    if (balance < threshold) {
      const nextBill = obligations
        .filter((o) => o.dayOfMonth > dayOfMonth)
        .sort((a, b) => a.dayOfMonth - b.dayOfMonth)[0];

      dangerZones.push({
        date,
        projectedBalance: Math.round(balance * 100) / 100,
        threshold,
        upcomingBill: nextBill?.merchantName ?? null,
        upcomingBillAmount: nextBill?.amount ?? null,
        suggestion: `Balance drops to $${Math.round(balance).toLocaleString()} on ${date}.${nextBill ? ` ${nextBill.merchantName} ($${nextBill.amount.toLocaleString()}) is due on the ${nextBill.dayOfMonth}th.` : ''} Transfer funds to avoid overdraft.`,
      });
    }
  }

  return { cashFlowForecast: forecast, dangerZones };
}

// ---------------------------------------------------------------------------
// Milestone detection
// ---------------------------------------------------------------------------

function detectMilestones(
  emergencyFundMonths: number,
  dti: number,
  savingsRate: number,
): ReadinessMilestone[] {
  const milestones: ReadinessMilestone[] = [];
  const today = new Date().toISOString().slice(0, 10);

  if (emergencyFundMonths >= 3) {
    milestones.push({
      type: 'emergency_fund',
      title: 'Emergency Fund: 3 Months',
      description: `Your liquid reserves cover ${emergencyFundMonths.toFixed(1)} months of expenses. This is the minimum threshold for financial readiness.`,
      achievedDate: today,
      scoreImpact: 5,
    });
  }
  if (emergencyFundMonths >= 6) {
    milestones.push({
      type: 'emergency_fund',
      title: 'Emergency Fund: 6 Months',
      description: `Outstanding! Your ${emergencyFundMonths.toFixed(1)} months of reserves provide strong protection against income disruption.`,
      achievedDate: today,
      scoreImpact: 8,
    });
  }
  if (dti > 0 && dti < 0.28) {
    milestones.push({
      type: 'dti_threshold',
      title: 'DTI Below 28%',
      description: `Your debt-to-income ratio is ${(dti * 100).toFixed(1)}%, below the 28% threshold that lenders consider ideal.`,
      achievedDate: today,
      scoreImpact: 4,
    });
  }
  if (savingsRate >= 0.20) {
    milestones.push({
      type: 'savings_rate',
      title: 'Savings Rate Above 20%',
      description: `You're saving ${(savingsRate * 100).toFixed(1)}% of your income — well above the recommended 20%.`,
      achievedDate: today,
      scoreImpact: 3,
    });
  }

  return milestones;
}

// ---------------------------------------------------------------------------
// Couple alignment analysis
// ---------------------------------------------------------------------------

/**
 * Computes financial alignment metrics for couples with linked accounts.
 * Feeds directly into couple_assessments.alignment_data.
 */
export function computeCoupleAlignment(
  metricsA: FinancialMetrics,
  metricsB: FinancialMetrics,
): CoupleAlignment {
  const combinedIncome = metricsA.verifiedMonthlyIncome + metricsB.verifiedMonthlyIncome;
  const combinedDebt = metricsA.verifiedMonthlyDebt + metricsB.verifiedMonthlyDebt;
  const combinedDTI = combinedIncome > 0 ? combinedDebt / combinedIncome : 0;

  const savingsRateDifferential = Math.abs(metricsA.savingsRate - metricsB.savingsRate);

  // Alignment score: higher when partners have similar financial behavior
  const dtiAlignment = 1 - Math.abs(metricsA.actualDTI - metricsB.actualDTI);
  const savingsAlignment = 1 - savingsRateDifferential;
  const reservesRatio = Math.min(metricsA.emergencyFundMonths, metricsB.emergencyFundMonths) /
    Math.max(metricsA.emergencyFundMonths, metricsB.emergencyFundMonths || 1);

  const alignmentScore = Math.round(
    ((dtiAlignment * 0.3) + (savingsAlignment * 0.4) + (reservesRatio * 0.3)) * 100,
  );

  // Combined readiness verdict
  const avgEmergencyFund = (metricsA.emergencyFundMonths + metricsB.emergencyFundMonths) / 2;
  let combinedReadiness = 'NOT_READY';
  if (combinedDTI < 0.28 && avgEmergencyFund >= 3) {
    combinedReadiness = 'READY';
  } else if (combinedDTI < 0.36 && avgEmergencyFund >= 1.5) {
    combinedReadiness = 'ALMOST_READY';
  }

  return {
    combinedDTI,
    savingsRateDifferential,
    partnerASavingsRate: metricsA.savingsRate,
    partnerBSavingsRate: metricsB.savingsRate,
    sharedObligations: combinedDebt,
    individualObligationsA: metricsA.totalRecurringMonthly,
    individualObligationsB: metricsB.totalRecurringMonthly,
    alignmentScore,
    combinedReadiness,
  };
}

// ---------------------------------------------------------------------------
// Readiness countdown estimation
// ---------------------------------------------------------------------------

/**
 * Estimates days until the user's readiness score crosses the READY threshold
 * based on current savings trajectory.
 */
export function estimateReadinessCountdown(
  metrics: FinancialMetrics,
  targetEmergencyMonths: number = 3,
  targetDTI: number = 0.28,
): { daysToReady: number | null; limitingFactor: string } {
  // Already ready?
  if (metrics.emergencyFundMonths >= targetEmergencyMonths && metrics.actualDTI <= targetDTI) {
    return { daysToReady: 0, limitingFactor: 'none' };
  }

  const monthlySavings = metrics.verifiedMonthlyIncome * metrics.savingsRate;

  // Emergency fund gap
  const avgMonthlyExpenses = metrics.liquidReserves / (metrics.emergencyFundMonths || 0.1);
  const targetReserves = targetEmergencyMonths * avgMonthlyExpenses;
  const reservesGap = Math.max(0, targetReserves - metrics.liquidReserves);

  const daysForReserves = monthlySavings > 0
    ? Math.ceil((reservesGap / monthlySavings) * 30)
    : null;

  // DTI gap (harder to fix — requires debt payoff or income increase)
  const dtiGap = metrics.actualDTI - targetDTI;
  const daysForDTI = dtiGap > 0 ? Math.ceil(dtiGap * 365) : 0; // rough estimate

  if (daysForReserves === null) {
    return { daysToReady: null, limitingFactor: 'Unable to project — savings rate too low' };
  }

  if (daysForReserves >= daysForDTI) {
    return { daysToReady: daysForReserves, limitingFactor: 'emergency fund' };
  }
  return { daysToReady: daysForDTI, limitingFactor: 'debt-to-income ratio' };
}
