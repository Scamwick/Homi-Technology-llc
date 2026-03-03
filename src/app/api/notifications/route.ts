import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread') === 'true'

    // Build query
    let query = (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount, error: countError } = await (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (countError) {
      console.error('Error counting unread notifications:', countError)
    }

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      pagination: {
        limit,
        offset,
        hasMore: notifications && notifications.length === limit,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications - Create a notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Verify this is an internal request (from another API route or edge function)
    const authHeader = request.headers.get('authorization')
    const isInternal = authHeader?.startsWith('Bearer internal_')
    
    if (!isInternal) {
      // Get current user for user-initiated notifications
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { userId, type, title, body: notificationBody, actionUrl } = body

    if (!userId || !type || !title) {
      return NextResponse.json(
        { error: 'userId, type, and title are required' },
        { status: 400 }
      )
    }

    const { data: notification, error } = await (supabase as any)
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body: notificationBody,
        action_url: actionUrl,
        read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
