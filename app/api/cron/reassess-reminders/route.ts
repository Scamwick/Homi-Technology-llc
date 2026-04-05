/**
 * GET /api/cron/reassess-reminders -- Reassessment Reminder Cron
 * ================================================================
 *
 * Checks for users who haven't taken an assessment in 30+ days
 * and sends them reminder notifications + emails.
 *
 * Protected by CRON_SECRET header check.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/service';
import { reassessReminderEmail } from '@/emails/reassess-reminder';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Run cron job
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
          { status: 401, headers: CORS_HEADERS },
        );
      }
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { success: true, data: { remindersCreated: 0, emailsSent: 0 } },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com';

    // Find users whose most recent assessment is older than 30 days
    // We query profiles and join with their latest assessment
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name, notification_preferences');

    let remindersCreated = 0;
    let emailsSent = 0;

    for (const profile of profiles ?? []) {
      // Check if user has reassess reminders enabled
      const prefs = profile.notification_preferences as Record<string, boolean> | null;
      if (prefs?.reassess_reminder === false) continue;

      // Check last assessment date
      const { data: lastAssessment } = await admin
        .from('assessments')
        .select('id, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastAssessment) continue; // No assessments yet — skip
      if (lastAssessment.created_at > thirtyDaysAgo) continue; // Recently assessed

      const daysSince = Math.floor(
        (Date.now() - new Date(lastAssessment.created_at).getTime()) / (24 * 60 * 60 * 1000),
      );

      // Create in-app notification
      await admin.from('notifications').insert({
        user_id: profile.id,
        type: 'reassess_reminder' as const,
        title: 'Time to Reassess',
        body: `It has been ${daysSince} days since your last assessment. Your situation may have changed.`,
        action_url: '/assess/new',
        data: { lastAssessmentId: lastAssessment.id, daysSinceLastAssessment: daysSince },
      });
      remindersCreated++;

      // Send email if enabled
      if (prefs?.email_enabled !== false) {
        const { subject, html } = reassessReminderEmail({
          name: profile.full_name || profile.email.split('@')[0],
          days: daysSince,
          appUrl,
        });

        sendEmail({ to: profile.email, subject, html }).catch(
          (err) => console.error('[Cron] Reminder email error:', err),
        );
        emailsSent++;
      }
    }

    const result = { executedAt: new Date().toISOString(), remindersCreated, emailsSent };
    console.log('[Cron] Reassess reminders completed:', result);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Cron] Reassess reminders error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
