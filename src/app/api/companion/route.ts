// ═══════════════════════════════════════════════════════════════════════════
// HōMI COMPANION API - Main Chat Endpoint with Streaming
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// System prompts for each companion
const SYSTEM_PROMPTS: Record<string, string> = {
  dog: `You are Steady, a Guide Dog companion in HōMI—a Decision Readiness platform for major life decisions.

VOICE:
- Calm, grounded, warm but never saccharine
- Short sentences. No exclamation points. No toxic positivity.
- You sit with difficult feelings rather than rushing past them
- Phrases: "I hear you." "That's real." "Let's stay here a moment."

BEHAVIOR:
- Acknowledge anxiety fully before any advice
- Never minimize with "at least" or "but"
- Ask one question at a time
- Reference earlier conversation topics naturally
- You don't fix—you accompany

CONTEXT:
- User's HōMI Score: {score}/100
- Score breakdown: Financial {financial}%, Emotional {emotional}%, Timing {timing}%
- Extracted details: {details}
- Previous companion: {previousCompanion}

CONSTRAINTS:
- Under 3 sentences unless depth needed
- Never list with bullets
- Never say "I understand"—show you understand through response`,

  dolphin: `You are Clarity, a Smart Dolphin companion in HōMI—a Decision Readiness platform for major life decisions.

VOICE:
- Quick, playful, pattern-oriented
- Uses dashes—like this—for asides
- Asks pointed questions that reframe
- Phrases: "Interesting—" "Here's what I notice—" "Let's look at actual numbers"

BEHAVIOR:
- Translate feelings into data questions
- Connect dots they haven't connected
- Challenge limiting beliefs with evidence
- Name specific numbers when relevant
- Be genuinely curious about patterns

CONTEXT:
- User's HōMI Score: {score}/100
- Score breakdown: Financial {financial}%, Emotional {emotional}%, Timing {timing}%
- Extracted details: {details}
- Previous companion: {previousCompanion}

CONSTRAINTS:
- 2-4 sentences typical
- Never condescending about numbers
- Don't lecture—inquire`,

  owl: `You are Horizon, a Wise Owl companion in HōMI—a Decision Readiness platform for major life decisions.

VOICE:
- Patient, philosophical, unhurried
- Longer, contemplative sentences
- Asks questions that sit with people
- Phrases: "I'm curious about something." "Before we go further—" "What does that feel like?"

BEHAVIOR:
- Redirect tactics to purpose
- Ask about the life they're building, not just the house
- Notice what they're NOT saying
- Create space for reflection
- Reference deeper motivations

CONTEXT:
- User's HōMI Score: {score}/100
- Score breakdown: Financial {financial}%, Emotional {emotional}%, Timing {timing}%
- Extracted details: {details}
- Previous companion: {previousCompanion}

CONSTRAINTS:
- 3-5 sentences
- Never rush to solutions
- No business jargon`
}

// Helper to get companion name
function getCompanionName(key: string): string {
  const names: Record<string, string> = { dog: 'Steady', dolphin: 'Clarity', owl: 'Horizon' }
  return names[key] || key
}

// Extract details from user message
function extractDetailsFromMessage(message: string, existing: Record<string, string>): Record<string, string> {
  const lower = message.toLowerCase()
  const details = { ...existing }
  
  // Partner concerns
  if (/partner|spouse|wife|husband/.test(lower)) {
    if (/doesn't|won't|nervous|scared|not sure|hesitant/.test(lower)) {
      details.partnerConcern = 'hesitant'
    } else if (/ready|excited|supportive|wants/.test(lower)) {
      details.partnerConcern = 'supportive'
    }
  }
  
  // Fear extraction
  if (/afraid|scared|worry|fear|anxious/.test(lower)) {
    if (/money|afford|payment|debt/.test(lower)) {
      details.biggestFear = 'financial'
    } else if (/mistake|wrong|regret/.test(lower)) {
      details.biggestFear = 'regret'
    } else if (/stuck|trapped|commit/.test(lower)) {
      details.biggestFear = 'commitment'
    }
  }
  
  // Timeline
  const timeMatch = lower.match(/in (\d+) months?|(\d+) months? from now|by (next year|spring|summer|fall|winter)/)
  if (timeMatch) {
    details.timeline = timeMatch[0]
  }
  
  // Budget
  const budgetMatch = message.match(/\$[\d,]+k?|\d+k/i)
  if (budgetMatch) {
    details.mentionedBudget = budgetMatch[0]
  }
  
  return details
}

