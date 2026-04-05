/**
 * GET/PATCH /api/user/profile -- User Profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateProfileSchema } from '@/validators/user';
import { createClient } from '@/lib/supabase/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

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
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.full_name !== undefined) updates.name = parsed.data.full_name;
    if (parsed.data.avatar_url !== undefined) updates.avatar_url = parsed.data.avatar_url;
    const anyData = parsed.data as Record<string, unknown>;
    if (anyData.preferences !== undefined) updates.preferences = anyData.preferences;

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: updatedProfile },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Profile API] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
