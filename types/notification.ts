// =============================================================================
// types/notification.ts — Notification System Types
// =============================================================================

// ---------------------------------------------------------------------------
// Notification Types
// ---------------------------------------------------------------------------

/**
 * All notification event types in the system.
 * Used for routing, filtering, and rendering the correct UI treatment.
 */
export type NotificationType =
  | 'assessment_complete'
  | 'verdict_ready'
  | 'couple_invite'
  | 'couple_accepted'
  | 'reassess_reminder'
  | 'milestone_achieved'
  | 'transformation_update'
  | 'agent_action'
  | 'system';

/** Urgency level for notification rendering and delivery priority. */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/** How the notification was delivered. */
export type NotificationChannel = 'in_app' | 'email' | 'push';

// ---------------------------------------------------------------------------
// Notification Metadata — type-safe per-notification-type payloads
// ---------------------------------------------------------------------------

export interface AssessmentCompleteMetadata {
  assessmentId: string;
  overall: number;
}

export interface VerdictReadyMetadata {
  assessmentId: string;
  verdict: import('./assessment').Verdict;
}

export interface CoupleInviteMetadata {
  inviterId: string;
  inviterName: string;
  coupleId: string;
}

export interface CoupleAcceptedMetadata {
  partnerId: string;
  partnerName: string;
  coupleId: string;
}

export interface ReassessReminderMetadata {
  lastAssessmentId: string;
  daysSinceLastAssessment: number;
}

export interface MilestoneAchievedMetadata {
  milestone: string;
  previousValue: number;
  currentValue: number;
}

export interface TransformationUpdateMetadata {
  pathId: string;
  stepCompleted: string;
  progressPercent: number;
}

export interface AgentActionMetadata {
  receiptId: string;
  action: string;
  skillId: string | null;
}

export interface SystemMetadata {
  category: 'maintenance' | 'feature' | 'security' | 'billing';
}

/**
 * Discriminated union of all notification metadata types.
 * The correct shape is determined by the notification's `type` field.
 */
export type NotificationMetadata =
  | AssessmentCompleteMetadata
  | VerdictReadyMetadata
  | CoupleInviteMetadata
  | CoupleAcceptedMetadata
  | ReassessReminderMetadata
  | MilestoneAchievedMetadata
  | TransformationUpdateMetadata
  | AgentActionMetadata
  | SystemMetadata;

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export interface Notification {
  /** Unique notification ID (UUID). */
  id: string;

  /** Recipient user ID. */
  userId: string;

  /** Notification event type — determines metadata shape and UI rendering. */
  type: NotificationType;

  /** Short headline shown in the notification list. */
  title: string;

  /** Longer description shown on expansion or in email body. */
  body: string;

  /** Whether the user has read this notification. */
  read: boolean;

  /** ISO 8601 timestamp of when the notification was created. */
  createdAt: string;

  /** ISO 8601 timestamp of when the notification was read, if applicable. */
  readAt: string | null;

  /** Priority level for rendering and delivery. */
  priority: NotificationPriority;

  /** Channels this notification was delivered through. */
  channels: NotificationChannel[];

  /** Type-specific payload. Shape depends on `type`. */
  metadata: NotificationMetadata | null;
}

// ---------------------------------------------------------------------------
// Notification Feed
// ---------------------------------------------------------------------------

/** Paginated notification response for the notification feed API. */
export interface NotificationFeed {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
  cursor: string | null;
}
