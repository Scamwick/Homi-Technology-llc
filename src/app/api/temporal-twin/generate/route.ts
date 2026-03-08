import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import type { TemporalHorizon } from "@/types/temporal-twin"
import { TemporalTwinEngine } from "@/lib/temporal-twin/engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const allowed: TemporalHorizon[] = ["5yr", "10yr", "retirement"]

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json().catch(() => ({}))
  const assessmentId = body?.assessmentId as string | undefined
  const horizon = body?.horizon as TemporalHorizon | "all" | undefined
  const currentAge = Number(body?.currentAge ?? 35)

  if (!assessmentId) {
    return NextResponse.json({ success: false, error: { code: "MISSING", message: "assessmentId required" } }, { status: 400 })
  }
  if (!horizon || (horizon !== "all" && !allowed.includes(horizon))) {
    return NextResponse.json({ success: false, error: { code: "INVALID", message: "Invalid horizon" } }, { status: 400 })
  }
  if (!Number.isFinite(currentAge) || currentAge < 18 || currentAge > 100) {
    return NextResponse.json({ success: false, error: { code: "INVALID", message: "Invalid age" } }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const { data: a } = await supabase
    .from("assessments")
    .select("id,user_id,decision_type,overall_score,financial_score,emotional_score,timing_score,verdict,financial_sub_scores,emotional_sub_scores,timing_sub_scores,insights,created_at")
    .eq("id", assessmentId)
    .single()

  if (!a || a.user_id !== ctx.userId) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 })
  }

  const tier = ctx.profile.subscription_tier ?? "free"
  const requested = horizon === "all"
    ? (tier === "free" ? (["5yr"] as TemporalHorizon[]) : (["5yr","10yr","retirement"] as TemporalHorizon[]))
    : ([horizon] as TemporalHorizon[])

  if (tier === "free" && requested.some((h) => h !== "5yr")) {
    return NextResponse.json({ success: false, error: { code: "UPGRADE", message: "Upgrade required for this horizon" } }, { status: 403 })
  }

  const { data: cached } = await supabase
    .from("temporal_messages")
    .select("*")
    .eq("assessment_id", assessmentId)
    .in("horizon", requested as string[])

  type CachedTemporalRow = {
    horizon: string
    future_age: number
    content: string
    created_at: string
  }

  const cachedMap = new Map<string, CachedTemporalRow>()
  for (const row of cached ?? []) cachedMap.set(row.horizon, row)

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

  const engine = new TemporalTwinEngine()
  const context = {
    decisionType: a.decision_type,
    verdict: a.verdict,
    overallScore: overall,
    financialScore: fin,
    emotionalScore: emo,
    timingScore: tim,
    strengths,
    weaknesses,
    transformationPriority: a.insights?.transformation_priority ?? null
  }

  const out: {
    messages: Record<string, {
      horizon: TemporalHorizon
      futureAge: number
      content: string
      signature: string
      assessment_id: string
      generated_at: string
    }>
  } = { messages: {} }

  for (const h of requested) {
    const c = cachedMap.get(h)
    if (c) {
      out.messages[h === "5yr" ? "fiveYear" : h === "10yr" ? "tenYear" : "retirement"] = {
        horizon: h,
        futureAge: c.future_age,
        content: c.content,
        signature: `— You, age ${c.future_age}`,
        assessment_id: assessmentId,
        generated_at: c.created_at
      }
      continue
    }

    const msg = await engine.generate({ context, horizon: h, currentAge })
    await admin.from("temporal_messages").upsert({
      assessment_id: assessmentId,
      user_id: ctx.userId,
      horizon: h,
      future_age: msg.futureAge,
      content: msg.content
    }, { onConflict: "assessment_id,horizon" })

    out.messages[h === "5yr" ? "fiveYear" : h === "10yr" ? "tenYear" : "retirement"] = {
      ...msg,
      assessment_id: assessmentId
    }
  }

  return NextResponse.json({ success: true, data: out })
})
