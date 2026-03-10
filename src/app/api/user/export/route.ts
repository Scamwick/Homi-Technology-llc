import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/user/export
 * GDPR data export — returns all user data as JSON
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch all user data in parallel
    const [
      { data: profile },
      { data: assessments },
      { data: transformationPaths },
      { data: temporalMessages },
      { data: notifications },
      { data: couples },
      { data: aiConversations },
      { data: featureFlagOverrides },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('assessments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('transformation_paths').select('*').eq('user_id', user.id),
      supabase.from('temporal_twin_messages').select('*').eq('user_id', user.id),
      supabase.from('notifications').select('*').eq('user_id', user.id),
      supabase.from('couples').select('*').or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`),
      supabase.from('ai_conversations').select('id, role, content, created_at').eq('user_id', user.id),
      supabase.from('user_feature_flags').select('flag_key, enabled, created_at').eq('user_id', user.id),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile: profile ?? null,
      assessments: assessments ?? [],
      transformation_paths: transformationPaths ?? [],
      temporal_twin_messages: temporalMessages ?? [],
      notifications: notifications ?? [],
      couples: couples ?? [],
      ai_conversations: aiConversations ?? [],
      feature_flag_overrides: featureFlagOverrides ?? [],
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="homi-data-export-${user.id.slice(0, 8)}-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    )
  }
}
