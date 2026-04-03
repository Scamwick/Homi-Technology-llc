import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/service';
import { waitlistConfirmationEmail } from '@/emails/waitlist-confirmation';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Log the signup (TODO: store in Supabase waitlist table)
    console.log('[HōMI Waitlist] New signup:', normalizedEmail);

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
