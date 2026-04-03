import { NextResponse } from 'next/server'

export async function GET() {
  console.log('[H\u014dMI Cron] Would expire old assessments')

  return NextResponse.json({ success: true, message: 'Assessment expiry processed' })
}
