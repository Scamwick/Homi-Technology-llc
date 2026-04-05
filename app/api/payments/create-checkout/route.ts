/**
 * POST /api/payments/create-checkout -- Stripe Checkout Session
 * ===============================================================
 *
 * Creates a Stripe Checkout session for the requested subscription tier.
 * Returns a mock checkout URL in development.
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
// Price Mapping (mock)
// ---------------------------------------------------------------------------

const TIER_PRICES: Record<string, { priceId: string; monthlyAmountCents: number }> = {
  plus: { priceId: 'price_plus_monthly', monthlyAmountCents: 999 },
  pro: { priceId: 'price_pro_monthly', monthlyAmountCents: 2499 },
  family: { priceId: 'price_family_monthly', monthlyAmountCents: 3999 },
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
    const price = TIER_PRICES[tier];

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    if (stripeSecretKey) {
      // Production: create real Stripe checkout session
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-03-31.basil' });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: price.priceId, quantity: 1 }],
        success_url: `${appUrl}/settings/billing?success=true`,
        cancel_url: `${appUrl}/settings/billing?canceled=true`,
        metadata: { tier },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            url: session.url,
            sessionId: session.id,
            tier,
            monthlyAmountCents: price.monthlyAmountCents,
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    // Development fallback: mock checkout URL
    const sessionId = `cs_mock_${crypto.randomUUID().slice(0, 16)}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: `${appUrl}/settings/billing?mock_checkout=${sessionId}`,
          sessionId,
          tier,
          monthlyAmountCents: price.monthlyAmountCents,
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
