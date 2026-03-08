import { callAnthropic } from "@/lib/ai/anthropic"

type TrinityInput = {
  decisionType: string
  verdict: string | null
  overallScore: number
  financialScore: number
  emotionalScore: number
  timingScore: number
  redFlags: string[]
  strengths: string[]
  weaknesses: string[]
}

type RoleOutput = { content: string; model: string }

export class TrinityEngine {
  async analyze(input: TrinityInput, tier: string) {
    const common = [
      `Decision: ${input.decisionType}`,
      `Verdict: ${input.verdict ?? "unknown"}`,
      `Overall: ${input.overallScore}`,
      `Financial: ${input.financialScore}`,
      `Emotional: ${input.emotionalScore}`,
      `Timing: ${input.timingScore}`,
      "Canonical weights: Financial Reality 35%, Emotional Truth 35%, Perfect Timing 30%.",
      `Strengths: ${input.strengths.join(", ") || "none"}`,
      `Weaknesses: ${input.weaknesses.join(", ") || "none"}`,
      `Red flags: ${input.redFlags.join(", ") || "none"}`
    ].join("\n")

    const [advocate, skeptic, arbiter] = await Promise.all([
      callAnthropic({
        system: "You are the Advocate. Explain why the user could proceed safely if guardrails are respected. 4 short sentences.",
        user: common
      }),
      callAnthropic({
        system: "You are the Skeptic. Explain downside risks and what must be true before proceeding. 4 short sentences.",
        user: common
      }),
      callAnthropic({
        system: "You are the Arbiter. Produce a balanced final recommendation with explicit protection framing and next actions. 4 short sentences.",
        user: common
      })
    ])

    const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022"

    return {
      advocate: tier === "free" ? null : ({ content: advocate.text, model } as RoleOutput),
      skeptic: tier === "free" ? null : ({ content: skeptic.text, model } as RoleOutput),
      arbiter: { content: arbiter.text, model } as RoleOutput
    }
  }
}
