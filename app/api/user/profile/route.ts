/**
 * GET/PATCH /api/user/profile -- User Profile
 * =============================================
 *
 * GET:   Return the authenticated user's profile.
 * PATCH: Update profile fields (validated with updateProfileSchema).
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateProfileSchema } from '@/validators/user';
import { withAuth } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Mock Data (dev fallback)
// ---------------------------------------------------------------------------

const MOCK_PROFILE = {
  id: 'dev-user',
  email: 'dev@homi.app',
  full_name: 'Alex Developer',
  avatar_url: null,
  subscription_tier: 'pro' as const,
  onboarding_completed: true,
  created_at: '2026-01-15T08:00:00Z',
  updated_at: '2026-03-28T14:15:00Z',
};

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Get user profile
// ---------------------------------------------------------------------------

export const GET = withAuth(async (_req, ctx) => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: true, data: MOCK_PROFILE },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', ctx.user!.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      { success: true, data: profile },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Profile API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});

// ---------------------------------------------------------------------------
// PATCH -- Update user profile
// ---------------------------------------------------------------------------

export const PATCH = withAuth(async (request, ctx) => {
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...MOCK_PROFILE,
            ...(parsed.data.full_name !== undefined && { full_name: parsed.data.full_name }),
            ...(parsed.data.avatar_url !== undefined && { avatar_url: parsed.data.avatar_url }),
            updated_at: new Date().toISOString(),
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};
    if (parsed.data.full_name !== undefined) updateData.full_name = parsed.data.full_name;
    if (parsed.data.avatar_url !== undefined) updateData.avatar_url = parsed.data.avatar_url;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', ctx.user!.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: profile },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Profile API] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
