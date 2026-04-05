/**
 * POST /api/webhooks/stripe -- Stripe Webhook Handler
 * =====================================================
 *
 * Receives and processes Stripe webhook events. In production this would
 * verify the webhook signature using the Stripe SDK.
 *
 * Handled events:
 *   - checkout.session.completed
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_succeeded
 *   - invoice.payment_failed
 *
 * Always returns 200 to acknowledge receipt (Stripe retries on non-2xx).
 */

import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
} as const;

// ---------------------------------------------------------------------------
// Handled Event Types
// ---------------------------------------------------------------------------

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST -- Handle Stripe webhook
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: { id?: string; type?: string; data?: { object?: unknown } };

    if (webhookSecret && signature) {
      // Verify Stripe signature in production
      // Uses Stripe's recommended verification pattern
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2025-03-31.basil' });
        const verified = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        event = verified as typeof event;
      } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err);
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } },
          { status: 401, headers: CORS_HEADERS },
        );
      }
    } else {
      // Development mode — no signature verification
      if (process.env.NODE_ENV === 'production') {
        console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET in production');
        return NextResponse.json(
          { success: false, error: { code: 'CONFIGURATION_ERROR', message: 'Webhook secret not configured' } },
          { status: 500, headers: CORS_HEADERS },
        );
      }
      try {
        event = JSON.parse(rawBody);
      } catch {
        console.error('[Stripe Webhook] Invalid JSON payload');
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PAYLOAD', message: 'Invalid JSON' } },
          { status: 400, headers: CORS_HEADERS },
        );
      }
    }

    if (!event.type || !event.id) {
      console.error('[Stripe Webhook] Missing event type or id');
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_EVENT', message: 'Missing event type or id' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // Log every event for audit trail
    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    if (HANDLED_EVENTS.has(event.type)) {
      // In production, each event type would trigger specific business logic:
      // - checkout.session.completed -> provision subscription
      // - customer.subscription.updated -> sync tier changes
      // - customer.subscription.deleted -> downgrade to free
      // - invoice.payment_failed -> send dunning email
      console.log(`[Stripe Webhook] Processing: ${event.type}`);
    } else {
      console.log(`[Stripe Webhook] Ignoring unhandled event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json(
      { success: true, data: { received: true, eventId: event.id, eventType: event.type } },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Stripe Webhook] Unexpected error:', error);
    // Still return 200 to prevent Stripe from retrying on server errors
    // that aren't related to event processing
    return NextResponse.json(
      { success: true, data: { received: true, error: 'Processing error logged' } },
      { status: 200, headers: CORS_HEADERS },
    );
  }
}
