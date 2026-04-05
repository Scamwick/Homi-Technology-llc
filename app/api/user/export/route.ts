/**
 * GET /api/user/export -- GDPR Data Export
 * ==========================================
 *
 * Returns all user data in a single JSON payload for GDPR compliance.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Export all user data
// ---------------------------------------------------------------------------

export const GET = withAuth(async (_req, ctx) => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        {
          success: true,
          data: {
            exportedAt: new Date().toISOString(),
            format: 'homi-gdpr-export-v1',
            profile: { id: 'dev-user', email: 'dev@homi.app', full_name: 'Alex Developer' },
            assessments: [],
            notifications: [],
            couples: [],
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const userId = ctx.user!.id;
    const supabase = await createClient();

    // Run all queries in parallel
    const [profileRes, assessmentsRes, notificationsRes, couplesRes, subscriptionsRes] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('assessments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('couples')
          .select('*')
          .or(`partner_a_id.eq.${userId},partner_b_id.eq.${userId}`),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      format: 'homi-gdpr-export-v1',
      profile: profileRes.data,
      assessments: assessmentsRes.data ?? [],
      notifications: notificationsRes.data ?? [],
      couples: couplesRes.data ?? [],
      subscription: subscriptionsRes.data?.[0] ?? null,
    };

    return NextResponse.json(
      { success: true, data: exportData },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Export API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
