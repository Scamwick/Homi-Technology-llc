import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { reportPath, uploadReport, createSignedReportUrl } from "@/lib/reports/storage"
import { renderReportPdf } from "@/lib/reports/render"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function canAccessPdf(tier: string) {
  return tier === "plus" || tier === "pro" || tier === "family"
}

export const GET = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const variant = (searchParams.get("variant") ?? "dark") as "dark" | "light"
  if (variant !== "dark" && variant !== "light") {
    return NextResponse.json({ success: false, error: { code: "INVALID", message: "Invalid variant" } }, { status: 400 })
  }

  const tier = ctx.profile.subscription_tier ?? "free"
  if (!canAccessPdf(tier)) {
    return NextResponse.json({ success: false, error: { code: "UPGRADE", message: "Upgrade required for PDF reports" } }, { status: 403 })
  }

  const assessmentId = req.url.split("/api/reports/")[1]?.split("/pdf")[0]
  if (!assessmentId) {
    return NextResponse.json({ success: false, error: { code: "MISSING", message: "assessmentId required" } }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { data: a } = await supabase
    .from("assessments")
    .select("id,user_id,created_at,verdict,overall_score,financial_score,emotional_score,timing_score,insights,financial_sub_scores,emotional_sub_scores,timing_sub_scores")
    .eq("id", assessmentId)
    .single()

  if (!a || a.user_id !== ctx.userId) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 })
  }

  const path = reportPath({ userId: ctx.userId, assessmentId, variant })

  try {
    const signed = await createSignedReportUrl({ path, expiresIn: 60 * 10 })
    return NextResponse.redirect(signed)
  } catch {
    // generate below
  }

  const data = {
    appName: "HōMI",
    entity: "HOMI TECHNOLOGIES LLC",
    ein: "39-3779378",
    assessmentId,
    createdAt: a.created_at,
    verdict: a.verdict,
    overall: a.overall_score ?? 0,
    financial: a.financial_score ?? 0,
    emotional: a.emotional_score ?? 0,
    timing: a.timing_score ?? 0,
    insights: a.insights ?? null,
    subScores: {
      financial: a.financial_sub_scores ?? null,
      emotional: a.emotional_sub_scores ?? null,
      timing: a.timing_sub_scores ?? null
    }
  }

  const buf = await renderReportPdf({ data, variant })
  await uploadReport({ path, buffer: buf, contentType: "application/pdf" })

  const signed = await createSignedReportUrl({ path, expiresIn: 60 * 10 })
  return NextResponse.redirect(signed)
})
