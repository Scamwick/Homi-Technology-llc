import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// PATCH /api/transformation/actions/[id] - Update action item completion status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const actionId = params.id
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { completed } = body

    if (typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Completed status is required' }, { status: 400 })
    }

    // Get the transformation path that contains this action
    const { data: path, error: pathError } = await (supabase as any)
      .from('transformation_paths')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (pathError || !path) {
      return NextResponse.json({ error: 'Transformation path not found' }, { status: 404 })
    }

    // Find and update the action
    const updatedActions = (path as any).action_items.map((action: any) => {
      if (action.id === actionId) {
        return {
          ...action,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        }
      }
      return action
    })

    // Check if all actions are completed
    const allCompleted = updatedActions.every((action: any) => action.completed)
    const newStatus = allCompleted ? 'completed' : (path as any).status

    // Update the path
    const { data: updatedPath, error: updateError } = await (supabase as any)
      .from('transformation_paths')
      .update({
        action_items: updatedActions,
        status: newStatus,
        completed_at: allCompleted ? new Date().toISOString() : (path as any).completed_at,
      })
      .eq('id', (path as any).id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating action:', updateError)
      return NextResponse.json({ error: 'Failed to update action' }, { status: 500 })
    }

    // Create notification for action completion
    if (completed) {
      await (supabase as any).from('notifications').insert({
        user_id: user.id,
        type: 'transformation_milestone',
        title: 'Action Completed!',
        body: 'You\'ve completed an action item. Keep up the great work!',
        read: false,
        action_url: '/transformation',
      })
    }

    return NextResponse.json({ 
      success: true, 
      action: updatedActions.find((a: any) => a.id === actionId),
      path: updatedPath,
    })
  } catch (error) {
    console.error('Error in PATCH /api/transformation/actions/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
