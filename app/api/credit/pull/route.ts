/**
 * POST /api/credit/pull — Trigger Multi-Source Credit Pull
 * ==========================================================
 *
 * User-initiated credit score pull from TransUnion + Experian + Plaid.
 * Requires authenticated session and explicit user consent.
 *
 * This is a "soft pull" — does NOT impact the user's credit score.
 *
 * Response: { score, scoreType, confidence, factors, sources }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pullCreditScore } from '@/lib/credit/service';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    const result = await pullCreditScore(user.id);

    return NextResponse.json({
      score: result.reconciledScore,
      scoreType: result.scoreType,
      confidence: result.confidence,
      factors: result.factors,
      sources: result.sources.map((s) => ({
        source: s.source,
        score: s.score,
        scoreType: s.scoreType,
        pulledAt: s.pulledAt,
      })),
      pulledAt: result.pulledAt,
    });
  } catch (error) {
    console.error('[Credit Pull] Error:', error);
    return NextResponse.json(
      { error: 'Failed to pull credit score' },
      { status: 500 },
    );
  }
}
