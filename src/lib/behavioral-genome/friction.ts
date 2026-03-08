export function frictionProfile(scores: Record<string, number>) {
  const loss = scores.loss_aversion ?? 50
  const conf = scores.confidence_calibration ?? 50
  const social = scores.social_proof_sensitivity ?? 50
  const narrative = scores.narrative_bias ?? 50

  return {
    addProceedConfirmations: loss >= 70,
    showMoreTooltips: conf <= 45,
    showPeerComparisons: social >= 70,
    leadWithNarratives: narrative >= 70
  }
}
