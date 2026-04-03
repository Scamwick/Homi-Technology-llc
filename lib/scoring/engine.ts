/**
 * HōMI-Score Canonical Scoring Engine
 * ====================================
 *
 * The mathematical heart of HōMI. Produces a deterministic 0-100 score
 * from three equally-weighted pillars:
 *
 *   Financial Reality  (max 35 points)
 *   Emotional Truth    (max 35 points)
 *   Perfect Timing     (max 30 points)
 *
 * Overall = (Financial / 35 * 35) + (Emotional / 35 * 35) + (Timing / 30 * 30)
 *         = Financial + Emotional + Timing  (each already on its own scale)
 *
 * Verdict thresholds (inclusive on the upper boundary):
 *   >= 80  READY
 *   65-79  ALMOST_THERE
 *   50-64  BUILD_FIRST
 *   <  50  NOT_YET
 *
 * Every function in this module is **pure** — no side effects,
 * deterministic output for identical input.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// TODO: Move these interfaces to @/types/assessment once the types package
// is established. For now they are defined inline so the engine is
// self-contained and testable in isolation.

/** Verdict tiers produced by the scoring engine. */
export type Verdict = 'READY' | 'ALMOST_THERE' | 'BUILD_FIRST' | 'NOT_YET';

/** Raw inputs collected from the assessment flow. */
export interface AssessmentInputs {
  // --- Financial Reality ---
  /** Monthly debt payments divided by gross monthly income (0-1 ratio, e.g. 0.28 = 28%). */
  debtToIncomeRatio: number;
  /** Down-payment percentage of target home price (0-1 ratio, e.g. 0.20 = 20%). */
  downPaymentPercent: number;
  /** Number of months of living expenses in emergency fund. */
  emergencyFundMonths: number;
  /** FICO or equivalent credit score (300-850 range). */
  creditScore: number;

  // --- Emotional Truth ---
  /** Self-reported life stability on a 1-10 slider. */
  lifeStability: number;
  /** Self-reported confidence level on a 1-10 slider. */
  confidenceLevel: number;
  /**
   * Self-reported partner alignment on a 1-10 slider.
   * null indicates a single/solo buyer — the 9 points are redistributed
   * proportionally across the other emotional factors.
   */
  partnerAlignment: number | null;
  /** Self-reported FOMO / external pressure on a 1-10 slider. INVERTED in scoring. */
  fomoLevel: number;

  // --- Perfect Timing ---
  /** Planned months until purchase. */
  timeHorizonMonths: number;
  /** Monthly savings rate as a ratio (0-1, e.g. 0.20 = 20%). */
  savingsRate: number;
  /** Progress toward down-payment goal as a ratio (0-1, e.g. 0.80 = 80%). */
  downPaymentProgress: number;
}

/** Breakdown of points earned in each sub-factor. */
export interface FinancialBreakdown {
  debtToIncome: number;     // max 10
  downPayment: number;      // max 10
  emergencyFund: number;    // max 8
  creditHealth: number;     // max 7
  total: number;            // max 35
}

export interface EmotionalBreakdown {
  lifeStability: number;    // max 9
  confidenceLevel: number;  // max 9
  partnerAlignment: number; // max 9 (redistributed if single)
  fomoCheck: number;        // max 8
  total: number;            // max 35
  /** True when partnerAlignment was null and points were redistributed. */
  singleRedistribution: boolean;
}

export interface TimingBreakdown {
  timeHorizon: number;          // max 10
  savingsRate: number;          // max 10
  downPaymentProgress: number;  // max 10
  total: number;                // max 30
}

/** Complete output of the scoring engine. */
export interface AssessmentResult {
  /** Overall HōMI-Score (0-100, 1 decimal precision). */
  score: number;
  /** Verdict tier derived from the score. */
  verdict: Verdict;
  /** Per-pillar breakdowns. */
  financial: FinancialBreakdown;
  emotional: EmotionalBreakdown;
  timing: TimingBreakdown;
  /** Warning flags for the caller. */
  warnings: ScoringWarning[];
}

