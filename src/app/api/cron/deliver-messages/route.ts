import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// POST /api/cron/deliver-messages - Deliver due future messages
// This should be called by a cron job every hour
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Find messages that are due for delivery
    const { data: dueMessages, error: fetchError } = await supabase
      .from('future_messages')
      .select('*, profiles(email, full_name)')
      .eq('delivered', false)
      .lte('scheduled_for', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching due messages:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    const results = []

    for (const message of dueMessages || []) {
      try {
        // Mark as delivered
        const { error: updateError } = await supabase
          .from('future_messages')
          .update({
            delivered: true,
            delivered_at: new Date().toISOString(),
          })
          .eq('id', message.id)

        if (updateError) {
          throw updateError
        }

        // Create notification
        await supabase.from('notifications').insert({
          user_id: message.user_id,
          type: 'system',
          title: 'Message from Your Past Self',
          body: 'You wrote yourself a message that\'s ready to read.',
          read: false,
          action_url: '/temporal-twin',
        })

        results.push({
          messageId: message.id,
          userId: message.user_id,
          success: true,
        })
      } catch (error) {
        console.error(`Error delivering message ${message.id}:`, error)
        results.push({
          messageId: message.id,
          userId: message.user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      delivered: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    })
  } catch (error) {
    console.error('Error in POST /api/cron/deliver-messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
