/**
 * GET/POST /api/couples -- Couples Mode
 * ========================================
 *
 * GET:  Return the user's couple status.
 * POST: Create a couple invite (validates partner email).
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { inviteCoupleSchema } from '@/validators/couples';
import { withAuth } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/service';
import { coupleInviteEmail } from '@/emails/couple-invite';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Get couple status
// ---------------------------------------------------------------------------

export const GET = withAuth(async (_req, ctx) => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        {
          success: true,
          data: {
            status: 'not_linked',
            couple: null,
            pendingInvites: [],
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const userId = ctx.user!.id;

    // Find active couple
    const { data: couple } = await supabase
      .from('couples')
      .select('*')
      .or(`partner_a_id.eq.${userId},partner_b_id.eq.${userId}`)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    // Find pending invites sent by this user
    const { data: pendingInvites } = await supabase
      .from('couples')
      .select('*')
      .eq('partner_a_id', userId)
      .eq('status', 'pending');

    return NextResponse.json(
      {
        success: true,
        data: {
          status: couple ? 'linked' : 'not_linked',
          couple: couple ?? null,
          pendingInvites: pendingInvites ?? [],
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Couples API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});

// ---------------------------------------------------------------------------
// POST -- Create couple invite
// ---------------------------------------------------------------------------

export const POST = withAuth(async (request, ctx) => {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = inviteCoupleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
          },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { partner_email } = parsed.data;
    const token = crypto.randomUUID();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        {
          success: true,
          data: {
            id: `couple_${crypto.randomUUID().slice(0, 8)}`,
            invite_token: token,
            invite_email: partner_email,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        },
        { status: 201, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();

    const { data: couple, error } = await supabase
      .from('couples')
      .insert({
        partner_a_id: ctx.user!.id,
        invite_email: partner_email,
        invite_token: token,
      })
      .select()
      .single();

    if (error) throw error;

    // Send invite email (fire-and-forget)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com';
    const { subject, html } = coupleInviteEmail({
      name: partner_email.split('@')[0],
      inviteToken: token,
      appUrl,
    });

    sendEmail({ to: partner_email, subject, html }).catch(
      (err) => console.error('[Couples] Invite email error:', err),
    );

    return NextResponse.json(
      { success: true, data: couple },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Couples API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
