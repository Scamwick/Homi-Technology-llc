export const HOMI_DIMENSION_WEIGHTS = {
  financial: 0.35,
  emotional: 0.35,
  timing: 0.3
} as const

export type HomiDimension = keyof typeof HOMI_DIMENSION_WEIGHTS

export const HOMI_DIMENSION_LABELS: Record<HomiDimension, string> = {
  financial: "Financial Reality",
  emotional: "Emotional Truth",
  timing: "Perfect Timing"
}

export function calculateWeightedReadinessScore(scores: Record<HomiDimension, number>) {
  const weighted =
    scores.financial * HOMI_DIMENSION_WEIGHTS.financial +
    scores.emotional * HOMI_DIMENSION_WEIGHTS.emotional +
    scores.timing * HOMI_DIMENSION_WEIGHTS.timing

  return Math.round(weighted)
}
