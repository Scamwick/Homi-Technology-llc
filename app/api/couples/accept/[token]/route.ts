/**
 * POST /api/couples/accept/[token] -- Accept Couple Invite
 * ===========================================================
 *
 * Accepts a couple invite by token, linking two accounts.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST -- Accept invite by token
// ---------------------------------------------------------------------------

export const POST = withAuth(async (
  _request: NextRequest,
  ctx,
  routeParams?: { params: Promise<{ token: string }> },
) => {
  try {
    const { token } = await routeParams!.params;

    if (!token || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Invite token is required' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        {
          success: true,
          data: {
            coupleId: `couple_${crypto.randomUUID().slice(0, 8)}`,
            inviteToken: token,
            status: 'active',
            linkedAt: new Date().toISOString(),
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const userId = ctx.user!.id;

    // Look up the invite
    const { data: couple, error: findError } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !couple) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Invite not found or already accepted' } },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    // Prevent self-accept
    if (couple.partner_a_id === userId) {
      return NextResponse.json(
        { success: false, error: { code: 'SELF_ACCEPT', message: 'Cannot accept your own invite' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // Accept the invite
    const { data: updated, error: updateError } = await supabase
      .from('couples')
      .update({ partner_b_id: userId, status: 'active' })
      .eq('id', couple.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Notify the inviter
    await supabase.from('notifications').insert({
      user_id: couple.partner_a_id,
      type: 'couple_invite' as const,
      title: 'Couple Invite Accepted',
      body: `${ctx.user!.email} has accepted your couples mode invitation.`,
      action_url: '/couples',
      data: { coupleId: couple.id, partnerId: userId },
    });

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Couples Accept API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}) as (req: NextRequest, ctx: { params: Promise<{ token: string }> }) => Promise<NextResponse>;
