/**
 * GET /api/cron/reassess-reminders -- Reassessment Reminder Cron
 * ================================================================
 *
 * Checks for users who haven't taken an assessment recently and
 * sends them reminder notifications. Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/service';

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

const DEFAULT_REMINDER_DAYS = 30;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
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

    const supabase = createServiceClient();
    const cutoffDate = new Date(Date.now() - DEFAULT_REMINDER_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Find all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, display_name, preferences');

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: { executedAt: new Date().toISOString(), usersChecked: 0, remindersCreated: 0, emailsSent: 0, skipped: { recentlyAssessed: 0, remindersDisabled: 0 } },
      }, { status: 200, headers: CORS_HEADERS });
    }

    let remindersCreated = 0;
    let emailsSent = 0;
    let recentlyAssessed = 0;
    let remindersDisabled = 0;

    for (const profile of profiles) {
      // Check if user has reminders disabled
      const prefs = (profile.preferences as Record<string, unknown>) ?? {};
      if (prefs.reassessReminders === false) {
        remindersDisabled++;
        continue;
      }

      // Check when last assessment was taken
      const { data: lastAssessment } = await supabase
        .from('assessments')
        .select('created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastAssessment && lastAssessment.created_at > cutoffDate) {
        recentlyAssessed++;
        continue;
      }

      // Create in-app notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'info',
        title: 'Time for a reassessment',
        message: `It's been over ${DEFAULT_REMINDER_DAYS} days since your last assessment. Take a new one to see how your readiness has changed.`,
        read: false,
      });
      remindersCreated++;

      // Send email if email notifications are enabled
      if (prefs.emailNotifications !== false && profile.email) {
        const result = await sendEmail({
          to: profile.email,
          subject: 'Time to reassess your homebuying readiness',
          html: `<p>Hi ${profile.display_name || 'there'},</p>
<p>It's been a while since your last H\u014dMI assessment. A lot can change in ${DEFAULT_REMINDER_DAYS} days!</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com'}/assess/new">Take Your Reassessment</a></p>`,
        });
        if (result.success) emailsSent++;
      }
    }

    const result = {
      executedAt: new Date().toISOString(),
      usersChecked: profiles.length,
      remindersCreated,
      emailsSent,
      skipped: { recentlyAssessed, remindersDisabled },
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
