/**
 * GET /api/plaid/accounts — List connected bank accounts
 * =======================================================
 *
 * Returns accounts grouped by institution with current balances.
 * Returns mock data when Plaid credentials are missing.
 *
 * Returns: { success: boolean, data?: BankConnectionView[], error?: { code, message } }
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { MOCK_BANK_CONNECTIONS } from '@/lib/mocks/calendar-data';

export const GET = withAuth(async (_req, _ctx) => {
  // In production, fetch from Supabase bank_connections + linked_accounts
  // For now, always return mock data
  return NextResponse.json({
    success: true,
    data: MOCK_BANK_CONNECTIONS,
  });
});
