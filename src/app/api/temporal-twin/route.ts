import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  scheduledFor: z.string().datetime(),
  category: z.enum(['reminder', 'encouragement', 'goal', 'reflection', 'question']),
  assessmentId: z.string().uuid().optional(),
})

// GET /api/temporal-twin - Get user's future messages
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'delivered', 'all'

    let query = supabase
      .from('future_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true })

    if (status === 'pending') {
      query = query.eq('delivered', false)
    } else if (status === 'delivered') {
      query = query.eq('delivered', true)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching future messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error in GET /api/temporal-twin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/temporal-twin - Create a new future message
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createMessageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { content, scheduledFor, category, assessmentId } = validation.data

    // Validate scheduled date is in the future
    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      )
    }

    const { data: message, error } = await supabase
      .from('future_messages')
      .insert({
        user_id: user.id,
        content,
        scheduled_for: scheduledFor,
        category,
        assessment_id: assessmentId,
        delivered: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating future message:', error)
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/temporal-twin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
