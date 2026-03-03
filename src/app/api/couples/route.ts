import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateInviteToken } from '@/lib/couples/service'
import { sendCoupleInviteEmail } from '@/lib/email/service'
import { z } from 'zod'

const createCoupleSchema = z.object({
  partnerEmail: z.string().email(),
})

// GET /api/couples - Get user's couple relationship
export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to Couples Mode (Pro feature)
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('subscription_tier, email, full_name')
      .eq('id', user.id)
      .single()

    const hasAccess = ['pro', 'family'].includes((profile as any)?.subscription_tier || '')
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Couples Mode requires Pro subscription', code: 'UPGRADE_REQUIRED' },
        { status: 403 }
      )
    }

    // Find existing couple relationship
    const { data: couple, error: coupleError } = await (supabase as any)
      .from('couples')
      .select('*')
      .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)
      .in('status', ['pending', 'active'])
      .single()

    if (coupleError && coupleError.code !== 'PGRST116') {
      console.error('Error fetching couple:', coupleError)
      return NextResponse.json(
        { error: 'Failed to fetch couple data' },
        { status: 500 }
      )
    }

    // Get couple assessments if couple exists
    let coupleAssessments = []
    if (couple) {
      const { data: assessments } = await (supabase as any)
        .from('couple_assessments')
        .select('*')
        .eq('couple_id', (couple as any).id)
        .order('created_at', { ascending: false })

      coupleAssessments = assessments || []
    }

    return NextResponse.json({
      couple,
      assessments: coupleAssessments,
      user: {
        id: user.id,
        email: profile?.email,
        name: profile?.full_name,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/couples:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/couples - Create a new couple relationship
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check access
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('subscription_tier, email, full_name')
      .eq('id', user.id)
      .single()

    const hasAccess = ['pro', 'family'].includes((profile as any)?.subscription_tier || '')

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Couples Mode requires Pro subscription', code: 'UPGRADE_REQUIRED' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createCoupleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { partnerEmail } = validation.data

    // Check if partner email is same as user's email
    if (partnerEmail.toLowerCase() === (profile as any)?.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot invite yourself' },
        { status: 400 }
      )
    }

    // Check if user already has an active couple
    const { data: existingCouple } = await (supabase as any)
      .from('couples')
      .select('*')
      .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)
      .in('status', ['pending', 'active'])
      .single()

    if (existingCouple) {
      return NextResponse.json(
        { error: 'You already have an active couple relationship' },
        { status: 400 }
      )
    }

    // Generate invite token
    const inviteToken = generateInviteToken()

    // Create couple relationship
    const { data: couple, error: createError } = await (supabase as any)
      .from('couples')
      .insert({
        partner_a_id: user.id,
        partner_b_id: null,
        invite_email: partnerEmail.toLowerCase(),
        invite_token: inviteToken,
        status: 'pending',
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating couple:', createError)
      return NextResponse.json(
        { error: 'Failed to create couple relationship' },
        { status: 500 }
      )
    }

    // Send invite email
    try {
      await sendCoupleInviteEmail(
        partnerEmail,
        (profile as any)?.full_name || (profile as any)?.email?.split('@')[0] || 'Someone',
        (profile as any)?.email || '',
        inviteToken
      )
    } catch (emailError) {
      console.error('Error sending invite email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ couple }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/couples:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/couples - Dissolve couple relationship
export async function DELETE() {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find and update couple relationship
    const { error } = await (supabase as any)
      .from('couples')
      .update({ status: 'dissolved' })
      .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)
      .in('status', ['pending', 'active'])

    if (error) {
      console.error('Error dissolving couple:', error)
      return NextResponse.json(
        { error: 'Failed to dissolve relationship' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/couples:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