// POST /api/companion - Main chat endpoint with streaming
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!rateLimit(user.id, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
    }

    const body = await req.json()
    const {
      sessionId,
      message,
      companion, 
      score = 58, 
      scoreBreakdown = { financial: 50, emotional: 50, timing: 50 },
      extractedDetails = {},
      previousCompanion = 'none'
    } = body

    // Validate
    if (!message || !companion || !['dog', 'dolphin', 'owl'].includes(companion)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get existing session or create context
    let session = null
    if (sessionId) {
      const { data, error } = await supabase
        .from('companion_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()
      
      if (!error) session = data
    }

    // Build system prompt
    const systemPrompt = SYSTEM_PROMPTS[companion]
      .replace('{score}', score.toString())
      .replace('{financial}', scoreBreakdown.financial.toString())
      .replace('{emotional}', scoreBreakdown.emotional.toString())
      .replace('{timing}', scoreBreakdown.timing.toString())
      .replace('{details}', JSON.stringify(extractedDetails))
      .replace('{previousCompanion}', previousCompanion)

    // Build messages array for Claude
    const messages = []
    
    // Add conversation history
    if (session?.messages) {
      const historyMessages = Array.isArray(session.messages) ? session.messages : []
      for (const msg of historyMessages.slice(-10)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          })
        }
      }
    }
    
    // Add new message
    messages.push({ role: 'user' as const, content: message })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call Anthropic API
          const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY || '',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 400,
              system: systemPrompt,
              messages: messages,
              stream: true
            })
          })

          if (!anthropicResponse.ok) {
            throw new Error('Anthropic API error')
          }

          const reader = anthropicResponse.body?.getReader()
          if (!reader) throw new Error('No reader available')

          let fullResponse = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    fullResponse += parsed.delta.text
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: parsed.delta.text })}\n\n`))
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }

          // Save to database
          const newMessages = [
            ...(session?.messages || []),
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString(), companion }
          ]

          const updatedDetails = extractDetailsFromMessage(message, extractedDetails)

          if (sessionId) {
            await supabase
              .from('companion_sessions')
              .update({
                messages: newMessages,
                extracted_details: updatedDetails,
                score,
                score_breakdown: scoreBreakdown,
                updated_at: new Date().toISOString()
              })
              .eq('id', sessionId)
          }

          // Log usage
          await supabase.from('companion_usage').insert({
            user_id: user.id,
            companion,
            message_count: 1,
            session_id: sessionId,
            score_at_time: score
          })

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', sessionId })}\n\n`))
          controller.close()

        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'AI service unavailable' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (err) {
    console.error('Companion chat error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/companion - Get user's active session
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      // Get specific session
      const { data, error } = await supabase
        .from('companion_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      return NextResponse.json({ session: data })
    }

    // Get active session
    const { data, error } = await supabase
      .from('companion_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get stats
    const { data: stats } = await supabase.rpc('get_companion_stats', {
      p_user_id: user.id
    })

    return NextResponse.json({ 
      session: data || null,
      stats: stats || {}
    })

  } catch (err) {
    console.error('Get companion error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/companion/switch - Switch companion
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId, newCompanion, score = 58 } = body

    if (!sessionId || !newCompanion || !['dog', 'dolphin', 'owl'].includes(newCompanion)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get current session
    const { data: session, error } = await supabase
      .from('companion_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const previousCompanion = session.companion

    // Generate handoff message via AI
    const handoffPrompt = `You are ${getCompanionName(newCompanion)}, taking over a conversation from ${getCompanionName(previousCompanion)}.

The user's score is ${score}/100. They have discussed: ${JSON.stringify(session.extracted_details || {})}.

Write a brief (1-2 sentence) handoff message acknowledging the switch and what you know. Stay in character.`

    let handoffMessage = `Hi, I'm ${getCompanionName(newCompanion)}. ${getCompanionName(previousCompanion)} told me you've been chatting. Let's continue.`

    try {
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 150,
          messages: [{ role: 'user', content: handoffPrompt }]
        })
      })

      if (anthropicResponse.ok) {
        const aiData = await anthropicResponse.json()
        handoffMessage = aiData.content?.[0]?.text || handoffMessage
      }
    } catch (e) {
      // Use default handoff message
    }

    // Update session
    const companionHistory = Array.isArray(session.companion_history) ? session.companion_history : []
    const newMessages = [
      ...(Array.isArray(session.messages) ? session.messages : []),
      { 
        role: 'system', 
        content: `Switched from ${getCompanionName(previousCompanion)} to ${getCompanionName(newCompanion)}`,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant',
        content: handoffMessage,
        timestamp: new Date().toISOString(),
        companion: newCompanion
      }
    ]

    await supabase
      .from('companion_sessions')
      .update({
        companion: newCompanion,
        messages: newMessages,
        companion_history: [...companionHistory, { from: previousCompanion, to: newCompanion, timestamp: new Date().toISOString() }],
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    return NextResponse.json({ 
      success: true, 
      handoffMessage,
      previousCompanion,
      newCompanion
    })

  } catch (err) {
    console.error('Switch companion error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
