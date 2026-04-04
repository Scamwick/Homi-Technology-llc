'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Filter,
  List,
  LayoutGrid,
} from 'lucide-react';
import { MonthGrid, EventList, EventForm, CashFlowBar, SharePanel } from '@/components/calendar';
import { EVENT_TYPE_CONFIG } from '@/types/calendar';
import type { CalendarEventRow, CalendarEventType, RecurrencePattern, CalendarShareRole } from '@/types/calendar';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Financial Calendar — Unified view of all financial events.
 *
 * Paycheck, bill, investment, subscription, tax, loan, savings — all on one
 * calendar with cash flow summaries and family/enterprise sharing.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock data (same as API for now)
// ---------------------------------------------------------------------------

const MOCK_EVENTS: CalendarEventRow[] = [
  {
    id: 'evt_001', user_id: 'dev-user', organization_id: null,
    title: 'Salary Deposit', description: 'Monthly salary from Employer Inc.',
    event_type: 'paycheck', category: 'Employment',
    amount: 5200, currency: 'USD', is_income: true,
    event_date: '2026-04-15', event_time: null, end_date: null,
    recurrence: 'biweekly', recurrence_end: null, recurrence_metadata: { weekday: 'friday' },
    is_confirmed: false, confirmed_at: null, is_autopay: true,
    merchant: 'Employer Inc.', account_label: 'Chase Checking',
    notes: null, reminder_days: [1], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_002', user_id: 'dev-user', organization_id: null,
    title: 'Mortgage Payment', description: null,
    event_type: 'loan_payment', category: 'Housing',
    amount: 2150, currency: 'USD', is_income: false,
    event_date: '2026-04-01', event_time: null, end_date: null,
    recurrence: 'monthly', recurrence_end: null, recurrence_metadata: { day_of_month: 1 },
    is_confirmed: true, confirmed_at: '2026-04-01T06:00:00Z', is_autopay: true,
    merchant: 'Wells Fargo', account_label: 'Chase Checking',
    notes: null, reminder_days: [3], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-04-01T06:00:00Z',
  },
  {
    id: 'evt_003', user_id: 'dev-user', organization_id: null,
    title: 'Electric Bill', description: null,
    event_type: 'bill', category: 'Utilities',
    amount: 145, currency: 'USD', is_income: false,
    event_date: '2026-04-10', event_time: null, end_date: null,
    recurrence: 'monthly', recurrence_end: null, recurrence_metadata: { day_of_month: 10 },
    is_confirmed: false, confirmed_at: null, is_autopay: true,
    merchant: 'City Power Co.', account_label: 'Chase Checking',
    notes: null, reminder_days: [3, 1], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_004', user_id: 'dev-user', organization_id: null,
    title: '401(k) Contribution', description: 'Bi-weekly 401k contribution',
    event_type: 'investment', category: 'Retirement',
    amount: 750, currency: 'USD', is_income: false,
    event_date: '2026-04-15', event_time: null, end_date: null,
    recurrence: 'biweekly', recurrence_end: null, recurrence_metadata: null,
    is_confirmed: false, confirmed_at: null, is_autopay: true,
    merchant: 'Fidelity', account_label: 'Fidelity 401k',
    notes: null, reminder_days: [], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_005', user_id: 'dev-user', organization_id: null,
    title: 'Netflix', description: null,
    event_type: 'subscription', category: 'Entertainment',
    amount: 22.99, currency: 'USD', is_income: false,
    event_date: '2026-04-07', event_time: null, end_date: null,
    recurrence: 'monthly', recurrence_end: null, recurrence_metadata: { day_of_month: 7 },
    is_confirmed: false, confirmed_at: null, is_autopay: true,
    merchant: 'Netflix', account_label: 'Visa *4242',
    notes: null, reminder_days: [], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_006', user_id: 'dev-user', organization_id: null,
    title: 'Estimated Tax (Q1)', description: 'Federal estimated quarterly tax',
    event_type: 'tax', category: 'Federal Tax',
    amount: 1800, currency: 'USD', is_income: false,
    event_date: '2026-04-15', event_time: null, end_date: null,
    recurrence: 'quarterly', recurrence_end: null, recurrence_metadata: null,
    is_confirmed: false, confirmed_at: null, is_autopay: false,
    merchant: 'IRS', account_label: 'Chase Checking',
    notes: 'Due by April 15', reminder_days: [7, 3, 1], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_007', user_id: 'dev-user', organization_id: null,
    title: 'Emergency Fund Transfer', description: 'Weekly savings transfer',
    event_type: 'savings_deposit', category: 'Savings',
    amount: 200, currency: 'USD', is_income: false,
    event_date: '2026-04-04', event_time: null, end_date: null,
    recurrence: 'weekly', recurrence_end: null, recurrence_metadata: { weekday: 'friday' },
    is_confirmed: true, confirmed_at: '2026-04-04T08:00:00Z', is_autopay: true,
    merchant: null, account_label: 'Marcus Savings',
    notes: null, reminder_days: [], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-04-04T08:00:00Z',
  },
  {
    id: 'evt_008', user_id: 'dev-user', organization_id: null,
    title: 'Salary Deposit', description: 'Monthly salary from Employer Inc.',
    event_type: 'paycheck', category: 'Employment',
    amount: 5200, currency: 'USD', is_income: true,
    event_date: '2026-04-29', event_time: null, end_date: null,
    recurrence: 'biweekly', recurrence_end: null, recurrence_metadata: { weekday: 'friday' },
    is_confirmed: false, confirmed_at: null, is_autopay: true,
    merchant: 'Employer Inc.', account_label: 'Chase Checking',
    notes: null, reminder_days: [1], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_009', user_id: 'dev-user', organization_id: null,
    title: 'Internet Bill', description: null,
    event_type: 'bill', category: 'Utilities',
    amount: 79.99, currency: 'USD', is_income: false,
    event_date: '2026-04-18', event_time: null, end_date: null,
    recurrence: 'monthly', recurrence_end: null, recurrence_metadata: { day_of_month: 18 },
    is_confirmed: false, confirmed_at: null, is_autopay: false,
    merchant: 'Comcast', account_label: 'Visa *4242',
    notes: null, reminder_days: [3], color: null, metadata: {},
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt_010', user_id: 'dev-user', organization_id: null,
    title: 'Car Insurance', description: 'Semi-annual auto insurance premium',
    event_type: 'bill', category: 'Insurance',
    amount: 680, currency: 'USD', is_income: false,
    event_date: '2026-04-22', event_time: null, end_date: null,
    recurrence: 'none', recurrence_end: null, recurrence_metadata: null,
    is_confirmed: false, confirmed_at: null, is_autopay: false,
    merchant: 'Geico', account_label: 'Chase Checking',
    notes: 'Semi-annual payment', reminder_days: [7, 3], color: null, metadata: {},
    created_at: '2026-03-15T10:00:00Z', updated_at: '2026-03-15T10:00:00Z',
  },
];

