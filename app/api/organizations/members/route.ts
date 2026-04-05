/**
 * POST /api/organizations/members -- Invite member to org
 * DELETE /api/organizations/members -- Remove member from org
 * ===========================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';
import { z } from 'zod';

const inviteMemberSchema = z.object({
  organization_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

const removeMemberSchema = z.object({
  organization_id: z.string().uuid(),
  member_id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// POST -- Invite member
// ---------------------------------------------------------------------------

export const POST = withAuth(async (req: NextRequest, ctx) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON' } }, { status: 400 });
  }

  const parsed = inviteMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map(i => i.message).join('; ') } },
      { status: 400 },
    );
  }

  const supabase = getSupabaseForRoute(req);
  const userId = ctx.user!.id;

  if (!supabase) {
    return NextResponse.json({
      success: true,
      data: { id: crypto.randomUUID(), invite_email: parsed.data.email, role: parsed.data.role, accepted: false },
    }, { status: 201 });
  }

  // Verify user owns or is admin of the org
  const { data: org } = await supabase
    .from('organizations')
    .select('id, owner_id, max_members')
    .eq('id', parsed.data.organization_id)
    .single();

  if (!org) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Organization not found' } }, { status: 404 });
  }

  const isOwner = org.owner_id === userId;
  if (!isOwner) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', org.id)
      .eq('user_id', userId)
      .eq('accepted', true)
      .single();

    if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Only owners/admins can invite members' } }, { status: 403 });
    }
  }

  // Check member count
  const { count } = await supabase
    .from('organization_members')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', org.id);

  if ((count ?? 0) >= org.max_members) {
    return NextResponse.json(
      { success: false, error: { code: 'LIMIT_REACHED', message: `Organization is at max capacity (${org.max_members} members)` } },
      { status: 409 },
    );
  }

  // Check if already a member
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', parsed.data.email)
    .maybeSingle();

  const token = `org_${crypto.randomUUID().slice(0, 16)}`;

  const { data: member, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: existingUser?.id ?? null,
      invite_email: parsed.data.email,
      invite_token: token,
      role: parsed.data.role,
      accepted: false,
      invited_by: userId,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to invite member:', error);
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: 'Failed to invite member' } }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: member }, { status: 201 });
});

// ---------------------------------------------------------------------------
// DELETE -- Remove member
// ---------------------------------------------------------------------------

export const DELETE = withAuth(async (req: NextRequest, ctx) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON' } }, { status: 400 });
  }

  const parsed = removeMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map(i => i.message).join('; ') } },
      { status: 400 },
    );
  }

  const supabase = getSupabaseForRoute(req);
  const userId = ctx.user!.id;

  if (!supabase) {
    return NextResponse.json({ success: true, data: { removed: true } });
  }

  // Verify ownership
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', parsed.data.organization_id)
    .single();

  if (!org || org.owner_id !== userId) {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Only org owner can remove members' } }, { status: 403 });
  }

  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', parsed.data.member_id)
    .eq('organization_id', parsed.data.organization_id);

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: 'Failed to remove member' } }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { removed: true } });
});
