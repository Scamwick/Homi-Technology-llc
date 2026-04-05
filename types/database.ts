// =============================================================================
// types/database.ts — Supabase Database Row Types
// =============================================================================
// These types mirror the Supabase schema exactly. They represent what comes
// back from database queries (Row types). For inserts, use the corresponding
// Insert types which make auto-generated fields optional.
//
// Tables (15):
//   profiles, assessments, monte_carlo_results, trinity_analyses,
//   temporal_messages, behavioral_genome, subscriptions, couples,
//   organizations, partner_users, advisor_permissions, notifications,
//   waitlist, transformation_paths, audit_log
// =============================================================================

import type { Verdict, ConfidenceBand, Dimension } from './assessment';
import type { SubscriptionTier } from './user';
import type { SubscriptionStatus } from './payment';
import type { NotificationType, NotificationPriority } from './notification';
import type { TrustLevel } from './agent';

// ---------------------------------------------------------------------------
// Helper: Insert types make server-generated columns optional
// ---------------------------------------------------------------------------

/**
 * Utility type that makes specified keys optional.
 * Used to derive Insert types from Row types by making
 * auto-generated fields (id, created_at, etc.) optional.
 */
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ---------------------------------------------------------------------------
// 1. profiles  (matches SQL: 00002_create_tables.sql lines 15-38)
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  subscription_tier: SubscriptionTier;
  subscription_status: string;
  stripe_customer_id: string | null;
  partner_id: string | null;
  onboarding_completed: boolean;
  notification_preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = MakeOptional<
  ProfileRow,
  | 'full_name'
  | 'avatar_url'
  | 'role'
  | 'subscription_tier'
  | 'subscription_status'
  | 'stripe_customer_id'
  | 'partner_id'
  | 'onboarding_completed'
  | 'notification_preferences'
  | 'created_at'
  | 'updated_at'
>;

export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// 2. assessments  (matches SQL: 00002 lines 53-72 + migration 00006)
// ---------------------------------------------------------------------------

