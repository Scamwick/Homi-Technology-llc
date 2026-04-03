/**
 * Deflection Copy — Word-Locked Safety Messages
 * ===============================================
 *
 * This module contains the IMMUTABLE deflection copy that the Safety Canon
 * presents when crisis signals are detected. These words were chosen
 * deliberately and must never be modified by code, configuration, or
 * feature flags.
 *
 * The copy is designed to:
 *   1. Validate the user's experience (not dismiss or pathologize)
 *   2. Reframe pausing as strength, not weakness
 *   3. Provide actionable crisis resources
 *   4. Offer a clear, informed override path
 *
 * WHY "as const": TypeScript's const assertion makes every string literal
 * a readonly type. This is the closest we get to compile-time immutability.
 * Combined with Object.freeze at runtime, this copy cannot be mutated.
 */

import type { SafetyResource } from '@/types/safety';

// ---------------------------------------------------------------------------
// Deflection Copy — CONSTITUTIONALLY BINDING, DO NOT MODIFY
// ---------------------------------------------------------------------------

/**
 * Primary deflection message shown when the Safety Canon triggers.
 * This is the first thing the user sees. It must be empathetic,
 * non-judgmental, and frame the pause as wisdom.
 */
const PRIMARY_MESSAGE =
  "I want to pause for a moment. This decision feels heavier than it " +
  "should feel right now. That's not a weakness \u2014 it's wisdom. " +
  "Let's step back.";

/**
 * Crisis resources presented alongside the deflection.
 * These are real, verified hotlines and helplines.
 */
const CRISIS_RESOURCES: readonly SafetyResource[] = Object.freeze([
  Object.freeze({
    label: '988 Suicide & Crisis Lifeline',
    href: 'tel:988',
    type: 'hotline' as const,
  }),
  Object.freeze({
    label: 'Crisis Text Line',
    href: 'sms:741741?body=HOME',
    type: 'hotline' as const,
  }),
  Object.freeze({
    label: 'NAMI Helpline',
    href: 'tel:18009506264',
    type: 'hotline' as const,
  }),
]);

/**
 * User-friendly display format for crisis resources.
 * Used in UI components that need a simple name + contact string.
 */
const CRISIS_RESOURCE_DISPLAY = Object.freeze([
  Object.freeze({ name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988' }),
  Object.freeze({ name: 'Crisis Text Line', contact: 'Text HOME to 741741' }),
  Object.freeze({ name: 'NAMI Helpline', contact: '1-800-950-NAMI (6264)' }),
]);

/**
 * Override acknowledgment text. Shown when a user explicitly chooses
 * to continue past a deflection. Their original assessment data is
 * preserved — no penalty for acknowledging the warning.
 */
const OVERRIDE_MESSAGE =
  "I understand the risks and want to continue. My original " +
  "assessment will be preserved." ;

/**
 * Secondary supportive message shown below the primary deflection.
 * Reinforces that this is normal and okay.
 */
const SECONDARY_MESSAGE =
  "Big financial decisions deserve a clear head. There's no penalty " +
  "for taking time \u2014 your assessment will be here when you're ready." ;

/**
 * Cooldown explanation shown when a user tries to retake during cooldown.
 */
const COOLDOWN_MESSAGE =
  "You're in a 24-hour reflection period. This isn't a punishment \u2014 " +
  "it's space to breathe. Your previous assessment is saved and waiting." ;

// ---------------------------------------------------------------------------
// Frozen Export Object
// ---------------------------------------------------------------------------

/**
 * The complete deflection copy bundle.
 *
 * IMMUTABLE by design:
 *   - TypeScript: `as const` makes all values literal types
 *   - Runtime: `Object.freeze` prevents property mutation
 *   - Convention: This object must never be modified
 *
 * Any attempt to change these values should be caught in code review
 * as a Safety Canon violation.
 */
export const DEFLECTION_COPY = Object.freeze({
  /** Primary deflection message — the first thing the user sees. */
  primary: PRIMARY_MESSAGE,

  /** Secondary supportive message. */
  secondary: SECONDARY_MESSAGE,

  /** Cooldown period explanation. */
  cooldown: COOLDOWN_MESSAGE,

  /** Crisis resources with full SafetyResource metadata. */
  resources: CRISIS_RESOURCES,

  /** Simplified resource display format for UI components. */
  resourceDisplay: CRISIS_RESOURCE_DISPLAY,

  /** Override acknowledgment text. */
  override: OVERRIDE_MESSAGE,
});

/**
 * Type-safe accessor for the deflection copy.
 * Use this instead of accessing DEFLECTION_COPY directly when you need
 * to ensure the return type is narrow.
 */
export function getDeflectionCopy() {
  return DEFLECTION_COPY;
}

/**
 * Returns the crisis resources in the format expected by the CrisisResult type.
 */
export function getCrisisResources(): SafetyResource[] {
  // Return a new array (shallow copy) so callers can't mutate the original
  return [...CRISIS_RESOURCES];
}
