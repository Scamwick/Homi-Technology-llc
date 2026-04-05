/**
 * POST /api/payments/create-checkout -- Stripe Checkout Session
 * ===============================================================
 *
 * Creates a Stripe Checkout session for the requested subscription tier.
 * Returns 503 when STRIPE_SECRET_KEY is not configured.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const CreateCheckoutSchema = z.object({
  tier: z.enum(['plus', 'pro', 'family']),
});

// ---------------------------------------------------------------------------
// Price Mapping — use Stripe price IDs from env vars
// ---------------------------------------------------------------------------

const TIER_PRICES: Record<string, { monthlyAmountCents: number; envKey: string }> = {
  plus: { monthlyAmountCents: 999, envKey: 'STRIPE_PRICE_PLUS' },
  pro: { monthlyAmountCents: 2499, envKey: 'STRIPE_PRICE_PRO' },
  family: { monthlyAmountCents: 3999, envKey: 'STRIPE_PRICE_FAMILY' },
};

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST -- Create checkout session
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // --- Guard: Stripe not configured ---
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVICE_NOT_CONFIGURED',
            message: 'Payment processing is not configured. Set STRIPE_SECRET_KEY.',
          },
        },
        { status: 503, headers: CORS_HEADERS },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = CreateCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
          },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { tier } = parsed.data;
    const priceConfig = TIER_PRICES[tier];
    const priceId = process.env[priceConfig.envKey];

    if (!priceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRICE_NOT_CONFIGURED',
            message: `Stripe price ID for ${tier} tier is not configured. Set ${priceConfig.envKey}.`,
          },
        },
        { status: 503, headers: CORS_HEADERS },
      );
    }

    // --- Authenticate user ---
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    // Look up existing Stripe customer ID from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', authUser.id)
      .single();

    // --- Create real Stripe Checkout session ---
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: Record<string, any> = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/settings/billing?canceled=true`,
      metadata: { user_id: authUser.id, tier },
      subscription_data: { metadata: { user_id: authUser.id, tier } },
    };

    // Reuse existing Stripe customer if available
    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      sessionParams.customer_email = authUser.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json(
      {
        success: true,
        data: {
          url: session.url,
          sessionId: session.id,
          tier,
          monthlyAmountCents: priceConfig.monthlyAmountCents,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Payments Checkout API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
