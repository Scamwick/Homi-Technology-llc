import {
  DecisionType,
  AssessmentStatus,
  VerdictType,
  DimensionType,
  SubScoreBreakdown,
  AssessmentInsights,
  AssessmentResponse,
  Question,
  TransformationPath
} from './database'

export type { AssessmentResponse, Question, TransformationPath }

export interface Assessment {
  id: string
  user_id: string
  decision_type: DecisionType
  status: AssessmentStatus
  financial_score: number | null
  emotional_score: number | null
  timing_score: number | null
  overall_score: number | null
  verdict: VerdictType | null
  financial_sub_scores: SubScoreBreakdown | null
  emotional_sub_scores: SubScoreBreakdown | null
  timing_sub_scores: SubScoreBreakdown | null
  insights: AssessmentInsights | null
  completed_at: string | null
  expires_at: string
  created_at: string
}

export interface AssessmentProgress {
  assessmentId: string
  currentQuestionIndex: number
  totalQuestions: number
  responses: Record<string, AssessmentResponse>
  isComplete: boolean
}

export interface DimensionProgress {
  dimension: DimensionType
  answered: number
  total: number
  score: number | null
}
