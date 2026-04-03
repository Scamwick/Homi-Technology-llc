// =============================================================================
// types/trinity.ts — Trinity Engine Types
// =============================================================================
// The Trinity Engine runs three AI perspectives on every assessment:
//   1. Advocate  — finds reasons the user IS ready
//   2. Skeptic   — finds reasons the user is NOT ready
//   3. Arbiter   — synthesizes both into a balanced recommendation
//
// This "adversarial collaboration" pattern ensures users get honest,
// multi-dimensional guidance rather than a single biased perspective.
// =============================================================================

// ---------------------------------------------------------------------------
// Perspective Roles
// ---------------------------------------------------------------------------

/** The three roles in the Trinity Engine deliberation. */
export type TrinityRole = 'advocate' | 'skeptic' | 'arbiter';

// ---------------------------------------------------------------------------
// Individual Perspective
// ---------------------------------------------------------------------------

export interface TrinityPerspective {
  /** Which role produced this perspective. */
  role: TrinityRole;

  /**
   * The narrative perspective — a human-readable paragraph explaining
   * this role's position on the user's readiness.
   */
  perspective: string;

  /** Confidence in this perspective's conclusions (0-100). */
  confidence: number;

  /** Specific supporting points for this perspective. */
  keyPoints: string[];

  /** Which dimension(s) this perspective weighted most heavily. */
  primaryDimensions: import('./assessment').Dimension[];
}

// ---------------------------------------------------------------------------
// Trinity Analysis — full deliberation result
// ---------------------------------------------------------------------------

export interface TrinityAnalysis {
  /** Unique analysis ID (UUID). */
  id: string;

  /** The assessment this analysis was run against. */
  assessmentId: string;

  /** The Advocate's perspective — reasons the user IS ready. */
  advocate: TrinityPerspective;

  /** The Skeptic's perspective — reasons the user is NOT ready. */
  skeptic: TrinityPerspective;

  /**
   * The Arbiter's synthesis — balanced recommendation considering
   * both the Advocate and Skeptic positions.
   */
  arbiter: TrinityPerspective;

  /**
   * Level of agreement between Advocate and Skeptic (0-100).
   * High consensus = clear signal. Low consensus = user situation is nuanced.
   */
  consensus: number;

  /** ISO 8601 timestamp of when the analysis was generated. */
  createdAt: string;

  /** Which AI model(s) were used for this analysis. */
  modelVersion: string;
}

// ---------------------------------------------------------------------------
// Trinity Request / Response for the API layer
// ---------------------------------------------------------------------------

export interface TrinityRequest {
  /** Assessment ID to analyze. */
  assessmentId: string;

  /** Whether to include the full assessment data in context (vs. summary only). */
  includeFullContext: boolean;
}

export interface TrinityResponse {
  analysis: TrinityAnalysis;

  /** Token usage for billing/monitoring purposes. */
  usage: {
    advocateTokens: number;
    skepticTokens: number;
    arbiterTokens: number;
    totalTokens: number;
  };
}
