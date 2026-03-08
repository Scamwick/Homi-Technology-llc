import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export const REPORT_BUCKET = "reports"

export function reportPath(args: { userId: string; assessmentId: string; variant: "dark" | "light" }) {
  return `${args.userId}/${args.assessmentId}/${args.variant}.pdf`
}

export async function uploadReport(args: { path: string; buffer: Buffer; contentType?: string }) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.storage.from(REPORT_BUCKET).upload(args.path, args.buffer, {
    contentType: args.contentType ?? "application/pdf",
    upsert: true
  })
  if (error) throw new Error(error.message)
}

export async function createSignedReportUrl(args: { path: string; expiresIn: number }) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.storage.from(REPORT_BUCKET).createSignedUrl(args.path, args.expiresIn)
  if (error) throw new Error(error.message)
  return data.signedUrl
}
