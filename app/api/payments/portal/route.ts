/**
 * POST /api/payments/portal -- Stripe Customer Portal
 * =====================================================
 *
 * Creates a Stripe Customer Portal session for managing subscriptions.
 * Returns a mock portal URL in development.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST -- Create portal session
// ---------------------------------------------------------------------------

export async function POST() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    if (stripeSecretKey) {
      // Production: create real billing portal session
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-03-31.basil' });

      // TODO: Look up customer ID from user's profile in Supabase
      // For now, this will fail gracefully if no customer ID exists
      const customerId = ''; // Should come from user profile
      if (!customerId) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NO_CUSTOMER', message: 'No billing account found. Please subscribe first.' },
          },
          { status: 400, headers: CORS_HEADERS },
        );
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/settings/billing`,
      });

      return NextResponse.json(
        { success: true, data: { url: session.url } },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    // Development fallback
    const sessionId = `bps_mock_${crypto.randomUUID().slice(0, 16)}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: `${appUrl}/settings/billing?mock_portal=${sessionId}`,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Payments Portal API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
