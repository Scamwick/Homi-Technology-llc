import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createAssessmentSchema = z.object({
  decisionType: z.enum(['home_buying', 'career_change', 'investment', 'business_launch', 'major_purchase']),
})

// POST /api/couples/assessments - Create a new couple assessment
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createAssessmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { decisionType } = validation.data

    // Find active couple
    const { data: couple, error: coupleError } = await (supabase as any)
      .from('couples')
      .select('*')
      .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (coupleError || !couple) {
      return NextResponse.json(
        { error: 'No active couple relationship found' },
        { status: 404 }
      )
    }

    // Create individual assessment for the user
    const { data: assessment, error: assessmentError } = await (supabase as any)
      .from('assessments')
      .insert({
        user_id: user.id,
        decision_type: decisionType,
        status: 'in_progress',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError)
      return NextResponse.json(
        { error: 'Failed to create assessment' },
        { status: 500 }
      )
    }

    // Check if couple assessment already exists for this decision type
    const { data: existingCoupleAssessment } = await (supabase as any)
      .from('couple_assessments')
      .select('*')
      .eq('couple_id', (couple as any).id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let coupleAssessment

    if (existingCoupleAssessment && !(existingCoupleAssessment as any).partner_b_assessment_id) {
      // Update existing couple assessment with partner A's assessment
      const isPartnerA = (couple as any).partner_a_id === user.id

      if (isPartnerA) {
        const { data, error } = await (supabase as any)
          .from('couple_assessments')
          .update({
            partner_a_assessment_id: (assessment as any).id,
          })
          .eq('id', (existingCoupleAssessment as any).id)
          .select()
          .single()

        if (error) {
          console.error('Error updating couple assessment:', error)
        }
        coupleAssessment = data
      } else {
        const { data, error } = await (supabase as any)
          .from('couple_assessments')
          .update({
            partner_b_assessment_id: (assessment as any).id,
          })
          .eq('id', (existingCoupleAssessment as any).id)
          .select()
          .single()

        if (error) {
          console.error('Error updating couple assessment:', error)
        }
        coupleAssessment = data
      }
    } else {
      // Create new couple assessment
      const isPartnerA = (couple as any).partner_a_id === user.id

      const { data, error } = await (supabase as any)
        .from('couple_assessments')
        .insert({
          couple_id: (couple as any).id,
          partner_a_assessment_id: isPartnerA ? (assessment as any).id : null,
          partner_b_assessment_id: !isPartnerA ? (assessment as any).id : null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating couple assessment:', error)
      }
      coupleAssessment = data
    }

    // Notify partner
    const partnerId = (couple as any).partner_a_id === user.id ? (couple as any).partner_b_id : (couple as any).partner_a_id
    if (partnerId) {
      await (supabase as any).from('notifications').insert({
        user_id: partnerId,
        type: 'assessment_complete',
        title: 'Partner Started Assessment',
        body: `Your partner started a ${decisionType.replace('_', ' ')} assessment. Take yours to see your alignment!`,
        read: false,
        action_url: '/couples',
      })
    }

    return NextResponse.json({ 
      assessment,
      coupleAssessment,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/couples/assessments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/couples/assessments - Get couple assessments
export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find active couple
    const { data: couple, error: coupleError } = await (supabase as any)
      .from('couples')
      .select('*')
      .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (coupleError || !couple) {
      return NextResponse.json({ assessments: [] })
    }

    // Get couple assessments with individual assessment details
    const { data: assessments, error } = await (supabase as any)
      .from('couple_assessments')
      .select(`
        *,
        partner_a_assessment:assessments!partner_a_assessment_id(*),
        partner_b_assessment:assessments!partner_b_assessment_id(*)
      `)
      .eq('couple_id', (couple as any).id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching couple assessments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ assessments })
  } catch (error) {
    console.error('Error in GET /api/couples/assessments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
