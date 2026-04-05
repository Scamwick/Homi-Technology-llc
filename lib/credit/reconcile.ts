/**
 * Credit Score Reconciliation
 * =============================
 *
 * When multiple credit scores are available from different sources,
 * this module reconciles them into a single high-confidence score.
 *
 * Reconciliation rules:
 *   1. Bureau scores (TransUnion FICO, Experian VantageScore) weighted by recency
 *   2. Plaid estimates used only as a tiebreaker or floor
 *   3. Discrepancies >30 points flagged for user review
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreditPull {
  source: 'transunion' | 'experian' | 'plaid';
  score: number;
  scoreType: string;
  factors: string[];
  pulledAt: string;
  rawData: unknown;
}

export interface ReconciledScore {
  score: number;
  scoreType: string;
  sourceCount: number;
  discrepancy: number | null;
  discrepancyFlag: boolean;
}

// ---------------------------------------------------------------------------
// Source Weights
// ---------------------------------------------------------------------------

/** Weight by source reliability. Bureau scores are more reliable than Plaid estimates. */
const SOURCE_WEIGHTS: Record<string, number> = {
  transunion: 1.0,
  experian: 1.0,
  plaid: 0.3,
};

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Reconciles multiple credit scores into a single score.
 *
 * Strategy:
 *   - If two bureau scores exist, uses weighted average (both weight 1.0)
 *   - If one bureau + Plaid, uses bureau score (Plaid as validation)
 *   - If only Plaid, uses Plaid estimate with lower confidence
 *   - Empty: returns 0
 */
export function reconcileScores(pulls: CreditPull[]): ReconciledScore {
  if (pulls.length === 0) {
    return {
      score: 0,
      scoreType: 'none',
      sourceCount: 0,
      discrepancy: null,
      discrepancyFlag: false,
    };
  }

  if (pulls.length === 1) {
    return {
      score: pulls[0].score,
      scoreType: pulls[0].scoreType,
      sourceCount: 1,
      discrepancy: null,
      discrepancyFlag: false,
    };
  }

  // Sort by source weight (highest first), then recency
  const sorted = [...pulls].sort((a, b) => {
    const weightDiff = (SOURCE_WEIGHTS[b.source] ?? 0) - (SOURCE_WEIGHTS[a.source] ?? 0);
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.pulledAt).getTime() - new Date(a.pulledAt).getTime();
  });

  // Calculate weighted average
  let weightedSum = 0;
  let totalWeight = 0;

  for (const pull of sorted) {
    const weight = SOURCE_WEIGHTS[pull.source] ?? 0.5;
    // Apply recency decay: pulls older than 30 days get reduced weight
    const ageMs = Date.now() - new Date(pull.pulledAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recencyFactor = ageDays > 30 ? 0.7 : 1.0;

    const effectiveWeight = weight * recencyFactor;
    weightedSum += pull.score * effectiveWeight;
    totalWeight += effectiveWeight;
  }

  const reconciledScore = totalWeight > 0
    ? Math.round(weightedSum / totalWeight)
    : sorted[0].score;

  // Check for discrepancies between bureau scores
  const bureauPulls = sorted.filter((p) => p.source !== 'plaid');
  let discrepancy: number | null = null;
  let discrepancyFlag = false;

  if (bureauPulls.length >= 2) {
    discrepancy = Math.abs(bureauPulls[0].score - bureauPulls[1].score);
    discrepancyFlag = discrepancy > 30;
  }

  // Determine the primary score type
  const primaryBureau = bureauPulls[0] ?? sorted[0];

  return {
    score: reconciledScore,
    scoreType: primaryBureau.scoreType,
    sourceCount: pulls.length,
    discrepancy,
    discrepancyFlag,
  };
}
