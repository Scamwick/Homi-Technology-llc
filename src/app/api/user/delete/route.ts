import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient as createAdminClient } from "@/lib/supabase/admin"

/**
 * DELETE /api/user/delete
 * GDPR hard delete — removes all user data then deletes the auth account.
 * Body: { confirm: "DELETE MY ACCOUNT" }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Require explicit confirmation string
    const body = await request.json().catch(() => ({}))
    if (body?.confirm !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { success: false, error: 'Confirmation required. Send { confirm: "DELETE MY ACCOUNT" }' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Delete user data from all tables (RLS cascade handles most,
    // but explicit deletes ensure nothing is missed)
    const tables = [
      'ai_conversations',
      'notifications',
      'temporal_twin_messages',
      'transformation_paths',
      'user_feature_flags',
      'assessments',
      'profiles',
    ]

    for (const table of tables) {
      await admin.from(table as any).delete().eq('user_id', user.id)
    }

    // Handle couples — remove user from any couple record
    await admin
      .from('couples')
      .delete()
      .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)

    // Hard delete the auth user (must be last)
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('Auth delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Account deletion failed. Contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data permanently deleted.',
    })
  } catch (error) {
    console.error('Account delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Deletion failed' },
      { status: 500 }
    )
  }
}
