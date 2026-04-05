/**
 * GET/POST /api/assessments -- Assessment CRUD
 * ==============================================
 *
 * GET:  List the authenticated user's assessments.
 * POST: Create a new assessment (validates decision_type).
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAssessmentSchema } from '@/validators/assessment';
import { withAuth } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Mock Data (dev fallback)
// ---------------------------------------------------------------------------

const MOCK_ASSESSMENTS = [
  {
    id: 'assess_001',
    user_id: 'dev-user',
    decision_type: 'home_buying' as const,
    overall_score: 74,
    verdict: 'ALMOST_THERE' as const,
    confidence_band: 'high' as const,
    crisis_detected: false,
    created_at: '2026-03-15T10:30:00Z',
    version: '1.0.0',
  },
  {
    id: 'assess_002',
    user_id: 'dev-user',
    decision_type: 'home_buying' as const,
    overall_score: 82,
    verdict: 'READY' as const,
    confidence_band: 'high' as const,
    crisis_detected: false,
    created_at: '2026-03-28T14:15:00Z',
    version: '1.0.0',
  },
];

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- List assessments
// ---------------------------------------------------------------------------

export const GET = withAuth(async (_req, ctx) => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: true, data: { assessments: MOCK_ASSESSMENTS, total: MOCK_ASSESSMENTS.length } },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const { data: assessments, error, count } = await supabase
      .from('assessments')
      .select('*', { count: 'exact' })
      .eq('user_id', ctx.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: { assessments: assessments ?? [], total: count ?? 0 } },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessments API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});

// ---------------------------------------------------------------------------
// POST -- Create assessment
// ---------------------------------------------------------------------------

export const POST = withAuth(async (request, ctx) => {
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const now = new Date().toISOString();
      return NextResponse.json(
        {
          success: true,
          data: {
            id: `assess_${crypto.randomUUID().slice(0, 8)}`,
            user_id: ctx.user!.id,
            decision_type: parsed.data.decision_type,
            status: 'in_progress',
            created_at: now,
          },
        },
        { status: 201, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert({
        user_id: ctx.user!.id,
        decision_type: parsed.data.decision_type,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: assessment },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessments API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
