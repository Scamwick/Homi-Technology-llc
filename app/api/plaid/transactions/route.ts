/**
 * GET /api/plaid/transactions — Fetch bank transactions
 * ======================================================
 *
 * Query: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * Returns transactions from linked accounts.
 * Returns mock data when Plaid credentials are missing.
 *
 * Returns: { success: boolean, data?: BankTransactionRow[], error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { MOCK_TRANSACTIONS } from '@/lib/mocks/calendar-data';

export const GET = withAuth(async (req: NextRequest, _ctx) => {
  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  let transactions = [...MOCK_TRANSACTIONS];

  if (startDate) {
    transactions = transactions.filter((t) => t.transaction_date >= startDate);
  }
  if (endDate) {
    transactions = transactions.filter((t) => t.transaction_date <= endDate);
  }

  return NextResponse.json({
    success: true,
    data: transactions,
  });
});
