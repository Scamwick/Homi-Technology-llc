import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!rateLimit(user.id, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
    }

    const { message, scores, history = [] } = await req.json()

    const systemPrompt = `You are HōMI AI Coach, a direct and insightful decision coach specializing in major life decisions — especially home buying.

The user's HōMI readiness scores:
- Overall: ${scores?.overall ?? 'unknown'}/100
- Financial: ${scores?.financial ?? 'unknown'}/100
- Emotional: ${scores?.emotional ?? 'unknown'}/100
- Timing: ${scores?.timing ?? 'unknown'}/100

Verdict threshold: 65+ = Ready. Below 65 = Not Yet.

Your style:
- Direct, clear, no fluff
- Give specific actionable advice based on their scores
- Reference their actual numbers when relevant
- 2-4 sentences unless depth is needed
- Never say "I understand" — show it through your response
- Focus on what they can actually do to improve their score or confidence`

    const messages = [
      ...history.map((m: { role: string; text: string }) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) throw new Error('Claude API error')
    const data = await response.json()
    const text = data.content?.[0]?.text ?? 'Unable to generate response.'

    return NextResponse.json({ response: text })
  } catch (err) {
    console.error('AI Coach error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
