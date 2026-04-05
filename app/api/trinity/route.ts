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
 * When ANTHROPIC_API_KEY is not set, returns mock responses for development.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

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
// Mock Responses (Development)
// ---------------------------------------------------------------------------

function generateMockResponse(assessment: TrinityRequest['assessment']): {
  advocate: string;
  skeptic: string;
  arbiter: string;
} {
  const score = assessment.overall;
  const verdict = assessment.verdict;

  if (verdict === 'READY' || score >= 80) {
    return {
      advocate: `Your ${score}/100 score reflects genuine financial strength. A ${(assessment.monteCarlo.successRate * 100).toFixed(0)}% success rate across a thousand simulated scenarios isn't luck — it's preparation. Your financial dimension alone contributed ${assessment.financial.contribution}/35 points, which tells me you've been disciplined about the math.`,
      skeptic: `Even strong scores have blind spots. Your emotional dimension at ${assessment.emotional.score}% deserves scrutiny — are you being honest with yourself about the stress of homeownership, or are you caught up in the excitement? The ${(assessment.monteCarlo.crashSurvivalRate * 100).toFixed(0)}% crash survival rate is solid but not bulletproof.`,
      arbiter: `You're in a strong position. The numbers support moving forward, but I'd recommend stress-testing your budget at 2% higher interest rates before committing. Your readiness is real — don't let perfect be the enemy of good here.`,
    };
  }

  if (verdict === 'ALMOST_THERE' || score >= 65) {
    return {
      advocate: `A ${score}/100 puts you closer than most first-time buyers ever get before pulling the trigger. Your timing score of ${assessment.timing.score}% shows you're thinking ahead, and that strategic mindset is worth more than a few extra points on paper.`,
      skeptic: `The gap between ${score} and 80 isn't trivial. Your financial contribution of ${assessment.financial.contribution}/35 suggests there's room to strengthen your position — and in a market where closing costs alone can run 3-5%, that buffer matters more than you think.`,
      arbiter: `You're close but not quite there. I'd give yourself 3-6 more months of focused preparation. The difference between buying at ${score} and buying at 80+ could save you tens of thousands over the life of the loan.`,
    };
  }

  if (verdict === 'BUILD_FIRST' || score >= 50) {
    return {
      advocate: `Scoring ${score}/100 means you have a foundation. You're not starting from zero — your ${assessment.emotional.score}% emotional readiness suggests you know what you want, and that clarity is the hardest part for many buyers to achieve.`,
      skeptic: `A Monte Carlo success rate of ${(assessment.monteCarlo.successRate * 100).toFixed(0)}% means that in roughly ${((1 - assessment.monteCarlo.successRate) * 100).toFixed(0)}% of scenarios, you'd be in financial distress. That's not a risk I'd take with the biggest purchase of your life. Your P10 outcome of $${assessment.monteCarlo.p10.toLocaleString()} paints a concerning worst-case picture.`,
      arbiter: `Now is the time to build, not buy. Focus on increasing your financial score from ${assessment.financial.score}% — every 10-point improvement here translates directly to better loan terms and more breathing room. Set a 6-12 month target and reassess.`,
    };
  }

  return {
    advocate: `Even at ${score}/100, you're already doing something most people never do: honestly assessing where you stand. That self-awareness is the first step, and it puts you ahead of buyers who rush in without looking.`,
    skeptic: `The numbers are clear — a ${(assessment.monteCarlo.successRate * 100).toFixed(0)}% success rate and ${score}/100 overall score both say the same thing: buying now would put you at serious financial risk. Your emergency fund and debt ratios need significant improvement before homeownership is sustainable.`,
    arbiter: `This is not your moment to buy — and that's not a failure, it's information. Build an emergency fund to 6+ months, work on getting your credit above 700, and aim to save at least 10% of your down payment target. Come back in 12-18 months and you'll see a dramatically different score.`,
  };
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
    let rawPerspectives: { advocate: string; skeptic: string; arbiter: string };
    let model: string;

    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

    if (hasApiKey) {
      try {
        rawPerspectives = await callClaudeAPI(assessment);
        model = 'claude-sonnet-4-20250514';
      } catch (error) {
        console.error('[Trinity API] Claude API call failed, falling back to mock:', error);
        rawPerspectives = generateMockResponse(assessment);
        model = 'mock-fallback';
      }
    } else {
      rawPerspectives = generateMockResponse(assessment);
      model = 'mock-development';
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

    // Persist trinity analysis to database (fire-and-forget)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      createClient().then(supabase => {
        supabase.from('trinity_analyses').insert({
          assessment_id: assessmentId,
          advocate_perspective: rawPerspectives.advocate,
          advocate_confidence: 0.8,
          advocate_key_points: [],
          skeptic_perspective: rawPerspectives.skeptic,
          skeptic_confidence: 0.8,
          skeptic_key_points: [],
          arbiter_perspective: rawPerspectives.arbiter,
          arbiter_confidence: 0.8,
          arbiter_key_points: [],
          consensus: 0.7,
          model_version: model,
        }).then(({ error }) => {
          if (error) console.error('[Trinity API] Persistence error:', error);
        });
      });
    }

    return NextResponse.json(response, { status: 200, headers: CORS_HEADERS });

  } catch (error) {
    console.error('[Trinity API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
