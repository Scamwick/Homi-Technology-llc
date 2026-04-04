/**
 * Plaid Data Sync Service
 * ========================
 *
 * Handles syncing financial data from Plaid into our database:
 *   - Transactions (via Transactions Sync API with cursor-based pagination)
 *   - Account balances
 *   - Liabilities (credit cards, loans, mortgages)
 *
 * After syncing raw data, triggers snapshot derivation for scoring.
 */

import { plaidClient } from './client';
import { deriveFinancialSnapshot } from './derive-snapshot';
import type {
  Transaction,
  RemovedTransaction,
} from 'plaid';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncResult {
  transactionsAdded: number;
  transactionsModified: number;
  transactionsRemoved: number;
  accountsUpdated: number;
  liabilitiesUpdated: number;
  snapshotId: string | null;
}

// ---------------------------------------------------------------------------
// Transaction Sync (cursor-based)
// ---------------------------------------------------------------------------

/**
 * Syncs transactions for a Plaid item using the Transactions Sync API.
 * Uses a cursor stored in the database to fetch only new/changed data.
 */
export async function syncTransactions(
  accessToken: string,
  plaidItemId: string,
): Promise<{ added: number; modified: number; removed: number }> {
  const supabase = await createClient();

  // Get the current cursor for this item
  const { data: item } = await supabase
    .from('plaid_items')
    .select('id, plaid_cursor')
    .eq('plaid_item_id', plaidItemId)
    .single();

  if (!item) throw new Error(`Plaid item not found: ${plaidItemId}`);

  let cursor = item.plaid_cursor ?? undefined;
  let hasMore = true;
  let added = 0;
  let modified = 0;
  let removed = 0;

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor,
      count: 500,
    });

    const data = response.data;

    // Process added transactions
    if (data.added.length > 0) {
      await upsertTransactions(data.added, item.id);
      added += data.added.length;
    }

    // Process modified transactions
    if (data.modified.length > 0) {
      await upsertTransactions(data.modified, item.id);
      modified += data.modified.length;
    }

    // Process removed transactions
    if (data.removed.length > 0) {
      await removeTransactions(data.removed);
      removed += data.removed.length;
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  // Update cursor in database
  await supabase
    .from('plaid_items')
    .update({
      plaid_cursor: cursor,
      last_synced_at: new Date().toISOString(),
    })
    .eq('plaid_item_id', plaidItemId);

  return { added, modified, removed };
}

// ---------------------------------------------------------------------------
// Balance Sync
// ---------------------------------------------------------------------------

/**
 * Fetches current balances for all accounts under a Plaid item.
 */
