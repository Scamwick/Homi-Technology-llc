/**
 * POST /api/temporal-twin — Temporal Twin Message Generation
 * ==========================================================
 *
 * Generates personalized letters from the user's future self based
 * on their assessment results. Supports single-horizon or all-horizon
 * generation.
 *
 * Rate limit: 3 requests per assessmentId (tracked in-memory for now).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TemporalTwinEngine } from '@/lib/temporal-twin/engine';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Rate Limiting (in-memory — suitable for serverless with short lifetimes)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT = 3;

function checkRateLimit(assessmentId: string): boolean {
  const current = rateLimitMap.get(assessmentId) ?? 0;
  if (current >= RATE_LIMIT) return false;
  rateLimitMap.set(assessmentId, current + 1);
  return true;
}

// ---------------------------------------------------------------------------
// Request Validation
// ---------------------------------------------------------------------------

const HorizonSchema = z.enum(['5yr', '10yr', 'retirement', 'all']);

const TemporalTwinRequestSchema = z.object({
  assessmentId: z.string().min(1),
  currentAge: z.number().int().min(18).max(100),
  verdict: z.enum(['READY', 'ALMOST_THERE', 'BUILD_FIRST', 'NOT_YET']),
  scores: z.object({
    overall: z.number().min(0).max(100),
    financial: z.number().min(0).max(100),
    emotional: z.number().min(0).max(100),
    timing: z.number().min(0).max(100),
  }),
  horizon: HorizonSchema,
  decisionType: z.string().default('homeownership'),
});

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // --- Parse & Validate ---
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = TemporalTwinRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { assessmentId, currentAge, verdict, scores, horizon, decisionType } =
      parsed.data;

    // --- Rate Limit ---
    if (!checkRateLimit(assessmentId)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Maximum ${RATE_LIMIT} requests per assessment.`,
        },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // --- Generate ---
    const engine = new TemporalTwinEngine();
    const baseParams = {
      currentAge,
      verdict,
      overallScore: scores.overall,
      financialScore: scores.financial,
      emotionalScore: scores.emotional,
      timingScore: scores.timing,
      decisionType,
    };

    if (horizon === 'all') {
      const messages = await engine.generateAll(baseParams);
      return NextResponse.json(
        {
          assessmentId,
          messages,
          generatedAt: new Date().toISOString(),
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const message = await engine.generateMessage({
      ...baseParams,
      horizon,
    });

    return NextResponse.json(
      {
        assessmentId,
        message,
        generatedAt: new Date().toISOString(),
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Temporal Twin API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
