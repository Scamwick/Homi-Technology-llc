/**
 * GET/POST /api/user/notifications -- Notifications
 * ====================================================
 *
 * GET:  Return the user's notifications.
 * POST: Mark a notification as read.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const MarkReadSchema = z.object({
  notificationId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Mock Data (dev fallback)
// ---------------------------------------------------------------------------

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_001',
    user_id: 'dev-user',
    type: 'assessment_complete' as const,
    title: 'Assessment Complete',
    body: 'Your latest assessment scored 82/100. You are READY.',
    read: false,
    created_at: '2026-03-28T14:15:00Z',
    read_at: null,
    priority: 'normal' as const,
    channels: ['in_app'] as const,
    data: { assessmentId: 'assess_002', overall: 82 },
  },
  {
    id: 'notif_002',
    user_id: 'dev-user',
    type: 'reassess_reminder' as const,
    title: 'Time to Reassess',
    body: 'It has been 30 days since your last assessment. Your situation may have changed.',
    read: true,
    created_at: '2026-03-15T09:00:00Z',
    read_at: '2026-03-15T12:30:00Z',
    priority: 'low' as const,
    channels: ['in_app', 'email'] as const,
    data: { lastAssessmentId: 'assess_001', daysSinceLastAssessment: 30 },
  },
  {
    id: 'notif_003',
    user_id: 'dev-user',
    type: 'system' as const,
    title: 'Welcome to H\u014dMI',
    body: 'Your account has been created. Take your first assessment to get started.',
    read: true,
    created_at: '2026-01-15T08:00:00Z',
    read_at: '2026-01-15T08:05:00Z',
    priority: 'normal' as const,
    channels: ['in_app'] as const,
    data: { category: 'feature' },
  },
];

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- List notifications
// ---------------------------------------------------------------------------

export const GET = withAuth(async (_req, ctx) => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
      return NextResponse.json(
        {
          success: true,
          data: {
            notifications: MOCK_NOTIFICATIONS,
            unreadCount,
            totalCount: MOCK_NOTIFICATIONS.length,
            hasMore: false,
            cursor: null,
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();

    const [notifResult, countResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', ctx.user!.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', ctx.user!.id)
        .eq('read', false),
    ]);

    if (notifResult.error) throw notifResult.error;

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications: notifResult.data ?? [],
          unreadCount: countResult.count ?? 0,
          totalCount: notifResult.data?.length ?? 0,
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
});

// ---------------------------------------------------------------------------
// POST -- Mark notification as read
// ---------------------------------------------------------------------------

export const POST = withAuth(async (request, ctx) => {
  try {
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

    const { notificationId } = parsed.data;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const notification = MOCK_NOTIFICATIONS.find(n => n.id === notificationId);
      if (!notification) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Notification ${notificationId} not found` } },
          { status: 404, headers: CORS_HEADERS },
        );
      }
      return NextResponse.json(
        { success: true, data: { ...notification, read: true, read_at: new Date().toISOString() } },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const supabase = await createClient();
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', ctx.user!.id)
      .select()
      .single();

    if (error || !notification) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Notification ${notificationId} not found` } },
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
});