export interface AssessmentRow {
  id: string;
  user_id: string;
  decision_type: string;
  status: string;
  // Dimension scores (nullable until computed)
  financial_score: number | null;
  emotional_score: number | null;
  timing_score: number | null;
  overall_score: number | null;
  verdict: Verdict | null;
  // Sub-dimension breakdowns (JSONB)
  financial_sub_scores: Record<string, unknown> | null;
  emotional_sub_scores: Record<string, unknown> | null;
  timing_sub_scores: Record<string, unknown> | null;
  // AI-generated insights
  insights: Record<string, unknown> | null;
  // Raw inputs stored for reassessment pre-fill (added in migration 00006)
  financial_inputs: Record<string, unknown> | null;
  emotional_inputs: Record<string, unknown> | null;
  timing_inputs: Record<string, unknown> | null;
  // Metadata (added in migration 00006)
  confidence_band: ConfidenceBand | null;
  crisis_detected: boolean;
  version: string | null;
  // Timestamps
  completed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export type AssessmentInsert = MakeOptional<
  AssessmentRow,
  | 'id'
  | 'status'
  | 'financial_score'
  | 'emotional_score'
  | 'timing_score'
  | 'overall_score'
  | 'verdict'
  | 'financial_sub_scores'
  | 'emotional_sub_scores'
  | 'timing_sub_scores'
  | 'insights'
  | 'financial_inputs'
  | 'emotional_inputs'
  | 'timing_inputs'
  | 'confidence_band'
  | 'crisis_detected'
  | 'version'
  | 'completed_at'
  | 'expires_at'
  | 'created_at'
>;

// ---------------------------------------------------------------------------
// 3. monte_carlo_results
// ---------------------------------------------------------------------------

export interface MonteCarloResultRow {
  id: string;
  assessment_id: string;
  success_rate: number;
  scenarios_run: number;
  p10: number;
  p50: number;
  p90: number;
  crash_survival_rate: number;
  gate_applied: boolean;
  /** Full scenario distribution stored as JSONB for detailed analysis. */
  raw_distribution: Record<string, unknown> | null;
  created_at: string;
}

export type MonteCarloResultInsert = MakeOptional<
  MonteCarloResultRow,
  'id' | 'raw_distribution' | 'created_at'
>;

// ---------------------------------------------------------------------------
// 4. trinity_analyses
// ---------------------------------------------------------------------------

export interface TrinityAnalysisRow {
  id: string;
  assessment_id: string;
  advocate_perspective: string;
  advocate_confidence: number;
  advocate_key_points: string[];
  skeptic_perspective: string;
  skeptic_confidence: number;
  skeptic_key_points: string[];
  arbiter_perspective: string;
  arbiter_confidence: number;
  arbiter_key_points: string[];
  consensus: number;
  model_version: string;
  created_at: string;
}

export type TrinityAnalysisInsert = MakeOptional<
  TrinityAnalysisRow,
  'id' | 'created_at'
>;

// ---------------------------------------------------------------------------
// 5. temporal_messages
// ---------------------------------------------------------------------------

/** Agent conversation messages persisted for context continuity. */
export interface TemporalMessageRow {
  id: string;
  user_id: string;
  /** Conversation thread ID for grouping related messages. */
  thread_id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  /** Completion Receipt ID if this message corresponds to an agent action. */
  receipt_id: string | null;
  /** Metadata for the message (e.g., skill context, tokens used). */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type TemporalMessageInsert = MakeOptional<
  TemporalMessageRow,
  'id' | 'receipt_id' | 'metadata' | 'created_at'
>;

// ---------------------------------------------------------------------------
// 6. behavioral_genome
// ---------------------------------------------------------------------------

export interface BehavioralGenomeRow {
  id: string;
  user_id: string;
  assessment_count: number;
  avg_reassessment_interval_days: number | null;
  score_trajectory: number[];
  deflection_count: number;
  emotional_patterns: Record<string, unknown>;
  preferred_skills: string[];
  trust_profile: Record<string, TrustLevel>;
  last_assessment_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BehavioralGenomeInsert = MakeOptional<
  BehavioralGenomeRow,
  | 'id'
  | 'assessment_count'
  | 'avg_reassessment_interval_days'
  | 'score_trajectory'
  | 'deflection_count'
  | 'emotional_patterns'
  | 'preferred_skills'
  | 'trust_profile'
  | 'last_assessment_at'
  | 'created_at'
  | 'updated_at'
>;

export type BehavioralGenomeUpdate = Partial<Omit<BehavioralGenomeRow, 'id' | 'user_id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// 7. subscriptions
// ---------------------------------------------------------------------------

export interface SubscriptionRow {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export type SubscriptionInsert = MakeOptional<
  SubscriptionRow,
  'id' | 'stripe_subscription_id' | 'cancel_at_period_end' | 'created_at' | 'updated_at'
>;

export type SubscriptionUpdate = Partial<Omit<SubscriptionRow, 'id' | 'user_id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// 8. couples  (matches SQL: 00002 lines 159-166 + migration 00006)
// ---------------------------------------------------------------------------

export interface CoupleRow {
  id: string;
  /** partner_a_id in SQL — the user who initiated the couple link. */
  partner_a_id: string;
  /** partner_b_id in SQL — the partner who accepted. Nullable until accepted. */
  partner_b_id: string | null;
  invite_email: string;
  invite_token: string;
  status: 'pending' | 'active' | 'dissolved';
  /** Whether assessments are automatically shared (added in migration 00006). */
  share_assessments: boolean;
  /** Whether full breakdowns are shared (added in migration 00006). */
  share_full_breakdown: boolean;
  created_at: string;
}

export type CoupleInsert = MakeOptional<
  CoupleRow,
  'id' | 'partner_b_id' | 'status' | 'share_assessments' | 'share_full_breakdown' | 'created_at'
>;

export type CoupleUpdate = Partial<Omit<CoupleRow, 'id' | 'partner_a_id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// 9. organizations
// ---------------------------------------------------------------------------

export interface OrganizationRow {
  id: string;
  name: string;
  owner_id: string;
  tier: SubscriptionTier;
  max_members: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type OrganizationInsert = MakeOptional<
  OrganizationRow,
  'id' | 'max_members' | 'settings' | 'created_at' | 'updated_at'
>;

export type OrganizationUpdate = Partial<Omit<OrganizationRow, 'id' | 'owner_id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// 10. partner_users
// ---------------------------------------------------------------------------

export interface PartnerUserRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  accepted: boolean;
  invited_by: string;
  created_at: string;
}

export type PartnerUserInsert = MakeOptional<
  PartnerUserRow,
  'id' | 'accepted' | 'created_at'
>;

// ---------------------------------------------------------------------------
// 11. advisor_permissions
// ---------------------------------------------------------------------------

export interface AdvisorPermissionRow {
  id: string;
  advisor_id: string;
  client_id: string;
  allowed_dimensions: Dimension[];
  full_access: boolean;
  active: boolean;
  granted_at: string;
  revoked_at: string | null;
}

export type AdvisorPermissionInsert = MakeOptional<
  AdvisorPermissionRow,
  'id' | 'full_access' | 'active' | 'granted_at' | 'revoked_at'
>;

// ---------------------------------------------------------------------------
// 12. notifications  (matches SQL: 00002 lines 260-269 + migration 00006)
// ---------------------------------------------------------------------------

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  /** Deep link within the app (from SQL action_url). */
  action_url: string | null;
  /** Arbitrary payload (SQL column: data). */
  data: Record<string, unknown> | null;
  /** When the notification was read (added in migration 00006). */
  read_at: string | null;
  /** Priority level (added in migration 00006). */
  priority: NotificationPriority;
  /** Delivery channels (added in migration 00006). */
  channels: string[];
  created_at: string;
}

export type NotificationInsert = MakeOptional<
  NotificationRow,
  'id' | 'body' | 'read' | 'action_url' | 'data' | 'read_at' | 'priority' | 'channels' | 'created_at'
>;

// ---------------------------------------------------------------------------
// 13. waitlist
// ---------------------------------------------------------------------------

export interface WaitlistRow {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  interested_tier: SubscriptionTier | null;
  converted: boolean;
  converted_at: string | null;
  created_at: string;
}

export type WaitlistInsert = MakeOptional<
  WaitlistRow,
  'id' | 'name' | 'source' | 'interested_tier' | 'converted' | 'converted_at' | 'created_at'
>;

// ---------------------------------------------------------------------------
// 14. transformation_paths
// ---------------------------------------------------------------------------

export interface TransformationPathRow {
  id: string;
  user_id: string;
  assessment_id: string;
  steps: TransformationStepData[];
  progress_percent: number;
  current_step_index: number;
  status: 'active' | 'completed' | 'abandoned' | 'superseded';
  created_at: string;
  updated_at: string;
}

export interface TransformationStepData {
  title: string;
  description: string;
  dimension: Dimension;
  completed: boolean;
  completed_at: string | null;
  estimated_score_impact: number;
}

export type TransformationPathInsert = MakeOptional<
  TransformationPathRow,
  'id' | 'progress_percent' | 'current_step_index' | 'status' | 'created_at' | 'updated_at'
>;

export type TransformationPathUpdate = Partial<
  Omit<TransformationPathRow, 'id' | 'user_id' | 'assessment_id' | 'created_at'>
>;

// ---------------------------------------------------------------------------
// 15. audit_log
// ---------------------------------------------------------------------------

export type AuditAction =
  | 'assessment.created'
  | 'assessment.deleted'
  | 'monte_carlo.run'
  | 'trinity.analyzed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'couple.invited'
  | 'couple.accepted'
  | 'couple.dissolved'
  | 'advisor.granted'
  | 'advisor.revoked'
  | 'crisis.detected'
  | 'crisis.deflected'
  | 'crisis.overridden'
  | 'agent.action'
  | 'agent.skill_installed'
  | 'agent.trust_changed'
  | 'user.profile_updated'
  | 'user.preferences_updated'
  | 'user.deleted'
  | 'org.created'
  | 'org.member_added'
  | 'org.member_removed';

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type AuditLogInsert = MakeOptional<
  AuditLogRow,
  'id' | 'user_id' | 'metadata' | 'ip_address' | 'user_agent' | 'created_at'
>;

// ---------------------------------------------------------------------------
// Aggregate Database type for Supabase client typing
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      assessments: {
        Row: AssessmentRow;
        Insert: AssessmentInsert;
        Update: Partial<AssessmentRow>;
      };
      monte_carlo_results: {
        Row: MonteCarloResultRow;
        Insert: MonteCarloResultInsert;
        Update: Partial<MonteCarloResultRow>;
      };
      trinity_analyses: {
        Row: TrinityAnalysisRow;
        Insert: TrinityAnalysisInsert;
        Update: Partial<TrinityAnalysisRow>;
      };
      temporal_messages: {
        Row: TemporalMessageRow;
        Insert: TemporalMessageInsert;
        Update: Partial<TemporalMessageRow>;
      };
      behavioral_genome: {
        Row: BehavioralGenomeRow;
        Insert: BehavioralGenomeInsert;
        Update: BehavioralGenomeUpdate;
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
      };
      couples: {
        Row: CoupleRow;
        Insert: CoupleInsert;
        Update: CoupleUpdate;
      };
      organizations: {
        Row: OrganizationRow;
        Insert: OrganizationInsert;
        Update: OrganizationUpdate;
      };
      partner_users: {
        Row: PartnerUserRow;
        Insert: PartnerUserInsert;
        Update: Partial<PartnerUserRow>;
      };
      advisor_permissions: {
        Row: AdvisorPermissionRow;
        Insert: AdvisorPermissionInsert;
        Update: Partial<AdvisorPermissionRow>;
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: Partial<NotificationRow>;
      };
      waitlist: {
        Row: WaitlistRow;
        Insert: WaitlistInsert;
        Update: Partial<WaitlistRow>;
      };
      transformation_paths: {
        Row: TransformationPathRow;
        Insert: TransformationPathInsert;
        Update: TransformationPathUpdate;
      };
      audit_log: {
        Row: AuditLogRow;
        Insert: AuditLogInsert;
        Update: never;
      };
    };
  };
}
