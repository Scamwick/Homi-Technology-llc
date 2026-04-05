/**
 * GET /api/plaid/accounts — List connected bank accounts
 * =======================================================
 *
 * Returns accounts grouped by institution with current balances.
 * Queries Supabase for stored connections and accounts.
 *
 * Returns: { success: boolean, data?: BankConnectionView[], error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';
import type { BankConnectionView, LinkedAccountView } from '@/types/plaid';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const supabase = getSupabaseForRoute(req);

  if (!supabase) {
    // Dev mode: return empty connections
    return NextResponse.json({ success: true, data: [] });
  }

  const userId = ctx.user!.id;

  const { data: connections, error } = await supabase
    .from('bank_connections')
    .select('id, institution_name, institution_logo, institution_color, status, error_message, last_synced_at, linked_accounts(id, name, official_name, account_type, mask, balance_current, balance_available, balance_limit, currency, is_visible, nickname)')
    .eq('user_id', userId)
    .neq('status', 'revoked')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch bank connections:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Failed to fetch bank connections' } },
      { status: 500 },
    );
  }

  const views: BankConnectionView[] = (connections ?? []).map((conn) => ({
    id: conn.id,
    institution_name: conn.institution_name,
    institution_logo: conn.institution_logo,
    institution_color: conn.institution_color,
    status: conn.status,
    error_message: conn.error_message,
    last_synced_at: conn.last_synced_at,
    accounts: ((conn.linked_accounts as Record<string, unknown>[]) ?? []).map((a): LinkedAccountView => ({
      id: a.id as string,
      name: a.name as string,
      official_name: (a.official_name as string) ?? null,
      account_type: a.account_type as LinkedAccountView['account_type'],
      mask: (a.mask as string) ?? null,
      balance_current: (a.balance_current as number) ?? null,
      balance_available: (a.balance_available as number) ?? null,
      balance_limit: (a.balance_limit as number) ?? null,
      currency: (a.currency as string) ?? 'USD',
      is_visible: (a.is_visible as boolean) ?? true,
      nickname: (a.nickname as string) ?? null,
      display_name: ((a.nickname as string) ?? (a.name as string)),
    })),
  }));

  return NextResponse.json({
    success: true,
    data: views,
  });
});
