// =============================================================================
// types/index.ts — Barrel Re-export
// =============================================================================
// Single entry point for all HōMI type definitions.
// Usage: import { AssessmentResult, UserProfile, Verdict } from '@/types';
// =============================================================================

export type {
  // Enums & unions
  Verdict,
  Dimension,
  ConfidenceBand,
  // Inputs
  FinancialInputs,
  EmotionalInputs,
  TimingInputs,
  AssessmentInputs,
  // Scoring outputs
  MetricBreakdown,
  DimensionScore,
  MonteCarloResult,
  // Assessment result
  AssessmentResult,
  AssessmentSummary,
  AssessmentDelta,
} from './assessment';

export type {
  // Tier
  SubscriptionTier,
  // Profile
  UserProfile,
  // Preferences
  NotificationPreferences,
  CouplesPreferences,
  PrivacyPreferences,
  UserPreferences,
  // Onboarding
  OnboardingStep,
  OnboardingState,
  // Auth
  AuthUser,
} from './user';

export type {
  // Trust
  TrustLevel,
  TrustLevelLabel,
  // Conversation
  AgentRole,
  AgentMessage,
  // Receipts
  CompletionReceipt,
  // Skills
  SkillCategory,
  Skill,
  // Config
  AgentConfig,
  AgentSession,
} from './agent';

export type {
  // Crisis detection
  CrisisCategory,
  CrisisSignalType,
  CrisisSignal,
  // Crisis evaluation
  CrisisAction,
  CrisisResult,
  // Resources
  SafetyResource,
  // Audit
  DeflectionRecord,
  // Config
  SafetyConfig,
} from './safety';

export type {
  // Type unions
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  // Metadata
  AssessmentCompleteMetadata,
  VerdictReadyMetadata,
  CoupleInviteMetadata,
  CoupleAcceptedMetadata,
  ReassessReminderMetadata,
  MilestoneAchievedMetadata,
  TransformationUpdateMetadata,
  AgentActionMetadata,
  SystemMetadata,
  NotificationMetadata,
  // Notification
  Notification,
  NotificationFeed,
} from './notification';

export type {
  // Subscription
  SubscriptionStatus,
  Subscription,
  // Pricing
  TierPrice,
  PriceConfig,
  // Checkout
  CheckoutRequest,
  CheckoutResponse,
  PortalRequest,
  PortalResponse,
  // Webhooks
  StripeWebhookEventType,
} from './payment';

export type {
  // Roles
  TrinityRole,
  // Perspective
  TrinityPerspective,
  // Analysis
  TrinityAnalysis,
  // API
  TrinityRequest,
  TrinityResponse,
} from './trinity';

export type {
  // Row types
  ProfileRow,
  AssessmentRow,
  MonteCarloResultRow,
  TrinityAnalysisRow,
  TemporalMessageRow,
  BehavioralGenomeRow,
  SubscriptionRow,
  CoupleRow,
  OrganizationRow,
  PartnerUserRow,
  AdvisorPermissionRow,
  NotificationRow,
  WaitlistRow,
  TransformationPathRow,
  TransformationStepData,
  AuditLogRow,
  AuditAction,
  // Insert types
  ProfileInsert,
  AssessmentInsert,
  MonteCarloResultInsert,
  TrinityAnalysisInsert,
  TemporalMessageInsert,
  BehavioralGenomeInsert,
  SubscriptionInsert,
  CoupleInsert,
  OrganizationInsert,
  PartnerUserInsert,
  AdvisorPermissionInsert,
  NotificationInsert,
  WaitlistInsert,
  TransformationPathInsert,
  AuditLogInsert,
  // Update types
  ProfileUpdate,
  BehavioralGenomeUpdate,
  SubscriptionUpdate,
  CoupleUpdate,
  OrganizationUpdate,
  TransformationPathUpdate,
  // Database schema
  Database,
} from './database';
