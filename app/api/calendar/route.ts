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
import type { CalendarEventType, RecurrencePattern } from '@/types/calendar';

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
// Mock data
// ---------------------------------------------------------------------------

const MOCK_EVENTS = [
  {
    id: 'evt_001',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Salary Deposit',
    description: 'Monthly salary from Employer Inc.',
    event_type: 'paycheck' as CalendarEventType,
    category: 'Employment',
    amount: 5200.00,
    currency: 'USD',
    is_income: true,
    event_date: '2026-04-15',
    event_time: null,
    end_date: null,
    recurrence: 'biweekly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: { weekday: 'friday' },
    is_confirmed: false,
    confirmed_at: null,
    is_autopay: true,
    merchant: 'Employer Inc.',
    account_label: 'Chase Checking',
    notes: null,
    reminder_days: [1],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_002',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Mortgage Payment',
    description: null,
    event_type: 'loan_payment' as CalendarEventType,
    category: 'Housing',
    amount: 2150.00,
    currency: 'USD',
    is_income: false,
    event_date: '2026-04-01',
    event_time: null,
    end_date: null,
    recurrence: 'monthly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: { day_of_month: 1 },
    is_confirmed: true,
    confirmed_at: '2026-04-01T06:00:00Z',
    is_autopay: true,
    merchant: 'Wells Fargo',
    account_label: 'Chase Checking',
    notes: null,
    reminder_days: [3],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-04-01T06:00:00Z',
  },
  {
    id: 'evt_003',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Electric Bill',
    description: null,
    event_type: 'bill' as CalendarEventType,
    category: 'Utilities',
    amount: 145.00,
    currency: 'USD',
    is_income: false,
    event_date: '2026-04-10',
    event_time: null,
    end_date: null,
    recurrence: 'monthly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: { day_of_month: 10 },
    is_confirmed: false,
    confirmed_at: null,
    is_autopay: true,
    merchant: 'City Power Co.',
    account_label: 'Chase Checking',
    notes: null,
    reminder_days: [3, 1],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_004',
    user_id: 'dev-user',
    organization_id: null,
    title: '401(k) Contribution',
    description: 'Bi-weekly 401k contribution',
    event_type: 'investment' as CalendarEventType,
    category: 'Retirement',
    amount: 750.00,
    currency: 'USD',
    is_income: false,
    event_date: '2026-04-15',
    event_time: null,
    end_date: null,
    recurrence: 'biweekly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: null,
    is_confirmed: false,
    confirmed_at: null,
    is_autopay: true,
    merchant: 'Fidelity',
    account_label: 'Fidelity 401k',
    notes: null,
    reminder_days: [],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_005',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Netflix',
    description: null,
    event_type: 'subscription' as CalendarEventType,
    category: 'Entertainment',
    amount: 22.99,
    currency: 'USD',
    is_income: false,
    event_date: '2026-04-07',
    event_time: null,
    end_date: null,
    recurrence: 'monthly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: { day_of_month: 7 },
    is_confirmed: false,
    confirmed_at: null,
    is_autopay: true,
    merchant: 'Netflix',
    account_label: 'Visa *4242',
    notes: null,
    reminder_days: [],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_006',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Estimated Tax Payment (Q1)',
    description: 'Federal estimated quarterly tax',
    event_type: 'tax' as CalendarEventType,
    category: 'Federal Tax',
    amount: 1800.00,
    currency: 'USD',
    is_income: false,
    event_date: '2026-04-15',
    event_time: null,
    end_date: null,
    recurrence: 'quarterly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: null,
    is_confirmed: false,
    confirmed_at: null,
    is_autopay: false,
    merchant: 'IRS',
    account_label: 'Chase Checking',
    notes: 'Due by April 15',
    reminder_days: [7, 3, 1],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_007',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Emergency Fund Transfer',
    description: 'Weekly savings transfer',
    event_type: 'savings_deposit' as CalendarEventType,
    category: 'Savings',
    amount: 200.00,
    currency: 'USD',
    is_income: false,
    event_date: '2026-04-04',
    event_time: null,
    end_date: null,
    recurrence: 'weekly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: { weekday: 'friday' },
    is_confirmed: true,
    confirmed_at: '2026-04-04T08:00:00Z',
    is_autopay: true,
    merchant: null,
    account_label: 'Marcus Savings',
    notes: null,
    reminder_days: [],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-04-04T08:00:00Z',
  },
  {
    id: 'evt_008',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Salary Deposit',
    description: 'Monthly salary from Employer Inc.',
    event_type: 'paycheck' as CalendarEventType,
    category: 'Employment',
    amount: 5200.00,
    currency: 'USD',
    is_income: true,
    event_date: '2026-04-29',
    event_time: null,
    end_date: null,
    recurrence: 'biweekly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: { weekday: 'friday' },
    is_confirmed: false,
    confirmed_at: null,
    is_autopay: true,
    merchant: 'Employer Inc.',
    account_label: 'Chase Checking',
    notes: null,
    reminder_days: [1],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_009',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Internet Bill',
    description: null,
    event_type: 'bill' as CalendarEventType,
    category: 'Utilities',
    amount: 79.99,
    currency: 'USD',
    is_income: false,
    event_date: '2026-04-18',
    event_time: null,
    end_date: null,
    recurrence: 'monthly' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: { day_of_month: 18 },
    is_confirmed: false,
    confirmed_at: null,
    is_autopay: false,
    merchant: 'Comcast',
    account_label: 'Visa *4242',
    notes: null,
    reminder_days: [3],
    color: null,
    metadata: {},
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_010',
    user_id: 'dev-user',
    organization_id: null,
    title: 'Car Insurance',
    description: 'Semi-annual auto insurance premium',
    event_type: 'bill' as CalendarEventType,
    category: 'Insurance',
    amount: 680.00,
    currency: 'USD',
    is_income: false,
    event_date: '2026-04-22',
    event_time: null,
    end_date: null,
    recurrence: 'none' as RecurrencePattern,
    recurrence_end: null,
    recurrence_metadata: null,
    is_confirmed: false,
    confirmed_at: null,
    is_autopay: false,
    merchant: 'Geico',
    account_label: 'Chase Checking',
    notes: 'Semi-annual payment',
    reminder_days: [7, 3],
    color: null,
    metadata: {},
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
];

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
