import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user stats
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: newUsersToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // Get assessment stats
    const { count: totalAssessments } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })

    const { count: completedAssessments } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Get subscription stats
    const { data: allProfiles } = await (supabase as any)
      .from('profiles')
      .select('subscription_tier')

    const subscriptionStats = allProfiles?.reduce((acc: any[], profile: any) => {
      const existing = acc.find(s => s.subscription_tier === profile.subscription_tier)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ subscription_tier: profile.subscription_tier, count: 1 })
      }
      return acc
    }, []) || []

    // Get revenue (from payments)
    const { data: revenueData } = await (supabase as any)
      .from('payments')
      .select('amount')
      .eq('status', 'succeeded')

    const totalRevenue = (revenueData as any)?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0

    // Get recent assessments
    const { data: recentAssessments } = await (supabase as any)
      .from('assessments')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get verdict distribution
    const { data: completedAssessmentsList } = await (supabase as any)
      .from('assessments')
      .select('verdict')
      .eq('status', 'completed')

    const verdictStats = completedAssessmentsList?.reduce((acc: any[], assessment: any) => {
      const existing = acc.find(v => v.verdict === assessment.verdict)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ verdict: assessment.verdict, count: 1 })
      }
      return acc
    }, []) || []

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        newToday: newUsersToday || 0,
      },
      assessments: {
        total: totalAssessments || 0,
        completed: completedAssessments || 0,
        completionRate: totalAssessments 
          ? Math.round(((completedAssessments || 0) / totalAssessments) * 100)
          : 0,
      },
      subscriptions: subscriptionStats || [],
      revenue: {
        total: totalRevenue,
      },
      verdicts: verdictStats || [],
      recentAssessments: recentAssessments || [],
    })
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
