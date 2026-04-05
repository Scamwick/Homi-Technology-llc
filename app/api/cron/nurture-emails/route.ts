/**
 * GET /api/cron/nurture-emails -- Nurture Email Sequence
 * ========================================================
 *
 * Sends nurture emails to free-tier users who signed up recently
 * but haven't completed an assessment. Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/service';

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
      console.log('[Cron] nurture-emails: no Supabase configured');
      return NextResponse.json({ success: true, data: { emailsSent: 0 } });
    }

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Find free-tier users who signed up 3-30 days ago
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name, notification_preferences')
      .eq('subscription_tier', 'free')
      .lt('created_at', threeDaysAgo)
      .gt('created_at', thirtyDaysAgo);

    let emailsSent = 0;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com';

    for (const profile of profiles ?? []) {
      const prefs = profile.notification_preferences as Record<string, boolean> | null;
      if (prefs?.email_enabled === false) continue;

      // Check if user has completed any assessments
      const { count } = await admin
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'completed');

      if ((count ?? 0) > 0) continue; // Already completed — skip nurture

      // Check if we already sent a nurture notification recently (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: recentNurture } = await admin
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('type', 'system')
        .gt('created_at', sevenDaysAgo);

      if ((recentNurture ?? 0) > 0) continue; // Already nurtured recently

      const name = profile.full_name || profile.email.split('@')[0];

      // Send nurture email
      await sendEmail({
        to: profile.email,
        subject: `${name}, your HōMI-Score is waiting`,
        html: `
          <p>Hi ${name},</p>
          <p>You signed up for HōMI but haven't taken your first assessment yet.</p>
          <p>Your HōMI-Score takes just 5 minutes and gives you a clear picture of your
          decision readiness across three dimensions.</p>
          <p><a href="${appUrl}/assess/new">Take Your Assessment Now</a></p>
          <p>— The HōMI Team</p>
        `,
      }).catch((err) => console.error('[Cron] Nurture email error:', err));

      // Track that we sent a nurture
      await admin.from('notifications').insert({
        user_id: profile.id,
        type: 'system' as const,
        title: 'Nurture Email Sent',
        body: 'Nurture sequence email sent to encourage first assessment.',
        data: { category: 'feature', internal: true },
      });

      emailsSent++;
    }

    console.log(`[Cron] nurture-emails: sent ${emailsSent} emails`);

    return NextResponse.json({
      success: true,
      data: { emailsSent, executedAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[Cron] nurture-emails error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
