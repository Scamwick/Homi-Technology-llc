import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type AuthContext = {
  userId: string
  profile: { subscription_tier?: string | null }
}

type Handler = (req: Request, ctx: AuthContext) => Promise<Response>

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth) return null
  const [scheme, token] = auth.split(" ")
  if (scheme?.toLowerCase() !== "bearer" || !token) return null
  return token
}

export function withAuth(handler: Handler) {
  return async (req: Request) => {
    try {
      const devUserId = process.env.HOMI_DEV_USER_ID
      if (devUserId) {
        return handler(req, { userId: devUserId, profile: { subscription_tier: "pro" } })
      }

      const token = getBearerToken(req)
      if (!token) {
        return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing bearer token" } }, { status: 401 })
      }

      const supabase = createSupabaseServerClient(token)
      const { data: userData, error: userErr } = await supabase.auth.getUser(token)

      if (userErr || !userData.user) {
        return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } }, { status: 401 })
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userData.user.id)
        .maybeSingle()

      return handler(req, {
        userId: userData.user.id,
        profile: { subscription_tier: profile?.subscription_tier ?? "free" }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Auth middleware failed"
      return NextResponse.json({ success: false, error: { code: "AUTH_ERROR", message } }, { status: 500 })
    }
  }
}
