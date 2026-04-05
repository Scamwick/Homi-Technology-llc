/**
 * POST /api/payments/portal -- Stripe Customer Portal
 * =====================================================
 *
 * Creates a Stripe Customer Portal session for managing subscriptions.
 * Falls back to mock portal URL when Stripe is not configured.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextResponse } from 'next/server';
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
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST -- Create portal session
// ---------------------------------------------------------------------------

export const POST = withAuth(async (_req, ctx) => {
  try {
    const stripe = getStripeServer();

    // Mock fallback
    if (!stripe || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const sessionId = `bps_mock_${crypto.randomUUID().slice(0, 16)}`;
      return NextResponse.json(
        { success: true, data: { url: `https://billing.stripe.com/p/session/${sessionId}` } },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    // Get Stripe customer ID from profile
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', ctx.user!.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription found' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com';

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json(
      { success: true, data: { url: session.url } },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Payments Portal API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
