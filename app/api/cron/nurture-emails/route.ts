import { NextResponse } from 'next/server'

export async function GET() {
  console.log('[H\u014dMI Cron] Would send nurture emails')

  return NextResponse.json({ success: true, message: 'Nurture emails processed' })
}