const MOCK_SHARES = [
  {
    id: 'share_001',
    shared_with_name: 'Jamie Smith',
    shared_with_email: 'jamie@example.com',
    role: 'editor' as CalendarShareRole,
    status: 'accepted' as const,
    can_create: true, can_edit: true, can_delete: false,
  },
  {
    id: 'share_002',
    shared_with_name: null,
    shared_with_email: 'alex@example.com',
    role: 'viewer' as CalendarShareRole,
    status: 'pending' as const,
    can_create: false, can_edit: false, can_delete: false,
  },
];

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ViewMode = 'calendar' | 'list';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filterType, setFilterType] = useState<CalendarEventType | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEventRow[]>(MOCK_EVENTS);

  // Filter events for current month
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (e.event_date < monthStart || e.event_date > monthEnd) return false;
      if (filterType !== 'all' && e.event_type !== filterType) return false;
      return true;
    });
  }, [events, monthStart, monthEnd, filterType]);

  const handlePrevMonth = useCallback(() => setCurrentMonth((m) => subMonths(m, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentMonth((m) => addMonths(m, 1)), []);

  const handleAddEvent = useCallback((data: Record<string, unknown>) => {
    const now = new Date().toISOString();
    const newEvent: CalendarEventRow = {
      id: `evt_${crypto.randomUUID().slice(0, 8)}`,
      user_id: 'dev-user',
      organization_id: null,
      title: data.title as string,
      description: null,
      event_type: data.event_type as CalendarEventType,
      category: (data.category as string) || null,
      amount: parseFloat(data.amount as string) || 0,
      currency: 'USD',
      is_income: data.is_income as boolean,
      event_date: data.event_date as string,
      event_time: null,
      end_date: null,
      recurrence: (data.recurrence as RecurrencePattern) || 'none',
      recurrence_end: null,
      recurrence_metadata: null,
      is_confirmed: false,
      confirmed_at: null,
      is_autopay: data.is_autopay as boolean,
      merchant: (data.merchant as string) || null,
      account_label: (data.account_label as string) || null,
      notes: (data.notes as string) || null,
      reminder_days: [],
      color: null,
      metadata: {},
      created_at: now,
      updated_at: now,
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const handleConfirmEvent = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, is_confirmed: true, confirmed_at: new Date().toISOString() }
          : e,
      ),
    );
  }, []);

  const handleInvite = useCallback((email: string, role: CalendarShareRole) => {
    // In production, this calls /api/calendar/shares
    console.log('Invite sent:', { email, role });
  }, []);

  return (
    <motion.div
      className="mx-auto w-full max-w-7xl space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Page header ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays size={22} style={{ color: 'var(--cyan, #22d3ee)' }} />
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              Financial Calendar
            </h1>
          </div>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            Track paychecks, bills, investments, and more — all in one place
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid rgba(148, 163, 184, 0.12)' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: viewMode === 'calendar' ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                color: viewMode === 'calendar' ? '#22d3ee' : 'var(--text-secondary, #94a3b8)',
              }}
            >
              <LayoutGrid size={14} />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: viewMode === 'list' ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                color: viewMode === 'list' ? '#22d3ee' : 'var(--text-secondary, #94a3b8)',
              }}
            >
              <List size={14} />
              List
            </button>
          </div>

          {/* Add event button */}
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: 'rgba(34, 211, 238, 0.15)',
              color: '#22d3ee',
              border: '1px solid rgba(34, 211, 238, 0.3)',
            }}
          >
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </motion.div>

      {/* ── Month navigation ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="rounded-lg p-2 transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          <ChevronLeft size={20} />
        </button>

        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          {format(currentMonth, 'MMMM yyyy')}
        </h2>

        <button
          type="button"
          onClick={handleNextMonth}
          className="rounded-lg p-2 transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          <ChevronRight size={20} />
        </button>
      </motion.div>

      {/* ── Filter bar ── */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={14} style={{ color: 'var(--text-secondary, #94a3b8)' }} className="shrink-0" />
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer"
          style={{
            background: filterType === 'all' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(30, 41, 59, 0.5)',
            color: filterType === 'all' ? '#22d3ee' : 'var(--text-secondary, #94a3b8)',
            border: `1px solid ${filterType === 'all' ? 'rgba(34, 211, 238, 0.3)' : 'rgba(148, 163, 184, 0.08)'}`,
          }}
        >
          All
        </button>
        {(Object.entries(EVENT_TYPE_CONFIG) as [CalendarEventType, typeof EVENT_TYPE_CONFIG[CalendarEventType]][]).map(
          ([type, config]) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className="shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: filterType === type ? `${config.color}20` : 'rgba(30, 41, 59, 0.5)',
                color: filterType === type ? config.color : 'var(--text-secondary, #94a3b8)',
                border: `1px solid ${filterType === type ? config.color : 'rgba(148, 163, 184, 0.08)'}`,
              }}
            >
              <span className="size-1.5 rounded-full" style={{ background: config.color }} />
              {config.label}
            </button>
          ),
        )}
      </motion.div>

      {/* ── Cash flow summary ── */}
      <motion.div variants={fadeUp}>
        <CashFlowBar
          events={filteredEvents}
          monthLabel={format(currentMonth, 'MMMM yyyy')}
        />
      </motion.div>

      {/* ── Main content: Calendar/List + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar or List view (2/3) */}
        <motion.div className="lg:col-span-2" variants={fadeUp}>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.08)',
            }}
          >
            {viewMode === 'calendar' ? (
              <MonthGrid
                currentMonth={currentMonth}
                events={filteredEvents}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            ) : (
              <div className="p-4">
                <EventList
                  events={filteredEvents.sort((a, b) => a.event_date.localeCompare(b.event_date))}
                  selectedDate={null}
                  onConfirmEvent={handleConfirmEvent}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar: Day detail + Share panel (1/3) */}
        <motion.div className="space-y-6" variants={fadeUp}>
          {/* Selected day events */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.08)',
            }}
          >
            <EventList
              events={filteredEvents}
              selectedDate={selectedDate}
              onConfirmEvent={handleConfirmEvent}
            />
          </div>

          {/* Share panel */}
          <SharePanel shares={MOCK_SHARES} onInvite={handleInvite} />
        </motion.div>
      </div>

      {/* ── Event form modal ── */}
      <EventForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddEvent}
        initialDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
      />
    </motion.div>
  );
}
