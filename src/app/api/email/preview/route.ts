import { NextResponse } from "next/server"
import { renderAssessmentCompleteEmail } from "@/lib/email/templates"

export const runtime = "nodejs"

export async function GET() {
  const preview = renderAssessmentCompleteEmail({
    firstName: "Cody",
    verdict: "NOT YET",
    overallScore: 68
  })

  return NextResponse.json({ success: true, data: preview })
}
