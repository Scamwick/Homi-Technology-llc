/**
 * POST /api/couples/accept/[token] -- Accept Couple Invite
 * ===========================================================
 *
 * Accepts a couple invite by token, linking two accounts.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';

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
// POST -- Accept invite by token
// ---------------------------------------------------------------------------

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || token.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invite token is required' },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // In production this would:
    // 1. Look up the invite by token
    // 2. Check if it is still valid (not expired, not already accepted)
    // 3. Link the two user accounts
    // 4. Send notification to the inviter
    // 5. Mark the invite as accepted

    const now = new Date().toISOString();

    return NextResponse.json(
      {
        success: true,
        data: {
          coupleId: `couple_${crypto.randomUUID().slice(0, 8)}`,
          inviteToken: token,
          status: 'linked',
          linkedAt: now,
          inviterId: 'dev-user-inviter',
          acceptedById: 'dev-user',
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Couples Accept API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
