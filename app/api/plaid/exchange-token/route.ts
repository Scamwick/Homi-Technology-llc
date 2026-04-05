/**
 * POST /api/plaid/exchange-token — Exchange public token for access token
 * =======================================================================
 *
 * Receives public_token from Plaid Link → exchanges for persistent access_token.
 * Fetches institution metadata and account list.
 * Stores connection and accounts in Supabase.
 *
 * Returns: { success: boolean, data?: ExchangeTokenResponse, error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlaidClient } from '@/lib/plaid/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';
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

  if (!client) {
    return NextResponse.json(
      { success: false, error: { code: 'PLAID_NOT_CONFIGURED', message: 'Plaid credentials are not configured.' } },
      { status: 503 },
    );
  }

  try {
    // Exchange public token for access token
    const exchangeRes = await client.itemPublicTokenExchange({
      public_token: body.public_token,
    });
    const { access_token, item_id } = exchangeRes.data;

    // Fetch accounts from Plaid
    const accountsRes = await client.accountsGet({ access_token });
    const plaidAccounts = accountsRes.data.accounts;

    // Try to get institution logo/color
    let institutionLogo: string | null = null;
    let institutionColor: string | null = null;
    if (body.institution_id) {
      try {
        const instRes = await client.institutionsGetById({
          institution_id: body.institution_id,
          country_codes: ['US'] as never[],
          options: { include_optional_metadata: true },
        });
        institutionLogo = instRes.data.institution.logo ?? null;
        institutionColor = instRes.data.institution.primary_color ?? null;
      } catch {
        // Non-critical — proceed without logo/color
      }
    }

    const userId = ctx.user!.id;
    const supabase = getSupabaseForRoute(req);

    let connectionId = item_id;
    const accounts: LinkedAccountView[] = [];

    if (supabase) {
      // Insert bank connection
      const { data: connection, error: connError } = await supabase
        .from('bank_connections')
        .insert({
          user_id: userId,
          plaid_item_id: item_id,
          plaid_access_token: access_token,
          institution_id: body.institution_id ?? 'unknown',
          institution_name: body.institution_name ?? 'Unknown Institution',
          institution_logo: institutionLogo,
          institution_color: institutionColor,
          status: 'active',
        })
        .select('id')
        .single();

      if (connError) {
        console.error('Failed to store bank connection:', connError);
        return NextResponse.json(
          { success: false, error: { code: 'DB_ERROR', message: 'Failed to store bank connection' } },
          { status: 500 },
        );
      }

      connectionId = connection.id;

      // Insert linked accounts
      const accountInserts = plaidAccounts.map((a) => ({
        connection_id: connection.id,
        user_id: userId,
        plaid_account_id: a.account_id,
        name: a.name,
        official_name: a.official_name ?? null,
        account_type: mapAccountType(a.type),
        subtype: a.subtype ?? null,
        mask: a.mask ?? null,
        balance_current: a.balances.current ?? null,
        balance_available: a.balances.available ?? null,
        balance_limit: a.balances.limit ?? null,
        currency: a.balances.iso_currency_code ?? 'USD',
        is_visible: true,
        last_synced_at: new Date().toISOString(),
      }));

      const { data: savedAccounts, error: acctError } = await supabase
        .from('linked_accounts')
        .insert(accountInserts)
        .select('id, name, official_name, account_type, mask, balance_current, balance_available, balance_limit, currency, is_visible, nickname');

      if (acctError) {
        console.error('Failed to store linked accounts:', acctError);
        return NextResponse.json(
          { success: false, error: { code: 'DB_ERROR', message: 'Failed to store linked accounts' } },
          { status: 500 },
        );
      }

      for (const sa of savedAccounts ?? []) {
        accounts.push({
          id: sa.id,
          name: sa.name,
          official_name: sa.official_name,
          account_type: sa.account_type,
          mask: sa.mask,
          balance_current: sa.balance_current,
          balance_available: sa.balance_available,
          balance_limit: sa.balance_limit,
          currency: sa.currency,
          is_visible: sa.is_visible,
          nickname: sa.nickname,
          display_name: sa.nickname ?? sa.name,
        });
      }
    } else {
      // Dev mode: return Plaid data directly without persisting
      for (const a of plaidAccounts) {
        accounts.push({
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
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        connection_id: connectionId,
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
