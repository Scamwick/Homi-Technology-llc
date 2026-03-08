import { HOMI_MESSAGING } from "@homi/shared"

export function renderAssessmentCompleteEmail(args: {
  firstName?: string
  verdict: string
  overallScore: number
}) {
  const dims = HOMI_MESSAGING.model.dimensions
    .map((d) => `${d.name} (${Math.round(d.weight * 100)}%)`)
    .join(", ")

  return {
    subject: `${HOMI_MESSAGING.brand.name}: Your readiness result is in`,
    text: [
      `Hi ${args.firstName ?? "there"},`,
      "",
      `Verdict: ${args.verdict}`,
      `Overall Score: ${args.overallScore}/100`,
      `Model: ${dims}`,
      "",
      HOMI_MESSAGING.trust.body,
      HOMI_MESSAGING.model.verdictRules[2]
    ].join("\n")
  }
}
