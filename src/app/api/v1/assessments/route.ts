import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateApiKey, hasPermission } from '@/lib/partners/api-keys'
import { z } from 'zod'

const createAssessmentSchema = z.object({
  decision_type: z.enum(['home_buying', 'career_change', 'investment', 'business_launch', 'major_purchase']),
  user_id: z.string().optional(), // Partner's user ID
  metadata: z.record(z.any()).optional(),
})

/**
 * Middleware to validate partner API key
 */
async function validatePartnerAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 }
  }

  const apiKey = authHeader.substring(7)
  const supabase = createServerClient()

  // Find API key by prefix
  const keyPrefix = apiKey.substring(0, 16) + '...'
  
  const { data: keyData, error } = await (supabase as any)
    .from('partner_api_keys')
    .select('*, partners(*)')
    .eq('key_prefix', keyPrefix)
    .eq('is_active', true)
    .single()

  if (error || !keyData) {
    return { error: 'Invalid API key', status: 401 }
  }

  // Validate key hash
  if (!validateApiKey(apiKey, (keyData as any).key_hash)) {
    return { error: 'Invalid API key', status: 401 }
  }

  // Check if partner is active
  if ((keyData as any).partners.status !== 'active') {
    return { error: 'Partner account inactive', status: 403 }
  }

  // Update last used
  await (supabase as any)
    .from('partner_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', (keyData as any).id)

  return { partner: keyData.partners, apiKey: keyData }
}

// POST /api/v1/assessments - Create a white-label assessment
export async function POST(request: NextRequest) {
  try {
    // Validate partner
    const auth = await validatePartnerAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Check permission
    if (!hasPermission(auth.apiKey!, 'assessments:create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const validation = createAssessmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { decision_type, user_id, metadata } = validation.data

    const supabase = createServerClient()

    // Create assessment
    const { data: assessment, error } = await (supabase as any)
      .from('partner_assessments')
      .insert({
        partner_id: (auth.partner as any)!.id,
        decision_type,
        external_user_id: user_id || null,
        metadata: metadata || {},
        status: 'created',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating assessment:', error)
      return NextResponse.json(
        { error: 'Failed to create assessment' },
        { status: 500 }
      )
    }

    // Generate assessment URL
    const assessmentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/v1/assessments/${(assessment as any).id}?token=${(assessment as any).access_token}`

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        decision_type: assessment.decision_type,
        status: assessment.status,
        created_at: assessment.created_at,
      },
      assessment_url: assessmentUrl,
      embed_code: `<iframe src="${assessmentUrl}" width="100%" height="800" frameborder="0"></iframe>`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/v1/assessments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/v1/assessments - List partner assessments
export async function GET(request: NextRequest) {
  try {
    // Validate partner
    const auth = await validatePartnerAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Check permission
    if (!hasPermission(auth.apiKey!, 'assessments:read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const supabase = createServerClient()

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('partner_assessments')
      .select('*')
      .eq('partner_id', auth.partner!.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: assessments, error } = await query

    if (error) {
      console.error('Error fetching assessments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ assessments })
  } catch (error) {
    console.error('Error in GET /api/v1/assessments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
