/**
 * GET /api/cron/expire-assessments -- Assessment Expiry Cron
 * ============================================================
 *
 * Marks assessments older than 90 days as expired.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
          { status: 401 },
        );
      }
    }

    const supabase = createServiceClient();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('assessments')
      .update({ status: 'expired' })
      .lt('created_at', ninetyDaysAgo)
      .neq('status', 'expired')
      .select('id');

    if (error) {
      console.error('[Cron] Expire assessments DB error:', error);
      throw error;
    }

    const result = {
      assessmentsExpired: data?.length ?? 0,
      executedAt: new Date().toISOString(),
    };

    console.log('[Cron] Expire assessments completed:', result);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Cron] Expire assessments error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
