/**
 * POST /api/webhooks/stripe -- Stripe Webhook Handler
 * =====================================================
 *
 * Receives and processes Stripe webhook events with signature verification.
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
import { getStripeServer } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
} as const;

// ---------------------------------------------------------------------------
// Price ID -> Tier mapping (reverse of create-checkout)
// ---------------------------------------------------------------------------

function tierFromPriceId(priceId: string): string {
  const mapping: Record<string, string> = {};
  if (process.env.STRIPE_PRICE_PLUS) mapping[process.env.STRIPE_PRICE_PLUS] = 'plus';
  if (process.env.STRIPE_PRICE_PRO) mapping[process.env.STRIPE_PRICE_PRO] = 'pro';
  if (process.env.STRIPE_PRICE_FAMILY) mapping[process.env.STRIPE_PRICE_FAMILY] = 'family';
  return mapping[priceId] || 'free';
}

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
  const stripe = getStripeServer();
  const admin = createAdminClient();

  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    // Verify signature if Stripe is configured
    if (stripe && process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err);
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } },
          { status: 400, headers: CORS_HEADERS },
        );
      }
    } else {
      // Dev mode: parse JSON without verification
      event = JSON.parse(rawBody) as Stripe.Event;
    }

    console.log(`[Stripe Webhook] Received: ${event.type} (${event.id})`);

    // Process events
    if (admin) {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const tier = session.metadata?.tier || 'plus';

          if (userId) {
            await admin.from('profiles').update({
              subscription_tier: tier,
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
            }).eq('id', userId);

            // Insert subscription record
            await admin.from('subscriptions').upsert({
              user_id: userId,
              tier: tier as 'plus' | 'pro' | 'family',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: 'active',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }, { onConflict: 'user_id' });

            // Notify user
            await admin.from('notifications').insert({
              user_id: userId,
              type: 'system' as const,
              title: 'Subscription Active',
              body: `Welcome to HōMI ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`,
              data: { category: 'billing' },
            });
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const priceId = subscription.items.data[0]?.price?.id;
          const tier = priceId ? tierFromPriceId(priceId) : 'free';

          const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await admin.from('profiles').update({
              subscription_tier: tier,
              subscription_status: subscription.status,
            }).eq('id', profile.id);

            await admin.from('subscriptions').update({
              tier: tier as 'plus' | 'pro' | 'family',
              status: subscription.status as 'active' | 'past_due' | 'canceled',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            }).eq('stripe_customer_id', customerId);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await admin.from('profiles').update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
            }).eq('id', profile.id);

            await admin.from('subscriptions').update({
              status: 'canceled',
            }).eq('stripe_customer_id', customerId);

            await admin.from('notifications').insert({
              user_id: profile.id,
              type: 'system' as const,
              title: 'Subscription Canceled',
              body: 'Your subscription has been canceled. You still have access until the end of your billing period.',
              data: { category: 'billing' },
            });
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await admin.from('payments').insert({
              user_id: profile.id,
              stripe_payment_intent_id: invoice.payment_intent as string,
              stripe_subscription_id: invoice.subscription as string,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
              description: `Invoice ${invoice.number || invoice.id}`,
            });
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await admin.from('payments').insert({
              user_id: profile.id,
              stripe_payment_intent_id: invoice.payment_intent as string,
              stripe_subscription_id: invoice.subscription as string,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: 'failed',
              description: `Failed: Invoice ${invoice.number || invoice.id}`,
            });

            await admin.from('notifications').insert({
              user_id: profile.id,
              type: 'system' as const,
              title: 'Payment Failed',
              body: 'Your latest payment could not be processed. Please update your payment method to avoid service interruption.',
              priority: 'high',
              data: { category: 'billing' },
            });
          }
          break;
        }

        default:
          console.log(`[Stripe Webhook] Ignoring unhandled event: ${event.type}`);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json(
      { success: true, data: { received: true, eventId: event.id, eventType: event.type } },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Stripe Webhook] Unexpected error:', error);
    return NextResponse.json(
      { success: true, data: { received: true, error: 'Processing error logged' } },
      { status: 200, headers: CORS_HEADERS },
    );
  }
}
