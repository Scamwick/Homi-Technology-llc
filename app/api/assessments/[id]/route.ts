/**
 * GET /api/assessments/[id] -- Single Assessment
 * ================================================
 *
 * Retrieves a single assessment by ID (mock data).
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Get single assessment
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_ID', message: 'Assessment ID is required' },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // Mock assessment data
    const assessment = {
      id,
      userId: 'dev-user',
      decision_type: 'home_buying',
      overall: 74,
      verdict: 'ALMOST_THERE' as const,
      confidenceBand: 'high' as const,
      financial: {
        score: 80,
        maxContribution: 35,
        contribution: 28,
        breakdown: {
          dti: { value: 0.25, maxPoints: 10, points: 10 },
          downPayment: { value: 0.15, maxPoints: 10, points: 7 },
          emergencyFund: { value: 4, maxPoints: 8, points: 5 },
          creditScore: { value: 720, maxPoints: 7, points: 5 },
        },
      },
      emotional: {
        score: 71,
        maxContribution: 35,
        contribution: 25,
        breakdown: {
          lifeStability: { value: 7, maxPoints: 9, points: 6 },
          confidence: { value: 6, maxPoints: 9, points: 5 },
          partnerAlignment: { value: 8, maxPoints: 9, points: 7 },
          fomoCheck: { value: 4, maxPoints: 8, points: 5 },
        },
      },
      timing: {
        score: 70,
        maxContribution: 30,
        contribution: 21,
        breakdown: {
          timeHorizon: { value: 9, maxPoints: 10, points: 7 },
          savingsRate: { value: 0.15, maxPoints: 10, points: 7 },
          downPaymentProgress: { value: 0.65, maxPoints: 10, points: 7 },
        },
      },
      monteCarlo: {
        successRate: 0.72,
        scenariosRun: 1000,
        p10: -15000,
        p50: 45000,
        p90: 120000,
        crashSurvivalRate: 0.68,
        gateApplied: false,
      },
      crisisDetected: false,
      createdAt: '2026-03-28T14:15:00Z',
      version: '1.0.0',
    };

    return NextResponse.json(
      { success: true, data: assessment },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessment Detail API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
