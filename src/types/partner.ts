import { PartnerStatus, DecisionType, VerdictType, PartnerBranding } from './database'

export type { PartnerBranding }

export interface Partner {
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

export interface PartnerClient {
  id: string
  partner_id: string
  user_id: string
  external_client_id: string | null
  notes: string | null
  created_at: string
}

export interface WebhookPayload {
  event: 'assessment.completed' | 'verdict.ready' | 'verdict.not_yet'
  partner_id: string
  client: {
    id: string
    external_id: string | null
    email: string
  }
  assessment: {
    id: string
    decision_type: DecisionType
    financial_score: number
    emotional_score: number
    timing_score: number
    overall_score: number
    verdict: VerdictType
    completed_at: string
  }
}

export interface PartnerAnalytics {
  total_clients: number
  total_assessments: number
  assessments_this_month: number
  average_score: number
  verdict_distribution: {
    ready: number
    not_yet: number
  }
  dimension_averages: {
    financial: number
    emotional: number
    timing: number
  }
}

export interface PartnerInviteClient {
  email: string
  external_client_id?: string
  message?: string
}
