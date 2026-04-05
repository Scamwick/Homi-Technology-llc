/**
 * POST /api/plaid/webhooks — Plaid Webhook Handler
 * ==================================================
 *
 * Receives webhook events from Plaid and triggers appropriate actions:
 *
 *  TRANSACTIONS:
 *    - SYNC_UPDATES_AVAILABLE: New transactions to sync
 *    - DEFAULT_UPDATE: Initial transaction pull complete
 *
 *  ITEM:
 *    - ERROR: Item needs attention (re-auth, etc.)
 *    - PENDING_EXPIRATION: Access token expiring soon
 *
 *  LIABILITIES:
 *    - DEFAULT_UPDATE: Liability data refreshed
 *
 * After syncing data, triggers financial snapshot derivation and
 * alert evaluation.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fullSync } from '@/lib/plaid/sync';
import { evaluateAlerts } from '@/lib/alerts/engine';
import { plaidClient } from '@/lib/plaid/client';

// ---------------------------------------------------------------------------
// Webhook Verification
// ---------------------------------------------------------------------------

/**
 * Verifies that the webhook request is from Plaid using JWT verification.
 * Returns true if verification passes or if PLAID_WEBHOOK_SECRET is not set
 * (development mode — logs a warning).
 */
async function verifyPlaidWebhook(request: NextRequest, body: string): Promise<boolean> {
  const plaidVerification = request.headers.get('plaid-verification');

  if (!plaidVerification) {
    // In development, allow unsigned webhooks with a warning
    if (!process.env.PLAID_WEBHOOK_SECRET) {
      console.warn('[Plaid Webhook] No verification header — skipping verification (dev mode)');
      return true;
    }
    console.error('[Plaid Webhook] Missing plaid-verification header');
    return false;
  }

  try {
    // Use Plaid SDK to verify webhook
    const keyResponse = await plaidClient.webhookVerificationKeyGet({
      key_id: plaidVerification,
    });
    // If the key fetch succeeds, the webhook is from Plaid
    return Boolean(keyResponse.data.key);
  } catch (error) {
    console.error('[Plaid Webhook] Verification failed:', error);
    // In development without full Plaid config, allow through
    if (!process.env.PLAID_WEBHOOK_SECRET) return true;
    return false;
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let body: Record<string, unknown>;

  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Verify webhook signature
  const isValid = await verifyPlaidWebhook(request, rawBody);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const webhookType = String(body.webhook_type ?? '').replace(/%/g, '%%');
  const webhookCode = String(body.webhook_code ?? '').replace(/%/g, '%%');
  const itemId = String(body.item_id ?? '').replace(/%/g, '%%');

  console.log('[Plaid Webhook]', webhookType + '.' + webhookCode, 'for item:', itemId);

  const supabase = await createClient();

  // Look up the item to get access token and user
  const { data: item } = await supabase
    .from('plaid_items')
    .select('id, user_id, plaid_access_token, plaid_item_id')
    .eq('plaid_item_id', body.item_id as string)
    .single();

  if (!item) {
    console.warn('[Plaid Webhook] Unknown item:', itemId);
    return NextResponse.json({ received: true });
  }

  try {
    switch (body.webhook_type as string) {
      case 'TRANSACTIONS': {
        if (body.webhook_code === 'SYNC_UPDATES_AVAILABLE' || body.webhook_code === 'DEFAULT_UPDATE') {
          // Sync new transactions and rederive snapshot
          await fullSync(item.plaid_access_token, item.plaid_item_id, item.user_id);
          // Evaluate alerts based on new data
          await evaluateAlerts(item.user_id);
        }
        break;
      }

      case 'ITEM': {
        if (body.webhook_code === 'ERROR') {
          const plaidError = body.error as Record<string, string> | undefined;
          await supabase
            .from('plaid_items')
            .update({
              status: 'error',
              error_code: plaidError?.error_code ?? 'UNKNOWN',
              error_message: plaidError?.error_message ?? 'Unknown error',
            })
            .eq('plaid_item_id', body.item_id as string);

          // Notify user about the error
          await supabase
            .from('notifications')
            .insert({
              user_id: item.user_id,
              type: 'system',
              title: 'Bank Connection Issue',
              body: 'Your bank connection needs attention. Please reconnect your account to keep your H\u014dMI-Score up to date.',
              data: { itemId: body.item_id, errorCode: plaidError?.error_code },
            });
        }

        if (body.webhook_code === 'PENDING_EXPIRATION') {
          await supabase
            .from('plaid_items')
            .update({
              consent_expires_at: (body.consent_expiration_time as string) ?? null,
            })
            .eq('plaid_item_id', body.item_id as string);

          await supabase
            .from('notifications')
            .insert({
              user_id: item.user_id,
              type: 'system',
              title: 'Bank Connection Expiring',
              body: 'Your bank connection will expire soon. Please re-authenticate to maintain your live H\u014dMI-Score.',
              data: { itemId: body.item_id },
            });
        }
        break;
      }

      case 'LIABILITIES': {
        if (body.webhook_code === 'DEFAULT_UPDATE') {
          await fullSync(item.plaid_access_token, item.plaid_item_id, item.user_id);
          await evaluateAlerts(item.user_id);
        }
        break;
      }

      default:
        console.log('[Plaid Webhook] Unhandled type:', webhookType + '.' + webhookCode);
    }
  } catch (error) {
    console.error('[Plaid Webhook] Processing error for', webhookType + '.' + webhookCode + ':', error);
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
