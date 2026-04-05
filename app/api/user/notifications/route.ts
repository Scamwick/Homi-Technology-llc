/**
 * GET/POST /api/user/notifications -- Notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

const MarkReadSchema = z.object({
  notificationId: z.string().min(1),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const list = notifications ?? [];
    const unreadCount = list.filter(n => !n.read).length;

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications: list,
          unreadCount,
          totalCount: list.length,
          hasMore: false,
          cursor: null,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Notifications API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = MarkReadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
          },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', parsed.data.notificationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !notification) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Notification not found` } },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      { success: true, data: notification },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Notifications API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
