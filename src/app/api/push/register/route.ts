import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json().catch(() => ({}))

  const token = body?.token as string | undefined
  const platform = body?.platform as "ios" | "android" | undefined
  const device_id = body?.device_id as string | undefined
  const device_model = body?.device_model as string | undefined
  const app_version = body?.app_version as string | undefined

  if (!token || !platform) {
    return NextResponse.json({ success: false, error: { code: "MISSING", message: "token + platform required" } }, { status: 400 })
  }
  if (platform !== "ios" && platform !== "android") {
    return NextResponse.json({ success: false, error: { code: "INVALID", message: "invalid platform" } }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: ctx.userId,
      token,
      platform,
      device_id: device_id ?? null,
      device_model: device_model ?? null,
      app_version: app_version ?? null
    },
    { onConflict: "user_id,token" }
  )

  if (error) {
    return NextResponse.json({ success: false, error: { code: "DB", message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})
