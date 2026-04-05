/**
 * GET /api/cron/nurture-emails -- Nurture Email Cron
 * ====================================================
 *
 * Sends nurture emails to waitlisted users who haven't completed
 * an assessment within 7 days of signing up.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/service';

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
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Find waitlisted users who signed up > 7 days ago
    const { data: waitlistUsers } = await supabase
      .from('waitlist')
      .select('email, name')
      .lt('created_at', sevenDaysAgo);

    if (!waitlistUsers || waitlistUsers.length === 0) {
      return NextResponse.json({
        success: true,
        data: { usersChecked: 0, emailsSent: 0, skipped: 0 },
      });
    }

    // Check which of these have already completed an assessment
    const emails = waitlistUsers.map(u => u.email);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('email')
      .in('email', emails);

    const profileEmails = new Set((profiles ?? []).map(p => p.email));

    // Filter to users who have NOT created a profile (haven't signed up yet)
    const needsNurture = waitlistUsers.filter(u => !profileEmails.has(u.email));

    let emailsSent = 0;
    for (const user of needsNurture) {
      const result = await sendEmail({
        to: user.email,
        subject: 'Your homebuying readiness journey awaits',
        html: `<p>Hi ${user.name || 'there'},</p>
<p>You joined the H\u014dMI waitlist but haven't taken your readiness assessment yet. It only takes 5 minutes and gives you a clear picture of where you stand.</p>
<p>Ready to find out your H\u014dMI-Score?</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com'}/auth/signup">Take Your Assessment</a></p>`,
      });
      if (result.success) emailsSent++;
    }

    const result = {
      usersChecked: waitlistUsers.length,
      emailsSent,
      skipped: waitlistUsers.length - needsNurture.length,
    };

    console.log('[Cron] Nurture emails completed:', result);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Cron] Nurture emails error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
