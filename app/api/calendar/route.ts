/**
 * GET/POST /api/calendar -- Financial Calendar Events CRUD
 * ========================================================
 *
 * GET:  List calendar events for the authenticated user (with optional date range).
 * POST: Create a new calendar event.
 *
 * Returns: { success: boolean, data?: T, error?: { code, message } }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createCalendarEventSchema,
  calendarQuerySchema,
} from '@/validators/calendar';
import { MOCK_EVENTS } from '@/lib/mocks/calendar-data';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- List events
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = calendarQuerySchema.safeParse(params);

    let events = [...MOCK_EVENTS];

    if (query.success) {
      if (query.data.start_date) {
        events = events.filter((e) => e.event_date >= query.data.start_date!);
      }
      if (query.data.end_date) {
        events = events.filter((e) => e.event_date <= query.data.end_date!);
      }
      if (query.data.event_type) {
        events = events.filter((e) => e.event_type === query.data.event_type);
      }
    }

    // Compute summary
    const totalIncome = events
      .filter((e) => e.is_income)
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = events
      .filter((e) => !e.is_income)
      .reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          events,
          total: events.length,
          summary: {
            total_income: totalIncome,
            total_expenses: totalExpenses,
            net_cash_flow: totalIncome - totalExpenses,
          },
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Calendar API] GET error:', error);
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
// POST -- Create event
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

    const parsed = createCalendarEventSchema.safeParse(body);
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
    const newEvent = {
      id: `evt_${crypto.randomUUID().slice(0, 8)}`,
      user_id: 'dev-user',
      organization_id: parsed.data.organization_id ?? null,
      ...parsed.data,
      is_confirmed: false,
      confirmed_at: null,
      metadata: {},
      created_at: now,
      updated_at: now,
    };

    return NextResponse.json(
      { success: true, data: newEvent },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Calendar API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
