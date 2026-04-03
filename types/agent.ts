// =============================================================================
// types/agent.ts — HōMI Agent Platform Types
// =============================================================================
// The HōMI Agent is an AI-powered assistant that helps users navigate the
// homebuying journey. It operates under a trust framework with escalating
// autonomy levels and produces auditable Completion Receipts for every action.
// =============================================================================

// ---------------------------------------------------------------------------
// Trust Framework
// ---------------------------------------------------------------------------

/**
 * Trust level governing how much autonomy the agent has per skill:
 * - 1 (Suggest):     Agent recommends, user must approve before execution
 * - 2 (Supervised):  Agent executes but user can undo within a window
 * - 3 (Autonomous):  Agent executes without confirmation
 */
export type TrustLevel = 1 | 2 | 3;

/** Human-readable labels for trust levels. */
export type TrustLevelLabel = 'Suggest' | 'Supervised' | 'Autonomous';

// ---------------------------------------------------------------------------
// Conversation
// ---------------------------------------------------------------------------

/** Participant role in the agent conversation. */
export type AgentRole = 'user' | 'agent' | 'system';

export interface AgentMessage {
  /** Unique message identifier. */
  id: string;

  /** Who sent the message. */
  role: AgentRole;

  /** Message body (supports markdown). */
  content: string;

  /** ISO 8601 timestamp. */
  timestamp: string;

  /**
   * If this message corresponds to an agent action, the receipt ID.
   * Format: "HM-xxx" (e.g., "HM-001").
   */
  receiptId: string | null;
}

// ---------------------------------------------------------------------------
// Completion Receipts — auditable action records
// ---------------------------------------------------------------------------

export interface CompletionReceipt {
  /**
   * Unique receipt identifier in the format "HM-xxx".
   * Sequential per user session.
   */
  id: string;

  /** What the agent did (e.g., "Scheduled reassessment for March 15"). */
  action: string;

  /** Why the agent took this action. */
  reasoning: string;

  /** How clear the user's intent was (0-100). */
  clarity: number;

  /** How aligned this action is with the user's stated goals (0-100). */
  alignment: number;

  /** Whether the timing of this action is appropriate (0-100). */
  timing: number;

  /** Agent's self-assessed confidence in this action being correct (0-100). */
  confidence: number;

  /** ISO 8601 timestamp of when the action was executed. */
  timestamp: string;

  /** Whether this action can be reversed. */
  undoable: boolean;

  /** Whether the user has undone this action. */
  undone: boolean;

  /** ISO 8601 timestamp of when the action was undone, if applicable. */
  undoneAt: string | null;
}

// ---------------------------------------------------------------------------
// Skills — modular agent capabilities
// ---------------------------------------------------------------------------

/** Category of agent skill in the marketplace. */
export type SkillCategory =
  | 'assessment'
  | 'financial'
  | 'emotional'
  | 'timing'
  | 'communication'
  | 'research'
  | 'automation';

export interface Skill {
  /** Unique skill identifier. */
  id: string;

  /** Human-readable skill name. */
  name: string;

  /** Lucide icon name for UI rendering. */
  icon: string;

  /** What this skill enables the agent to do. */
  description: string;

  /** Whether the user has installed this skill. */
  installed: boolean;

  /** Average user rating (1.0-5.0). */
  rating: number;

  /** Total number of installs across all users. */
  installs: number;

  /** Whether this skill has been verified by the HōMI team. */
  verified: boolean;

  /** Skill category for marketplace organization. */
  category: SkillCategory;

  /** Minimum subscription tier required to install this skill. */
  requiredTier: import('./user').SubscriptionTier;
}

// ---------------------------------------------------------------------------
// Agent Configuration
// ---------------------------------------------------------------------------

export interface AgentConfig {
  /** Display name the agent uses to address the user. */
  userName: string;

  /**
   * Trust level overrides per skill ID.
   * Skills not in this map default to TrustLevel 1 (Suggest).
   */
  trustLevels: Record<string, TrustLevel>;

  /** IDs of skills the user has installed. */
  installedSkills: string[];

  /** Whether the agent should proactively reach out with insights. */
  proactiveMode: boolean;

  /** Maximum number of autonomous actions per day (safety guardrail). */
  dailyActionLimit: number;
}

// ---------------------------------------------------------------------------
// Agent Session State
// ---------------------------------------------------------------------------

export interface AgentSession {
  /** Current conversation thread. */
  messages: AgentMessage[];

  /** All receipts generated in this session. */
  receipts: CompletionReceipt[];

  /** Whether the agent is currently processing a request. */
  isThinking: boolean;

  /** Active skill being used, if any. */
  activeSkillId: string | null;

  /** Current trust level for the active context. */
  activeTrustLevel: TrustLevel;
}
