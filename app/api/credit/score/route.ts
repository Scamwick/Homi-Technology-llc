/**
 * GET /api/credit/score — Get Latest Reconciled Credit Score
 * ============================================================
 *
 * Returns the most recent credit score without triggering a new pull.
 * Uses cached bureau reports and Plaid data.
 *
 * Response: { score, scoreType, confidence, factors, pulledAt } | { score: null }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLatestCreditScore } from '@/lib/credit/service';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    const result = await getLatestCreditScore(user.id);

    if (!result) {
      return NextResponse.json({
        score: null,
        message: 'No credit data available. Pull your credit score first.',
      });
    }

    return NextResponse.json({
      score: result.reconciledScore,
      scoreType: result.scoreType,
      confidence: result.confidence,
      factors: result.factors,
      sources: result.sources.map((s) => ({
        source: s.source,
        score: s.score,
        scoreType: s.scoreType,
      })),
      pulledAt: result.pulledAt,
    });
  } catch (error) {
    console.error('[Credit Score] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get credit score' },
      { status: 500 },
    );
  }
}
