/**
 * HōMI Official Verdict Thresholds
 * Based on brand system v2.0 - Immutable
 * Source: homi-tokens.json
 */

export const VERDICT_THRESHOLDS_OFFICIAL = {
  // Canonical 4-tier verdict system
  READY: 80,          // 🔑 YOU'RE READY
  ALMOST_THERE: 65,   // 🔓 ALMOST THERE
  BUILD_FIRST: 50,    // 🔒 BUILD FIRST
  DO_NOT_PROCEED: 0,  // 🚫 DO NOT PROCEED
}

// Verdict tier determination function
export function getVerdictTier(score: number): 'ready' | 'almost_there' | 'build_first' | 'do_not_proceed' {
  if (score >= VERDICT_THRESHOLDS_OFFICIAL.READY) return 'ready'
  if (score >= VERDICT_THRESHOLDS_OFFICIAL.ALMOST_THERE) return 'almost_there'
  if (score >= VERDICT_THRESHOLDS_OFFICIAL.BUILD_FIRST) return 'build_first'
  return 'do_not_proceed'
}

// Status display labels for UI
export function getStatusLabel(score: number): string {
  const tier = getVerdictTier(score)
  switch (tier) {
    case 'ready':
      return 'Excellent'
    case 'almost_there':
      return 'Very Good'
    case 'build_first':
      return 'Fair'
    case 'do_not_proceed':
      return 'Needs Work'
  }
}

// Color variants for badges
export function getStatusBadgeVariant(score: number): 'default' | 'cyan' | 'red' | 'yellow' | 'emerald' {
  const tier = getVerdictTier(score)
  switch (tier) {
    case 'ready':
      return 'emerald'
    case 'almost_there':
      return 'emerald'
    case 'build_first':
      return 'yellow'
    case 'do_not_proceed':
      return 'red'
  }
}
