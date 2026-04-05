/**
 * POST /api/payments/create-checkout -- Stripe Checkout Session
 * ===============================================================
 *
 * Creates a Stripe Checkout session for the requested subscription tier.
 * Falls back to mock checkout URL when Stripe is not configured.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api/middleware';
import { getStripeServer } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

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
// Price Mapping — env vars for real price IDs, fallback for mock
// ---------------------------------------------------------------------------

function getTierPriceId(tier: string): string | null {
  const mapping: Record<string, string | undefined> = {
    plus: process.env.STRIPE_PRICE_PLUS,
    pro: process.env.STRIPE_PRICE_PRO,
    family: process.env.STRIPE_PRICE_FAMILY,
  };
  return mapping[tier] ?? null;
}

const TIER_AMOUNTS: Record<string, number> = {
  plus: 999,
  pro: 2499,
  family: 3999,
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

export const POST = withAuth(async (request, ctx) => {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
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
    const stripe = getStripeServer();
    const priceId = getTierPriceId(tier);

    // Mock fallback when Stripe is not configured
    if (!stripe || !priceId) {
      const sessionId = `cs_mock_${crypto.randomUUID().slice(0, 16)}`;
      return NextResponse.json(
        {
          success: true,
          data: {
            url: `https://checkout.stripe.com/c/pay/${sessionId}`,
            sessionId,
            tier,
            monthlyAmountCents: TIER_AMOUNTS[tier],
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    // Get or create Stripe customer
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', ctx.user!.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: ctx.user!.email,
        metadata: { userId: ctx.user!.id },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', ctx.user!.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      metadata: { userId: ctx.user!.id, tier },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          url: session.url,
          sessionId: session.id,
          tier,
          monthlyAmountCents: TIER_AMOUNTS[tier],
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Payments Checkout API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
