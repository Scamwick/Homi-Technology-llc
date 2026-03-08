import { PaymentStatus, SubscriptionTier } from './database'

export interface Payment {
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

export interface SubscriptionLimits {
  assessments_per_month: number | null  // null = unlimited
  advisor_messages_per_day: number | null
  couples_mode: boolean
  transformation_paths: boolean
  pdf_reports: boolean
}

export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    assessments_per_month: 3,
    advisor_messages_per_day: 10,
    couples_mode: false,
    transformation_paths: false,
    pdf_reports: false,
  },
  plus: {
    assessments_per_month: null,
    advisor_messages_per_day: 50,
    couples_mode: false,
    transformation_paths: false,
    pdf_reports: true,
  },
  pro: {
    assessments_per_month: null,
    advisor_messages_per_day: null,
    couples_mode: true,
    transformation_paths: true,
    pdf_reports: true,
  },
  family: {
    assessments_per_month: null,
    advisor_messages_per_day: null,
    couples_mode: true,
    transformation_paths: true,
    pdf_reports: true,
  },
}

export const TIER_PRICES: Record<SubscriptionTier, number> = {
  free: 0,
  plus: 9.99,
  pro: 19.99,
  family: 29.99,
}

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  plus: 'Plus',
  pro: 'Pro',
  family: 'Family',
}

export interface CheckoutSession {
  url: string
  session_id: string
}

export interface SubscriptionStatusDetail {
  tier: SubscriptionTier
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive'
  current_period_end: string | null
  cancel_at_period_end: boolean
}
