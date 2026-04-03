/**
 * HōMI Scoring Module — Barrel Export
 * ====================================
 *
 * Public API surface for the scoring engine. Import from '@/lib/scoring'
 * to access the canonical scoring algorithm, Monte Carlo stress testing,
 * and utility functions.
 *
 * @example
 * ```ts
 * import {
 *   computeScore,
 *   runMonteCarlo,
 *   getVerdictColor,
 *   formatScore,
 * } from '@/lib/scoring';
 * ```
 */

// --- Canonical scoring engine ---
export {
  computeScore,
  type AssessmentInputs,
  type AssessmentResult,
  type FinancialBreakdown,
  type EmotionalBreakdown,
  type TimingBreakdown,
  type ScoringWarning,
  type Verdict,
} from './engine';

// --- Monte Carlo stress test ---
export {
  runMonteCarlo,
  type FinancialInputs,
  type MonteCarloConfig,
  type MonteCarloResult,
  type Percentiles,
} from './monte-carlo';

// --- Utility functions ---
export {
  clamp,
  getVerdictColor,
  getVerdictIcon,
  getVerdictLabel,
  scoreToHSL,
  formatScore,
  getScoreGrade,
} from './utils';
