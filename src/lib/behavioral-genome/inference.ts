import type { GenomeScore, GenomeDimension, GenomeConfidence } from "@/types/behavioral-genome"

type Signals = {
  medianQuestionTimeMs: number
  questionTimeVarianceMs: number
  revisionsPerQuestion: number
  jumpedSections: number
  resultFocus: {
    percentilesViewed: number[]
    timeOnWorstCaseMs: number
    timeOnMedianMs: number
  }
  trinityExpands: number
  narrativeTimeMs: number
  dataTableTimeMs: number
  overrideHoverCount: number
  overrideClickCount: number
  returnVisits7d: number
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function conf(score: number) {
  const s = Math.abs(score - 50)
  if (s > 25) return "high"
  if (s > 12) return "medium"
  return "low"
}

export function inferGenome(signals: Signals): GenomeScore[] {
  const now = new Date().toISOString()

  const lossAversion = clamp(
    50 +
      (signals.resultFocus.timeOnWorstCaseMs - signals.resultFocus.timeOnMedianMs) / 2000 +
      (signals.resultFocus.percentilesViewed.includes(5) ? 10 : 0) +
      (signals.resultFocus.percentilesViewed.includes(10) ? 6 : 0)
  )

  const timePerception = clamp(
    50 +
      (signals.medianQuestionTimeMs > 8000 ? 12 : signals.medianQuestionTimeMs > 5000 ? 6 : -6) +
      (signals.jumpedSections > 2 ? -8 : 4)
  )

  const confidenceCalibration = clamp(
    60 - signals.revisionsPerQuestion * 8 - (signals.medianQuestionTimeMs < 2500 ? 10 : 0) + (signals.medianQuestionTimeMs > 9000 ? 6 : 0)
  )

  const volatilityTolerance = clamp(
    50 + (signals.resultFocus.timeOnMedianMs > 4000 ? 6 : 0) - (signals.resultFocus.timeOnWorstCaseMs > 9000 ? 10 : 0) +
      (signals.resultFocus.percentilesViewed.includes(95) ? 6 : 0)
  )

  const regretAsymmetry = clamp(45 + signals.returnVisits7d * 6 + signals.overrideHoverCount * 2 + signals.overrideClickCount * 6)

  const socialProof = clamp(40 + signals.returnVisits7d * 4 + signals.jumpedSections * 3)

  const narrativeBias = clamp(50 + (signals.narrativeTimeMs - signals.dataTableTimeMs) / 2000)

  const agencyAttribution = clamp(55 + signals.revisionsPerQuestion * 4 - signals.overrideClickCount * 4)

  const outcomeBias = clamp(50 + (signals.dataTableTimeMs < 2000 ? 8 : -4) + (signals.jumpedSections > 2 ? 6 : 0))

  const dims: Record<GenomeDimension, number> = {
    loss_aversion: lossAversion,
    time_perception: timePerception,
    confidence_calibration: confidenceCalibration,
    volatility_tolerance: volatilityTolerance,
    regret_asymmetry: regretAsymmetry,
    social_proof_sensitivity: socialProof,
    narrative_bias: narrativeBias,
    agency_attribution: agencyAttribution,
    outcome_bias: outcomeBias
  }

  return (Object.entries(dims) as [GenomeDimension, number][]).map(([dimension, score]) => ({
    dimension,
    score,
    confidence: conf(score) as GenomeConfidence,
    last_updated: now
  }))
}
