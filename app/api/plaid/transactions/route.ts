/**
 * GET /api/plaid/transactions — Fetch bank transactions
 * ======================================================
 *
 * Query: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * Returns transactions from linked accounts stored in Supabase.
 *
 * Returns: { success: boolean, data?: BankTransactionRow[], error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import type { BankTransactionRow } from '@/types/plaid';

export const GET = withAuth(async (req: NextRequest, _ctx) => {
  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  // TODO: Query Supabase for user's bank_transactions
  // let query = supabase
  //   .from('bank_transactions')
  //   .select('*')
  //   .eq('user_id', ctx.user.id)
  //   .order('transaction_date', { ascending: false });
  //
  // if (startDate) query = query.gte('transaction_date', startDate);
  // if (endDate) query = query.lte('transaction_date', endDate);
  //
  // const { data: transactions } = await query;

  // For now, return empty — real data comes after Plaid sync
  const transactions: BankTransactionRow[] = [];

  return NextResponse.json({
    success: true,
    data: transactions,
  });
});
