// ── Enums ──
export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'family'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type DecisionType = 'home_buying' | 'career_change' | 'investment' | 'business_launch' | 'major_purchase'
export type AssessmentStatus = 'in_progress' | 'completed' | 'expired'
export type VerdictType = 'ready' | 'not_yet'
export type DimensionType = 'financial' | 'emotional' | 'timing'
export type MessageRole = 'user' | 'assistant' | 'system'
export type CoupleStatus = 'pending' | 'active' | 'dissolved'
export type PartnerStatus = 'pending' | 'active' | 'suspended'
export type NotificationType = 'assessment_complete' | 'verdict_ready' | 'transformation_milestone' | 'couple_invite' | 'reassess_reminder' | 'system'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type QuestionType = 'slider' | 'single_choice' | 'multi_choice' | 'text' | 'number'
export type JointVerdictType = 'both_ready' | 'one_not_yet' | 'both_not_yet'
export type UserRole = 'user' | 'admin'

// Database table row types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          subscription_tier: SubscriptionTier
          subscription_status: SubscriptionStatus
          stripe_customer_id: string | null
          partner_id: string | null
          onboarding_completed: boolean
          role: UserRole
          notification_preferences: Record<string, boolean>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      assessments: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>
      }
      assessment_responses: {
        Row: {
          id: string
          assessment_id: string
          question_id: string
          dimension: DimensionType
          response_value: ResponseValue
          response_metadata: ResponseMetadata
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['assessment_responses']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['assessment_responses']['Insert']>
      }
      transformation_paths: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['transformation_paths']['Row'], 'id' | 'started_at'>
        Update: Partial<Database['public']['Tables']['transformation_paths']['Insert']>
      }
      advisor_conversations: {
        Row: {
          id: string
          user_id: string
          assessment_id: string | null
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['advisor_conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['advisor_conversations']['Insert']>
      }
      advisor_messages: {
        Row: {
          id: string
          conversation_id: string
          role: MessageRole
          content: string
          metadata: MessageMetadata | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['advisor_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['advisor_messages']['Insert']>
      }
      couples: {
        Row: {
          id: string
          partner_a_id: string
          partner_b_id: string | null
          invite_email: string
          invite_token: string
          status: CoupleStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['couples']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['couples']['Insert']>
      }
      couple_assessments: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['couple_assessments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['couple_assessments']['Insert']>
      }
      partners: {
        Row: {
          id: string
          company_name: string
          contact_email: string
          api_key: string
          api_key_hash: string
          branding: PartnerBranding
          pricing_per_assessment: number
          status: PartnerStatus
          webhook_url: string | null
          webhook_events: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['partners']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['partners']['Insert']>
      }
      partner_clients: {
        Row: {
          id: string
          partner_id: string
          user_id: string
          external_client_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['partner_clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['partner_clients']['Insert']>
      }
      payments: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string
          stripe_subscription_id: string | null
          amount: number
          currency: string
          status: PaymentStatus
          description: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          body: string
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      admin_audit_log: {
        Row: {
          id: string
          admin_user_id: string
          action: string
          target_type: string
          target_id: string
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_audit_log']['Row'], 'id' | 'created_at'>
        Update: never
      }
      question_bank: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['question_bank']['Row'], never>
        Update: Partial<Database['public']['Tables']['question_bank']['Insert']>
      }
    }
  }
}

// Export convenience types
export type Question = Database['public']['Tables']['question_bank']['Row']
export type TransformationPath = Database['public']['Tables']['transformation_paths']['Row']

// Supporting types
export interface SubScoreBreakdown {
  categories: CategoryScore[]
  strengths: string[]
  weaknesses: string[]
  red_flags: string[]
}

export interface AssessmentInsights {
  executive_summary: string
  financial_insight: string
  emotional_insight: string
  timing_insight: string
  recommendations: string[]
  transformation_priority: DimensionType | null
}

export type ResponseValue = number | string | string[]

export interface ResponseMetadata {
  time_spent_ms: number
  changes_made: number
}

export interface ActionItem {
  id: string
  title: string
  description: string
  dimension: DimensionType
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_duration: string
  resources: { title: string; url: string }[]
  completed: boolean
  completed_at: string | null
  order: number
}

export interface Milestone {
  id: string
  title: string
  description: string
  target_dimension: DimensionType
  target_score: number
  achieved: boolean
  achieved_at: string | null
  celebration_message: string
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

export interface PartnerBranding {
  logo_url: string
  primary_color: string
  company_name: string
  welcome_message: string
}

export interface MessageMetadata {
  model: string
  tokens_used: number
  latency_ms: number
}

export interface CategoryScore {
  name: string
  score: number
  weight: number
  questions: QuestionScore[]
}

export interface QuestionScore {
  question_id: string
  raw_value: ResponseValue
  score: number
  weight: number
}

export interface QuestionOption {
  value: string
  label: string
  score: number
}

export interface ScoringFunction {
  type: 'direct' | 'scaled' | 'inverted' | 'lookup' | 'threshold' | 'multi_select'
  params: Record<string, unknown>
}
