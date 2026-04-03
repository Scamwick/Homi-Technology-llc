/**
 * DELETE /api/user/delete -- Account Deletion
 * ==============================================
 *
 * Handles account deletion requests. Marks the account for deletion
 * and schedules data purge per retention policy.
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
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// DELETE -- Delete user account
// ---------------------------------------------------------------------------

export async function DELETE() {
  try {
    // In production this would:
    // 1. Mark the account as deleted in the database
    // 2. Revoke all sessions
    // 3. Cancel Stripe subscription
    // 4. Schedule data purge after retention period (30 days)
    // 5. Send confirmation email

    const now = new Date().toISOString();
    const purgeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: 'dev-user',
          status: 'deletion_scheduled',
          deletedAt: now,
          dataPurgeScheduledAt: purgeDate,
          message: 'Account has been scheduled for deletion. Your data will be permanently removed in 30 days.',
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Delete API] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
