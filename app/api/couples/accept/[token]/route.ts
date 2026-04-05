/**
 * POST /api/couples/accept/[token] -- Accept Couple Invite
 * ===========================================================
 *
 * Accepts a couple invite by token, linking two user accounts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';

export const POST = withAuth(async (req: NextRequest, ctx) => {
  // Extract token from URL path: /api/couples/accept/{token}
  const segments = req.nextUrl.pathname.split('/');
  const token = segments[segments.length - 1];

  if (!token || token.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_TOKEN', message: 'Invite token is required' } },
      { status: 400 },
    );
  }

  const supabase = getSupabaseForRoute(req);
  const userId = ctx.user!.id;

  if (!supabase) {
    return NextResponse.json({
      success: true,
      data: { coupleId: 'couple_dev', inviteToken: token, status: 'linked', linkedAt: new Date().toISOString() },
    });
  }

  // Look up the invite
  const { data: couple, error: lookupError } = await supabase
    .from('couples')
    .select('id, partner_a_id, status')
    .eq('invite_token', token)
    .single();

  if (lookupError || !couple) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Invite not found or expired' } },
      { status: 404 },
    );
  }

  if (couple.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: { code: 'ALREADY_USED', message: 'This invite has already been used' } },
      { status: 409 },
    );
  }

  if (couple.partner_a_id === userId) {
    return NextResponse.json(
      { success: false, error: { code: 'SELF_ACCEPT', message: 'You cannot accept your own invite' } },
      { status: 400 },
    );
  }

  // Link the couple
  const { error: updateError } = await supabase
    .from('couples')
    .update({ partner_b_id: userId, status: 'active' })
    .eq('id', couple.id);

  if (updateError) {
    console.error('Failed to accept couple invite:', updateError);
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Failed to link accounts' } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      coupleId: couple.id,
      inviteToken: token,
      status: 'linked',
      linkedAt: new Date().toISOString(),
      partnerId: couple.partner_a_id,
    },
  });
});
