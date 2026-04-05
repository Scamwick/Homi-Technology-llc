/**
 * GET/POST /api/calendar/shares -- Calendar Sharing
 * ==================================================
 *
 * GET:  List calendar shares (inbound + outbound) for the authenticated user.
 * POST: Create a new calendar share invitation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';
import { createCalendarShareSchema } from '@/validators/calendar';

// ---------------------------------------------------------------------------
// GET -- List shares
// ---------------------------------------------------------------------------

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const supabase = getSupabaseForRoute(req);
  const userId = ctx.user!.id;

  if (!supabase) {
    return NextResponse.json({ success: true, data: { shares: [], total: 0 } });
  }

  // Fetch outbound shares (user is owner)
  const { data: outbound, error: outErr } = await supabase
    .from('calendar_shares')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  // Fetch inbound shares (user is shared_with)
  const { data: inbound, error: inErr } = await supabase
    .from('calendar_shares')
    .select('*')
    .eq('shared_with_id', userId)
    .order('created_at', { ascending: false });

  if (outErr || inErr) {
    console.error('Failed to fetch calendar shares:', outErr || inErr);
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Failed to fetch shares' } },
      { status: 500 },
    );
  }

  const shares = [
    ...(outbound ?? []).map((s) => ({ ...s, direction: 'outbound' })),
    ...(inbound ?? []).map((s) => ({ ...s, direction: 'inbound' })),
  ];

  return NextResponse.json({
    success: true,
    data: { shares, total: shares.length },
  });
});

// ---------------------------------------------------------------------------
// POST -- Create share invitation
// ---------------------------------------------------------------------------

export const POST = withAuth(async (req: NextRequest, ctx) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON' } },
      { status: 400 },
    );
  }

  const parsed = createCalendarShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') } },
      { status: 400 },
    );
  }

  const supabase = getSupabaseForRoute(req);
  const userId = ctx.user!.id;

  if (!supabase) {
    const now = new Date().toISOString();
    return NextResponse.json({
      success: true,
      data: {
        id: `share_${crypto.randomUUID().slice(0, 8)}`,
        owner_id: userId,
        ...parsed.data,
        status: 'pending',
        invite_token: `tok_${crypto.randomUUID().slice(0, 12)}`,
        created_at: now,
      },
    }, { status: 201 });
  }

  // If sharing by email, check if user exists
  let sharedWithId = parsed.data.shared_with_id ?? null;
  if (!sharedWithId && parsed.data.shared_with_email) {
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', parsed.data.shared_with_email)
      .maybeSingle();
    if (targetUser) {
      sharedWithId = targetUser.id;
    }
  }

  const { data: share, error } = await supabase
    .from('calendar_shares')
    .insert({
      owner_id: userId,
      shared_with_id: sharedWithId,
      organization_id: parsed.data.organization_id ?? null,
      role: parsed.data.role,
      status: 'pending',
      invite_email: parsed.data.shared_with_email ?? null,
      invite_token: `tok_${crypto.randomUUID().slice(0, 12)}`,
      shared_event_types: parsed.data.shared_event_types ?? null,
      can_create: parsed.data.can_create,
      can_edit: parsed.data.can_edit,
      can_delete: parsed.data.can_delete,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to create calendar share:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Failed to create share' } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: share }, { status: 201 });
});
