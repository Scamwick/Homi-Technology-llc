/**
 * POST /api/payments/webhook — Stripe Webhook Handler
 * =====================================================
 *
 * Processes Stripe events to sync subscription state with Supabase.
 *
 * Events handled:
 *   - checkout.session.completed  → create/update subscription + upgrade tier
 *   - customer.subscription.updated → sync tier/status changes
 *   - customer.subscription.deleted → downgrade to free
 *   - invoice.payment_failed       → mark subscription past_due
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Stripe & Supabase clients
// ---------------------------------------------------------------------------

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ---------------------------------------------------------------------------
// Price ID → Tier mapping (reverse of create-checkout)
// ---------------------------------------------------------------------------

function tierFromPriceId(priceId: string): string | null {
  const mapping: Record<string, string> = {}
  if (process.env.STRIPE_PRICE_PLUS) mapping[process.env.STRIPE_PRICE_PLUS] = 'plus'
  if (process.env.STRIPE_PRICE_PRO) mapping[process.env.STRIPE_PRICE_PRO] = 'pro'
  if (process.env.STRIPE_PRICE_FAMILY) mapping[process.env.STRIPE_PRICE_FAMILY] = 'family'
  if (process.env.STRIPE_PRICE_ENTERPRISE) mapping[process.env.STRIPE_PRICE_ENTERPRISE] = 'enterprise_paid'
  return mapping[priceId] ?? null
}

function tierFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price.id
  return (priceId && tierFromPriceId(priceId)) ?? 'free'
}

function statusFromStripe(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'active': return 'active'
    case 'past_due': return 'past_due'
    case 'canceled': return 'canceled'
    case 'trialing': return 'trialing'
    default: return 'canceled'
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const supabase = getServiceClient()

  if (!stripe || !supabase) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503 },
    )
  }

  // Verify webhook signature
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      // ── Checkout completed — new subscription ──
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription' || !session.subscription || !session.customer_email) {
          break
        }

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const tier = tierFromSubscription(subscription)
        const customerId = typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id ?? ''

        // Find user by email
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', session.customer_email.toLowerCase())
          .single()

        if (!profile) {
          console.error('[Stripe Webhook] No profile found for:', session.customer_email)
          break
        }

        // Update profile with Stripe customer ID and new tier
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            subscription_tier: tier,
            subscription_status: 'active',
          })
          .eq('id', profile.id)

        console.log(`[Stripe Webhook] checkout.session.completed: ${session.customer_email} → ${tier}`)
        break
      }

      // ── Subscription updated (plan change, renewal) ──
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        const tier = tierFromSubscription(subscription)
        const status = statusFromStripe(subscription.status)

        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: status,
          })
          .eq('stripe_customer_id', customerId)

        console.log(`[Stripe Webhook] subscription.updated: customer ${customerId} → ${tier} (${status})`)
        break
      }

      // ── Subscription canceled/deleted ──
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
          })
          .eq('stripe_customer_id', customerId)

        console.log(`[Stripe Webhook] subscription.deleted: customer ${customerId} → free`)
        break
      }

      // ── Payment failed ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id

        if (customerId) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_customer_id', customerId)

          console.log(`[Stripe Webhook] invoice.payment_failed: customer ${customerId} → past_due`)
        }
        break
      }

      default:
        // Unhandled event type — acknowledge silently
        break
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
