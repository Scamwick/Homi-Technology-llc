import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendWelcomeEmail, sendVerdictReadyEmail, sendMilestoneAchievedEmail } from '@/lib/email/service'

// POST /api/emails/send - Send emails (internal use only)
export async function POST(request: NextRequest) {
  try {
    // Verify this is an internal request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // Allow requests with cron secret or from internal API routes
    const isAuthorized = authHeader === `Bearer ${cronSecret}` || 
                        authHeader?.startsWith('Bearer internal_')
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, userId, data } = body

    if (!type || !userId) {
      return NextResponse.json(
        { error: 'type and userId are required' },
        { status: 400 }
      )
    }

    // Get user email
    const supabase = createServerClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let result

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(
          profile.email,
          profile.full_name || 'There'
        )
        break

      case 'verdict_ready':
        result = await sendVerdictReadyEmail(
          profile.email,
          profile.full_name || 'There',
          data.verdict,
          data.scores,
          data.assessmentId
        )
        break

      case 'milestone_achieved':
        result = await sendMilestoneAchievedEmail(
          profile.email,
          profile.full_name || 'There',
          data.milestone
        )
        break

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error in POST /api/emails/send:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
