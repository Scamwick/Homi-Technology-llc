/**
 * POST /api/plaid/exchange-token — Exchange public token for access token
 * =======================================================================
 *
 * Receives public_token from Plaid Link → exchanges for persistent access_token.
 * Fetches institution metadata and account list.
 * Returns mock data when Plaid credentials are missing.
 *
 * Returns: { success: boolean, data?: ExchangeTokenResponse, error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlaidClient } from '@/lib/plaid/server';
import { withAuth } from '@/lib/api/middleware';
import type { LinkedAccountView, BankAccountType } from '@/types/plaid';

export const POST = withAuth(async (req: NextRequest, ctx) => {
  let body: { public_token?: string; institution_id?: string; institution_name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_BODY', message: 'Invalid JSON body' } },
      { status: 400 },
    );
  }

  if (!body.public_token) {
    return NextResponse.json(
      { success: false, error: { code: 'MISSING_TOKEN', message: 'public_token is required' } },
      { status: 400 },
    );
  }

  const client = getPlaidClient();

  // Mock mode
  if (!client) {
    const mockAccounts: LinkedAccountView[] = [
      {
        id: 'acct_mock_001',
        name: 'Plaid Checking',
        official_name: 'Plaid Gold Standard 0% Interest Checking',
        account_type: 'checking',
        mask: '0000',
        balance_current: 4200.50,
        balance_available: 4150.00,
        balance_limit: null,
        currency: 'USD',
        is_visible: true,
        nickname: null,
        display_name: 'Plaid Checking',
      },
      {
        id: 'acct_mock_002',
        name: 'Plaid Saving',
        official_name: 'Plaid Silver Standard 0.1% Interest Saving',
        account_type: 'savings',
        mask: '1111',
        balance_current: 12800.00,
        balance_available: 12800.00,
        balance_limit: null,
        currency: 'USD',
        is_visible: true,
        nickname: null,
        display_name: 'Plaid Saving',
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        connection_id: 'conn_mock_' + Date.now(),
        accounts: mockAccounts,
      },
    });
  }

  try {
    // Exchange public token
    const exchangeRes = await client.itemPublicTokenExchange({
      public_token: body.public_token,
    });
    const { access_token, item_id } = exchangeRes.data;

    // Fetch accounts
    const accountsRes = await client.accountsGet({ access_token });
    const accounts: LinkedAccountView[] = accountsRes.data.accounts.map((a) => ({
      id: a.account_id,
      name: a.name,
      official_name: a.official_name ?? null,
      account_type: mapAccountType(a.type),
      mask: a.mask ?? null,
      balance_current: a.balances.current ?? null,
      balance_available: a.balances.available ?? null,
      balance_limit: a.balances.limit ?? null,
      currency: a.balances.iso_currency_code ?? 'USD',
      is_visible: true,
      nickname: null,
      display_name: a.name,
    }));

    // TODO: Store access_token, item_id, and accounts in Supabase

    return NextResponse.json({
      success: true,
      data: {
        connection_id: item_id,
        accounts,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to exchange token';
    return NextResponse.json(
      { success: false, error: { code: 'PLAID_ERROR', message } },
      { status: 500 },
    );
  }
});

function mapAccountType(plaidType: string): BankAccountType {
  const mapping: Record<string, BankAccountType> = {
    depository: 'checking',
    credit: 'credit',
    loan: 'loan',
    investment: 'investment',
    mortgage: 'mortgage',
  };
  return mapping[plaidType] ?? 'other';
}
