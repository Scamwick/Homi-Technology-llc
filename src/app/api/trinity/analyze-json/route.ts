import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { TrinityEngine } from "@/lib/trinity/engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json().catch(() => ({}))
  const assessmentId = body?.assessmentId as string | undefined
  if (!assessmentId) {
    return NextResponse.json({ success: false, error: { code: "MISSING", message: "assessmentId required" } }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const { data: a } = await supabase
    .from("assessments")
    .select("id,user_id,decision_type,overall_score,financial_score,emotional_score,timing_score,verdict,financial_sub_scores,emotional_sub_scores,timing_sub_scores")
    .eq("id", assessmentId)
    .single()

  if (!a || a.user_id !== ctx.userId) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 })
  }

  const tier = ctx.profile.subscription_tier ?? "free"

  const { data: cached } = await supabase
    .from("trinity_analyses")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cached) {
    const created = new Date(cached.created_at).getTime()
    const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24)
    if (ageDays <= 30) {
      return NextResponse.json({
        success: true,
        data: {
          cached: true,
          advocate: cached.advocate_content,
          skeptic: cached.skeptic_content,
          arbiter: cached.arbiter_content
        }
      })
    }
  }

  const fin = a.financial_score ?? 0
  const emo = a.emotional_score ?? 0
  const tim = a.timing_score ?? 0
  const overall = a.overall_score ?? 0

  const strengths = [
    ...(a.financial_sub_scores?.strengths ?? []),
    ...(a.emotional_sub_scores?.strengths ?? []),
    ...(a.timing_sub_scores?.strengths ?? [])
  ]
  const weaknesses = [
    ...(a.financial_sub_scores?.weaknesses ?? []),
    ...(a.emotional_sub_scores?.weaknesses ?? []),
    ...(a.timing_sub_scores?.weaknesses ?? [])
  ]
  const redFlags = [
    ...(a.financial_sub_scores?.red_flags ?? []),
    ...(a.emotional_sub_scores?.red_flags ?? []),
    ...(a.timing_sub_scores?.red_flags ?? [])
  ]

  const engine = new TrinityEngine()
  const result = await engine.analyze(
    {
      decisionType: a.decision_type,
      verdict: a.verdict,
      overallScore: overall,
      financialScore: fin,
      emotionalScore: emo,
      timingScore: tim,
      redFlags,
      strengths,
      weaknesses
    },
    tier
  )

  await admin.from("trinity_analyses").insert({
    assessment_id: assessmentId,
    user_id: ctx.userId,
    advocate_content: result.advocate?.content ?? null,
    skeptic_content: result.skeptic?.content ?? null,
    arbiter_content: result.arbiter.content,
    model_used: result.arbiter.model
  })

  return NextResponse.json({
    success: true,
    data: {
      cached: false,
      advocate: result.advocate?.content ?? null,
      skeptic: result.skeptic?.content ?? null,
      arbiter: result.arbiter.content
    }
  })
})
