import { createSupabaseAdminClient } from "@/lib/supabase/admin"

type PushPayload = {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
}

export async function sendExpoPush(payloads: PushPayload[]) {
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "accept-encoding": "gzip, deflate"
    },
    body: JSON.stringify(payloads)
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json?.errors?.[0]?.message ?? "Expo push send failed")
  return json
}

export async function notifyUser(args: {
  userId: string
  title: string
  body: string
  url?: string
  extraData?: Record<string, unknown>
}) {
  const supabase = createSupabaseAdminClient()
  const { data: tokens, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", args.userId)

  if (error) throw new Error(error.message)
  if (!tokens?.length) return { ok: true, sent: 0 }

  const payloads: PushPayload[] = tokens.map((t) => ({
    to: t.token,
    title: args.title,
    body: args.body,
    data: { url: args.url ?? null, ...(args.extraData ?? {}) }
  }))

  await sendExpoPush(payloads)
  return { ok: true, sent: payloads.length }
}
