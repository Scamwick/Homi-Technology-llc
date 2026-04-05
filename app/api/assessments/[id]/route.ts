/**
 * GET /api/assessments/[id] -- Single Assessment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'Assessment ID is required' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const [assessmentResult, monteCarloResult, trinityResult] = await Promise.all([
      supabase.from('assessments').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('monte_carlo_results').select('*').eq('assessment_id', id).single(),
      supabase.from('trinity_analyses').select('*').eq('assessment_id', id).single(),
    ]);

    if (!assessmentResult.data) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Assessment not found' } },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...assessmentResult.data,
          monte_carlo: monteCarloResult.data ?? null,
          trinity: trinityResult.data ?? null,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessment Detail API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
