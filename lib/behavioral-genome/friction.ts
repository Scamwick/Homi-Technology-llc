/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Behavioral Genome — Friction Adjustment Engine
 *
 * Maps genome profiles to UX friction adjustments. These adjustments
 * change HOW information is presented, never WHAT the verdict is.
 *
 * CRITICAL CONSTRAINT: The genome modifies UX FRICTION only.
 * It NEVER modifies verdict logic. Verdicts are deterministic based on inputs.
 *
 * Friction types:
 *   - confirmation:  Extra confirmation steps before actions
 *   - emphasis:      Highlight or de-emphasize certain UI sections
 *   - framing:       Change narrative framing (story-first vs data-first)
 *   - pacing:        Slow down or speed up information reveal
 *   - anchoring:     Which data point to show first
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import type { GenomeProfile } from './inference';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FrictionType =
  | 'confirmation'
  | 'emphasis'
  | 'framing'
  | 'pacing'
  | 'anchoring';

export interface FrictionAdjustment {
  /** Unique identifier for this adjustment */
  id: string;
  /** Category of UX friction being modified */
  type: FrictionType;
  /** Human-readable description of the adjustment */
  description: string;
  /** Which genome dimension triggered this */
  triggeredBy: string;
  /** Strength of the adjustment, 0-1.0 */
  intensity: number;
  /** UX target: what part of the interface is affected */
  target: string;
}

// ---------------------------------------------------------------------------
// Threshold constants
// ---------------------------------------------------------------------------

/** Score above which a dimension is considered "high" */
const HIGH_THRESHOLD = 70;

/** Score below which a dimension is considered "low" */
const LOW_THRESHOLD = 35;

/** Minimum confidence to act on a dimension score */
const MIN_CONFIDENCE = 0.4;

// ---------------------------------------------------------------------------
// Friction rules
// ---------------------------------------------------------------------------

/**
 * getFrictionAdjustments — Convert a genome profile into UX friction rules.
 *
 * Each rule maps a genome dimension score range to a specific presentation
 * change. No rule ever modifies the verdict calculation itself.
 */
