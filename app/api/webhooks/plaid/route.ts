/**
 * POST /api/webhooks/plaid — Plaid webhook handler
 * ==================================================
 *
 * Handles Plaid webhook events:
 * - SYNC_UPDATES_AVAILABLE: New transactions ready
 * - ERROR: Connection issues
 * - PENDING_EXPIRATION: Consent about to expire
 *
 * Returns: 200 OK
 */

import { NextRequest, NextResponse } from 'next/server';

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

  // TODO: In production, verify webhook signature via Plaid JWT verification
  // const plaid = getPlaidClient();
  // if (plaid) { await verifyWebhookSignature(req, plaid); }

  const { webhook_type, webhook_code, item_id } = body;

  switch (webhook_code) {
    case 'SYNC_UPDATES_AVAILABLE':
      // New transactions available — trigger sync for this item
      console.log(`[Plaid Webhook] Sync updates available for item ${item_id}`);
      // TODO: Queue transaction sync job
      break;

    case 'ERROR':
      // Connection error — mark connection as degraded
      console.log(`[Plaid Webhook] Error for item ${item_id}:`, body.error);
      // TODO: Update bank_connections status to 'degraded'
      break;

    case 'PENDING_EXPIRATION':
      // Consent expiring — user needs to re-auth
      console.log(`[Plaid Webhook] Consent expiring for item ${item_id} at ${body.consent_expiration_time}`);
      // TODO: Send re-auth notification to user
      break;

    default:
      console.log(`[Plaid Webhook] Unhandled: ${webhook_type}/${webhook_code} for item ${item_id}`);
  }

  return NextResponse.json({ received: true });
}
