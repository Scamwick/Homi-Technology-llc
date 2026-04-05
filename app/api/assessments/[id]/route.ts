/**
 * GET /api/assessments/[id] -- Single Assessment
 * ================================================
 *
 * Retrieves a single assessment by ID with full scoring details.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Mock Assessment (dev fallback)
// ---------------------------------------------------------------------------

const MOCK_ASSESSMENT = {
  id: 'mock',
  user_id: 'dev-user',
  decision_type: 'home_buying',
  overall_score: 74,
  verdict: 'ALMOST_THERE' as const,
  confidence_band: 'high' as const,
  financial_score: 80,
  emotional_score: 71,
  timing_score: 70,
  financial_sub_scores: {
    dti: { value: 0.25, maxPoints: 10, points: 10 },
    downPayment: { value: 0.15, maxPoints: 10, points: 7 },
    emergencyFund: { value: 4, maxPoints: 8, points: 5 },
    creditScore: { value: 720, maxPoints: 7, points: 5 },
  },
  emotional_sub_scores: {
    lifeStability: { value: 7, maxPoints: 9, points: 6 },
    confidence: { value: 6, maxPoints: 9, points: 5 },
    partnerAlignment: { value: 8, maxPoints: 9, points: 7 },
    fomoCheck: { value: 4, maxPoints: 8, points: 5 },
  },
  timing_sub_scores: {
    timeHorizon: { value: 9, maxPoints: 10, points: 7 },
    savingsRate: { value: 0.15, maxPoints: 10, points: 7 },
    downPaymentProgress: { value: 0.65, maxPoints: 10, points: 7 },
  },
  crisis_detected: false,
  created_at: '2026-03-28T14:15:00Z',
  version: '1.0.0',
};

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Get single assessment
// ---------------------------------------------------------------------------

export const GET = withAuth(async (
  _request: NextRequest,
  ctx,
  routeParams?: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await routeParams!.params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'Assessment ID is required' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: true, data: { ...MOCK_ASSESSMENT, id } },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*, monte_carlo_results(*)')
      .eq('id', id)
      .eq('user_id', ctx.user!.id)
      .single();

    if (error || !assessment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Assessment not found' } },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      { success: true, data: assessment },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessment Detail API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}) as (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<NextResponse>;
