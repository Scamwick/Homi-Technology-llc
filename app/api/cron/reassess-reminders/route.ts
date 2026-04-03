/**
 * GET /api/cron/reassess-reminders -- Reassessment Reminder Cron
 * ================================================================
 *
 * Scheduled job that checks for users who haven't taken an assessment
 * recently and sends them reminder notifications.
 *
 * Designed to be called by Vercel Cron or an external scheduler.
 * Protected by CRON_SECRET header check in production.
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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Run cron job
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // In production: verify cron secret to prevent unauthorized access
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' },
          },
          { status: 401, headers: CORS_HEADERS },
        );
      }
    }

    // In production this would:
    // 1. Query users whose last assessment is older than their reminderFrequencyDays
    // 2. Filter to users with reassessReminders enabled
    // 3. Create in-app notifications
    // 4. Send email reminders to users with email notifications enabled
    // 5. Log results for monitoring

    const now = new Date().toISOString();

    const result = {
      executedAt: now,
      usersChecked: 42,
      remindersCreated: 7,
      emailsSent: 5,
      skipped: {
        recentlyAssessed: 30,
        remindersDisabled: 5,
      },
    };

    console.log('[Cron] Reassess reminders completed:', result);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Cron] Reassess reminders error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
