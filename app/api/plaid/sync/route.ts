/**
 * POST /api/plaid/sync — Manually trigger transaction sync
 * ==========================================================
 *
 * Body: { connection_id?: string }
 * If connection_id is provided, syncs that connection only.
 * Otherwise, syncs all active connections for the authenticated user.
 *
 * Returns: { success: boolean, data?: SyncSummary, error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';
import { getPlaidClient } from '@/lib/plaid/server';
import { syncTransactionsForConnection } from '@/lib/plaid/sync';

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const plaid = getPlaidClient();
  if (!plaid) {
    return NextResponse.json(
      { success: false, error: { code: 'PLAID_NOT_CONFIGURED', message: 'Plaid credentials are not configured.' } },
      { status: 503 },
    );
  }

  const supabase = getSupabaseForRoute(req);
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_NOT_CONFIGURED', message: 'Database not configured.' } },
      { status: 503 },
    );
  }

  let body: { connection_id?: string } = {};
  try {
    body = await req.json();
  } catch {
    // No body is fine — sync all connections
  }

  const userId = ctx.user!.id;

  // Fetch connections to sync
  let query = supabase
    .from('bank_connections')
    .select('id, user_id, plaid_access_token, cursor')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (body.connection_id) {
    query = query.eq('id', body.connection_id);
  }

  const { data: connections, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Failed to fetch connections' } },
      { status: 500 },
    );
  }

  if (!connections || connections.length === 0) {
    return NextResponse.json({
      success: true,
      data: { synced: 0, added: 0, modified: 0, removed: 0 },
    });
  }

  let totalAdded = 0;
  let totalModified = 0;
  let totalRemoved = 0;
  const errors: string[] = [];

  for (const conn of connections) {
    try {
      const result = await syncTransactionsForConnection(plaid, supabase, conn);
      totalAdded += result.added;
      totalModified += result.modified;
      totalRemoved += result.removed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown sync error';
      errors.push(`Connection ${conn.id}: ${msg}`);
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    data: {
      synced: connections.length - errors.length,
      added: totalAdded,
      modified: totalModified,
      removed: totalRemoved,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});
