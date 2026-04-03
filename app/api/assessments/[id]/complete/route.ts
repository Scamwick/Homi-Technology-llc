/**
 * POST /api/assessments/[id]/complete -- Complete Assessment
 * ===========================================================
 *
 * Triggers the scoring engine and returns the scored result.
 * Accepts financial/emotional/timing inputs and runs computeScore.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeScore } from '@/lib/scoring';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Request Validation
// ---------------------------------------------------------------------------

const CompleteAssessmentSchema = z.object({
  financial: z.object({
    annualIncome: z.number().min(0),
    monthlyDebt: z.number().min(0),
    downPaymentSaved: z.number().min(0),
    targetHomePrice: z.number().min(1),
    emergencyFundMonths: z.number().min(0),
    creditScore: z.number().min(300).max(850),
  }),
  emotional: z.object({
    lifeStability: z.number().min(1).max(10),
    confidenceLevel: z.number().min(1).max(10),
    partnerAlignment: z.number().min(1).max(10).nullable(),
    fomoLevel: z.number().min(1).max(10),
  }),
  timing: z.object({
    timeHorizonMonths: z.number().min(0),
    monthlySavingsRate: z.number().min(0).max(100),
    downPaymentProgress: z.number().min(0).max(100),
  }),
});

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST -- Complete assessment & run scoring
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
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

    const parsed = CompleteAssessmentSchema.safeParse(body);
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

    const { financial, emotional, timing } = parsed.data;

    // Transform inputs for the scoring engine
    const monthlyIncome = financial.annualIncome / 12;
    const engineInputs = {
      debtToIncomeRatio: monthlyIncome > 0 ? financial.monthlyDebt / monthlyIncome : 1,
      downPaymentPercent: financial.targetHomePrice > 0
        ? financial.downPaymentSaved / financial.targetHomePrice
        : 0,
      emergencyFundMonths: financial.emergencyFundMonths,
      creditScore: financial.creditScore,
      lifeStability: emotional.lifeStability,
      confidenceLevel: emotional.confidenceLevel,
      partnerAlignment: emotional.partnerAlignment,
      fomoLevel: emotional.fomoLevel,
      timeHorizonMonths: timing.timeHorizonMonths,
      savingsRate: timing.monthlySavingsRate / 100,
      downPaymentProgress: timing.downPaymentProgress / 100,
    };

    const scoreResult = computeScore(engineInputs);
    const now = new Date().toISOString();

    const result = {
      assessmentId: id,
      overall: scoreResult.score,
      verdict: scoreResult.verdict,
      financial: scoreResult.financial,
      emotional: scoreResult.emotional,
      timing: scoreResult.timing,
      warnings: scoreResult.warnings,
      completedAt: now,
      version: '1.0.0',
    };

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessment Complete API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
