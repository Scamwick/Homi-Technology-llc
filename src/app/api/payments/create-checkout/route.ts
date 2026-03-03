import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

const PRICE_IDS: Record<string, string> = {
  plus: process.env.STRIPE_PRICE_PLUS!,
  pro: process.env.STRIPE_PRICE_PRO!,
  family: process.env.STRIPE_PRICE_FAMILY!,
}

/**
 * POST /api/payments/create-checkout
 * Create a Stripe Checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { tier } = body

    if (!tier || !PRICE_IDS[tier]) {
      return NextResponse.json(
        { success: false, error: { code: 'invalid_tier', message: 'Invalid subscription tier' } },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = (profile as any)?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      await (supabase as any)
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: PRICE_IDS[tier],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        tier,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { success: false, error: { code: 'internal_error', message: 'Failed to create checkout session' } },
      { status: 500 }
    )
  }
}
