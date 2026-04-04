/**
 * Financial Snapshot Derivation
 * ==============================
 *
 * Takes raw Plaid data (accounts, transactions, liabilities) and derives
 * a comprehensive financial snapshot used for HoMI-Score calculation.
 *
 * Key derived metrics:
 *   - Estimated monthly income (from deposit pattern analysis)
 *   - Monthly debt payments (from liabilities + recurring charges)
 *   - Emergency fund months (liquid savings / monthly expenses)
 *   - Savings rate (income - expenses / income)
 *   - DTI ratio (debt payments / income)
 *   - Net worth (assets - liabilities)
 */

import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FinancialSnapshot {
  id: string;
  userId: string;
  snapshotAt: string;
  totalChecking: number;
  totalSavings: number;
  totalInvestments: number;
  totalCreditCardDebt: number;
  totalLoanDebt: number;
  totalMonthlyDebtPayments: number;
  estimatedMonthlyIncome: number;
  estimatedMonthlyExpenses: number;
  debtToIncomeRatio: number;
  savingsRate: number;
  emergencyFundMonths: number;
  downPaymentAvailable: number;
  netWorth: number;
  reconciledCreditScore: number | null;
  dataSources: string[];
  confidence: 'high' | 'medium' | 'low';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default analysis window for income/expense derivation. */
const ANALYSIS_WINDOW_DAYS = 90;

/** Plaid categories that indicate income deposits. */
const INCOME_CATEGORIES = [
  'INCOME',
  'TRANSFER_IN',
];

/** Common payroll transaction name patterns. */
const PAYROLL_PATTERNS = [
  /payroll/i,
  /direct dep/i,
  /salary/i,
  /wage/i,
  /pay\s*check/i,
  /employer/i,
  /adp/i,
  /gusto/i,
  /paychex/i,
];

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Derives a financial snapshot from all linked Plaid data for a user.
 * Stores the snapshot in the database and returns the snapshot ID.
 */
export async function deriveFinancialSnapshot(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();

  // 1. Get all linked Plaid items for this user
  const { data: items } = await supabase
    .from('plaid_items')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!items || items.length === 0) return null;

  const itemIds = items.map((i) => i.id);

  // 2. Get all accounts across all items
  const { data: accounts } = await supabase
    .from('plaid_accounts')
    .select('*')
    .in('plaid_item_id', itemIds);

  if (!accounts || accounts.length === 0) return null;

  // 3. Aggregate balances by account type
  const balances = aggregateBalances(accounts);

  // 4. Get transactions for the analysis window
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - ANALYSIS_WINDOW_DAYS);

  const accountIds = accounts.map((a) => a.id);
  const { data: transactions } = await supabase
    .from('plaid_transactions')
    .select('*')
    .in('plaid_account_id', accountIds)
    .gte('date', cutoffDate.toISOString().split('T')[0])
    .eq('pending', false);

  // 5. Derive income and expenses from transactions
  const { monthlyIncome, monthlyExpenses } = deriveIncomeAndExpenses(
    transactions ?? [],
  );

  // 6. Get liabilities for debt payment calculation
  const { data: liabilities } = await supabase
    .from('plaid_liabilities')
    .select('*')
    .in('plaid_account_id', accountIds);

  const monthlyDebtPayments = calculateMonthlyDebtPayments(liabilities ?? []);

  // 7. Get latest reconciled credit score
  const { data: latestCredit } = await supabase
    .from('credit_reports')
    .select('score')
    .eq('user_id', userId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single();

  // 8. Derive all metrics
  const dti = monthlyIncome > 0 ? monthlyDebtPayments / monthlyIncome : 0;
  const savingsRate = monthlyIncome > 0
    ? Math.max(0, (monthlyIncome - monthlyExpenses) / monthlyIncome)
    : 0;
  const emergencyFundMonths = monthlyExpenses > 0
    ? (balances.checking + balances.savings) / monthlyExpenses
    : 0;

  // Down payment = savings accounts tagged as down payment, or all savings if none tagged
  const downPaymentAccounts = accounts.filter(
    (a) => a.is_down_payment_account && (a.type === 'depository'),
  );
  const downPaymentAvailable = downPaymentAccounts.length > 0
    ? downPaymentAccounts.reduce((sum, a) => sum + (Number(a.current_balance) || 0), 0)
    : balances.savings;

  const netWorth =
    balances.checking +
    balances.savings +
    balances.investments -
    balances.creditCardDebt -
    balances.loanDebt;

  // Determine confidence based on data quality
  const hasEnoughTransactions = (transactions?.length ?? 0) >= 30;
  const hasMultipleMonths = ANALYSIS_WINDOW_DAYS >= 60;
  const confidence = hasEnoughTransactions && hasMultipleMonths
    ? 'high'
    : hasEnoughTransactions
      ? 'medium'
      : 'low';

  // 9. Store snapshot
  const { data: snapshot, error } = await supabase
    .from('financial_snapshots')
    .insert({
      user_id: userId,
      total_checking: balances.checking,
      total_savings: balances.savings,
      total_investments: balances.investments,
      total_credit_card_debt: balances.creditCardDebt,
      total_loan_debt: balances.loanDebt,
      total_monthly_debt_payments: monthlyDebtPayments,
      estimated_monthly_income: monthlyIncome,
      estimated_monthly_expenses: monthlyExpenses,
      debt_to_income_ratio: Math.round(dti * 10000) / 10000,
      savings_rate: Math.round(savingsRate * 10000) / 10000,
      emergency_fund_months: Math.round(emergencyFundMonths * 10) / 10,
      down_payment_available: downPaymentAvailable,
      net_worth: netWorth,
      reconciled_credit_score: latestCredit?.score ?? null,
      data_sources: ['plaid'],
      plaid_items_included: itemIds,
      analysis_window_days: ANALYSIS_WINDOW_DAYS,
      confidence,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Snapshot] Failed to store snapshot:', error);
    return null;
  }

  return snapshot?.id ?? null;
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

interface BalanceAggregation {
  checking: number;
  savings: number;
  investments: number;
  creditCardDebt: number;
  loanDebt: number;
}

function aggregateBalances(
  accounts: Array<{
    type: string;
    subtype: string | null;
    current_balance: number | null;
  }>,
): BalanceAggregation {
  const result: BalanceAggregation = {
    checking: 0,
    savings: 0,
    investments: 0,
    creditCardDebt: 0,
    loanDebt: 0,
  };

  for (const account of accounts) {
    const balance = Number(account.current_balance) || 0;

    switch (account.type) {
      case 'depository':
        if (account.subtype === 'savings') {
          result.savings += balance;
        } else {
          result.checking += balance;
        }
        break;

      case 'investment':
        result.investments += balance;
        break;

      case 'credit':
        // Credit balances are typically positive in Plaid = amount owed
        result.creditCardDebt += Math.abs(balance);
        break;

      case 'loan':
        result.loanDebt += Math.abs(balance);
        break;
    }
  }

  return result;
}

interface IncomeExpenseResult {
  monthlyIncome: number;
  monthlyExpenses: number;
}

function deriveIncomeAndExpenses(
  transactions: Array<{
    amount: number;
    category: string[] | null;
    personal_finance_category: Record<string, string> | null;
    name: string | null;
    merchant_name: string | null;
    date: string;
  }>,
): IncomeExpenseResult {
  if (transactions.length === 0) {
    return { monthlyIncome: 0, monthlyExpenses: 0 };
  }

  // Determine the actual date range of transactions
  const dates = transactions.map((t) => new Date(t.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daySpan = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
  const monthMultiplier = 30 / daySpan;

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const txn of transactions) {
    const amount = Number(txn.amount);

    // In Plaid, negative amounts are income (money coming in)
    // Positive amounts are expenses (money going out)
    if (amount < 0) {
      // Check if this looks like income
      const isIncome = isIncomeTransaction(txn);
      if (isIncome) {
        totalIncome += Math.abs(amount);
      }
    } else if (amount > 0) {
      totalExpenses += amount;
    }
  }

  return {
    monthlyIncome: Math.round(totalIncome * monthMultiplier * 100) / 100,
    monthlyExpenses: Math.round(totalExpenses * monthMultiplier * 100) / 100,
  };
}

function isIncomeTransaction(txn: {
  amount: number;
  category: string[] | null;
  personal_finance_category: Record<string, string> | null;
  name: string | null;
}): boolean {
  // Check personal finance category first (most reliable)
  const pfcPrimary = txn.personal_finance_category?.primary;
  if (pfcPrimary && INCOME_CATEGORIES.includes(pfcPrimary)) {
    return true;
  }

  // Check legacy category
  if (txn.category?.some((c) => INCOME_CATEGORIES.includes(c.toUpperCase()))) {
    return true;
  }

  // Check transaction name against payroll patterns
  const name = txn.name ?? '';
  return PAYROLL_PATTERNS.some((pattern) => pattern.test(name));
}

function calculateMonthlyDebtPayments(
  liabilities: Array<{
    type: string;
    minimum_payment: number | null;
    balance: number | null;
    apr: number | null;
  }>,
): number {
  let total = 0;

  for (const liability of liabilities) {
    if (liability.minimum_payment != null) {
      total += Number(liability.minimum_payment);
    } else if (liability.balance != null && liability.apr != null) {
      // Estimate minimum payment: for credit cards ~2% of balance or $25, whichever is greater
      // For loans: use the amortization formula
      const balance = Number(liability.balance);
      const apr = Number(liability.apr) / 100;

      if (liability.type === 'credit') {
        total += Math.max(25, balance * 0.02);
      } else {
        // Simple estimate: balance * (monthly rate) / (1 - (1 + monthly rate)^-360)
        const monthlyRate = apr / 12;
        if (monthlyRate > 0) {
          const payment = balance * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -360)));
          total += payment;
        }
      }
    }
  }

  return Math.round(total * 100) / 100;
}
