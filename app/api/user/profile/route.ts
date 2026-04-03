/**
 * GET/PATCH /api/user/profile -- User Profile
 * =============================================
 *
 * GET:   Return the authenticated user's profile (mock data).
 * PATCH: Update profile fields (validated with updateProfileSchema).
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
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
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_PROFILE = {
  id: 'dev-user',
  email: 'dev@homi.app',
  name: 'Alex Developer',
  avatarUrl: null,
  tier: 'pro' as const,
  onboardingComplete: true,
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-03-28T14:15:00Z',
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

export async function GET() {
  try {
    return NextResponse.json(
      { success: true, data: MOCK_PROFILE },
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

    const updatedProfile = {
      ...MOCK_PROFILE,
      ...(parsed.data.full_name !== undefined && { name: parsed.data.full_name }),
      ...(parsed.data.avatar_url !== undefined && { avatarUrl: parsed.data.avatar_url }),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: updatedProfile },
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
