// ═══════════════════════════════════════════════════════════════════════════
// HōMI COMPANION SESSIONS API
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/companion/sessions - Create new session
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { companion, score = 58, scoreBreakdown = { financial: 50, emotional: 50, timing: 50 } } = body

    if (!companion || !['dog', 'dolphin', 'owl'].includes(companion)) {
      return NextResponse.json({ error: 'Invalid companion' }, { status: 400 })
    }

    // Check for existing active session
    const { data: existing } = await supabase
      .from('companion_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) {
      return NextResponse.json({ 
        session: existing,
        message: 'Existing active session found'
      })
    }

    // Generate greeting based on companion and score
    const range = score < 40 ? 'low' : score < 70 ? 'mid' : 'high'
    const greetings: Record<string, Record<string, string>> = {
      dog: {
        low: `Hey. Score is ${score}. Things feel heavy. But I'm here.`,
        mid: `Good to see you. ${score}—that's progress. What's on your mind?`,
        high: `You've been showing up. ${score}. What's next?`,
      },
      dolphin: {
        low: `Alright, ${score}. Let's not spiral—let's understand.`,
        mid: `${score}—interesting zone. What to optimize?`,
        high: `${score}. Fundamentals solid. What's the question?`,
      },
      owl: {
        low: `Score says ${score}. But first—what does home feel like?`,
        mid: `${score}. Building toward what you want, or away from fear?`,
        high: `${score}. Nearly ready. What question haven't you asked?`,
      },
    }

    const greeting = greetings[companion][range]

    // Create new session
    const { data: newSession, error } = await supabase
      .from('companion_sessions')
      .insert({
        user_id: user.id,
        companion,
        score,
        score_breakdown: scoreBreakdown,
        messages: [
          { role: 'assistant', content: greeting, timestamp: new Date().toISOString(), companion }
        ],
        extracted_details: {},
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      session: newSession,
      greeting
    })

  } catch (err) {
    console.error('Create session error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/companion/sessions - List user's sessions
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('companion_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sessions: data })

  } catch (err) {
    console.error('List sessions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
