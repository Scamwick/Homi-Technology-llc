/**
 * GET/POST /api/assessments -- Assessment CRUD
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAssessmentSchema } from '@/validators/assessment';
import { createClient } from '@/lib/supabase/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: {
          assessments: assessments ?? [],
          total: assessments?.length ?? 0,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessments API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const parsed = createAssessmentSchema.safeParse(body);
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

    const { data: newAssessment, error } = await supabase
      .from('assessments')
      .insert({
        user_id: user.id,
        financial_inputs: (parsed.data as Record<string, unknown>).financial_inputs ?? {},
        emotional_inputs: (parsed.data as Record<string, unknown>).emotional_inputs ?? {},
        timing_inputs: (parsed.data as Record<string, unknown>).timing_inputs ?? {},
        overall_score: 0,
        financial_score: 0,
        financial_breakdown: {},
        emotional_score: 0,
        emotional_breakdown: {},
        timing_score: 0,
        timing_breakdown: {},
        verdict: 'NOT_YET',
        confidence_band: 'low',
        version: '1.0.0',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: newAssessment },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessments API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
