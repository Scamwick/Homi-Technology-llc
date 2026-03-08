export type GenomeDimension =
  | "loss_aversion"
  | "time_perception"
  | "confidence_calibration"
  | "volatility_tolerance"
  | "regret_asymmetry"
  | "social_proof_sensitivity"
  | "narrative_bias"
  | "agency_attribution"
  | "outcome_bias"

export type GenomeConfidence = "low" | "medium" | "high"

export interface GenomeScore {
  dimension: GenomeDimension
  score: number
  confidence: GenomeConfidence
  last_updated: string
}

export type BehavioralEventType =
  | "question_time_spent"
  | "input_revised"
  | "section_navigated"
  | "result_section_viewed"
  | "monte_carlo_percentile_focused"
  | "trinity_perspective_expanded"
  | "override_button_interaction"
  | "return_visit"
