// =============================================================================
// types/safety.ts — Safety Canon Types
// =============================================================================
// The Safety Canon is HōMI's crisis detection and deflection system. It
// monitors user interactions for signs of financial, emotional, or behavioral
// distress and can intervene by pausing the assessment flow, deflecting to
// resources, or applying cooldown periods.
// =============================================================================

// ---------------------------------------------------------------------------
// Crisis Signal Detection
// ---------------------------------------------------------------------------

/** Category of crisis signal origin. */
export type CrisisCategory = 'behavioral' | 'emotional' | 'language';

/**
 * Specific crisis signal types detected by the Safety Canon.
 *
 * behavioral: patterns in how the user interacts (rapid retakes, erratic inputs)
 * emotional:  extreme self-reported scores or contradictory emotional signals
 * language:   NLP-detected distress markers in free-text agent conversations
 */
export type CrisisSignalType =
  // Behavioral signals
  | 'rapid_reassessment'
  | 'erratic_inputs'
  | 'score_chasing'
  | 'obsessive_checking'
  // Emotional signals
  | 'extreme_low_confidence'
  | 'partner_conflict_indicator'
  | 'panic_buying_signal'
  | 'fomo_crisis'
  // Language signals
  | 'distress_language'
  | 'financial_desperation'
  | 'relationship_crisis'
  | 'self_harm_indicator';

export interface CrisisSignal {
  /** How the signal was detected. */
  category: CrisisCategory;

  /** Specific signal type. */
  type: CrisisSignalType;

  /**
   * How intense the signal is (0-100).
   * Signals above 70 typically trigger deflection.
   */
  intensity: number;

  /** Raw evidence that triggered this signal (e.g., input pattern, text excerpt). */
  evidence: string;

  /** ISO 8601 timestamp of detection. */
  detectedAt: string;
}

// ---------------------------------------------------------------------------
// Crisis Evaluation Result
// ---------------------------------------------------------------------------

/** What the Safety Canon decides to do after evaluating signals. */
export type CrisisAction = 'continue' | 'deflect';

export interface CrisisResult {
  /** Whether any crisis signal exceeded the detection threshold. */
  detected: boolean;

  /** Whether to continue normally or deflect to safety resources. */
  action: CrisisAction;

  /** All signals detected during this evaluation, even sub-threshold ones. */
  signals: CrisisSignal[];

  /**
   * If action is 'deflect', the ISO 8601 timestamp until which the user
   * should be in a cooldown period before being allowed to reassess.
   * Undefined when action is 'continue'.
   */
  cooldownUntil?: string;

  /** Resource URLs to present if deflecting (crisis hotlines, articles, etc.). */
  resources?: SafetyResource[];
}

// ---------------------------------------------------------------------------
// Safety Resources
// ---------------------------------------------------------------------------

export interface SafetyResource {
  /** Display label (e.g., "National Crisis Hotline"). */
  label: string;

  /** URL or phone number. */
  href: string;

  /** Type of resource for icon/display purposes. */
  type: 'hotline' | 'article' | 'tool' | 'professional';
}

// ---------------------------------------------------------------------------
// Deflection Audit Trail
// ---------------------------------------------------------------------------

/** Immutable record of every deflection event for compliance and review. */
export interface DeflectionRecord {
  /** Unique deflection record ID. */
  id: string;

  /** User who was deflected. */
  userId: string;

  /** Signals that triggered the deflection. */
  signals: CrisisSignal[];

  /** ISO 8601 timestamp of the deflection. */
  timestamp: string;

  /** The action that was taken. */
  action: CrisisAction;

  /**
   * Whether the user manually overrode the deflection.
   * Only possible after the cooldown period expires.
   */
  overridden: boolean;

  /** ISO 8601 timestamp of when the override occurred, if applicable. */
  overrideTimestamp?: string;

  /** ID of the assessment that was in progress when the deflection occurred. */
  assessmentId: string | null;
}

// ---------------------------------------------------------------------------
// Safety Configuration
// ---------------------------------------------------------------------------

/** Tunable thresholds for the Safety Canon. */
export interface SafetyConfig {
  /** Minimum intensity to trigger deflection (0-100). */
  deflectionThreshold: number;

  /** Default cooldown duration in minutes. */
  cooldownMinutes: number;

  /** Maximum reassessments allowed within the rate limit window. */
  maxReassessmentsPerWindow: number;

  /** Rate limit window duration in hours. */
  rateLimitWindowHours: number;

  /** Whether self-harm signals should trigger an immediate escalation. */
  escalateSelfHarm: boolean;
}
