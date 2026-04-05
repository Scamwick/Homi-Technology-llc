/**
 * GET/POST /api/organizations -- Family & Enterprise Orgs
 * =========================================================
 *
 * GET:  List organizations the user belongs to.
 * POST: Create a new organization (family or enterprise).
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSupabaseForRoute } from '@/lib/api/middleware';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  org_type: z.enum(['family', 'enterprise']).default('family'),
});

// ---------------------------------------------------------------------------
// GET -- List user's organizations
// ---------------------------------------------------------------------------

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const supabase = getSupabaseForRoute(req);
  const userId = ctx.user!.id;

  if (!supabase) {
    return NextResponse.json({ success: true, data: [] });
  }

  // Orgs the user owns
  const { data: owned } = await supabase
    .from('organizations')
    .select('*, organization_members(id, user_id, role, invite_email, accepted, created_at)')
    .eq('owner_id', userId);

  // Orgs the user is a member of (but doesn't own)
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id, role, accepted')
    .eq('user_id', userId)
    .eq('accepted', true);

  const memberOrgIds = (memberships ?? [])
    .map((m) => m.organization_id)
    .filter((id) => !(owned ?? []).some((o) => o.id === id));

  let memberOrgs: typeof owned = [];
  if (memberOrgIds.length > 0) {
    const { data } = await supabase
      .from('organizations')
      .select('*, organization_members(id, user_id, role, invite_email, accepted, created_at)')
      .in('id', memberOrgIds);
    memberOrgs = data ?? [];
  }

  return NextResponse.json({
    success: true,
    data: [
      ...(owned ?? []).map((o) => ({ ...o, userRole: 'owner' })),
      ...(memberOrgs ?? []).map((o) => ({ ...o, userRole: memberships?.find(m => m.organization_id === o.id)?.role ?? 'member' })),
    ],
  });
});

// ---------------------------------------------------------------------------
// POST -- Create organization
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

  const parsed = createOrgSchema.safeParse(body);
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
      data: { id: crypto.randomUUID(), name: parsed.data.name, org_type: parsed.data.org_type, owner_id: userId, max_members: parsed.data.org_type === 'family' ? 6 : 50 },
    }, { status: 201 });
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: parsed.data.name,
      owner_id: userId,
      org_type: parsed.data.org_type,
      tier: ctx.user!.tier ?? 'family',
      max_members: parsed.data.org_type === 'family' ? 6 : 50,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to create organization:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Failed to create organization' } },
      { status: 500 },
    );
  }

  // Add owner as first member
  await supabase.from('organization_members').insert({
    organization_id: org.id,
    user_id: userId,
    role: 'owner',
    accepted: true,
    invited_by: userId,
  });

  return NextResponse.json({ success: true, data: org }, { status: 201 });
});
