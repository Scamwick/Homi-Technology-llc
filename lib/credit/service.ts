/**
 * Multi-Source Credit Score Service
 * ===================================
 *
 * Orchestrates credit data from multiple sources for maximum accuracy:
 *   1. TransUnion (via TrueVision API) — Primary FICO source
 *   2. Experian (via Connect API) — Secondary verification
 *   3. Plaid (via linked account indicators) — Supplementary
 *
 * After pulling from all available sources, reconciles into a single
 * high-confidence score for use in HoMI-Score calculation.
 */

import { createClient } from '@/lib/supabase/server';
import { pullTransUnion } from './transunion';
import { pullExperian } from './experian';
import { reconcileScores, type CreditPull } from './reconcile';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreditResult {
  reconciledScore: number;
  scoreType: string;
  sources: CreditPull[];
  confidence: 'verified' | 'high' | 'medium' | 'low';
  factors: string[];
  pulledAt: string;
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Pulls credit data from all configured sources and reconciles into
 * a single score. Stores individual reports and returns the reconciled result.
 *
 * This is a "soft pull" — it does NOT impact the user's credit score.
 */
export async function pullCreditScore(userId: string): Promise<CreditResult> {
  const supabase = await createClient();
  const pulls: CreditPull[] = [];
  const allFactors: string[] = [];

  // Pull from TransUnion
  try {
    const tuResult = await pullTransUnion(userId);
    if (tuResult) {
      pulls.push(tuResult);
      allFactors.push(...(tuResult.factors ?? []));

      await supabase.from('credit_reports').insert({
        user_id: userId,
        source: 'transunion',
        score: tuResult.score,
        score_type: tuResult.scoreType,
        factors: tuResult.factors,
        report_date: new Date().toISOString().split('T')[0],
        raw_data: tuResult.rawData,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  } catch (error) {
    console.warn('[Credit] TransUnion pull failed:', error);
  }

  // Pull from Experian
  try {
    const exResult = await pullExperian(userId);
    if (exResult) {
      pulls.push(exResult);
      allFactors.push(...(exResult.factors ?? []));

      await supabase.from('credit_reports').insert({
        user_id: userId,
        source: 'experian',
        score: exResult.score,
        score_type: exResult.scoreType,
        factors: exResult.factors,
        report_date: new Date().toISOString().split('T')[0],
        raw_data: exResult.rawData,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  } catch (error) {
    console.warn('[Credit] Experian pull failed:', error);
  }

  // Check for Plaid-derived credit indicators
  try {
    const { data: plaidCredit } = await supabase
      .from('credit_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('source', 'plaid')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    if (plaidCredit?.score) {
      pulls.push({
        source: 'plaid',
        score: plaidCredit.score,
        scoreType: 'plaid_estimate',
        factors: plaidCredit.factors ?? [],
        pulledAt: plaidCredit.fetched_at,
        rawData: null,
      });
    }
  } catch {
    // No Plaid credit data available
  }

  // Reconcile all pulls into a single score
  const reconciled = reconcileScores(pulls);

  // Determine confidence based on number and quality of sources
  let confidence: CreditResult['confidence'];
  const bureauPulls = pulls.filter((p) => p.source !== 'plaid');
  if (bureauPulls.length >= 2) {
    confidence = 'verified';
  } else if (bureauPulls.length === 1) {
    confidence = 'high';
  } else if (pulls.length > 0) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Deduplicate factors
  const uniqueFactors = [...new Set(allFactors)];

  return {
    reconciledScore: reconciled.score,
    scoreType: reconciled.scoreType,
    sources: pulls,
    confidence,
    factors: uniqueFactors,
    pulledAt: new Date().toISOString(),
  };
}

/**
 * Gets the most recent credit score for a user without performing a new pull.
 * Returns null if no score exists.
 */
export async function getLatestCreditScore(
  userId: string,
): Promise<CreditResult | null> {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from('credit_reports')
    .select('*')
    .eq('user_id', userId)
    .order('fetched_at', { ascending: false })
    .limit(5);

  if (!reports || reports.length === 0) return null;

  // Group by source, take most recent from each
  const bySource = new Map<string, typeof reports[0]>();
  for (const report of reports) {
    if (!bySource.has(report.source)) {
      bySource.set(report.source, report);
    }
  }

  const pulls: CreditPull[] = [];
  const allFactors: string[] = [];

  for (const report of bySource.values()) {
    pulls.push({
      source: report.source as CreditPull['source'],
      score: report.score,
      scoreType: report.score_type ?? 'unknown',
      factors: report.factors ?? [],
      pulledAt: report.fetched_at,
      rawData: null,
    });
    allFactors.push(...(report.factors ?? []));
  }

  const reconciled = reconcileScores(pulls);

  const bureauPulls = pulls.filter((p) => p.source !== 'plaid');
  let confidence: CreditResult['confidence'];
  if (bureauPulls.length >= 2) confidence = 'verified';
  else if (bureauPulls.length === 1) confidence = 'high';
  else if (pulls.length > 0) confidence = 'medium';
  else confidence = 'low';

  return {
    reconciledScore: reconciled.score,
    scoreType: reconciled.scoreType,
    sources: pulls,
    confidence,
    factors: [...new Set(allFactors)],
    pulledAt: reports[0].fetched_at,
  };
}
