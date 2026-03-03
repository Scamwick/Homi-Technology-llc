import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const joinSchema = z.object({
  token: z.string(),
})

// POST /api/couples/join - Accept a couple invitation
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = joinSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { token } = validation.data

    // Find the couple by invite token
    const { data: couple, error: fetchError } = await (supabase as any)
      .from('couples')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single()

    if (fetchError || !couple) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if user is trying to join their own invite
    if ((couple as any).partner_a_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot join your own invitation' },
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

    // Update couple with partner B
    const { data: updatedCouple, error: updateError } = await (supabase as any)
      .from('couples')
      .update({
        partner_b_id: user.id,
        status: 'active',
      })
      .eq('id', (couple as any).id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating couple:', updateError)
      return NextResponse.json(
        { error: 'Failed to join couple' },
        { status: 500 }
      )
    }

    // Create notification for partner A
    await (supabase as any).from('notifications').insert({
      user_id: (couple as any).partner_a_id,
      type: 'couple_invite',
      title: 'Partner Joined!',
      body: 'Your partner has accepted your invitation. You can now take assessments together.',
      read: false,
      action_url: '/couples',
    })

    return NextResponse.json({ couple: updatedCouple })
  } catch (error) {
    console.error('Error in POST /api/couples/join:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
