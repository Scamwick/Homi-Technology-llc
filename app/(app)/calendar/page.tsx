'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Landmark,
  Clock,
  AlertTriangle,
  TrendingUp,
  Shield,
  Target,
} from 'lucide-react';
import { MonthGrid, EventList, EventForm, CashFlowBar, SharePanel } from '@/components/calendar';
import { AccountsPanel } from '@/components/calendar/AccountsPanel';
import { TransactionList } from '@/components/calendar/TransactionList';
import { EVENT_TYPE_CONFIG } from '@/types/calendar';
import { mapTransactionsToEvents } from '@/lib/plaid/mapping';
import { deriveFinancialMetrics, estimateReadinessCountdown } from '@/lib/plaid/insights';
import type { CalendarEventRow, CalendarEventType, RecurrencePattern, CalendarShareRole } from '@/types/calendar';
import type { BankConnectionView, LinkedAccountView, BankTransactionRow } from '@/types/plaid';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Financial Calendar — Decision Readiness Intelligence
 *
 * Manual events + verified bank transactions on one calendar.
 * Cash flow projection, readiness countdown, and bill timing insights.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

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
// Filter type (extends CalendarEventType with special filters)
// ---------------------------------------------------------------------------

type FilterType = CalendarEventType | 'all' | 'imported';
type ViewMode = 'calendar' | 'list';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEventRow[]>([]);
  const [connections, setConnections] = useState<BankConnectionView[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransactionRow[]>([]);
  const [shares, setShares] = useState<{ id: string; shared_with_name: string | null; shared_with_email: string | null; role: CalendarShareRole; status: 'pending' | 'accepted' | 'declined' | 'revoked'; can_create: boolean; can_edit: boolean; can_delete: boolean }[]>([]);

  // Fetch calendar events from API
  useEffect(() => {
    const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    fetch(`/api/calendar?start_date=${monthStart}&end_date=${monthEnd}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.events) {
          setEvents(data.data.events);
        }
      })
      .catch(() => {});
  }, [currentMonth]);

  // Fetch connected accounts from API
  useEffect(() => {
    fetch('/api/plaid/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setConnections(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch bank transactions from API
  useEffect(() => {
    const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    fetch(`/api/plaid/transactions?start_date=${monthStart}&end_date=${monthEnd}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBankTransactions(data.data);
        }
      })
      .catch(() => {});
  }, [currentMonth]);

  // Fetch calendar shares
  useEffect(() => {
    fetch('/api/calendar/shares')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.shares) {
          setShares(data.data.shares);
        }
      })
      .catch(() => {});
  }, []);

  // Convert bank transactions → calendar events
  const importedEvents = useMemo(
    () => mapTransactionsToEvents(bankTransactions),
    [bankTransactions],
  );

  // Merge manual + imported (no duplication — different id prefixes)
  const allEvents = useMemo(
    () => [...events, ...importedEvents],
    [events, importedEvents],
  );

  // Compute readiness intelligence (only when data exists)
  const metrics = useMemo(
    () => bankTransactions.length > 0 || connections.length > 0
      ? deriveFinancialMetrics(bankTransactions, connections)
      : null,
    [bankTransactions, connections],
  );

  const countdown = useMemo(
    () => metrics ? estimateReadinessCountdown(metrics) : null,
    [metrics],
  );

  // Filter events for current month
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      if (e.event_date < monthStart || e.event_date > monthEnd) return false;
      if (filterType === 'all') return true;
      if (filterType === 'imported') return (e.metadata as Record<string, unknown>)?.source === 'plaid';
      return e.event_type === filterType;
    });
  }, [allEvents, monthStart, monthEnd, filterType]);

  const handlePrevMonth = useCallback(() => setCurrentMonth((m) => subMonths(m, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentMonth((m) => addMonths(m, 1)), []);

  const handleAddEvent = useCallback((data: {
    title: string;
    event_type: CalendarEventType;
    amount: string;
    is_income: boolean;
    event_date: string;
    recurrence: RecurrencePattern;
    merchant: string;
    account_label: string;
    category: string;
    is_autopay: boolean;
    notes: string;
  }) => {
    // POST to API and add to local state
    const body = {
      title: data.title,
      event_type: data.event_type,
      category: data.category || null,
      amount: parseFloat(data.amount) || 0,
      currency: 'USD',
      is_income: data.is_income,
      event_date: data.event_date,
      recurrence: data.recurrence || 'none',
      is_autopay: data.is_autopay,
      merchant: data.merchant || null,
      account_label: data.account_label || null,
      notes: data.notes || null,
    };

    fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setEvents((prev) => [...prev, res.data]);
        }
      })
      .catch(() => {});
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
    fetch('/api/calendar/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_email: email, role }),
    }).catch(() => {});
  }, []);

  const handleAccountsLinked = useCallback((accounts: LinkedAccountView[]) => {
    // Refresh connections from API after linking
    fetch('/api/plaid/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setConnections(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const hasConnections = connections.length > 0;

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

      {/* ── Readiness countdown banner ── */}
      {hasConnections && metrics && countdown && (
        <motion.div
          variants={fadeUp}
          className="rounded-xl px-4 py-3 flex items-center justify-between gap-4"
          style={{
            background: countdown.daysToReady === 0
              ? 'rgba(52, 211, 153, 0.1)'
              : 'rgba(34, 211, 238, 0.08)',
            border: `1px solid ${countdown.daysToReady === 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(34, 211, 238, 0.15)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{
                background: countdown.daysToReady === 0
                  ? 'rgba(52, 211, 153, 0.15)'
                  : 'rgba(34, 211, 238, 0.1)',
              }}
            >
              <Target
                size={20}
                style={{
                  color: countdown.daysToReady === 0 ? '#34d399' : '#22d3ee',
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                {countdown.daysToReady === 0
                  ? 'You are READY'
                  : countdown.daysToReady !== null
                    ? `${countdown.daysToReady} days to READY`
                    : 'Readiness calculating...'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                {countdown.daysToReady === 0
                  ? 'All readiness thresholds met based on verified data'
                  : `Limiting factor: ${countdown.limitingFactor}`}
              </p>
            </div>
          </div>

          {/* Quick metrics */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>DTI</p>
              <p className="text-sm font-bold" style={{ color: metrics.actualDTI <= 0.28 ? '#34d399' : metrics.actualDTI <= 0.36 ? '#facc15' : '#f87171' }}>
                {(metrics.actualDTI * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Emergency Fund</p>
              <p className="text-sm font-bold" style={{ color: metrics.emergencyFundMonths >= 3 ? '#34d399' : metrics.emergencyFundMonths >= 1 ? '#facc15' : '#f87171' }}>
                {metrics.emergencyFundMonths.toFixed(1)} mo
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Savings Rate</p>
              <p className="text-sm font-bold" style={{ color: metrics.savingsRate >= 0.2 ? '#34d399' : metrics.savingsRate >= 0.1 ? '#facc15' : '#f87171' }}>
                {(metrics.savingsRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Bill timing suggestion banner ── */}
      {metrics && metrics.billTimingSuggestions.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={{
            background: 'rgba(250, 204, 21, 0.06)',
            border: '1px solid rgba(250, 204, 21, 0.15)',
          }}
        >
          <Clock size={16} className="mt-0.5 shrink-0" style={{ color: '#facc15' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: '#facc15' }}>
              Bill Timing Misalignment Detected
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              {metrics.billTimingSuggestions[0].reason}
            </p>
          </div>
        </motion.div>
      )}

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

        {/* Imported filter (only when bank connected) */}
        {hasConnections && (
          <button
            type="button"
            onClick={() => setFilterType('imported')}
            className="shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: filterType === 'imported' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(30, 41, 59, 0.5)',
              color: filterType === 'imported' ? '#60a5fa' : 'var(--text-secondary, #94a3b8)',
              border: `1px solid ${filterType === 'imported' ? '#60a5fa' : 'rgba(148, 163, 184, 0.08)'}`,
            }}
          >
            <Landmark size={10} />
            Imported
          </button>
        )}

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

      {/* ── Danger zones alert ── */}
      {metrics && metrics.dangerZones.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={{
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.15)',
          }}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: '#f87171' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: '#f87171' }}>
              Cash Flow Danger Zone{metrics.dangerZones.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              {metrics.dangerZones[0].suggestion}
            </p>
          </div>
        </motion.div>
      )}

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

        {/* Sidebar (1/3) */}
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

          {/* Readiness insights card */}
          {hasConnections && metrics && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Readiness Intelligence
                </h3>
              </div>

              <div className="space-y-2">
                <InsightRow
                  label="Verified Monthly Income"
                  value={`$${metrics.verifiedMonthlyIncome.toLocaleString()}`}
                  color="#34d399"
                />
                <InsightRow
                  label="Recurring Obligations"
                  value={`$${metrics.totalRecurringMonthly.toLocaleString()}/mo`}
                  color="#f87171"
                />
                <InsightRow
                  label="Liquid Reserves"
                  value={`$${metrics.liquidReserves.toLocaleString()}`}
                  color="#22d3ee"
                />
                {metrics.hiddenObligationGap > 0 && (
                  <InsightRow
                    label="Hidden Obligation Gap"
                    value={`+$${metrics.hiddenObligationGap.toLocaleString()}/mo`}
                    color="#facc15"
                  />
                )}
                {metrics.subscriptions.length > 0 && (
                  <InsightRow
                    label={`Subscriptions (${metrics.subscriptions.length})`}
                    value={`$${metrics.totalSubscriptionMonthly.toFixed(0)}/mo`}
                    color="#a78bfa"
                  />
                )}
              </div>

              {/* Milestones */}
              {metrics.milestones.length > 0 && (
                <div className="pt-2" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  {metrics.milestones.map((m) => (
                    <div key={m.title} className="flex items-center gap-2 py-1">
                      <TrendingUp size={12} style={{ color: '#34d399' }} />
                      <p className="text-[11px]" style={{ color: '#34d399' }}>
                        {m.title} (+{m.scoreImpact} pts)
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Anomalies */}
              {metrics.anomalies.length > 0 && (
                <div className="pt-2" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  {metrics.anomalies.map((a) => (
                    <div key={a.transactionId} className="flex items-start gap-2 py-1">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: '#facc15' }} />
                      <div>
                        <p className="text-[11px] font-medium" style={{ color: '#facc15' }}>
                          {a.merchantName}: ${a.amount} (avg ${a.averageAmount})
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                          {a.readinessImpact}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Imported transactions */}
          {hasConnections && bankTransactions.length > 0 && (
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Landmark size={16} style={{ color: '#60a5fa' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Imported Transactions
                </h3>
                <span
                  className="text-xs rounded-full px-1.5 py-0.5"
                  style={{ background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}
                >
                  {bankTransactions.length}
                </span>
              </div>
              <TransactionList
                transactions={bankTransactions}
                selectedDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null}
              />
            </div>
          )}

          {/* Connected accounts */}
          <AccountsPanel
            connections={connections}
            onAccountsLinked={handleAccountsLinked}
          />

          {/* Share panel */}
          <SharePanel shares={shares} onInvite={handleInvite} />
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

// ---------------------------------------------------------------------------
// Insight row helper
// ---------------------------------------------------------------------------

function InsightRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[11px]" style={{ color: 'var(--text-secondary, #94a3b8)' }}>{label}</p>
      <p className="text-xs font-semibold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}
