/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Behavioral Genome — Trust Inversion Inference Engine
 *
 * Collects behavioral signals (timing, interaction patterns) and infers
 * genome dimension scores. This is the "Trust Inversion" principle:
 * we observe what users DO, not what they SAY.
 *
 * CRITICAL: The genome modifies UX FRICTION only. It NEVER modifies
 * verdict logic. Verdicts are deterministic based on inputs.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import type { GenomeDimensionId } from './dimensions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BehavioralEventType =
  | 'question_time_spent'
  | 'input_revised'
  | 'section_navigated'
  | 'result_section_viewed'
  | 'monte_carlo_percentile_focused'
  | 'override_button_interaction';

export interface BehavioralEvent {
  /** The type of behavioral signal captured */
  type: BehavioralEventType;
  /** Unix timestamp (ms) when the event occurred */
  timestamp: number;
  /** Duration in milliseconds (for time-based events) */
  durationMs?: number;
  /** Additional context about the event */
  metadata?: Record<string, string | number | boolean>;
}

export interface DimensionScore {
  /** Inferred score for this dimension, 0-100 */
  score: number;
  /** Confidence in this inference, 0-1.0 */
  confidence: number;
}

export type GenomeProfile = Record<GenomeDimensionId, DimensionScore>;

// ---------------------------------------------------------------------------
// Signal-to-dimension mapping
// ---------------------------------------------------------------------------

/** Each event type contributes to one or more genome dimensions with a weight */
interface SignalMapping {
  dimension: GenomeDimensionId;
  /** Positive weight = increases score, negative = decreases */
  weight: number;
}

const SIGNAL_MAP: Record<BehavioralEventType, SignalMapping[]> = {
  question_time_spent: [
    { dimension: 'loss_aversion', weight: 0.3 },
    { dimension: 'time_perception', weight: 0.2 },
    { dimension: 'confidence_calibration', weight: 0.15 },
  ],
  input_revised: [
    { dimension: 'confidence_calibration', weight: 0.4 },
    { dimension: 'regret_asymmetry', weight: 0.25 },
    { dimension: 'volatility_tolerance', weight: -0.1 },
  ],
  section_navigated: [
    { dimension: 'narrative_bias', weight: 0.2 },
    { dimension: 'outcome_bias', weight: 0.3 },
    { dimension: 'agency_attribution', weight: 0.15 },
  ],
  result_section_viewed: [
    { dimension: 'outcome_bias', weight: 0.35 },
    { dimension: 'loss_aversion', weight: 0.2 },
    { dimension: 'social_proof_sensitivity', weight: 0.15 },
  ],
  monte_carlo_percentile_focused: [
    { dimension: 'volatility_tolerance', weight: 0.4 },
    { dimension: 'loss_aversion', weight: 0.3 },
    { dimension: 'time_perception', weight: 0.1 },
  ],
  override_button_interaction: [
    { dimension: 'agency_attribution', weight: 0.35 },
    { dimension: 'confidence_calibration', weight: 0.25 },
    { dimension: 'regret_asymmetry', weight: 0.2 },
  ],
};

// ---------------------------------------------------------------------------
// Inference helpers
// ---------------------------------------------------------------------------

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Extract a normalized intensity (0-1) from an event based on its metadata.
 *
 * For time-based events, longer durations signal higher intensity.
 * For interaction events, the act of interacting is itself the signal.
 */
function eventIntensity(event: BehavioralEvent): number {
  if (event.durationMs !== undefined) {
    // Normalize: 0-30s maps to 0-1, cap at 1
    return clamp(event.durationMs / 30_000, 0, 1);
  }
  // Non-duration events: binary signal at 0.6 intensity
  return 0.6;
}

// ---------------------------------------------------------------------------
// Core inference
// ---------------------------------------------------------------------------

const DIMENSION_IDS: GenomeDimensionId[] = [
  'loss_aversion',
  'time_perception',
  'confidence_calibration',
  'volatility_tolerance',
  'regret_asymmetry',
  'social_proof_sensitivity',
  'narrative_bias',
  'agency_attribution',
  'outcome_bias',
];

/**
 * collectSignals — Aggregate behavioral events into a GenomeProfile.
 *
 * The inference engine:
 * 1. Maps each event to its contributing dimensions via SIGNAL_MAP
 * 2. Weights the contribution by event intensity
 * 3. Normalizes accumulated signals into 0-100 scores
 * 4. Computes confidence based on signal count per dimension
 */
export function collectSignals(events: BehavioralEvent[]): GenomeProfile {
  // Accumulate raw weighted signals per dimension
  const accumulator: Record<GenomeDimensionId, number[]> = {} as Record<
    GenomeDimensionId,
    number[]
  >;
  for (const id of DIMENSION_IDS) {
    accumulator[id] = [];
  }

  for (const event of events) {
    const mappings = SIGNAL_MAP[event.type];
    if (!mappings) continue;

    const intensity = eventIntensity(event);

    for (const mapping of mappings) {
      const signal = intensity * mapping.weight;
      accumulator[mapping.dimension].push(signal);
    }
  }

  // Build the profile
  const profile = {} as GenomeProfile;

  for (const id of DIMENSION_IDS) {
    const signals = accumulator[id];

    if (signals.length === 0) {
      // No data — neutral score, zero confidence
      profile[id] = { score: 50, confidence: 0 };
      continue;
    }

    // Average the signals and map to 0-100 scale
    // Raw signals are typically in [-0.4, 0.4] range
    const avg = signals.reduce((sum, s) => sum + s, 0) / signals.length;
    // Map [-0.4, 0.4] -> [0, 100], centered at 50
    const score = clamp(50 + avg * 125, 0, 100);

    // Confidence increases with more signals, asymptoting at 1.0
    // 1 signal = ~0.3, 5 signals = ~0.7, 10+ = ~0.9
    const confidence = clamp(1 - Math.exp(-signals.length * 0.35), 0, 1);

    profile[id] = { score: Math.round(score), confidence: parseFloat(confidence.toFixed(2)) };
  }

  return profile;
}

// ---------------------------------------------------------------------------
// Mock data generator (for development)
// ---------------------------------------------------------------------------

/**
 * Generate a plausible mock GenomeProfile for UI development.
 * Each call returns a different but internally-consistent profile.
 */
export function generateMockProfile(): GenomeProfile {
  const profile = {} as GenomeProfile;

  // Seed-like deterministic values for demo consistency
  const mockScores: Record<GenomeDimensionId, number> = {
    loss_aversion: 72,
    time_perception: 45,
    confidence_calibration: 63,
    volatility_tolerance: 38,
    regret_asymmetry: 81,
    social_proof_sensitivity: 55,
    narrative_bias: 67,
    agency_attribution: 74,
    outcome_bias: 59,
  };

  const mockConfidence: Record<GenomeDimensionId, number> = {
    loss_aversion: 0.85,
    time_perception: 0.62,
    confidence_calibration: 0.78,
    volatility_tolerance: 0.71,
    regret_asymmetry: 0.88,
    social_proof_sensitivity: 0.55,
    narrative_bias: 0.73,
    agency_attribution: 0.81,
    outcome_bias: 0.66,
  };

  for (const id of DIMENSION_IDS) {
    profile[id] = {
      score: mockScores[id],
      confidence: mockConfidence[id],
    };
  }

  return profile;
}
