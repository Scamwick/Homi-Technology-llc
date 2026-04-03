/**
 * Safety Canon — Barrel Export
 * =============================
 *
 * The Safety Canon is HōMI's constitutionally binding ethical guardrail
 * system. It cannot be bypassed, disabled, or overridden by feature flags,
 * A/B tests, or configuration changes.
 *
 * Three modules compose the Safety Canon:
 *
 *   1. Crisis Detection  — Monitors signals, determines if intervention needed
 *   2. Deflection         — Immutable copy and resources shown during intervention
 *   3. Cooldown           — 24-hour reflection period management
 *
 * Usage:
 *   import { detectCrisis, collectSignals, DEFLECTION_COPY, setCooldown, checkCooldown } from '@/lib/safety';
 */

// Crisis Detection Engine
export {
  detectCrisis,
  collectSignals,
  detectRapidAnswerChanges,
  detectExtremeSliderValues,
  detectSessionAnomaly,
  detectFomoConfidenceConflict,
  detectPanicBuying,
  detectExtremeLowConfidence,
  detectPartnerConflict,
  detectDistressLanguage,
} from './crisis-detection';

// Deflection Copy
export {
  DEFLECTION_COPY,
  getDeflectionCopy,
  getCrisisResources,
} from './deflection';

// Cooldown Management
export {
  setCooldown,
  checkCooldown,
  clearCooldown,
  checkCooldownServer,
  setCooldownServer,
} from './cooldown';
export type { CooldownStatus } from './cooldown';
