import type { TemporalContext, TemporalHorizon, TemporalMessage } from "@/types/temporal-twin"
import { callAnthropic } from "@/lib/ai/anthropic"

function horizonToYears(h: TemporalHorizon) {
  if (h === "5yr") return 5
  if (h === "10yr") return 10
  return 30
}

function systemPrompt(futureAge: number) {
  return [
    `You are writing as the user's future self at age ${futureAge}.`,
    "You are looking back at the decision they are making right now.",
    "Write a personal, warm, specific letter. Reference their actual scores and situation.",
    "Be authentic — this should feel like a real person wrote it, not an AI.",
    "Treat the scoring model as canonical: Financial Reality (35%), Emotional Truth (35%), Perfect Timing (30%).",
    "Use first person. 3–5 sentences maximum.",
    `Sign off with: — You, age ${futureAge}`,
    "Never use bullet points."
  ].join(" ")
}

function toneByVerdict(verdict: string) {
  if (verdict === "ready") return "Tone: gratitude, encouragement, calm confidence."
  return "Tone: compassion, protection, patience. No hype."
}

function buildUserPrompt(ctx: TemporalContext, horizon: TemporalHorizon, currentAge: number) {
  const years = horizonToYears(horizon)
  const futureAge = currentAge + years

  return [
    `Current age: ${currentAge}`,
    `Write as: age ${futureAge}`,
    `Decision type: ${ctx.decisionType}`,
    `Verdict: ${ctx.verdict} (overall ${ctx.overallScore}/100)`,
    "Canonical weights: Financial Reality 35%, Emotional Truth 35%, Perfect Timing 30%.",
    `Financial: ${ctx.financialScore}/100, Emotional: ${ctx.emotionalScore}/100, Timing: ${ctx.timingScore}/100`,
    ctx.mcMedian !== undefined ? `Monte Carlo median outcome (wealth): ${Math.round(ctx.mcMedian)}` : "",
    `Strengths: ${ctx.strengths.length ? ctx.strengths.join(", ") : "none"}`,
    `Weaknesses: ${ctx.weaknesses.length ? ctx.weaknesses.join(", ") : "none"}`,
    ctx.transformationPriority ? `Transformation priority: ${ctx.transformationPriority}` : "",
    toneByVerdict(ctx.verdict),
    `Horizon: ${horizon} (keep it specific to this timeframe)`
  ].filter(Boolean).join("\n")
}

export class TemporalTwinEngine {
  async generate(args: {
    context: TemporalContext
    horizon: TemporalHorizon
    currentAge: number
  }): Promise<TemporalMessage> {
    const { context, horizon, currentAge } = args
    const years = horizonToYears(horizon)
    const futureAge = currentAge + years
    const generated_at = new Date().toISOString()

    const out = await callAnthropic({
      system: systemPrompt(futureAge),
      user: buildUserPrompt(context, horizon, currentAge),
      maxTokens: 220,
      temperature: 0.7
    })

    const signature = `— You, age ${futureAge}`
    const content = out.text.trim()

    return {
      horizon,
      futureAge,
      content,
      signature,
      assessment_id: "",
      generated_at
    }
  }
}
