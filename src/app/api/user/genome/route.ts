import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const GET = withAuth(async (_req, ctx) => {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from("behavioral_genome").select("*").eq("user_id", ctx.userId).maybeSingle()
  return NextResponse.json({ success: true, data: data ?? null })
})
