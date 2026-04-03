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
// 1. profiles
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  tier: SubscriptionTier;
  onboarding_complete: boolean;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = MakeOptional<
  ProfileRow,
  'avatar_url' | 'tier' | 'onboarding_complete' | 'preferences' | 'created_at' | 'updated_at'
>;

export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// 2. assessments
// ---------------------------------------------------------------------------

export interface AssessmentRow {
  id: string;
  user_id: string;
  /** Raw financial inputs stored as JSONB. */
  financial_inputs: Record<string, unknown>;
  /** Raw emotional inputs stored as JSONB. */
  emotional_inputs: Record<string, unknown>;
  /** Raw timing inputs stored as JSONB. */
  timing_inputs: Record<string, unknown>;
  /** Composite HōMI-Score (0-100). */
  overall_score: number;
  financial_score: number;
  financial_breakdown: Record<string, unknown>;
  emotional_score: number;
  emotional_breakdown: Record<string, unknown>;
  timing_score: number;
  timing_breakdown: Record<string, unknown>;
  verdict: Verdict;
  confidence_band: ConfidenceBand;
  crisis_detected: boolean;
  /** Scoring methodology version (semver). */
  version: string;
  created_at: string;
}

export type AssessmentInsert = MakeOptional<
  AssessmentRow,
  'id' | 'crisis_detected' | 'created_at'
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

/**
 * The Behavioral Genome tracks patterns in how users interact with HōMI
 * over time. Used by the Safety Canon and agent personalization.
 */
export interface BehavioralGenomeRow {
  id: string;
  user_id: string;
  /** Total number of assessments completed. */
  assessment_count: number;
  /** Average time between assessments in days. */
  avg_reassessment_interval_days: number | null;
  /** Historical score trajectory as ordered array. */
  score_trajectory: number[];
  /** Number of times crisis deflection was triggered. */
  deflection_count: number;
  /** Dominant emotional patterns detected across assessments. */
  emotional_patterns: Record<string, unknown>;
  /** Most frequently used agent skills. */
  preferred_skills: string[];
  /** Agent trust level preferences snapshot. */
  trust_profile: Record<string, TrustLevel>;
  /** ISO 8601 timestamp of the last assessment. */
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
// 8. couples
// ---------------------------------------------------------------------------

/** Couples mode: links two users for shared assessment workflows. */
export interface CoupleRow {
  id: string;
  /** The user who initiated the couple link. */
  initiator_id: string;
  /** The partner who was invited. */
  partner_id: string;
  status: 'pending' | 'active' | 'dissolved';
  /** Whether assessments are automatically shared. */
  share_assessments: boolean;
  /** Whether full breakdowns are shared (vs. summary only). */
  share_full_breakdown: boolean;
  created_at: string;
  updated_at: string;
}

export type CoupleInsert = MakeOptional<
  CoupleRow,
  'id' | 'status' | 'share_assessments' | 'share_full_breakdown' | 'created_at' | 'updated_at'
>;

export type CoupleUpdate = Partial<Omit<CoupleRow, 'id' | 'initiator_id' | 'partner_id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// 9. organizations
// ---------------------------------------------------------------------------

/** Organizations for the family/enterprise tier. */
export interface OrganizationRow {
  id: string;
  name: string;
  /** User who owns/administers this organization. */
  owner_id: string;
  tier: SubscriptionTier;
  /** Maximum number of members allowed. */
  max_members: number;
  /** Organization-wide settings stored as JSONB. */
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

/** Junction table for organization membership. */
export interface PartnerUserRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  /** Whether this member has accepted the invitation. */
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

/** Permissions granted to financial advisors to view client data. */
export interface AdvisorPermissionRow {
  id: string;
  /** The advisor's user ID. */
  advisor_id: string;
  /** The client's user ID. */
  client_id: string;
  /** Which dimensions the advisor can view. */
  allowed_dimensions: Dimension[];
  /** Whether the advisor can see full breakdown or summary only. */
  full_access: boolean;
  /** Whether the client has granted active consent. */
  active: boolean;
  granted_at: string;
  revoked_at: string | null;
}

export type AdvisorPermissionInsert = MakeOptional<
  AdvisorPermissionRow,
  'id' | 'full_access' | 'active' | 'granted_at' | 'revoked_at'
>;

// ---------------------------------------------------------------------------
// 12. notifications
// ---------------------------------------------------------------------------

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  read_at: string | null;
  priority: NotificationPriority;
  channels: string[];
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type NotificationInsert = MakeOptional<
  NotificationRow,
  'id' | 'read' | 'read_at' | 'priority' | 'channels' | 'metadata' | 'created_at'
>;

// ---------------------------------------------------------------------------
// 13. waitlist
// ---------------------------------------------------------------------------

export interface WaitlistRow {
  id: string;
  email: string;
  name: string | null;
  /** How the user heard about HōMI. */
  source: string | null;
  /** Interest tier they expressed during signup. */
  interested_tier: SubscriptionTier | null;
  /** Whether the waitlist entry has been converted to a real account. */
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

/**
 * Transformation Paths are personalized roadmaps generated after an
 * assessment. They guide the user from their current state toward
 * homeownership readiness with concrete, sequenced steps.
 */
export interface TransformationPathRow {
  id: string;
  user_id: string;
  assessment_id: string;
  /** Ordered list of steps in the transformation path. */
  steps: TransformationStepData[];
  /** Overall progress percentage (0-100). */
  progress_percent: number;
  /** Current step index (0-based). */
  current_step_index: number;
  status: 'active' | 'completed' | 'abandoned' | 'superseded';
  created_at: string;
  updated_at: string;
}

/** JSONB shape for a single step in the transformation path. */
export interface TransformationStepData {
  title: string;
  description: string;
  dimension: Dimension;
  completed: boolean;
  completed_at: string | null;
  /** Estimated impact on the HōMI-Score if completed. */
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

/** Actions tracked in the audit log for compliance and debugging. */
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

/** Immutable audit log for all significant system events. */
export interface AuditLogRow {
  id: string;
  /** User who performed the action (null for system-initiated events). */
  user_id: string | null;
  action: AuditAction;
  /** The entity type affected (e.g., "assessment", "subscription"). */
  resource_type: string;
  /** The entity ID affected. */
  resource_id: string;
  /** Additional context about the action stored as JSONB. */
  metadata: Record<string, unknown> | null;
  /** IP address of the request, if applicable. */
  ip_address: string | null;
  /** User agent string from the request. */
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

/** Complete database schema type map for use with Supabase client generics. */
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
