// =============================================================================
// lib/plaid/mapping.ts — Transaction-to-Calendar Conversion
// =============================================================================
// Maps Plaid transactions to CalendarEventRow shape for unified display
// in the Financial Calendar. Each mapped event carries metadata.source = 'plaid'
// so the UI can distinguish imported from manual events.
// =============================================================================

import type { BankTransactionRow } from '@/types/plaid';
import type { CalendarEventRow, CalendarEventType } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Category mapping
// ---------------------------------------------------------------------------

const CATEGORY_TO_EVENT_TYPE: Record<string, CalendarEventType> = {
  // Income
  INCOME: 'paycheck',
  TRANSFER_IN: 'paycheck',

  // Debt payments
  LOAN_PAYMENTS: 'loan_payment',

  // Housing & utilities
  RENT_AND_UTILITIES: 'bill',

  // Food & general spending
  FOOD_AND_DRINK: 'bill',
  GENERAL_MERCHANDISE: 'bill',
  GENERAL_SERVICES: 'bill',

  // Transportation
  TRANSPORTATION: 'bill',

  // Entertainment (often subscriptions)
  ENTERTAINMENT: 'subscription',

  // Transfers
  TRANSFER_OUT: 'transfer',

  // Government & tax
  GOVERNMENT_AND_NON_PROFIT: 'tax',
};

/**
 * Determines the CalendarEventType for a Plaid transaction based on its
 * personal_finance_category, recurring status, and transfer details.
 */
function resolveEventType(txn: BankTransactionRow): CalendarEventType {
  const category = txn.personal_finance_category ?? txn.category_primary ?? '';

  // Negative amounts in Plaid = income (money flowing in)
  if (txn.amount < 0) return 'paycheck';

  // Recurring entertainment → subscription
  if (txn.is_recurring && (category === 'ENTERTAINMENT' || category === 'GENERAL_SERVICES')) {
    return 'subscription';
  }

  // Savings transfers
  if (category === 'TRANSFER_OUT' && txn.category_detailed?.includes('SAVINGS')) {
    return 'savings_deposit';
  }

  // Investment transfers
  if (category === 'TRANSFER_OUT' && txn.category_detailed?.includes('INVESTMENT')) {
    return 'investment';
  }

  return CATEGORY_TO_EVENT_TYPE[category] ?? 'other';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Maps a single Plaid transaction to a CalendarEventRow.
 * The resulting event has metadata.source = 'plaid' for visual distinction.
 */
export function mapTransactionToEvent(txn: BankTransactionRow): CalendarEventRow {
  const eventType = resolveEventType(txn);
  const isIncome = txn.amount < 0; // Plaid: negative = credit to account
  const absoluteAmount = Math.abs(txn.amount);
  const now = new Date().toISOString();

  return {
    id: `plaid_${txn.plaid_transaction_id}`,
    user_id: txn.user_id,
    organization_id: null,
    title: txn.merchant_name ?? txn.name,
    description: txn.name !== txn.merchant_name ? txn.name : null,
    event_type: eventType,
    category: txn.category_primary ?? null,
    amount: absoluteAmount,
    currency: txn.currency,
    is_income: isIncome,
    event_date: txn.transaction_date,
    event_time: null,
    end_date: null,
    recurrence: txn.is_recurring ? 'monthly' : 'none',
    recurrence_end: null,
    recurrence_metadata: null,
    is_confirmed: !txn.is_pending,
    confirmed_at: txn.is_pending ? null : txn.transaction_date + 'T00:00:00Z',
    is_autopay: txn.is_recurring,
    merchant: txn.merchant_name ?? null,
    account_label: null,
    notes: null,
    reminder_days: [],
    color: null,
    metadata: {
      source: 'plaid' as const,
      plaid_transaction_id: txn.plaid_transaction_id,
      is_pending: txn.is_pending,
      payment_channel: txn.payment_channel,
      is_recurring: txn.is_recurring,
      anomaly: (txn.metadata as Record<string, unknown>)?.anomaly ?? false,
      average_amount: (txn.metadata as Record<string, unknown>)?.average_amount,
      deviation_pct: (txn.metadata as Record<string, unknown>)?.deviation_pct,
    },
    created_at: txn.created_at,
    updated_at: now,
  };
}

/**
 * Maps an array of Plaid transactions to CalendarEventRow[].
 */
export function mapTransactionsToEvents(transactions: BankTransactionRow[]): CalendarEventRow[] {
  return transactions.map(mapTransactionToEvent);
}
