/**
 * GET/POST /api/couples -- Couples Mode
 * ========================================
 *
 * GET:  Return the user's couple status from Supabase.
 * POST: Create a couple invite (stores in Supabase).
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';
import { inviteCoupleSchema } from '@/validators/couples';

// ---------------------------------------------------------------------------
// GET -- Get couple status
// ---------------------------------------------------------------------------

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const supabase = getSupabaseForRoute(req);
  const userId = ctx.user!.id;

  if (!supabase) {
    return NextResponse.json({
      success: true,
      data: { status: 'not_linked', partnerId: null, partnerName: null, partnerEmail: null, linkedAt: null, pendingInvites: [] },
    });
  }

  // Check for active couple
  const { data: couple } = await supabase
    .from('couples')
    .select('id, partner_a_id, partner_b_id, invite_email, status, created_at')
    .or(`partner_a_id.eq.${userId},partner_b_id.eq.${userId}`)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (couple) {
    const partnerId = couple.partner_a_id === userId ? couple.partner_b_id : couple.partner_a_id;

    // Fetch partner profile
    let partnerName: string | null = null;
    let partnerEmail: string | null = null;
    if (partnerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', partnerId)
        .single();
      partnerName = profile?.full_name ?? null;
      partnerEmail = profile?.email ?? null;
    }

    // Fetch latest couple assessment
    const { data: coupleAssessment } = await supabase
      .from('couple_assessments')
      .select('id, combined_score, alignment_data, joint_verdict, partner_a_assessment_id, partner_b_assessment_id, created_at')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        status: 'linked',
        coupleId: couple.id,
        partnerId,
        partnerName,
        partnerEmail,
        linkedAt: couple.created_at,
        latestAssessment: coupleAssessment ?? null,
        pendingInvites: [],
      },
    });
  }

  // Check for pending invites (outbound)
  const { data: pendingOut } = await supabase
    .from('couples')
    .select('id, invite_email, invite_token, created_at')
    .eq('partner_a_id', userId)
    .eq('status', 'pending');

  // Check for pending invites (inbound — by email match)
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  let pendingIn: typeof pendingOut = [];
  if (userProfile?.email) {
    const { data: inbound } = await supabase
      .from('couples')
      .select('id, invite_email, invite_token, partner_a_id, created_at')
      .eq('invite_email', userProfile.email)
      .eq('status', 'pending');
    pendingIn = inbound ?? [];
  }

  return NextResponse.json({
    success: true,
    data: {
      status: 'not_linked',
      partnerId: null,
      partnerName: null,
      partnerEmail: null,
      linkedAt: null,
      pendingInvites: [
        ...(pendingOut ?? []).map((i) => ({ ...i, direction: 'outbound' })),
        ...(pendingIn ?? []).map((i) => ({ ...i, direction: 'inbound' })),
      ],
    },
  });
});

// ---------------------------------------------------------------------------
// POST -- Create couple invite
// ---------------------------------------------------------------------------

export const POST = withAuth(async (req: NextRequest, ctx) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
      { status: 400 },
    );
  }

  const parsed = inviteCoupleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') } },
      { status: 400 },
    );
  }

  const supabase = getSupabaseForRoute(req);
  const userId = ctx.user!.id;
  const { partner_email } = parsed.data;

  if (!supabase) {
    // Dev mode
    return NextResponse.json({
      success: true,
      data: {
        inviteId: `invite_${crypto.randomUUID().slice(0, 8)}`,
        token: crypto.randomUUID(),
        partnerEmail: partner_email,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }, { status: 201 });
  }

  // Check if user already has an active couple
  const { data: existing } = await supabase
    .from('couples')
    .select('id')
    .or(`partner_a_id.eq.${userId},partner_b_id.eq.${userId}`)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { success: false, error: { code: 'ALREADY_LINKED', message: 'You are already linked with a partner.' } },
      { status: 409 },
    );
  }

  const token = crypto.randomUUID();

  const { data: invite, error } = await supabase
    .from('couples')
    .insert({
      partner_a_id: userId,
      invite_email: partner_email,
      invite_token: token,
      status: 'pending',
    })
    .select('id, invite_email, invite_token, created_at')
    .single();

  if (error) {
    console.error('Failed to create couple invite:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Failed to create invite' } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      inviteId: invite.id,
      token: invite.invite_token,
      partnerEmail: invite.invite_email,
      status: 'pending',
      createdAt: invite.created_at,
      expiresAt: new Date(new Date(invite.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  }, { status: 201 });
});
