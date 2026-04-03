// =============================================================================
// lib/questions/scoring.ts — Per-Question Scoring & Dimension Aggregation
// =============================================================================
// Converts raw user responses into 0-100 scores using each question's
// scoring_function definition. Also aggregates per-dimension scores using
// weight-adjusted averages.
// =============================================================================

import type {
  Question,
  ResponseValue,
  ScoringFunction,
  Dimension,
} from './bank';

// ---------------------------------------------------------------------------
// Category Score — breakdown within a dimension
// ---------------------------------------------------------------------------

export interface CategoryScore {
  /** Category name (e.g. "income", "savings", "stress"). */
  category: string;
  /** Weight-adjusted average score for this category (0-100). */
  score: number;
  /** Number of answered questions in this category. */
  answeredCount: number;
  /** Total number of questions in this category. */
  totalCount: number;
}

export interface DimensionScoreResult {
  /** The dimension being scored. */
  dimension: Dimension;
  /** Overall weight-adjusted score for this dimension (0-100). */
  score: number;
  /** Per-category breakdowns. */
  categories: CategoryScore[];
  /** Question IDs where score > 70 (areas of strength). */
  strengths: string[];
  /** Question IDs where score < 50 (areas to improve). */
  weaknesses: string[];
  /** Question IDs where score < 30 (critical blockers). */
  redFlags: string[];
  /** Total weight of answered questions / total weight of all questions. */
  completeness: number;
}

// ---------------------------------------------------------------------------
// Clamp helper
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  if (value <= min) return min;
  if (value >= max) return max;
  return value;
}

// ---------------------------------------------------------------------------
// Per-Question Scoring
// ---------------------------------------------------------------------------

/**
 * Converts a single question response into a 0-100 score using the question's
 * scoring function definition.
 *
 * Returns null if the response type does not match the scoring function
 * expectations (e.g. a string for a linear_scale question).
 */
export function scoreResponse(
  question: Question,
  value: ResponseValue
): number | null {
  const sf = question.scoring_function;

  switch (sf.type) {
    case 'linear_scale':
      return scoreLinearScale(sf, value);
    case 'inverse_scale':
      return scoreInverseScale(sf, value);
    case 'option_map':
      return scoreOptionMap(sf, value);
    case 'slider_direct':
      return scoreSliderDirect(sf, value);
    case 'threshold':
      return scoreThreshold(sf, value);
    default:
      return null;
  }
}

/**
 * Linear scale: maps a numeric value from [min..max] to [0..100].
 * Values at or above `optimal_min` score 100.
 * Values at `min` score 0.
 * Linear interpolation between min and optimal_min.
 */
function scoreLinearScale(
  sf: Extract<ScoringFunction, { type: 'linear_scale' }>,
  value: ResponseValue
): number | null {
  if (typeof value !== 'number') return null;

  const v = clamp(value, sf.min, sf.max);

  // At or above optimal, score 100
  if (v >= sf.optimal_min) return 100;

  // Below min, score 0
  if (v <= sf.min) return 0;

  // Linear interpolation from min -> optimal_min maps to 0 -> 100
  const ratio = (v - sf.min) / (sf.optimal_min - sf.min);
  return Math.round(ratio * 100);
}

/**
 * Inverse scale: higher input = lower score.
 * Values at or below `optimal_max` score 100.
 * Values at `max` score 0.
 * Linear interpolation between optimal_max and max.
 */
function scoreInverseScale(
  sf: Extract<ScoringFunction, { type: 'inverse_scale' }>,
  value: ResponseValue
): number | null {
  if (typeof value !== 'number') return null;

  const v = clamp(value, sf.min, sf.max);

  // At or below optimal, score 100
  if (v <= sf.optimal_max) return 100;

  // At max, score 0
  if (v >= sf.max) return 0;

  // Inverse linear interpolation from optimal_max -> max maps to 100 -> 0
  const ratio = (v - sf.optimal_max) / (sf.max - sf.optimal_max);
  return Math.round((1 - ratio) * 100);
}

/**
 * Option map: looks up the string value in a predefined score table.
 * Returns null if the value is not found in the map.
 */
function scoreOptionMap(
  sf: Extract<ScoringFunction, { type: 'option_map' }>,
  value: ResponseValue
): number | null {
  if (typeof value !== 'string') return null;

  const score = sf.scores[value];
  if (score === undefined) return null;

  return score;
}

/**
 * Slider direct: maps a slider value from [min..max] to [output_min..output_max].
 * Continuous linear interpolation.
 */
function scoreSliderDirect(
  sf: Extract<ScoringFunction, { type: 'slider_direct' }>,
  value: ResponseValue
): number | null {
  if (typeof value !== 'number') return null;

  const v = clamp(value, sf.min, sf.max);
  const inputRange = sf.max - sf.min;

  if (inputRange === 0) return sf.output_min;

  const ratio = (v - sf.min) / inputRange;
  return Math.round(sf.output_min + ratio * (sf.output_max - sf.output_min));
}

/**
 * Threshold: value falls into brackets. Each bracket has a max boundary
 * and a score. We find the first bracket where value <= max.
 */
