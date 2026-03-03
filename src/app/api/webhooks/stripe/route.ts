import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { success: false, error: { code: 'invalid_signature', message: 'Invalid signature' } },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.user_id
        const tier = session.metadata?.tier

        if (userId && tier) {
          // Update user's subscription
          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_status: 'active',
            })
            .eq('id', userId)

          // Record payment
          if (session.payment_intent) {
            await supabase.from('payments').insert({
              user_id: userId,
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_subscription_id: session.subscription as string,
              amount: session.amount_total || 0,
              currency: session.currency || 'usd',
              status: 'succeeded',
              description: `Subscription to ${tier} plan`,
            })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const status = subscription.status
          const tier = subscription.items.data[0]?.price.lookup_key || 'free'

          await supabase
            .from('profiles')
            .update({
              subscription_tier: status === 'active' ? tier : 'free',
              subscription_status: status,
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', profile.id)

          // Create notification
          await supabase.from('notifications').insert({
            user_id: profile.id,
            type: 'system',
            title: 'Payment Failed',
            body: 'Your subscription payment failed. Please update your payment method.',
            action_url: '/settings/billing',
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'internal_error', message: 'Webhook processing failed' } },
      { status: 500 }
    )
  }
}
