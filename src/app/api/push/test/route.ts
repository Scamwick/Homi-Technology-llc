import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { notifyUser } from "@/lib/push/expo"

export const dynamic = "force-dynamic"

export const POST = withAuth(async (_req, ctx) => {
  const out = await notifyUser({
    userId: ctx.userId,
    title: "HōMI",
    body: "Push notifications are live.",
    url: "/(tabs)/dashboard"
  })
  return NextResponse.json({ success: true, data: out })
})
