import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendReassessReminderEmail } from '@/lib/email/service'

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// It sends reassess reminder emails to users who haven't assessed in 30+ days

// POST /api/cron/reassess-reminders
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Find users who haven't completed an assessment in 30+ days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get users with their latest assessment
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        assessments!inner(
          id,
          completed_at,
          financial_score,
          emotional_score,
          timing_score
        )
      `)
      .eq('assessments.status', 'completed')
      .order('assessments.completed_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Filter users whose last assessment was 30+ days ago
    const usersToRemind = users?.filter((user: any) => {
      const lastAssessment = user.assessments?.[0]
      if (!lastAssessment?.completed_at) return false
      
      const lastAssessmentDate = new Date(lastAssessment.completed_at)
      return lastAssessmentDate <= thirtyDaysAgo
    }) || []

    // Send reminder emails
    const results = []
    for (const user of usersToRemind) {
      try {
        const lastAssessment = user.assessments[0]
        const lastAssessmentDate = new Date(lastAssessment.completed_at)
        const daysSinceLastAssessment = Math.floor(
          (Date.now() - lastAssessmentDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        await sendReassessReminderEmail(
          user.email,
          user.full_name || 'There',
          daysSinceLastAssessment,
          lastAssessmentDate.toLocaleDateString(),
          {
            financial: lastAssessment.financial_score || 0,
            emotional: lastAssessment.emotional_score || 0,
            timing: lastAssessment.timing_score || 0,
          }
        )

        // Create in-app notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'reassess_reminder',
          title: 'Time to Reassess!',
          body: `It's been ${daysSinceLastAssessment} days since your last assessment. See how your readiness has changed!`,
          read: false,
          action_url: '/assessments/new',
        })

        results.push({
          email: user.email,
          success: true,
          daysSinceLastAssessment,
        })
      } catch (error) {
        console.error(`Error sending reminder to ${user.email}:`, error)
        results.push({
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalRemindersSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results,
    })
  } catch (error) {
    console.error('Error in POST /api/cron/reassess-reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
