/**
 * GET /api/cron/expire-assessments -- Expire Old Assessments
 * ============================================================
 *
 * Marks in-progress assessments as expired once their expires_at
 * timestamp has passed. Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Invalid cron secret' },
          { status: 401 },
        );
      }
    }

    const admin = createAdminClient();
    if (!admin) {
      console.log('[Cron] expire-assessments: no Supabase configured');
      return NextResponse.json({ success: true, data: { expired: 0 } });
    }

    const now = new Date().toISOString();

    // Find and update expired assessments
    const { data: expired, error } = await admin
      .from('assessments')
      .update({ status: 'expired' })
      .eq('status', 'in_progress')
      .lt('expires_at', now)
      .select('id');

    if (error) throw error;

    const count = expired?.length ?? 0;
    console.log(`[Cron] expire-assessments: expired ${count} assessments`);

    return NextResponse.json({
      success: true,
      data: { expired: count, executedAt: now },
    });
  } catch (error) {
    console.error('[Cron] expire-assessments error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
