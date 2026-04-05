/**
 * POST /api/assessments/[id]/complete -- Complete Assessment
 * ===========================================================
 *
 * Triggers the scoring engine, persists the result, and sends
 * the verdict email. Accepts financial/emotional/timing inputs.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeScore } from '@/lib/scoring';
import { withAuth } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/service';
import { verdictReadyEmail } from '@/emails/verdict-ready';
import { verdictNotYetEmail } from '@/emails/verdict-not-yet';

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

export const POST = withAuth(async (
  request: NextRequest,
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
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

    // Persist to database if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();

      // Update the assessment row with scores
      await supabase
        .from('assessments')
        .update({
          status: 'completed',
          overall_score: scoreResult.score,
          financial_score: scoreResult.financial.total,
          emotional_score: scoreResult.emotional.total,
          timing_score: scoreResult.timing.total,
          verdict: scoreResult.verdict,
          financial_sub_scores: scoreResult.financial as unknown as Record<string, unknown>,
          emotional_sub_scores: scoreResult.emotional as unknown as Record<string, unknown>,
          timing_sub_scores: scoreResult.timing as unknown as Record<string, unknown>,
          financial_inputs: financial as unknown as Record<string, unknown>,
          emotional_inputs: emotional as unknown as Record<string, unknown>,
          timing_inputs: timing as unknown as Record<string, unknown>,
          confidence_band: 'high',
          crisis_detected: false,
          version: '1.0.0',
          completed_at: now,
        })
        .eq('id', id)
        .eq('user_id', ctx.user!.id);

      // Insert notification
      await supabase.from('notifications').insert({
        user_id: ctx.user!.id,
        type: 'assessment_complete',
        title: 'Assessment Complete',
        body: `Your HōMI-Score is ${scoreResult.score} (${scoreResult.verdict.replace('_', ' ')}).`,
        action_url: `/assess/${id}`,
        data: { assessmentId: id, overall: scoreResult.score },
      });

      // Fire-and-forget: send verdict email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://homitechnology.com';
      const emailData = {
        name: ctx.user!.email.split('@')[0],
        score: scoreResult.score,
        dimensions: {
          self: scoreResult.financial.total,
          relational: scoreResult.emotional.total,
          practical: scoreResult.timing.total,
        },
        appUrl,
      };

      const template = scoreResult.score >= 65
        ? verdictReadyEmail(emailData)
        : verdictNotYetEmail(emailData);

      sendEmail({ to: ctx.user!.email, subject: template.subject, html: template.html }).catch(
        (err) => console.error('[Assessment Complete] Email error:', err),
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Assessment Complete API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}) as (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<NextResponse>;