export async function syncBalances(
  accessToken: string,
  plaidItemId: string,
): Promise<number> {
  const supabase = await createClient();

  const response = await plaidClient.accountsBalanceGet({
    access_token: accessToken,
  });

  const accounts = response.data.accounts;
  let updated = 0;

  for (const account of accounts) {
    await supabase
      .from('plaid_accounts')
      .upsert(
        {
          plaid_account_id: account.account_id,
          plaid_item_id: plaidItemId,
          name: account.name,
          official_name: account.official_name ?? null,
          type: account.type,
          subtype: account.subtype ?? null,
          mask: account.mask ?? null,
          current_balance: account.balances.current,
          available_balance: account.balances.available,
          credit_limit: account.balances.limit,
          iso_currency_code: account.balances.iso_currency_code ?? 'USD',
          last_balance_update: new Date().toISOString(),
        },
        { onConflict: 'plaid_account_id' },
      );
    updated++;
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Liability Sync
// ---------------------------------------------------------------------------

/**
 * Syncs liability data (credit cards, student loans, mortgages).
 */
export async function syncLiabilities(
  accessToken: string,
): Promise<number> {
  const supabase = await createClient();
  let updated = 0;

  try {
    const response = await plaidClient.liabilitiesGet({
      access_token: accessToken,
    });

    const { credit, student, mortgage } = response.data.liabilities;

    // Credit card liabilities
    if (credit) {
      for (const card of credit) {
        await upsertLiability(supabase, card.account_id, {
          type: 'credit',
          minimum_payment: card.minimum_payment_amount,
          last_payment_amount: card.last_payment_amount,
          last_payment_date: card.last_payment_date,
          next_payment_due_date: card.next_payment_due_date,
          apr: card.aprs?.[0]?.apr_percentage,
          balance: card.last_statement_balance,
        });
        updated++;
      }
    }

    // Student loan liabilities
    if (student) {
      for (const loan of student) {
        await upsertLiability(supabase, loan.account_id, {
          type: 'student',
          minimum_payment: loan.minimum_payment_amount,
          last_payment_amount: loan.last_payment_amount,
          last_payment_date: loan.last_payment_date,
          next_payment_due_date: loan.next_payment_due_date,
          apr: loan.interest_rate_percentage,
          balance: loan.outstanding_interest_amount != null && loan.origination_principal_amount != null
            ? (loan.outstanding_interest_amount + loan.origination_principal_amount)
            : null,
          origination_date: loan.origination_date,
          origination_principal: loan.origination_principal_amount,
          term: loan.repayment_plan?.type ?? null,
        });
        updated++;
      }
    }

    // Mortgage liabilities
    if (mortgage) {
      for (const mort of mortgage) {
        await upsertLiability(supabase, mort.account_id, {
          type: 'mortgage',
          minimum_payment: mort.last_payment_amount,
          last_payment_amount: mort.last_payment_amount,
          last_payment_date: mort.last_payment_date,
          next_payment_due_date: mort.next_payment_due_date,
          apr: mort.interest_rate?.percentage,
          interest_rate_type: mort.interest_rate?.type,
          balance: mort.current_late_fee != null ? undefined : undefined,
          origination_date: mort.origination_date,
          origination_principal: mort.origination_principal_amount,
          term: mort.loan_term ?? null,
        });
        updated++;
      }
    }
  } catch (error) {
    // Liabilities may not be available for all items — graceful degradation
    console.warn('[Plaid Sync] Liabilities fetch failed (product may not be enabled):', error);
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Full Sync Orchestrator
// ---------------------------------------------------------------------------

/**
 * Performs a full sync for a Plaid item: transactions, balances, liabilities.
 * Then derives a new financial snapshot for scoring.
 */
export async function fullSync(
  accessToken: string,
  plaidItemId: string,
  userId: string,
): Promise<SyncResult> {
  // Run balance and transaction sync in parallel
  const [txnResult, accountsUpdated, liabilitiesUpdated] = await Promise.all([
    syncTransactions(accessToken, plaidItemId),
    syncBalances(accessToken, plaidItemId),
    syncLiabilities(accessToken),
  ]);

  // Derive new financial snapshot from all synced data
  const snapshotId = await deriveFinancialSnapshot(userId);

  return {
    transactionsAdded: txnResult.added,
    transactionsModified: txnResult.modified,
    transactionsRemoved: txnResult.removed,
    accountsUpdated,
    liabilitiesUpdated,
    snapshotId,
  };
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

async function upsertTransactions(
  transactions: Transaction[],
  plaidItemDbId: string,
): Promise<void> {
  const supabase = await createClient();

  for (const txn of transactions) {
    // Look up the account DB id from plaid_account_id
    const { data: account } = await supabase
      .from('plaid_accounts')
      .select('id')
      .eq('plaid_account_id', txn.account_id)
      .single();

    if (!account) continue;

    await supabase
      .from('plaid_transactions')
      .upsert(
        {
          plaid_account_id: account.id,
          plaid_transaction_id: txn.transaction_id,
          amount: txn.amount,
          iso_currency_code: txn.iso_currency_code ?? 'USD',
          category: txn.category ?? [],
          personal_finance_category: txn.personal_finance_category ?? null,
          merchant_name: txn.merchant_name ?? null,
          name: txn.name,
          date: txn.date,
          authorized_date: txn.authorized_date ?? null,
          pending: txn.pending,
          payment_channel: txn.payment_channel ?? null,
        },
        { onConflict: 'plaid_transaction_id' },
      );
  }
}

async function removeTransactions(
  removed: RemovedTransaction[],
): Promise<void> {
  const supabase = await createClient();

  const ids = removed
    .map((r) => r.transaction_id)
    .filter((id): id is string => id != null);

  if (ids.length > 0) {
    await supabase
      .from('plaid_transactions')
      .delete()
      .in('plaid_transaction_id', ids);
  }
}

async function upsertLiability(
  supabase: Awaited<ReturnType<typeof createClient>>,
  plaidAccountId: string | null,
  data: Record<string, unknown>,
): Promise<void> {
  if (!plaidAccountId) return;

  const { data: account } = await supabase
    .from('plaid_accounts')
    .select('id')
    .eq('plaid_account_id', plaidAccountId)
    .single();

  if (!account) return;

  await supabase
    .from('plaid_liabilities')
    .upsert(
      {
        plaid_account_id: account.id,
        ...data,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'plaid_account_id' },
    );
}
