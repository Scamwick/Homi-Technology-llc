/**
 * POST /api/webhooks/plaid — Plaid webhook handler
 * ==================================================
 *
 * Handles Plaid webhook events:
 * - SYNC_UPDATES_AVAILABLE: Triggers transaction sync
 * - ERROR: Marks connection as degraded
 * - PENDING_EXPIRATION: Updates consent expiration
 *
 * Uses service-role Supabase client (no user session in webhooks).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPlaidClient } from '@/lib/plaid/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncTransactionsForConnection } from '@/lib/plaid/sync';

interface PlaidWebhookBody {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: { error_code: string; error_message: string };
  consent_expiration_time?: string;
}

export async function POST(req: NextRequest) {
  let body: PlaidWebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const plaid = getPlaidClient();

  if (!supabase || !plaid) {
    console.warn('[Plaid Webhook] Supabase or Plaid not configured — skipping');
    return NextResponse.json({ received: true, skipped: true });
  }

  const { webhook_code, item_id } = body;

  // Sanitize user-provided values for logging
  const safeItemId = String(item_id).replace(/%/g, '%%');
  const safeWebhookCode = String(webhook_code).replace(/%/g, '%%');

  // Look up the connection by plaid_item_id
  const { data: connection, error: lookupError } = await supabase
    .from('bank_connections')
    .select('id, user_id, plaid_access_token, cursor, status')
    .eq('plaid_item_id', item_id)
    .single();

  if (lookupError || !connection) {
    console.error('[Plaid Webhook] No connection found for item:', safeItemId, lookupError);
    return NextResponse.json({ received: true, error: 'Connection not found' });
  }

  switch (webhook_code) {
    case 'SYNC_UPDATES_AVAILABLE': {
      console.log('[Plaid Webhook] Syncing transactions for item:', safeItemId);
      try {
        const result = await syncTransactionsForConnection(plaid, supabase, connection);
        console.log('[Plaid Webhook] Sync complete:', { added: result.added, modified: result.modified, removed: result.removed });
      } catch (err) {
        console.error('[Plaid Webhook] Sync failed for item:', safeItemId, err);
      }
      break;
    }

    case 'ERROR': {
      console.log('[Plaid Webhook] Error for item:', safeItemId, body.error);
      await supabase
        .from('bank_connections')
        .update({
          status: 'degraded',
          error_code: body.error?.error_code ?? null,
          error_message: body.error?.error_message ?? null,
        })
        .eq('id', connection.id);
      break;
    }

    case 'PENDING_EXPIRATION': {
      console.log('[Plaid Webhook] Consent expiring for item:', safeItemId);
      await supabase
        .from('bank_connections')
        .update({
          consent_expires_at: body.consent_expiration_time ?? null,
        })
        .eq('id', connection.id);
      break;
    }

    case 'INITIAL_UPDATE':
    case 'HISTORICAL_UPDATE': {
      // Legacy webhook codes — trigger sync same as SYNC_UPDATES_AVAILABLE
      console.log('[Plaid Webhook]', safeWebhookCode, 'for item:', safeItemId, '— triggering sync');
      try {
        const result = await syncTransactionsForConnection(plaid, supabase, connection);
        console.log('[Plaid Webhook] Sync complete:', { added: result.added, modified: result.modified, removed: result.removed });
      } catch (err) {
        console.error('[Plaid Webhook] Sync failed for item:', safeItemId, err);
      }
      break;
    }

    default:
      console.log('[Plaid Webhook] Unhandled:', String(body.webhook_type).replace(/%/g, '%%'), '/', safeWebhookCode, 'for item:', safeItemId);
  }

  return NextResponse.json({ received: true });
}
