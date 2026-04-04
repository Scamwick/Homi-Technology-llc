/**
 * GET/POST /api/calendar/shares -- Calendar Sharing
 * ==================================================
 *
 * GET:  List calendar shares (inbound + outbound) for the authenticated user.
 * POST: Create a new calendar share invitation.
 *
 * Returns: { success: boolean, data?: T, error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCalendarShareSchema } from '@/validators/calendar';
import type { CalendarShareRole, CalendarShareStatus } from '@/types/calendar';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_SHARES = [
  {
    id: 'share_001',
    owner_id: 'dev-user',
    shared_with_id: 'user_partner_01',
    shared_with_name: 'Jamie Smith',
    shared_with_email: 'jamie@example.com',
    organization_id: null,
    role: 'editor' as CalendarShareRole,
    status: 'accepted' as CalendarShareStatus,
    invite_email: null,
    invite_token: null,
    shared_event_types: null,
    can_create: true,
    can_edit: true,
    can_delete: false,
    accepted_at: '2026-03-10T14:00:00Z',
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-03-10T14:00:00Z',
  },
  {
    id: 'share_002',
    owner_id: 'dev-user',
    shared_with_id: null,
    shared_with_name: null,
    shared_with_email: 'alex@example.com',
    organization_id: null,
    role: 'viewer' as CalendarShareRole,
    status: 'pending' as CalendarShareStatus,
    invite_email: 'alex@example.com',
    invite_token: 'tok_abc123',
    shared_event_types: ['paycheck', 'bill'],
    can_create: false,
    can_edit: false,
    can_delete: false,
    accepted_at: null,
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// GET -- List shares
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        data: {
          shares: MOCK_SHARES,
          total: MOCK_SHARES.length,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Calendar Shares API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

// ---------------------------------------------------------------------------
// POST -- Create share invitation
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = createCalendarShareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const now = new Date().toISOString();
    const newShare = {
      id: `share_${crypto.randomUUID().slice(0, 8)}`,
      owner_id: 'dev-user',
      shared_with_id: parsed.data.shared_with_id ?? null,
      organization_id: parsed.data.organization_id ?? null,
      role: parsed.data.role,
      status: 'pending' as CalendarShareStatus,
      invite_email: parsed.data.shared_with_email ?? null,
      invite_token: `tok_${crypto.randomUUID().slice(0, 12)}`,
      shared_event_types: parsed.data.shared_event_types ?? null,
      can_create: parsed.data.can_create,
      can_edit: parsed.data.can_edit,
      can_delete: parsed.data.can_delete,
      accepted_at: null,
      created_at: now,
      updated_at: now,
    };

    return NextResponse.json(
      { success: true, data: newShare },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Calendar Shares API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
