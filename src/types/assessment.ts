import { 
  DecisionType, 
  AssessmentStatus, 
  VerdictType, 
  DimensionType, 
  QuestionType,
  ResponseValue,
  ResponseMetadata,
  SubScoreBreakdown,
  AssessmentInsights,
  QuestionOption,
  ScoringFunction,
  ActionItem,
  Milestone
} from './database'

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

export interface AssessmentResponse {
  id: string
  assessment_id: string
  question_id: string
  dimension: DimensionType
  response_value: ResponseValue
  response_metadata: ResponseMetadata
  created_at: string
}

export interface Question {
  id: string
  dimension: DimensionType
  category: string
  question_text: string
  question_type: QuestionType
  options: QuestionOption[] | null
  weight: number
  order_index: number
  decision_types: DecisionType[]
  active: boolean
  scoring_function: ScoringFunction
}

export interface TransformationPath {
  id: string
  user_id: string
  assessment_id: string
  status: 'active' | 'completed' | 'abandoned'
  target_dimension: DimensionType | 'all'
  action_items: ActionItem[]
  milestones: Milestone[]
  started_at: string
  completed_at: string | null
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