export function getFrictionAdjustments(
  genome: GenomeProfile,
): FrictionAdjustment[] {
  const adjustments: FrictionAdjustment[] = [];

  // ── Loss Aversion ──────────────────────────────────────────────────────
  const la = genome.loss_aversion;
  if (la.confidence >= MIN_CONFIDENCE && la.score >= HIGH_THRESHOLD) {
    adjustments.push({
      id: 'la-confirm',
      type: 'confirmation',
      description:
        'Add confirmation step before showing worst-case scenarios',
      triggeredBy: 'loss_aversion',
      intensity: (la.score - HIGH_THRESHOLD) / 30,
      target: 'monte_carlo_results',
    });
    adjustments.push({
      id: 'la-emphasis',
      type: 'emphasis',
      description:
        'Lead with upside potential before showing downside risk',
      triggeredBy: 'loss_aversion',
      intensity: (la.score - HIGH_THRESHOLD) / 30,
      target: 'scenario_ordering',
    });
  }

  // ── Time Perception ────────────────────────────────────────────────────
  const tp = genome.time_perception;
  if (tp.confidence >= MIN_CONFIDENCE && tp.score <= LOW_THRESHOLD) {
    // Present-biased: slow down future projections
    adjustments.push({
      id: 'tp-pacing',
      type: 'pacing',
      description:
        'Add progressive disclosure to long-term projections',
      triggeredBy: 'time_perception',
      intensity: (LOW_THRESHOLD - tp.score) / 35,
      target: 'projection_timeline',
    });
  }
  if (tp.confidence >= MIN_CONFIDENCE && tp.score >= HIGH_THRESHOLD) {
    // Future-oriented: can show longer timelines upfront
    adjustments.push({
      id: 'tp-anchor',
      type: 'anchoring',
      description: 'Anchor on 10-year projection by default',
      triggeredBy: 'time_perception',
      intensity: (tp.score - HIGH_THRESHOLD) / 30,
      target: 'default_time_horizon',
    });
  }

  // ── Confidence Calibration ─────────────────────────────────────────────
  const cc = genome.confidence_calibration;
  if (cc.confidence >= MIN_CONFIDENCE && cc.score >= HIGH_THRESHOLD) {
    // Large gap between self-assessment and reality
    adjustments.push({
      id: 'cc-emphasis',
      type: 'emphasis',
      description:
        'Highlight gap between estimated and actual scores with gentle framing',
      triggeredBy: 'confidence_calibration',
      intensity: (cc.score - HIGH_THRESHOLD) / 30,
      target: 'score_comparison',
    });
  }

  // ── Volatility Tolerance ───────────────────────────────────────────────
  const vt = genome.volatility_tolerance;
  if (vt.confidence >= MIN_CONFIDENCE && vt.score <= LOW_THRESHOLD) {
    // Low tolerance: soften the Monte Carlo spread
    adjustments.push({
      id: 'vt-framing',
      type: 'framing',
      description:
        'Frame Monte Carlo results as confidence ranges rather than raw spread',
      triggeredBy: 'volatility_tolerance',
      intensity: (LOW_THRESHOLD - vt.score) / 35,
      target: 'monte_carlo_visualization',
    });
    adjustments.push({
      id: 'vt-confirm',
      type: 'confirmation',
      description:
        'Add "Are you ready to see the full range?" before worst-case',
      triggeredBy: 'volatility_tolerance',
      intensity: (LOW_THRESHOLD - vt.score) / 35,
      target: 'worst_case_reveal',
    });
  }

  // ── Regret Asymmetry ───────────────────────────────────────────────────
  const ra = genome.regret_asymmetry;
  if (ra.confidence >= MIN_CONFIDENCE && ra.score >= HIGH_THRESHOLD) {
    // High action-regret fear: add cooling-off prompts
    adjustments.push({
      id: 'ra-pacing',
      type: 'pacing',
      description:
        'Add cooling-off period before major action recommendations',
      triggeredBy: 'regret_asymmetry',
      intensity: (ra.score - HIGH_THRESHOLD) / 30,
      target: 'action_recommendations',
    });
  }

  // ── Social Proof Sensitivity ───────────────────────────────────────────
  const sp = genome.social_proof_sensitivity;
  if (sp.confidence >= MIN_CONFIDENCE && sp.score >= HIGH_THRESHOLD) {
    adjustments.push({
      id: 'sp-emphasis',
      type: 'emphasis',
      description: 'Show peer comparison percentiles prominently',
      triggeredBy: 'social_proof_sensitivity',
      intensity: (sp.score - HIGH_THRESHOLD) / 30,
      target: 'peer_comparisons',
    });
  }
  if (sp.confidence >= MIN_CONFIDENCE && sp.score <= LOW_THRESHOLD) {
    adjustments.push({
      id: 'sp-emphasis-low',
      type: 'emphasis',
      description: 'De-emphasize peer comparisons, focus on personal metrics',
      triggeredBy: 'social_proof_sensitivity',
      intensity: (LOW_THRESHOLD - sp.score) / 35,
      target: 'peer_comparisons',
    });
  }

  // ── Narrative Bias ─────────────────────────────────────────────────────
  const nb = genome.narrative_bias;
  if (nb.confidence >= MIN_CONFIDENCE && nb.score >= HIGH_THRESHOLD) {
    // Story-driven: lead with Trinity Engine narratives
    adjustments.push({
      id: 'nb-framing',
      type: 'framing',
      description:
        'Lead with Trinity Engine narrative before showing raw numbers',
      triggeredBy: 'narrative_bias',
      intensity: (nb.score - HIGH_THRESHOLD) / 30,
      target: 'results_layout',
    });
  }
  if (nb.confidence >= MIN_CONFIDENCE && nb.score <= LOW_THRESHOLD) {
    // Data-driven: lead with raw numbers
    adjustments.push({
      id: 'nb-framing-data',
      type: 'framing',
      description:
        'Lead with data tables and numbers before narrative context',
      triggeredBy: 'narrative_bias',
      intensity: (LOW_THRESHOLD - nb.score) / 35,
      target: 'results_layout',
    });
  }

  // ── Agency Attribution ─────────────────────────────────────────────────
  const aa = genome.agency_attribution;
  if (aa.confidence >= MIN_CONFIDENCE && aa.score >= HIGH_THRESHOLD) {
    // Internal locus: emphasize personal action items
    adjustments.push({
      id: 'aa-framing',
      type: 'framing',
      description:
        'Frame recommendations as actions the user can take',
      triggeredBy: 'agency_attribution',
      intensity: (aa.score - HIGH_THRESHOLD) / 30,
      target: 'recommendation_framing',
    });
  }
  if (aa.confidence >= MIN_CONFIDENCE && aa.score <= LOW_THRESHOLD) {
    // External locus: frame as market conditions and timing
    adjustments.push({
      id: 'aa-framing-ext',
      type: 'framing',
      description:
        'Frame recommendations in terms of market conditions and timing',
      triggeredBy: 'agency_attribution',
      intensity: (LOW_THRESHOLD - aa.score) / 35,
      target: 'recommendation_framing',
    });
  }

  // ── Outcome Bias ───────────────────────────────────────────────────────
  const ob = genome.outcome_bias;
  if (ob.confidence >= MIN_CONFIDENCE && ob.score >= HIGH_THRESHOLD) {
    // Outcome-focused: they skip to final score
    adjustments.push({
      id: 'ob-anchoring',
      type: 'anchoring',
      description:
        'Show dimension breakdown before final score to encourage process thinking',
      triggeredBy: 'outcome_bias',
      intensity: (ob.score - HIGH_THRESHOLD) / 30,
      target: 'score_reveal_order',
    });
  }

  // Clamp all intensities to [0, 1]
  for (const adj of adjustments) {
    adj.intensity = Math.max(0, Math.min(1, adj.intensity));
  }

  return adjustments;
}
