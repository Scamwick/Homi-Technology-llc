import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  // Store in memory for now (TODO: Supabase)
  console.log('[HoMI Waitlist]', email)
  return NextResponse.json({ success: true })
}
