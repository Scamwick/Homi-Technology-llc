/**
 * Debt Payoff Planner — Shared Library
 * =======================================
 *
 * Pure functions for simulating debt payoff strategies:
 *   - Avalanche: Highest interest rate first (minimizes total interest)
 *   - Snowball: Smallest balance first (maximizes psychological wins)
 *
 * Extracted from the standalone tools page for use in both the UI
 * and the AI agent's financial query tools.
 *
 * All functions are pure — no side effects, deterministic output.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Debt {
  /** Human-readable name (e.g. "Chase Visa", "Student Loan"). */
  name: string;
  /** Current outstanding balance. */
  balance: number;
  /** Annual interest rate as a percentage (e.g. 18.99). */
  annualRate: number;
  /** Minimum monthly payment. */
  minimumPayment: number;
}

export type PayoffStrategy = 'avalanche' | 'snowball';

export interface DebtPayoffResult {
  /** Strategy used. */
  strategy: PayoffStrategy;
  /** Total interest paid across all debts. */
  totalInterest: number;
  /** Total months until all debts are paid off. */
  totalMonths: number;
  /** Order in which debts are eliminated. */
  payoffOrder: Array<{
    name: string;
    paidOffMonth: number;
    interestPaid: number;
  }>;
  /** Monthly snapshot of total remaining balance (for charting). */
  balanceTimeline: number[];
  /** Per-debt monthly balance (for detailed charts). */
  debtTimelines: Record<string, number[]>;
}

export interface PayoffComparison {
  avalanche: DebtPayoffResult;
  snowball: DebtPayoffResult;
  interestSaved: number;
  monthsSaved: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Safety cap to prevent infinite loops on bad inputs. */
const MAX_MONTHS = 600; // 50 years

// ---------------------------------------------------------------------------
// Main Exports
// ---------------------------------------------------------------------------

/**
 * Simulates a debt payoff plan using the specified strategy.
 * Pure function — no side effects.
 */
export function computePayoff(
  debts: Debt[],
  extraPayment: number,
  strategy: PayoffStrategy,
): DebtPayoffResult {
  if (debts.length === 0) {
    return {
      strategy,
      totalInterest: 0,
      totalMonths: 0,
      payoffOrder: [],
      balanceTimeline: [0],
      debtTimelines: {},
    };
  }

  // Clone debts to avoid mutation
  const activeDebts = debts.map((d) => ({
    ...d,
    currentBalance: d.balance,
    interestPaid: 0,
    paidOff: false,
    paidOffMonth: 0,
  }));

  // Sort based on strategy
  const sortDebts = () => {
    if (strategy === 'avalanche') {
      activeDebts.sort((a, b) => {
        if (a.paidOff !== b.paidOff) return a.paidOff ? 1 : -1;
        return b.annualRate - a.annualRate;
      });
    } else {
      activeDebts.sort((a, b) => {
        if (a.paidOff !== b.paidOff) return a.paidOff ? 1 : -1;
        return a.currentBalance - b.currentBalance;
      });
    }
  };

  const balanceTimeline: number[] = [];
  const debtTimelines: Record<string, number[]> = {};
  for (const d of debts) {
    debtTimelines[d.name] = [];
  }

  let month = 0;

  // Record initial state
  balanceTimeline.push(totalBalance(activeDebts));
  for (const d of activeDebts) {
    debtTimelines[d.name].push(d.currentBalance);
  }

  while (totalBalance(activeDebts) > 0.01 && month < MAX_MONTHS) {
    month++;
    sortDebts();

    // 1. Apply interest to all active debts
    for (const d of activeDebts) {
      if (d.paidOff) continue;
      const monthlyRate = d.annualRate / 100 / 12;
      const interest = d.currentBalance * monthlyRate;
      d.currentBalance += interest;
      d.interestPaid += interest;
    }

    // 2. Make minimum payments on all active debts
    let availableExtra = extraPayment;
    for (const d of activeDebts) {
      if (d.paidOff) continue;
      const payment = Math.min(d.minimumPayment, d.currentBalance);
      d.currentBalance -= payment;

      if (d.currentBalance <= 0.01) {
        // Freed-up minimum payment becomes extra for next debt
        availableExtra += d.minimumPayment - payment;
        d.currentBalance = 0;
        d.paidOff = true;
        d.paidOffMonth = month;
      }
    }

    // 3. Apply extra payment to the priority debt
    for (const d of activeDebts) {
      if (d.paidOff || availableExtra <= 0) continue;
      const payment = Math.min(availableExtra, d.currentBalance);
      d.currentBalance -= payment;
      availableExtra -= payment;

      if (d.currentBalance <= 0.01) {
        availableExtra += d.minimumPayment; // Freed-up payment
        d.currentBalance = 0;
        d.paidOff = true;
        d.paidOffMonth = month;
      }
    }

    // Record state
    balanceTimeline.push(totalBalance(activeDebts));
    for (const d of activeDebts) {
      debtTimelines[d.name].push(d.currentBalance);
    }
  }

  const totalInterest = activeDebts.reduce((sum, d) => sum + d.interestPaid, 0);
  const payoffOrder = activeDebts
    .filter((d) => d.paidOff)
    .sort((a, b) => a.paidOffMonth - b.paidOffMonth)
    .map((d) => ({
      name: d.name,
      paidOffMonth: d.paidOffMonth,
      interestPaid: Math.round(d.interestPaid * 100) / 100,
    }));

  return {
    strategy,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalMonths: month,
    payoffOrder,
    balanceTimeline,
    debtTimelines,
  };
}

/**
 * Compares avalanche vs snowball strategies side by side.
 */
export function compareStrategies(
  debts: Debt[],
  extraPayment: number,
): PayoffComparison {
  const avalanche = computePayoff(debts, extraPayment, 'avalanche');
  const snowball = computePayoff(debts, extraPayment, 'snowball');

  return {
    avalanche,
    snowball,
    interestSaved: Math.round((snowball.totalInterest - avalanche.totalInterest) * 100) / 100,
    monthsSaved: snowball.totalMonths - avalanche.totalMonths,
  };
}

/**
 * Creates a debt list from Plaid liabilities for auto-population.
 */
export function liabilitiesToDebts(
  liabilities: Array<{
    type: string;
    balance: number | null;
    apr: number | null;
    minimum_payment: number | null;
    plaid_account_id: string;
  }>,
  accountNames: Record<string, string>,
): Debt[] {
  return liabilities
    .filter((l) => l.balance != null && l.balance > 0)
    .map((l) => ({
      name: accountNames[l.plaid_account_id] ?? `${l.type} account`,
      balance: Number(l.balance),
      annualRate: Number(l.apr) || 0,
      minimumPayment: Number(l.minimum_payment) || Math.max(25, Number(l.balance) * 0.02),
    }));
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function totalBalance(
  debts: Array<{ currentBalance: number; paidOff: boolean }>,
): number {
  return debts
    .filter((d) => !d.paidOff)
    .reduce((sum, d) => sum + d.currentBalance, 0);
}