export interface ScoringWarning {
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum points per pillar.
 * Financial(35) + Emotional(35) + Timing(30) = 100.
 * Exported for use in tests and documentation only.
 */
export const MAX_FINANCIAL = 35;
export const MAX_EMOTIONAL = 35;
export const MAX_TIMING = 30;

/** Verdict thresholds — score on the boundary is included in the higher tier. */
const THRESHOLD_READY = 80;
const THRESHOLD_ALMOST = 65;
const THRESHOLD_BUILD = 50;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Clamps a numeric value to [min, max].
 * Pure, no side effects.
 */
function clamp(value: number, min: number, max: number): number {
  if (value <= min) return min;
  if (value >= max) return max;
  return value;
}

// ---------------------------------------------------------------------------
// Financial Reality (max 35)
// ---------------------------------------------------------------------------

/**
 * Scores Debt-to-Income ratio.
 *
 * | DTI          | Points |
 * |--------------|--------|
 * | <= 28%       | 10     |
 * | 28% - 36%    | 7      |
 * | 36% - 43%    | 4      |
 * | > 43%        | 0      |
 *
 * @param dti - ratio (0-1), e.g. 0.28 = 28%
 * @returns 0-10 integer
 */
function scoreDTI(dti: number): number {
  const pct = clamp(dti, 0, 1) * 100;
  if (pct <= 28) return 10;
  if (pct <= 36) return 7;
  if (pct <= 43) return 4;
  return 0;
}

/**
 * Scores down-payment percentage.
 *
 * | Down Payment | Points |
 * |--------------|--------|
 * | >= 20%       | 10     |
 * | 10% - 20%    | 7      |
 * | 5% - 10%     | 4      |
 * | < 5%         | 0      |
 *
 * @param pct - ratio (0-1)
 * @returns 0-10 integer
 */
function scoreDownPayment(pct: number): number {
  const dp = clamp(pct, 0, 1) * 100;
  if (dp >= 20) return 10;
  if (dp >= 10) return 7;
  if (dp >= 5) return 4;
  return 0;
}

/**
 * Scores emergency fund adequacy.
 *
 * | Months | Points |
 * |--------|--------|
 * | >= 6   | 8      |
 * | 3-6    | 5      |
 * | 1-3    | 2      |
 * | < 1    | 0      |
 *
 * @param months - non-negative number
 * @returns 0-8 integer
 */
function scoreEmergencyFund(months: number): number {
  const m = clamp(months, 0, 120);
  if (m >= 6) return 8;
  if (m >= 3) return 5;
  if (m >= 1) return 2;
  return 0;
}

/**
 * Scores credit health from FICO-equivalent score.
 *
 * | FICO    | Points |
 * |---------|--------|
 * | >= 740  | 7      |
 * | 700-739 | 5      |
 * | 660-699 | 3      |
 * | < 660   | 0      |
 *
 * @param score - FICO score (300-850)
 * @returns 0-7 integer
 */
function scoreCreditHealth(score: number): number {
  const s = clamp(score, 300, 850);
  if (s >= 740) return 7;
  if (s >= 700) return 5;
  if (s >= 660) return 3;
  return 0;
}

/**
 * Computes the Financial Reality pillar (max 35 points).
 */
function computeFinancial(inputs: AssessmentInputs): FinancialBreakdown {
  const debtToIncome = scoreDTI(inputs.debtToIncomeRatio);
  const downPayment = scoreDownPayment(inputs.downPaymentPercent);
  const emergencyFund = scoreEmergencyFund(inputs.emergencyFundMonths);
  const creditHealth = scoreCreditHealth(inputs.creditScore);

  return {
    debtToIncome,
    downPayment,
    emergencyFund,
    creditHealth,
    total: debtToIncome + downPayment + emergencyFund + creditHealth,
  };
}

// ---------------------------------------------------------------------------
// Emotional Truth (max 35)
// ---------------------------------------------------------------------------

/**
 * Maps a 1-10 slider value to a 0-maxPoints score via linear interpolation.
 *
 * Formula: floor((clamp(slider, 1, 10) - 1) / 9 * maxPoints)
 * Except slider = 10 always yields maxPoints exactly.
 *
 * @param slider - raw slider value (1-10)
 * @param maxPoints - maximum possible points for this factor
 * @returns 0 to maxPoints integer
 */
function sliderToPoints(slider: number, maxPoints: number): number {
  const s = clamp(slider, 1, 10);
  if (s === 10) return maxPoints;
  return Math.floor(((s - 1) / 9) * maxPoints);
}

/**
 * INVERTED slider mapping for FOMO/Pressure check.
 * High FOMO (10) = 0 points. Low FOMO (1) = max points.
 *
 * Formula: sliderToPoints(11 - slider, maxPoints)
 *
 * @param slider - raw FOMO slider (1-10)
 * @param maxPoints - maximum possible points (8)
 * @returns 0 to maxPoints integer
 */
function fomoToPoints(slider: number, maxPoints: number): number {
  const s = clamp(slider, 1, 10);
  return sliderToPoints(11 - s, maxPoints);
}

/**
 * Computes the Emotional Truth pillar (max 35 points).
 *
 * When partnerAlignment is null (single buyer), the 9 partner points
 * are redistributed proportionally across the other three emotional
 * factors (lifeStability, confidenceLevel, fomoCheck) based on their
 * earned-to-max ratio.
 */
function computeEmotional(inputs: AssessmentInputs): EmotionalBreakdown {
  const isSingle = inputs.partnerAlignment === null;

  // Base scores
  const lifeStabilityRaw = sliderToPoints(inputs.lifeStability, 9);
  const confidenceRaw = sliderToPoints(inputs.confidenceLevel, 9);
  const fomoRaw = fomoToPoints(inputs.fomoLevel, 8);

  if (!isSingle) {
    const partnerRaw = sliderToPoints(inputs.partnerAlignment as number, 9);
    return {
      lifeStability: lifeStabilityRaw,
      confidenceLevel: confidenceRaw,
      partnerAlignment: partnerRaw,
      fomoCheck: fomoRaw,
      total: lifeStabilityRaw + confidenceRaw + partnerRaw + fomoRaw,
      singleRedistribution: false,
    };
  }

  // --- Single buyer redistribution ---
  // Pool = 9 (the partner alignment max)
  // Distribute proportionally by each factor's earned ratio (earned / max).
  // If all three base factors earned 0, split evenly.
  const PARTNER_MAX = 9;
  const baseMax = { life: 9, confidence: 9, fomo: 8 };
  const baseEarned = {
    life: lifeStabilityRaw,
    confidence: confidenceRaw,
    fomo: fomoRaw,
  };

  const ratioLife = baseEarned.life / baseMax.life;
  const ratioConfidence = baseEarned.confidence / baseMax.confidence;
  const ratioFomo = baseEarned.fomo / baseMax.fomo;
  const ratioSum = ratioLife + ratioConfidence + ratioFomo;

  let bonusLife: number;
  let bonusConfidence: number;
  let bonusFomo: number;

  if (ratioSum === 0) {
    // All zeroes — split evenly (3 each)
    bonusLife = 3;
    bonusConfidence = 3;
    bonusFomo = 3;
  } else {
    // Proportional distribution, rounded down, remainder to largest factor
    const rawBonusLife = (ratioLife / ratioSum) * PARTNER_MAX;
    const rawBonusConfidence = (ratioConfidence / ratioSum) * PARTNER_MAX;
    const rawBonusFomo = (ratioFomo / ratioSum) * PARTNER_MAX;

    bonusLife = Math.floor(rawBonusLife);
    bonusConfidence = Math.floor(rawBonusConfidence);
    bonusFomo = Math.floor(rawBonusFomo);

    // Distribute remainder to maintain total = PARTNER_MAX
    let remainder = PARTNER_MAX - (bonusLife + bonusConfidence + bonusFomo);
    const fractionals = [
      { key: 'life' as const, frac: rawBonusLife - bonusLife },
      { key: 'confidence' as const, frac: rawBonusConfidence - bonusConfidence },
      { key: 'fomo' as const, frac: rawBonusFomo - bonusFomo },
    ].sort((a, b) => b.frac - a.frac);

    for (const item of fractionals) {
      if (remainder <= 0) break;
      if (item.key === 'life') bonusLife++;
      else if (item.key === 'confidence') bonusConfidence++;
      else bonusFomo++;
      remainder--;
    }
  }

  const finalLife = lifeStabilityRaw + bonusLife;
  const finalConfidence = confidenceRaw + bonusConfidence;
  const finalFomo = fomoRaw + bonusFomo;

  return {
    lifeStability: finalLife,
    confidenceLevel: finalConfidence,
    partnerAlignment: 0,
    fomoCheck: finalFomo,
    total: finalLife + finalConfidence + finalFomo,
    singleRedistribution: true,
  };
}

// ---------------------------------------------------------------------------
// Perfect Timing (max 30)
// ---------------------------------------------------------------------------

/**
 * Scores time horizon (months until planned purchase).
 *
 * | Months | Points |
 * |--------|--------|
 * | > 12   | 10     |
 * | 6-12   | 7      |
 * | 3-6    | 4      |
 * | < 3    | 2      |
 *
 * @param months - non-negative number
 * @returns 2-10 integer
 */
function scoreTimeHorizon(months: number): number {
  const m = clamp(months, 0, 600);
  if (m > 12) return 10;
  if (m >= 6) return 7;
  if (m >= 3) return 4;
  return 2;
}

/**
 * Scores monthly savings rate.
 *
 * | Savings Rate | Points |
 * |--------------|--------|
 * | >= 20%       | 10     |
 * | 10% - 20%    | 7      |
 * | 5% - 10%     | 4      |
 * | < 5%         | 1      |
 *
 * @param rate - ratio (0-1)
 * @returns 1-10 integer
 */
function scoreSavingsRate(rate: number): number {
  const pct = clamp(rate, 0, 1) * 100;
  if (pct >= 20) return 10;
  if (pct >= 10) return 7;
  if (pct >= 5) return 4;
  return 1;
}

/**
 * Scores down-payment progress toward goal.
 *
 * | Progress | Points |
 * |----------|--------|
 * | >= 80%   | 10     |
 * | 50-80%   | 7      |
 * | 25-50%   | 4      |
 * | < 25%    | 1      |
 *
 * @param progress - ratio (0-1)
 * @returns 1-10 integer
 */
function scoreDownPaymentProgress(progress: number): number {
  const pct = clamp(progress, 0, 1) * 100;
  if (pct >= 80) return 10;
  if (pct >= 50) return 7;
  if (pct >= 25) return 4;
  return 1;
}

/**
 * Computes the Perfect Timing pillar (max 30 points).
 */
function computeTiming(inputs: AssessmentInputs): TimingBreakdown {
  const timeHorizon = scoreTimeHorizon(inputs.timeHorizonMonths);
  const savingsRate = scoreSavingsRate(inputs.savingsRate);
  const downPaymentProgress = scoreDownPaymentProgress(inputs.downPaymentProgress);

  return {
    timeHorizon,
    savingsRate,
    downPaymentProgress,
    total: timeHorizon + savingsRate + downPaymentProgress,
  };
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

/**
 * Derives the verdict tier from a 0-100 score.
 * Boundary values are included in the higher tier (e.g. 80 = READY).
 */
function deriveVerdict(score: number): Verdict {
  if (score >= THRESHOLD_READY) return 'READY';
  if (score >= THRESHOLD_ALMOST) return 'ALMOST_THERE';
  if (score >= THRESHOLD_BUILD) return 'BUILD_FIRST';
  return 'NOT_YET';
}

// ---------------------------------------------------------------------------
// Warnings
// ---------------------------------------------------------------------------

/**
 * Detects edge cases and produces warning flags.
 */
function detectWarnings(inputs: AssessmentInputs): ScoringWarning[] {
  const warnings: ScoringWarning[] = [];

  // All emotional sliders at max suggests the user may not be self-reflecting honestly.
  const allMaxed =
    inputs.lifeStability === 10 &&
    inputs.confidenceLevel === 10 &&
    (inputs.partnerAlignment === null || inputs.partnerAlignment === 10) &&
    inputs.fomoLevel === 1; // FOMO inverted: 1 = lowest pressure = best score

  if (allMaxed) {
    warnings.push({
      code: 'FOMO_WARNING',
      message:
        'All emotional indicators are at their optimal values. ' +
        'Take a moment to honestly reassess — buying a home is one of the biggest ' +
        'decisions you will make, and honesty here protects you.',
    });
  }

  // Very high FOMO combined with short timeline
  if (inputs.fomoLevel >= 8 && inputs.timeHorizonMonths < 3) {
    warnings.push({
      code: 'PRESSURE_RUSH',
      message:
        'High external pressure combined with a very short timeline. ' +
        'Consider whether you are being rushed into a decision.',
    });
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Computes the canonical HōMI-Score from raw assessment inputs.
 *
 * This is the single source of truth for how the HōMI-Score is calculated.
 * The function is pure and deterministic — same inputs always produce
 * the same output.
 *
 * @param inputs - Raw assessment data from the user.
 * @returns Full result including score, verdict, breakdowns, and warnings.
 *
 * @example
 * ```ts
 * const result = computeScore({
 *   debtToIncomeRatio: 0.25,
 *   downPaymentPercent: 0.20,
 *   emergencyFundMonths: 6,
 *   creditScore: 750,
 *   lifeStability: 8,
 *   confidenceLevel: 7,
 *   partnerAlignment: 9,
 *   fomoLevel: 3,
 *   timeHorizonMonths: 18,
 *   savingsRate: 0.22,
 *   downPaymentProgress: 0.85,
 * });
 * // result.score => 92.0
 * // result.verdict => 'READY'
 * ```
 */
export function computeScore(inputs: AssessmentInputs): AssessmentResult {
  const financial = computeFinancial(inputs);
  const emotional = computeEmotional(inputs);
  const timing = computeTiming(inputs);

  // Overall = sum of pillar totals (each already on its own max scale).
  // Financial max 35, Emotional max 35, Timing max 30 => total max 100.
  const rawScore = financial.total + emotional.total + timing.total;

  // Clamp to [0, 100] for safety, round to 1 decimal.
  const score = Math.round(clamp(rawScore, 0, 100) * 10) / 10;

  const verdict = deriveVerdict(score);
  const warnings = detectWarnings(inputs);

  return {
    score,
    verdict,
    financial,
    emotional,
    timing,
    warnings,
  };
}
