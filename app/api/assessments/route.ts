/**
 * GET/POST /api/assessments -- Assessment CRUD
 * ==============================================
 *
 * GET:  List the authenticated user's assessments (mock data).
 * POST: Create a new assessment (validates decision_type).
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAssessmentSchema } from '@/validators/assessment';
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
// Fallback Data (dev mode without Supabase)
// ---------------------------------------------------------------------------

const FALLBACK_ASSESSMENTS = [
  {
    id: 'assess_001',
    userId: 'dev-user',
    decision_type: 'home_buying' as const,
    overall: 74,
    verdict: 'ALMOST_THERE' as const,
    confidenceBand: 'high' as const,
    crisisDetected: false,
    createdAt: '2026-03-15T10:30:00Z',
    version: '1.0.0',
  },
  {
    id: 'assess_002',
    userId: 'dev-user',
    decision_type: 'home_buying' as const,
    overall: 82,
    verdict: 'READY' as const,
    confidenceBand: 'high' as const,
    crisisDetected: false,
    createdAt: '2026-03-28T14:15:00Z',
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

export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: assessments, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (!error && assessments) {
          return NextResponse.json(
            {
              success: true,
              data: {
                assessments: assessments.map((a) => ({
                  id: a.id,
                  userId: a.user_id,
                  decision_type: a.decision_type,
                  overall: a.overall,
                  verdict: a.verdict,
                  confidenceBand: a.confidence_band,
                  crisisDetected: a.crisis_detected,
                  createdAt: a.created_at,
                  version: a.version ?? '1.0.0',
                })),
                total: assessments.length,
              },
            },
            { status: 200, headers: CORS_HEADERS },
          );
        }
      }
    }

    // Fallback for dev mode
    return NextResponse.json(
      {
        success: true,
        data: {
          assessments: FALLBACK_ASSESSMENTS,
          total: FALLBACK_ASSESSMENTS.length,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessments API] GET error:', error);
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
// POST -- Create assessment
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
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

    const now = new Date().toISOString();
    const newAssessment = {
      id: `assess_${crypto.randomUUID().slice(0, 8)}`,
      userId: 'dev-user',
      decision_type: parsed.data.decision_type,
      status: 'in_progress',
      overall: null,
      verdict: null,
      confidenceBand: null,
      crisisDetected: false,
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
    };

    return NextResponse.json(
      { success: true, data: newAssessment },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessments API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
