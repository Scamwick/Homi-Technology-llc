/**
 * GET /api/plaid/accounts — List connected bank accounts
 * =======================================================
 *
 * Returns accounts grouped by institution with current balances.
 * Queries Supabase for stored connections and accounts.
 *
 * Returns: { success: boolean, data?: BankConnectionView[], error?: { code, message } }
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import type { BankConnectionView } from '@/types/plaid';

export const GET = withAuth(async (_req, _ctx) => {
  // TODO: Query Supabase for user's bank_connections + linked_accounts
  // const { data: connections } = await supabase
  //   .from('bank_connections')
  //   .select('*, linked_accounts(*)')
  //   .eq('user_id', ctx.user.id)
  //   .neq('status', 'revoked')
  //   .order('created_at', { ascending: false });

  // For now, return empty — real data comes after Plaid Link flow
  const connections: BankConnectionView[] = [];

  return NextResponse.json({
    success: true,
    data: connections,
  });
});
