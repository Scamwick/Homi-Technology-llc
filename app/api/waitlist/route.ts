import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/service';
import { waitlistConfirmationEmail } from '@/emails/waitlist-confirmation';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, name, source } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Store in Supabase waitlist table
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      await supabase
        .from('waitlist')
        .upsert(
          { email: normalizedEmail, name: name ?? null, source: source ?? null },
          { onConflict: 'email' },
        );
    }

    // Send confirmation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com';
    const { subject, html } = waitlistConfirmationEmail({
      email: normalizedEmail,
      appUrl,
    });

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject,
      html,
    });

    console.log('[HōMI Waitlist] Email sent:', emailResult);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[HōMI Waitlist] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
