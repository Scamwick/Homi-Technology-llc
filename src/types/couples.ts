import { CoupleStatus, JointVerdictType } from './database'
import { DimensionType } from './scoring'

export interface Couple {
  id: string
  partner_a_id: string
  partner_b_id: string | null
  invite_email: string
  invite_token: string
  status: CoupleStatus
  created_at: string
}

export interface CoupleAssessment {
  id: string
  couple_id: string
  partner_a_assessment_id: string
  partner_b_assessment_id: string | null
  combined_score: number | null
  alignment_data: AlignmentData | null
  joint_verdict: JointVerdictType | null
  discussion_prompts: string[] | null
  created_at: string
}

export interface AlignmentData {
  financial: DimensionAlignment
  emotional: DimensionAlignment
  timing: DimensionAlignment
}

export interface DimensionAlignment {
  score_a: number
  score_b: number
  gap: number
  alignment_level: 'strong' | 'moderate' | 'divergent'
}

export interface CoupleInvite {
  email: string
  message?: string
}

export interface CoupleComparison {
  couple_id: string
  partner_a: {
    id: string
    full_name: string
    avatar_url: string | null
    scores: {
      financial: number
      emotional: number
      timing: number
      overall: number
    }
  }
  partner_b: {
    id: string
    full_name: string
    avatar_url: string | null
    scores: {
      financial: number
      emotional: number
      timing: number
      overall: number
    }
  } | null
  alignment: AlignmentData | null
  joint_verdict: JointVerdictType | null
  discussion_prompts: string[]
}

export const ALIGNMENT_LABELS: Record<string, string> = {
  strong: 'Strongly Aligned',
  moderate: 'Moderately Aligned',
  divergent: 'Divergent Views',
}

export const JOINT_VERDICT_LABELS: Record<JointVerdictType, string> = {
  both_ready: 'Both Ready',
  one_not_yet: 'One Not Yet Ready',
  both_not_yet: 'Both Not Yet Ready',
}
