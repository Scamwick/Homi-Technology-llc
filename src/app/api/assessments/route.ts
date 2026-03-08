import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAssessmentSchema } from '@/validators/assessment'

/**
 * GET /api/assessments
 * List user's assessments
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = (supabase as any)
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching assessments:', error)
      return NextResponse.json(
        { success: false, error: { code: 'database_error', message: 'Failed to fetch assessments' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: count,
        limit,
        offset,
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
 * POST /api/assessments
 * Create a new assessment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check subscription limits
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = (profile as any)?.subscription_tier || 'free'

    // For free tier, check assessment count
    if (tier === 'free') {
      const { count } = await (supabase as any)
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (count && count >= 3) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'subscription_required', 
              message: 'Free tier limited to 3 assessments per month. Upgrade to continue.' 
            } 
          },
          { status: 403 }
        )
      }
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createAssessmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'validation_error', 
            message: 'Invalid request data',
            details: validation.error.flatten()
          } 
        },
        { status: 400 }
      )
    }

    const { decision_type } = validation.data

    // Create assessment
    const { data, error } = await (supabase as any)
      .from('assessments')
      .insert({
        user_id: user.id,
        decision_type,
        status: 'in_progress',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating assessment:', error)
      return NextResponse.json(
        { success: false, error: { code: 'database_error', message: 'Failed to create assessment' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'internal_error', message: 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
}
