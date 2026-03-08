import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateTransformationPath } from '@/lib/transformation/path-generator'

// GET /api/transformation - Get user's active transformation path
export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's latest assessment
    const { data: latestAssessment, error: assessmentError } = await (supabase as any)
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    if (assessmentError || !latestAssessment) {
      return NextResponse.json({ path: null, latestAssessment: null })
    }

    // Check if there's an active transformation path for this assessment
    let { data: existingPath } = await (supabase as any)
      .from('transformation_paths')
      .select('*')
      .eq('user_id', user.id)
      .eq('assessment_id', (latestAssessment as any).id)
      .eq('status', 'active')
      .single()

    // If no path exists, generate one
    if (!existingPath) {
      const financialScore = (latestAssessment as any).financial_score || 0
      const emotionalScore = (latestAssessment as any).emotional_score || 0
      const timingScore = (latestAssessment as any).timing_score || 0

      const financialSubScores = (latestAssessment as any).financial_sub_scores || { weaknesses: [] }
      const emotionalSubScores = (latestAssessment as any).emotional_sub_scores || { weaknesses: [] }
      const timingSubScores = (latestAssessment as any).timing_sub_scores || { weaknesses: [] }

      const { targetDimension, actionItems, milestones } = generateTransformationPath(
        { score: financialScore, weaknesses: financialSubScores.weaknesses || [] } as any,
        { score: emotionalScore, weaknesses: emotionalSubScores.weaknesses || [] } as any,
        { score: timingScore, weaknesses: timingSubScores.weaknesses || [] } as any
      )

      const { data: newPath, error: createError } = await (supabase as any)
        .from('transformation_paths')
        .insert({
          user_id: user.id,
          assessment_id: (latestAssessment as any).id,
          status: 'active',
          target_dimension: targetDimension,
          action_items: actionItems,
          milestones: milestones,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating transformation path:', createError)
        return NextResponse.json({ error: 'Failed to create transformation path' }, { status: 500 })
      }

      existingPath = newPath
    }

    // Check for milestone achievements based on current scores
    const updatedMilestones = (existingPath as any).milestones.map((milestone: any) => {
      if (milestone.achieved) return milestone

      const currentScore =
        milestone.target_dimension === 'financial' ? (latestAssessment as any).financial_score :
        milestone.target_dimension === 'emotional' ? (latestAssessment as any).emotional_score :
        milestone.target_dimension === 'timing' ? (latestAssessment as any).timing_score : 0

      if (currentScore >= milestone.target_score) {
        return {
          ...milestone,
          achieved: true,
          achieved_at: new Date().toISOString(),
        }
      }
      return milestone
    })

    // Update milestones if any were achieved
    const hasNewAchievements = updatedMilestones.some(
      (m: any, i: number) => m.achieved && !existingPath!.milestones[i].achieved
    )

    if (hasNewAchievements) {
      await (supabase as any)
        .from('transformation_paths')
        .update({ milestones: updatedMilestones })
        .eq('id', (existingPath as any).id)
    }

    return NextResponse.json({
      path: {
        ...existingPath,
        milestones: updatedMilestones,
      },
      latestAssessment,
    })
  } catch (error) {
    console.error('Error in GET /api/transformation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/transformation - Create a new transformation path
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assessmentId } = body

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    // Get the assessment
    const { data: assessment, error: assessmentError } = await (supabase as any)
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Generate transformation path
    const financialScore = (assessment as any).financial_score || 0
    const emotionalScore = (assessment as any).emotional_score || 0
    const timingScore = (assessment as any).timing_score || 0

    const financialSubScores = (assessment as any).financial_sub_scores || { weaknesses: [] }
    const emotionalSubScores = (assessment as any).emotional_sub_scores || { weaknesses: [] }
    const timingSubScores = (assessment as any).timing_sub_scores || { weaknesses: [] }

    const { targetDimension, actionItems, milestones } = generateTransformationPath(
      { score: financialScore, weaknesses: financialSubScores.weaknesses || [] } as any,
      { score: emotionalScore, weaknesses: emotionalSubScores.weaknesses || [] } as any,
      { score: timingScore, weaknesses: timingSubScores.weaknesses || [] } as any
    )

    // Create the path
    const { data: path, error: createError } = await (supabase as any)
      .from('transformation_paths')
      .insert({
        user_id: user.id,
        assessment_id: assessmentId,
        status: 'active',
        target_dimension: targetDimension,
        action_items: actionItems,
        milestones: milestones,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating transformation path:', createError)
      return NextResponse.json({ error: 'Failed to create transformation path' }, { status: 500 })
    }

    return NextResponse.json({ path }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/transformation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
