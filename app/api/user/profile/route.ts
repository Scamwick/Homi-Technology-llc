/**
 * GET/PATCH /api/user/profile -- User Profile
 * =============================================
 *
 * GET:   Return the authenticated user's profile from Supabase.
 * PATCH: Update profile fields (validated with updateProfileSchema).
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateProfileSchema } from '@/validators/user';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Get user profile
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Profile may not exist yet for new users — return basic info from auth
      return NextResponse.json(
        {
          success: true,
          data: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name ?? null,
            avatarUrl: user.user_metadata?.avatar_url ?? null,
            tier: 'free',
            onboardingComplete: false,
            createdAt: user.created_at,
            updatedAt: user.updated_at ?? user.created_at,
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: profile.id,
          email: user.email,
          name: profile.full_name ?? user.user_metadata?.full_name ?? null,
          avatarUrl: profile.avatar_url ?? null,
          tier: profile.tier ?? 'free',
          role: profile.role ?? 'user',
          onboardingComplete: profile.onboarding_complete ?? false,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Profile API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH -- Update user profile
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = updateProfileSchema.safeParse(body);
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

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.full_name !== undefined) updates.full_name = parsed.data.full_name;
    if (parsed.data.avatar_url !== undefined) updates.avatar_url = parsed.data.avatar_url;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('[User Profile API] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update profile' } },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedProfile.id,
          email: user.email,
          name: updatedProfile.full_name,
          avatarUrl: updatedProfile.avatar_url,
          tier: updatedProfile.tier ?? 'free',
          onboardingComplete: updatedProfile.onboarding_complete ?? false,
          createdAt: updatedProfile.created_at,
          updatedAt: updatedProfile.updated_at,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Profile API] PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
