import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { inferGenome } from "@/lib/behavioral-genome/inference"

export const dynamic = "force-dynamic"

export const POST = withAuth(async (_req, ctx) => {
  const supabase = createSupabaseServerClient()

  const { data: events } = await supabase
    .from("behavioral_events")
    .select("event_type,event_data,timestamp")
    .eq("user_id", ctx.userId)
    .order("timestamp", { ascending: false })
    .limit(500)

  const times: number[] = []
  let revisions = 0
  let jumps = 0
  let trinityExpands = 0
  let overrideHover = 0
  let overrideClick = 0
  let narrativeTime = 0
  let tableTime = 0
  const percentiles = new Set<number>()
  let worstMs = 0
  let medianMs = 0
  let returnVisits = 0

  for (const e of events ?? []) {
    const d = (e.event_data ?? {}) as Record<string, unknown>
    if (e.event_type === "question_time_spent") times.push(Number(d.time_spent_ms ?? 0))
    if (e.event_type === "input_revised") revisions += 1
    if (e.event_type === "section_navigated") jumps += 1
    if (e.event_type === "trinity_perspective_expanded") trinityExpands += 1
    if (e.event_type === "override_button_interaction") {
      overrideHover += Number(d.hovers ?? 0)
      overrideClick += Number(d.clicks ?? 0)
    }
    if (e.event_type === "result_section_viewed") {
      narrativeTime += Number(d.narrative_ms ?? 0)
      tableTime += Number(d.data_ms ?? 0)
    }
    if (e.event_type === "monte_carlo_percentile_focused") {
      const p = Number(d.percentile)
      if (Number.isFinite(p)) percentiles.add(p)
      if (p === 5) worstMs += Number(d.time_ms ?? 0)
      if (p === 50) medianMs += Number(d.time_ms ?? 0)
    }
    if (e.event_type === "return_visit") returnVisits += 1
  }

  const sorted = [...times].sort((a,b)=>a-b)
  const medianQuestionTimeMs = sorted.length ? sorted[Math.floor(sorted.length/2)] : 0
  const mean = times.length ? times.reduce((s,x)=>s+x,0)/times.length : 0
  const variance = times.length ? times.reduce((s,x)=>s+(x-mean)*(x-mean),0)/times.length : 0

  const signals = {
    medianQuestionTimeMs,
    questionTimeVarianceMs: variance,
    revisionsPerQuestion: times.length ? revisions / times.length : 0,
    jumpedSections: jumps,
    resultFocus: {
      percentilesViewed: Array.from(percentiles),
      timeOnWorstCaseMs: worstMs,
      timeOnMedianMs: medianMs
    },
    trinityExpands,
    narrativeTimeMs: narrativeTime,
    dataTableTimeMs: tableTime,
    overrideHoverCount: overrideHover,
    overrideClickCount: overrideClick,
    returnVisits7d: returnVisits
  }

  const scores = inferGenome(signals)

  const { data: existing } = await supabase
    .from("behavioral_genome")
    .select("id")
    .eq("user_id", ctx.userId)
    .maybeSingle()

  const payload = {
    user_id: ctx.userId,
    dimension_scores: scores,
    raw_signals: signals,
    inference_version: 1
  }

  const { data, error } = existing?.id
    ? await supabase.from("behavioral_genome").update(payload).eq("id", existing.id).select("*").single()
    : await supabase.from("behavioral_genome").insert(payload).select("*").single()

  if (error) return NextResponse.json({ success: false, error: { code: "DB", message: error.message } }, { status: 500 })

  return NextResponse.json({ success: true, data })
})
