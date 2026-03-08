import { SubscriptionTier, SubscriptionStatus, UserRole, Notification } from './database'

export type { Notification }

export interface Profile {
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
  notification_preferences: NotificationPreferences
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  full_name?: string
  avatar_url?: string | null
}

export interface NotificationPreferences {
  email_verdicts: boolean
  email_nurture: boolean
  email_product: boolean
  in_app: boolean
}

export interface UserSession {
  user: {
    id: string
    email: string
  } | null
  profile: Profile | null
  isLoading: boolean
}