function scoreThreshold(
  sf: Extract<ScoringFunction, { type: 'threshold' }>,
  value: ResponseValue
): number | null {
  if (typeof value !== 'number') return null;

  // Thresholds are sorted by max ascending
  const sorted = [...sf.thresholds].sort((a, b) => a.max - b.max);

  for (const bracket of sorted) {
    if (value <= bracket.max) {
      return bracket.score;
    }
  }

  // Value exceeds all thresholds, use the last bracket's score
  return sorted.length > 0 ? sorted[sorted.length - 1].score : 0;
}

// ---------------------------------------------------------------------------
// Dimension Aggregation
// ---------------------------------------------------------------------------

/**
 * Computes the aggregate score for a dimension given its questions
 * and the user's responses.
 *
 * Scoring uses a weight-adjusted average:
 *   score = sum(question_score * weight) / sum(weight)   [for answered questions]
 *
 * Only questions that have been answered are included in the calculation.
 * Unanswered questions reduce the `completeness` ratio but do not
 * penalize the score (they are simply not counted).
 */
export function scoreDimension(
  questions: Question[],
  responses: Map<string, ResponseValue>
): DimensionScoreResult {
  if (questions.length === 0) {
    return {
      dimension: 'financial',
      score: 0,
      categories: [],
      strengths: [],
      weaknesses: [],
      redFlags: [],
      completeness: 0,
    };
  }

  const dimension = questions[0].dimension;

  // Compute per-question scores
  const questionScores: { question: Question; score: number }[] = [];

  for (const q of questions) {
    const response = responses.get(q.id);
    if (response === undefined) continue;

    const score = scoreResponse(q, response);
    if (score === null) continue;

    questionScores.push({ question: q, score });
  }

  // Weight-adjusted average
  let weightedSum = 0;
  let totalWeight = 0;

  for (const qs of questionScores) {
    weightedSum += qs.score * qs.question.weight;
    totalWeight += qs.question.weight;
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Completeness: how much of the total weight is answered
  const allWeight = questions.reduce((sum, q) => sum + q.weight, 0);
  const completeness = allWeight > 0 ? totalWeight / allWeight : 0;

  // Per-category breakdown
  const categoryMap = new Map<
    string,
    { weightedSum: number; totalWeight: number; answered: number; total: number }
  >();

  for (const q of questions) {
    const cat = categoryMap.get(q.category) ?? {
      weightedSum: 0,
      totalWeight: 0,
      answered: 0,
      total: 0,
    };
    cat.total++;
    categoryMap.set(q.category, cat);
  }

  for (const qs of questionScores) {
    const cat = categoryMap.get(qs.question.category)!;
    cat.weightedSum += qs.score * qs.question.weight;
    cat.totalWeight += qs.question.weight;
    cat.answered++;
  }

  const categories: CategoryScore[] = [];
  for (const [name, data] of categoryMap) {
    categories.push({
      category: name,
      score: data.totalWeight > 0 ? Math.round(data.weightedSum / data.totalWeight) : 0,
      answeredCount: data.answered,
      totalCount: data.total,
    });
  }

  // Sort categories alphabetically for consistency
  categories.sort((a, b) => a.category.localeCompare(b.category));

  // Identify strengths, weaknesses, red flags
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const redFlags: string[] = [];

  for (const qs of questionScores) {
    if (qs.score > 70) {
      strengths.push(qs.question.id);
    }
    if (qs.score < 50) {
      weaknesses.push(qs.question.id);
    }
    if (qs.score < 30) {
      redFlags.push(qs.question.id);
    }
  }

  return {
    dimension,
    score: overallScore,
    categories,
    strengths,
    weaknesses,
    redFlags,
    completeness,
  };
}

// ---------------------------------------------------------------------------
// Multi-Dimension Summary
// ---------------------------------------------------------------------------

export interface AssessmentScoreSummary {
  financial: DimensionScoreResult;
  emotional: DimensionScoreResult;
  timing: DimensionScoreResult;
  /** Weighted overall score (financial 35%, emotional 35%, timing 30%). */
  overall: number;
  /** Overall completeness across all dimensions. */
  completeness: number;
}

/**
 * Computes a full assessment score summary across all three dimensions.
 * Uses the canonical weighting: financial 35%, emotional 35%, timing 30%.
 */
export function scoreAssessment(
  questions: Question[],
  responses: Map<string, ResponseValue>
): AssessmentScoreSummary {
  const financialQs = questions.filter((q) => q.dimension === 'financial');
  const emotionalQs = questions.filter((q) => q.dimension === 'emotional');
  const timingQs = questions.filter((q) => q.dimension === 'timing');

  const financial = scoreDimension(financialQs, responses);
  const emotional = scoreDimension(emotionalQs, responses);
  const timing = scoreDimension(timingQs, responses);

  // Weighted overall: 35% financial, 35% emotional, 30% timing
  const overall = Math.round(
    financial.score * 0.35 + emotional.score * 0.35 + timing.score * 0.30
  );

  // Average completeness
  const totalQuestions = questions.length;
  const answeredQuestions =
    financialQs.filter((q) => responses.has(q.id)).length +
    emotionalQs.filter((q) => responses.has(q.id)).length +
    timingQs.filter((q) => responses.has(q.id)).length;
  const completeness = totalQuestions > 0 ? answeredQuestions / totalQuestions : 0;

  return { financial, emotional, timing, overall, completeness };
}
