/**
 * GET /api/cron/financial-alerts — Daily Financial Alert Check
 * ==============================================================
 *
 * Cron job that evaluates financial alerts for all active Plaid users.
 * Should be triggered daily (e.g., via Vercel Cron or external scheduler).
 *
 * Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evaluateAlerts } from '@/lib/alerts/engine';

export async function GET(request: NextRequest) {
  // Verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = await createClient();

  try {
    // Get all users with active Plaid connections
    const { data: plaidUsers } = await supabase
      .from('plaid_items')
      .select('user_id')
      .eq('status', 'active');

    if (!plaidUsers || plaidUsers.length === 0) {
      return NextResponse.json({
        processed: 0,
        message: 'No active Plaid users to evaluate',
      });
    }

    // Deduplicate user IDs
    const userIds = [...new Set(plaidUsers.map((p) => p.user_id))];

    let totalAlerts = 0;
    const errors: string[] = [];

    // Evaluate alerts for each user
    for (const userId of userIds) {
      try {
        const alerts = await evaluateAlerts(userId);
        totalAlerts += alerts.length;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`User ${userId}: ${message}`);
        console.error(`[Financial Alerts Cron] Error for user ${userId}:`, error);
      }
    }

    return NextResponse.json({
      processed: userIds.length,
      alertsGenerated: totalAlerts,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Financial Alerts Cron] Fatal error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 },
    );
  }
}
