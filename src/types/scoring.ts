import { DimensionType, ResponseValue, CategoryScore, Question, AssessmentResponse, AssessmentInsights, QuestionScore, VerdictType } from './database'

// Re-export for convenience
export type { DimensionType }
export type { Question }
export type { AssessmentResponse }
export type { CategoryScore }
export type { AssessmentInsights }
export type { QuestionScore }
export type { VerdictType }

export interface ScoringResult {
  financial: DimensionScore
  emotional: DimensionScore
  timing: DimensionScore
  overall: number
  verdict: VerdictType
  insights: AssessmentInsights
  metadata: ScoringMetadata
}

export interface DimensionScore {
  dimension: DimensionType
  score: number
  categories: CategoryScore[]
  strengths: string[]
  weaknesses: string[]
  red_flags: string[]
}

export interface ScoringMetadata {
  scoring_version: string
  scored_at: string
  questions_answered: number
  questions_total: number
  consistency_bonus: number
  red_flag_penalties: number
}

// Verdict thresholds — IMMUTABLE
export const VERDICT_THRESHOLDS = {
  // Canonical 4-tier
  READY: 80,
  ALMOST_THERE: 65,
  BUILD_FIRST: 50,
  NOT_YET: 0,
  
  // Dimension weights
  DIMENSION_WEIGHTS: {
    financial: 0.35,
    emotional: 0.35,
    timing: 0.30,
  },
  
  // Bonuses and penalties
  CONSISTENCY_BONUS: 3,        // +3 if all dimensions within 10 points
  RED_FLAG_PENALTY: 5,         // -5 per red flag
  RED_FLAG_PENALTY_CAP: 15,    // max -15
  
  // Minimum completion for valid scoring
  MIN_COMPLETION_PERCENT: 80,
  
  // Dimension threshold for READY
  DIMENSION_READY_THRESHOLD: 70,
} as const

// Dimension colors for UI
export const DIMENSION_COLORS: Record<DimensionType, string> = {
  financial: '#22d3ee',  // cyan
  emotional: '#34d399',  // emerald
  timing: '#facc15',     // yellow
}

// Dimension labels
export const DIMENSION_LABELS: Record<DimensionType, string> = {
  financial: 'Financial Reality',
  emotional: 'Emotional Truth',
  timing: 'Perfect Timing',
}

// Dimension weights for display
export const DIMENSION_WEIGHTS: Record<DimensionType, number> = {
  financial: 35,
  emotional: 35,
  timing: 30,
}
