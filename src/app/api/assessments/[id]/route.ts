import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scoreAssessment } from '@/scoring/engine'

/**
 * GET /api/assessments/:id
 * Get a specific assessment with responses
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const assessmentId = params.id

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Fetch assessment
    const { data: assessment, error: assessmentError } = await (supabase as any)
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { success: false, error: { code: 'not_found', message: 'Assessment not found' } },
        { status: 404 }
      )
    }

    // Fetch responses if assessment is completed
    let responses: any[] = []
    if ((assessment as any).status === 'completed') {
      const { data: responsesData } = await (supabase as any)
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId)

      responses = (responsesData as any) || []
    }

    return NextResponse.json({
      success: true,
      data: {
        ...assessment,
        responses,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'internal_error', message: 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/assessments/:id
 * Update assessment (save progress, complete, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const assessmentId = params.id

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Verify ownership
    const { data: assessment, error: assessmentError } = await (supabase as any)
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { success: false, error: { code: 'not_found', message: 'Assessment not found' } },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Handle completion
    if (body.status === 'completed') {
      // Fetch all responses
      const { data: responses } = await (supabase as any)
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId)

      // Fetch questions
      const { data: questions } = await (supabase as any)
        .from('question_bank')
        .select('*')
        .contains('decision_types', [(assessment as any).decision_type])
        .eq('active', true)

      if (questions && responses) {
        // Calculate scores
        const scoringResult = scoreAssessment(questions as any, responses as any)

        // Update assessment with scores
        const { data: updatedAssessment, error: updateError } = await (supabase as any)
          .from('assessments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            financial_score: scoringResult.financial.score,
            emotional_score: scoringResult.emotional.score,
            timing_score: scoringResult.timing.score,
            overall_score: scoringResult.overall,
            verdict: scoringResult.verdict,
            financial_sub_scores: scoringResult.financial,
            emotional_sub_scores: scoringResult.emotional,
            timing_sub_scores: scoringResult.timing,
            insights: scoringResult.insights,
          })
          .eq('id', assessmentId)
          .select()
          .single()

        if (updateError) {
          console.error('Error completing assessment:', updateError)
          return NextResponse.json(
            { success: false, error: { code: 'database_error', message: 'Failed to complete assessment' } },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: updatedAssessment,
        })
      }
    }

    // Handle other updates (just save progress)
    const { data: updatedAssessment, error: updateError } = await (supabase as any)
      .from('assessments')
      .update(body)
      .eq('id', assessmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating assessment:', updateError)
      return NextResponse.json(
        { success: false, error: { code: 'database_error', message: 'Failed to update assessment' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedAssessment,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'internal_error', message: 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
}
