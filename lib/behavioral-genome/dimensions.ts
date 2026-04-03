/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Behavioral Genome — Dimension Definitions
 *
 * The 9 psychological dimensions that H\u014dMI tracks to personalize UX friction.
 * These dimensions NEVER modify verdict logic. They only adjust how information
 * is presented (confirmation steps, framing, emphasis).
 *
 * Color groups:
 *   Cyan   (#22d3ee) — Core perception dimensions
 *   Emerald (#34d399) — Calibration & tolerance dimensions
 *   Yellow (#facc15) — Social & narrative dimensions
 *   Orange (#fb923c) — Outcome dimensions
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const GENOME_DIMENSIONS = [
  {
    id: 'loss_aversion',
    name: 'Loss Aversion',
    description: 'Sensitivity to potential losses vs gains',
    color: '#22d3ee',
    detection:
      'Time on downside scenarios, attention to worst-case percentiles',
  },
  {
    id: 'time_perception',
    name: 'Time Perception',
    description: 'Future vs present orientation',
    color: '#22d3ee',
    detection: 'Time horizon selections, patience with projections',
  },
  {
    id: 'confidence_calibration',
    name: 'Confidence Calibration',
    description: 'Gap between self-assessment and actual scores',
    color: '#34d399',
    detection: 'Self-reported vs actual score gap, revision frequency',
  },
  {
    id: 'volatility_tolerance',
    name: 'Volatility Tolerance',
    description: 'Comfort with uncertainty and variance',
    color: '#34d399',
    detection: 'Reaction to Monte Carlo spread, worst-case focus',
  },
  {
    id: 'regret_asymmetry',
    name: 'Regret Asymmetry',
    description: 'Fear of action-regret vs inaction-regret',
    color: '#34d399',
    detection: 'Time on "what if I wait" vs "what if I act now"',
  },
  {
    id: 'social_proof_sensitivity',
    name: 'Social Proof Sensitivity',
    description: "Influence by others' decisions",
    color: '#facc15',
    detection: 'Interest in peer comparisons, percentile attention',
  },
  {
    id: 'narrative_bias',
    name: 'Narrative Bias',
    description: 'Story-driven vs data-driven decision making',
    color: '#facc15',
    detection: 'Engagement with Trinity stories vs raw numbers',
  },
  {
    id: 'agency_attribution',
    name: 'Agency Attribution',
    description: 'Internal vs external locus of control',
    color: '#facc15',
    detection: 'External vs internal framing in inputs',
  },
  {
    id: 'outcome_bias',
    name: 'Outcome Bias',
    description: 'Focus on end result vs process quality',
    color: '#fb923c',
    detection: 'Attention to final score vs dimension breakdowns',
  },
] as const;

export type GenomeDimensionId = (typeof GENOME_DIMENSIONS)[number]['id'];

export type GenomeDimension = (typeof GENOME_DIMENSIONS)[number];
