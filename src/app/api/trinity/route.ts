import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateTrinityDebate } from '@/lib/trinity/engine'
import { z } from 'zod'

const trinityRequestSchema = z.object({
  assessmentId: z.string().uuid(),
  userQuestion: z.string().optional(),
})

// POST /api/trinity - Generate a Trinity debate
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = trinityRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { assessmentId, userQuestion } = validation.data

    // Get assessment data
    const { data: assessment, error: assessmentError } = await (supabase as any)
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Check if user has access to Trinity (Pro feature)
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const hasTrinityAccess = ['plus', 'pro', 'family'].includes((profile as any)?.subscription_tier || '')
    
    if (!hasTrinityAccess) {
      return NextResponse.json(
        { error: 'Trinity Engine requires Plus or Pro subscription', code: 'UPGRADE_REQUIRED' },
        { status: 403 }
      )
    }

    // Generate Trinity debate
    const debate = await generateTrinityDebate({
      assessmentId,
      userId: user.id,
      decisionType: (assessment as any).decision_type,
      financialScore: assessment.financial_score || 0,
      emotionalScore: assessment.emotional_score || 0,
      timingScore: assessment.timing_score || 0,
      overallScore: assessment.overall_score || 0,
      verdict: assessment.verdict || 'not_yet',
      financialSubScores: assessment.financial_sub_scores || undefined,
      emotionalSubScores: assessment.emotional_sub_scores || undefined,
      timingSubScores: assessment.timing_sub_scores || undefined,
      userQuestion,
    })

    // Store debate in database
    const { error: storeError } = await (supabase as any)
      .from('trinity_debates')
      .insert({
        id: (debate as any).id,
        user_id: user.id,
        assessment_id: assessmentId,
        question: (debate as any).question,
        perspectives: (debate as any).perspectives,
        synthesis: (debate as any).synthesis,
      })

    if (storeError) {
      console.error('Error storing Trinity debate:', storeError)
    }

    return NextResponse.json({ debate })
  } catch (error) {
    console.error('Error in POST /api/trinity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/trinity - Get Trinity debates for a user
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('trinity_debates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId)
    }

    const { data: debates, error } = await query

    if (error) {
      console.error('Error fetching Trinity debates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch debates' },
        { status: 500 }
      )
    }

    return NextResponse.json({ debates })
  } catch (error) {
    console.error('Error in GET /api/trinity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
