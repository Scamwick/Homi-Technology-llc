// =============================================================================
// types/user.ts — User Profile & Preferences
// =============================================================================

// ---------------------------------------------------------------------------
// Subscription Tiers
// ---------------------------------------------------------------------------

/**
 * Product tiers. Each unlocks progressively more features:
 * - free:             Basic assessment, limited history
 * - plus:             Full assessment history, Monte Carlo, basic agent
 * - pro:              Trinity Engine, advanced agent, couples mode
 * - family:           Multi-member household, advisor sharing, org features
 * - enterprise_free:  Free enterprise trial (team management only)
 * - enterprise_paid:  Full enterprise, all features + white-label
 */
export type SubscriptionTier =
  | 'free'
  | 'plus'
  | 'pro'
  | 'family'
  | 'enterprise_free'
  | 'enterprise_paid';

/**
 * Platform roles for access control (WHO the user is):
 * - ceo_founder: God mode — full platform access, bypasses all paywalls
 * - admin:       Admin dashboard access, bypasses paywalls
 * - employee:    Employee dashboard, support queue, sales pipeline
 * - user:        Standard consumer-facing dashboard
 */
export type UserRole = 'ceo_founder' | 'admin' | 'employee' | 'user';

/**
 * Account type (individual vs enterprise):
 * - individual: Personal account
 * - enterprise: Business/org account (can have team members)
 */
export type AccountType = 'individual' | 'enterprise';

// ---------------------------------------------------------------------------
// User Profile
// ---------------------------------------------------------------------------

export interface UserProfile {
  /** Supabase auth user ID (UUID). */
  id: string;

  /** User's email address. */
  email: string;

  /** Display name (first + last or chosen name). */
  name: string;

  /** URL to the user's avatar image, if set. */
  avatarUrl: string | null;

  /** Current subscription tier. */
  tier: SubscriptionTier;

  /** Whether the user has completed the onboarding flow. */
  onboardingComplete: boolean;

  /** ISO 8601 timestamp of account creation. */
  createdAt: string;

  /** ISO 8601 timestamp of last profile update. */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// User Preferences
// ---------------------------------------------------------------------------

export interface NotificationPreferences {
  /** Receive email notifications. */
  email: boolean;

  /** Receive push notifications (mobile / browser). */
  push: boolean;

  /** Receive reassessment reminders. */
  reassessReminders: boolean;

  /** Frequency of reassessment reminders in days (e.g. 30, 60, 90). */
  reminderFrequencyDays: number;

  /** Receive agent action summaries. */
  agentDigest: boolean;
}

export interface CouplesPreferences {
  /** Whether couples mode is enabled. */
  enabled: boolean;

  /** Partner's user ID if linked, null otherwise. */
  partnerId: string | null;

  /** Share assessment results with partner automatically. */
  shareAssessments: boolean;

  /** Allow partner to view full breakdown vs. summary only. */
  shareFullBreakdown: boolean;
}

export interface PrivacyPreferences {
  /** Allow anonymized data to be used for aggregate insights. */
  analyticsOptIn: boolean;

  /** Show profile to advisors in the organization. */
  visibleToAdvisors: boolean;

  /** Allow HōMI to store assessment inputs for reassessment pre-fill. */
  retainInputs: boolean;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  couples: CouplesPreferences;
  privacy: PrivacyPreferences;
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

/** Steps in the onboarding wizard. */
export type OnboardingStep =
  | 'welcome'
  | 'profile_setup'
  | 'first_assessment'
  | 'results_tour'
  | 'agent_intro'
  | 'complete';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedAt: string | null;
}

// ---------------------------------------------------------------------------
// Session / Auth Context
// ---------------------------------------------------------------------------

/** Authenticated user context available throughout the app. */
export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
}
