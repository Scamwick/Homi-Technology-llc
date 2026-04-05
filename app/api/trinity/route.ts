/**
 * POST /api/trinity — Trinity Engine Analysis Endpoint
 * =====================================================
 *
 * Takes a completed assessment and generates three distinct AI perspectives:
 *
 *   ADVOCATE (Emerald)  — Finds strengths, sees what's going right
 *   SKEPTIC  (Yellow)   — Finds risks, sees what could go wrong
 *   ARBITER  (Cyan)     — Weighs both sides, delivers the final call
 *
 * This is a one-shot analysis, NOT a streaming conversation. The Trinity
 * speaks once, clearly, and lets the user sit with it.
 *
 * When ANTHROPIC_API_KEY is not set, returns a [Demo Mode] response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isDemoMode, getDemoMessage } from '@/lib/ai/demo-mode';

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

const TrinityRequestSchema = z.object({
  assessmentId: z.string().min(1).describe('Assessment ID to analyze'),
  /** Full assessment data passed inline so we don't need a database lookup yet. */
  assessment: z.object({
    overall: z.number().min(0).max(100),
    verdict: z.enum(['READY', 'ALMOST_THERE', 'BUILD_FIRST', 'NOT_YET']),
    financial: z.object({
      score: z.number(),
      contribution: z.number(),
    }),
    emotional: z.object({
      score: z.number(),
      contribution: z.number(),
    }),
    timing: z.object({
      score: z.number(),
      contribution: z.number(),
    }),
    monteCarlo: z.object({
      successRate: z.number(),
      crashSurvivalRate: z.number(),
      p10: z.number(),
      p50: z.number(),
      p90: z.number(),
    }),
    confidenceBand: z.enum(['high', 'medium', 'low']),
  }),
});

type TrinityRequest = z.infer<typeof TrinityRequestSchema>;

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

interface TrinityPerspective {
  role: 'advocate' | 'skeptic' | 'arbiter';
  displayName: string;
  color: string;
  analysis: string;
}

interface TrinityResponse {
  assessmentId: string;
  perspectives: TrinityPerspective[];
  generatedAt: string;
  model: string;
}

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

const TRINITY_SYSTEM_PROMPT = `You are the HōMI Trinity Engine. Given a readiness assessment, provide three perspectives:

ADVOCATE (optimistic): Find the strengths. What's going well? Why might this person be more ready than they think?

SKEPTIC (cautious): Find the risks. What's being overlooked? What could go wrong?

ARBITER (decisive): Weigh both sides. What's the final recommendation? Be direct.

Each perspective should be 2-3 sentences. Be specific to the user's actual numbers, not generic.

Respond in this exact JSON format:
{
  "advocate": "Your advocate analysis here.",
  "skeptic": "Your skeptic analysis here.",
  "arbiter": "Your arbiter analysis here."
}

Respond ONLY with the JSON object. No markdown, no code fences, no additional text.`;

// ---------------------------------------------------------------------------
// Claude API Integration
// ---------------------------------------------------------------------------

async function callClaudeAPI(assessment: TrinityRequest['assessment']): Promise<{
  advocate: string;
  skeptic: string;
  arbiter: string;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const userMessage = `Analyze this homebuying readiness assessment:

Overall HōMI-Score: ${assessment.overall}/100
Verdict: ${assessment.verdict}
Confidence Band: ${assessment.confidenceBand}

Financial Dimension: ${assessment.financial.score}% (contributed ${assessment.financial.contribution}/35 points)
Emotional Dimension: ${assessment.emotional.score}% (contributed ${assessment.emotional.contribution}/35 points)
Timing Dimension: ${assessment.timing.score}% (contributed ${assessment.timing.contribution}/30 points)

Monte Carlo Simulation:
- Success Rate: ${(assessment.monteCarlo.successRate * 100).toFixed(0)}% of scenarios sustainable
- Crash Survival: ${(assessment.monteCarlo.crashSurvivalRate * 100).toFixed(0)}% survive a market downturn
- Pessimistic Outcome (P10): $${assessment.monteCarlo.p10.toLocaleString()}
- Median Outcome (P50): $${assessment.monteCarlo.p50.toLocaleString()}
- Optimistic Outcome (P90): $${assessment.monteCarlo.p90.toLocaleString()}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: TRINITY_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Trinity API] Claude API error:', response.status, errorBody);
    throw new Error(`Claude API returned ${response.status}`);
  }

  const data = await response.json();

  // Extract text content from Claude's response
  const textBlock = data.content?.find(
    (block: { type: string }) => block.type === 'text',
  );
  if (!textBlock?.text) {
    throw new Error('No text content in Claude response');
  }

  // Parse the JSON response
  let parsed: { advocate: string; skeptic: string; arbiter: string };
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    // If Claude didn't return valid JSON, try to extract it
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not parse Trinity response as JSON');
    }
  }

  if (!parsed.advocate || !parsed.skeptic || !parsed.arbiter) {
    throw new Error('Trinity response missing required perspectives');
  }

  return parsed;
}

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

    const parsed = TrinityRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { assessmentId, assessment } = parsed.data;

    // --- Generate Trinity Analysis ---
    if (isDemoMode()) {
      const demoMsg = getDemoMessage();
      const response: TrinityResponse = {
        assessmentId,
        perspectives: [
          { role: 'advocate', displayName: 'Advocate', color: 'emerald', analysis: demoMsg },
          { role: 'skeptic', displayName: 'Skeptic', color: 'yellow', analysis: demoMsg },
          { role: 'arbiter', displayName: 'Arbiter', color: 'cyan', analysis: demoMsg },
        ],
        generatedAt: new Date().toISOString(),
        model: 'demo',
      };
      return NextResponse.json(response, { status: 200, headers: CORS_HEADERS });
    }

    let rawPerspectives: { advocate: string; skeptic: string; arbiter: string };
    let model: string;

    try {
      rawPerspectives = await callClaudeAPI(assessment);
      model = 'claude-sonnet-4-20250514';
    } catch (error) {
      console.error('[Trinity API] Claude API call failed:', error);
      return NextResponse.json(
        { error: 'AI analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 502, headers: CORS_HEADERS },
      );
    }

    // --- Format Response ---
    const perspectives: TrinityPerspective[] = [
      {
        role: 'advocate',
        displayName: 'Advocate',
        color: 'emerald',
        analysis: rawPerspectives.advocate,
      },
      {
        role: 'skeptic',
        displayName: 'Skeptic',
        color: 'yellow',
        analysis: rawPerspectives.skeptic,
      },
      {
        role: 'arbiter',
        displayName: 'Arbiter',
        color: 'cyan',
        analysis: rawPerspectives.arbiter,
      },
    ];

    const response: TrinityResponse = {
      assessmentId,
      perspectives,
      generatedAt: new Date().toISOString(),
      model,
    };

    return NextResponse.json(response, { status: 200, headers: CORS_HEADERS });

  } catch (error) {
    console.error('[Trinity API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
