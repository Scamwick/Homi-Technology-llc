// =============================================================================
// types/assessment.ts — Core HōMI Assessment Domain Types
// =============================================================================
// The assessment is the heart of HōMI. A user answers questions across three
// dimensions (financial, emotional, timing), the scoring engine produces a
// 0-100 HōMI-Score, and a Monte Carlo simulation stress-tests the result.
// =============================================================================

// ---------------------------------------------------------------------------
// Enums & Literal Unions
// ---------------------------------------------------------------------------

/** Final verdict rendered after scoring all three dimensions. */
export type Verdict = 'READY' | 'ALMOST_THERE' | 'BUILD_FIRST' | 'NOT_YET';

/** The three scoring dimensions that compose the HōMI-Score. */
export type Dimension = 'financial' | 'emotional' | 'timing';

/**
 * How confident we are in the score given the quality/completeness of inputs.
 * - verified: financial data confirmed via Plaid + credit bureaus
 * - high:     all inputs provided, data is self-consistent
 * - medium:   some optional fields missing or minor inconsistencies
 * - low:      key inputs missing or contradictory signals detected
 */
export type ConfidenceBand = 'verified' | 'high' | 'medium' | 'low';

/**
 * Where the financial data originated.
 * - plaid:          Real-time bank data via Plaid
 * - self_reported:  User-entered via assessment questionnaire
 * - hybrid:         Plaid for financial, self-reported for emotional/timing
 * - credit_bureau:  TransUnion, Experian, or other bureau
 */
export type DataSource = 'plaid' | 'self_reported' | 'hybrid' | 'credit_bureau';

// ---------------------------------------------------------------------------
// Input Types — what the user provides
// ---------------------------------------------------------------------------

export interface FinancialInputs {
  /** Gross annual household income in USD. */
  annualIncome: number;

  /** Total monthly debt obligations (student loans, car, credit cards, etc.). */
  monthlyDebt: number;

  /** Amount currently saved toward a down payment in USD. */
  downPaymentSaved: number;

  /** Target purchase price of the home in USD. */
  targetHomePrice: number;

  /** Number of months of expenses covered by emergency fund. */
  emergencyFundMonths: number;

  /** FICO or equivalent credit score (300-850). */
  creditScore: number;
}

export interface EmotionalInputs {
  /** Self-reported life stability (1 = chaotic, 10 = very stable). */
  lifeStability: number;

  /** Confidence in the decision to buy (1 = terrified, 10 = certain). */
  confidenceLevel: number;

  /**
   * How aligned the user's partner is on the decision.
   * null when the user is single / buying solo.
   */
  partnerAlignment: number | null;

  /**
   * Fear-of-missing-out pressure (1 = none, 10 = extreme).
   * Inverted during scoring — high FOMO penalizes readiness.
   */
  fomoLevel: number;
}

export interface TimingInputs {
  /** How many months until the user wants/needs to buy. */
  timeHorizonMonths: number;

  /** Percentage of monthly income going to savings (0-100). */
  monthlySavingsRate: number;

  /** How close the user is to their down payment goal (0-100%). */
  downPaymentProgress: number;
}

/** Complete set of inputs for a single assessment run. */
export interface AssessmentInputs {
  financial: FinancialInputs;
  emotional: EmotionalInputs;
  timing: TimingInputs;
}

// ---------------------------------------------------------------------------
// Scoring Output Types
// ---------------------------------------------------------------------------

/** Breakdown of how a single metric contributed to the dimension score. */
export interface MetricBreakdown {
  /** Raw value the user provided or we derived. */
  value: number;

  /** Maximum points this metric can contribute. */
  maxPoints: number;

  /** Actual points earned after applying the scoring curve. */
  points: number;
}

/** Score for one of the three dimensions. */
export interface DimensionScore {
  /** Raw dimension score before weighting (0-100). */
  score: number;

  /** Maximum contribution this dimension can make to the overall score (e.g. 35 or 30). */
  maxContribution: number;

  /** Weighted contribution to the overall HōMI-Score. */
  contribution: number;

  /** Per-metric breakdown keyed by metric name (e.g. "dti", "creditScore"). */
  breakdown: Record<string, MetricBreakdown>;
}

/** Output of the Monte Carlo homeownership simulation. */
export interface MonteCarloResult {
  /** Probability of successfully sustaining homeownership (0-1). */
  successRate: number;

  /** Number of simulation scenarios executed. */
  scenariosRun: number;

  /** 10th percentile outcome — pessimistic scenario net worth delta. */
  p10: number;

  /** 50th percentile outcome — median scenario. */
  p50: number;

  /** 90th percentile outcome — optimistic scenario. */
  p90: number;

  /**
   * Percentage of scenarios where the user survives a market crash
   * without being forced to sell (0-1).
   */
  crashSurvivalRate: number;

  /**
   * Whether a hard gate was applied (e.g., DTI > 50% forces
   * verdict to BUILD_FIRST regardless of overall score).
   */
  gateApplied: boolean;
}

// ---------------------------------------------------------------------------
// Assessment Result — the full scored output
// ---------------------------------------------------------------------------

/** Complete result of a single HōMI assessment. */
export interface AssessmentResult {
  /** Unique assessment identifier (UUID). */
  id: string;

  /** User who owns this assessment. */
  userId: string;

  /** The HōMI-Score: composite 0-100 readiness score. */
  overall: number;

  /** Financial dimension scoring details. */
  financial: DimensionScore;

  /** Emotional dimension scoring details. */
  emotional: DimensionScore;

  /** Timing dimension scoring details. */
  timing: DimensionScore;

  /** Human-readable verdict derived from the overall score and gates. */
  verdict: Verdict;

  /** Confidence in the assessment given input quality. */
  confidenceBand: ConfidenceBand;

  /** Monte Carlo simulation results. */
  monteCarlo: MonteCarloResult;

  /** Whether the Safety Canon detected a crisis signal during this assessment. */
  crisisDetected: boolean;

  /** Where the financial data came from. */
  dataSource: DataSource;

  /** ISO 8601 timestamp of when the assessment was created. */
  createdAt: string;

  /** Scoring methodology version (semver). Used for historical comparisons. */
  version: string;
}

// ---------------------------------------------------------------------------
// Assessment History & Comparison
// ---------------------------------------------------------------------------

/** Lightweight summary for listing assessments without full breakdown. */
export interface AssessmentSummary {
  id: string;
  overall: number;
  verdict: Verdict;
  confidenceBand: ConfidenceBand;
  crisisDetected: boolean;
  createdAt: string;
}

/** Delta between two assessments for tracking progress over time. */
export interface AssessmentDelta {
  previousId: string;
  currentId: string;
  overallDelta: number;
  financialDelta: number;
  emotionalDelta: number;
  timingDelta: number;
  verdictChanged: boolean;
  previousVerdict: Verdict;
  currentVerdict: Verdict;
}
