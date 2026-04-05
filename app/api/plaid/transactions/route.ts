/**
 * GET /api/plaid/transactions — Fetch bank transactions
 * ======================================================
 *
 * Query: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=50
 * Returns transactions from linked accounts stored in Supabase.
 *
 * Returns: { success: boolean, data?: BankTransactionRow[], error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';
import type { BankTransactionRow } from '@/types/plaid';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const supabase = getSupabaseForRoute(req);

  if (!supabase) {
    // Dev mode: return empty transactions
    return NextResponse.json({ success: true, data: [] });
  }

  const userId = ctx.user!.id;
  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '200', 10), 500);

  let query = supabase
    .from('bank_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .limit(limit);

  if (startDate) {
    query = query.gte('transaction_date', startDate);
  }
  if (endDate) {
    query = query.lte('transaction_date', endDate);
  }

  const { data: transactions, error } = await query;

  if (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Failed to fetch transactions' } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: (transactions ?? []) as BankTransactionRow[],
  });
});
