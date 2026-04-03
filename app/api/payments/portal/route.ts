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
    // In production this would:
    // 1. Look up the user's Stripe customer ID
    // 2. Call stripe.billingPortal.sessions.create
    // 3. Return the portal URL

    const sessionId = `bps_mock_${crypto.randomUUID().slice(0, 16)}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: `https://billing.stripe.com/p/session/${sessionId}`,
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
