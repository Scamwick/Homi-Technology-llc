/**
 * lib/plaid/sync.ts — Plaid Transaction Sync
 * ============================================
 *
 * Uses Plaid's transactionsSync endpoint with cursor-based pagination
 * to incrementally fetch new, modified, and removed transactions.
 * Stores results in Supabase bank_transactions table.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlaidApi } from 'plaid';
import type { BankConnectionRow } from '@/types/plaid';

interface SyncResult {
  added: number;
  modified: number;
  removed: number;
  cursor: string;
}

/**
 * Sync transactions for a single bank connection using Plaid's transactionsSync.
 * Fetches all pages, upserts into bank_transactions, and updates the connection cursor.
 */
export async function syncTransactionsForConnection(
  plaid: PlaidApi,
  supabase: SupabaseClient,
  connection: Pick<BankConnectionRow, 'id' | 'user_id' | 'plaid_access_token' | 'cursor'>,
): Promise<SyncResult> {
  let cursor = connection.cursor ?? '';
  let hasMore = true;
  let totalAdded = 0;
  let totalModified = 0;
  let totalRemoved = 0;

  // First, build a map of plaid_account_id → linked_account.id for this connection
  const { data: linkedAccounts } = await supabase
    .from('linked_accounts')
    .select('id, plaid_account_id')
    .eq('connection_id', connection.id);

  const accountMap = new Map<string, string>();
  for (const la of linkedAccounts ?? []) {
    accountMap.set(la.plaid_account_id, la.id);
  }

  while (hasMore) {
    const response = await plaid.transactionsSync({
      access_token: connection.plaid_access_token,
      cursor: cursor || undefined,
      count: 500,
    });

    const { added, modified, removed, next_cursor, has_more } = response.data;

    // Upsert added transactions
    if (added.length > 0) {
      const inserts = added
        .filter((t) => accountMap.has(t.account_id))
        .map((t) => ({
          account_id: accountMap.get(t.account_id)!,
          user_id: connection.user_id,
          plaid_transaction_id: t.transaction_id,
          name: t.name,
          merchant_name: t.merchant_name ?? null,
          amount: t.amount,
          currency: t.iso_currency_code ?? 'USD',
          is_pending: t.pending,
          category_primary: t.personal_finance_category?.primary ?? null,
          category_detailed: t.personal_finance_category?.detailed ?? null,
          personal_finance_category: t.personal_finance_category?.primary ?? null,
          transaction_date: t.date,
          authorized_date: t.authorized_date ?? null,
          payment_channel: t.payment_channel ?? null,
          transaction_type: t.transaction_type ?? null,
          is_recurring: false,
          metadata: {},
        }));

      if (inserts.length > 0) {
        const { error } = await supabase
          .from('bank_transactions')
          .upsert(inserts, { onConflict: 'plaid_transaction_id' });

        if (error) {
          console.error('[Plaid Sync] Error inserting transactions:', error);
        } else {
          totalAdded += inserts.length;
        }
      }
    }

    // Update modified transactions
    if (modified.length > 0) {
      for (const t of modified) {
        const accountId = accountMap.get(t.account_id);
        if (!accountId) continue;

        const { error } = await supabase
          .from('bank_transactions')
          .update({
            name: t.name,
            merchant_name: t.merchant_name ?? null,
            amount: t.amount,
            is_pending: t.pending,
            category_primary: t.personal_finance_category?.primary ?? null,
            category_detailed: t.personal_finance_category?.detailed ?? null,
            personal_finance_category: t.personal_finance_category?.primary ?? null,
            transaction_date: t.date,
            authorized_date: t.authorized_date ?? null,
          })
          .eq('plaid_transaction_id', t.transaction_id);

        if (!error) totalModified++;
      }
    }

    // Remove deleted transactions
    if (removed.length > 0) {
      const removedIds = removed
        .map((t) => t.transaction_id)
        .filter((id): id is string => !!id);

      if (removedIds.length > 0) {
        const { error } = await supabase
          .from('bank_transactions')
          .delete()
          .in('plaid_transaction_id', removedIds);

        if (!error) totalRemoved += removedIds.length;
      }
    }

    cursor = next_cursor;
    hasMore = has_more;
  }

  // Update connection cursor and last_synced_at
  await supabase
    .from('bank_connections')
    .update({ cursor, last_synced_at: new Date().toISOString() })
    .eq('id', connection.id);

  // Also update linked account balances
  try {
    const balancesRes = await plaid.accountsGet({
      access_token: connection.plaid_access_token,
    });
    for (const acct of balancesRes.data.accounts) {
      const linkedId = accountMap.get(acct.account_id);
      if (!linkedId) continue;

      await supabase
        .from('linked_accounts')
        .update({
          balance_current: acct.balances.current ?? null,
          balance_available: acct.balances.available ?? null,
          balance_limit: acct.balances.limit ?? null,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', linkedId);
    }
  } catch {
    // Non-critical — balances will update on next sync
  }

  return { added: totalAdded, modified: totalModified, removed: totalRemoved, cursor };
}

/**
 * Full sync alias — re-fetches all transactions for a connection.
 */
export async function fullSync(
  accessToken: string,
  plaidItemId: string,
  userId: string,
): Promise<void> {
  // TODO: Implement full re-sync using Plaid client + Supabase
  console.log(`[HōMI Plaid] Full sync requested for item ${plaidItemId}, user ${userId}`);
}
