// =============================================================================
// types/calendar.ts — Financial Calendar Types
// =============================================================================
// Types for the Financial Calendar feature: events (paychecks, bills,
// investments, etc.) and sharing (family / enterprise).
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type CalendarEventType =
  | 'paycheck'
  | 'bill'
  | 'investment'
  | 'transfer'
  | 'subscription'
  | 'tax'
  | 'loan_payment'
  | 'savings_deposit'
  | 'other';

export type RecurrencePattern =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export type CalendarShareRole = 'viewer' | 'editor' | 'admin';
export type CalendarShareStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

// ---------------------------------------------------------------------------
// Event type display config
// ---------------------------------------------------------------------------

export interface EventTypeConfig {
  label: string;
  color: string;
  icon: string; // Lucide icon name
  isIncome: boolean;
}

export const EVENT_TYPE_CONFIG: Record<CalendarEventType, EventTypeConfig> = {
  paycheck:        { label: 'Paycheck',        color: '#34d399', icon: 'Banknote',      isIncome: true },
  bill:            { label: 'Bill',             color: '#f87171', icon: 'Receipt',       isIncome: false },
  investment:      { label: 'Investment',       color: '#60a5fa', icon: 'TrendingUp',    isIncome: false },
  transfer:        { label: 'Transfer',         color: '#a78bfa', icon: 'ArrowLeftRight',isIncome: false },
  subscription:    { label: 'Subscription',     color: '#fb923c', icon: 'CreditCard',    isIncome: false },
  tax:             { label: 'Tax',              color: '#fbbf24', icon: 'Landmark',      isIncome: false },
  loan_payment:    { label: 'Loan Payment',     color: '#f472b6', icon: 'Building2',     isIncome: false },
  savings_deposit: { label: 'Savings Deposit',  color: '#22d3ee', icon: 'PiggyBank',     isIncome: false },
  other:           { label: 'Other',            color: '#94a3b8', icon: 'CircleDot',     isIncome: false },
};

// ---------------------------------------------------------------------------
// Recurrence display
// ---------------------------------------------------------------------------

export const RECURRENCE_LABELS: Record<RecurrencePattern, string> = {
  none:      'One-time',
  daily:     'Daily',
  weekly:    'Weekly',
  biweekly:  'Every 2 weeks',
  monthly:   'Monthly',
  quarterly: 'Quarterly',
  yearly:    'Yearly',
};

// ---------------------------------------------------------------------------
// Database Row types
// ---------------------------------------------------------------------------

export interface CalendarEventRow {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  category: string | null;
  amount: number;
  currency: string;
  is_income: boolean;
  event_date: string; // ISO date string YYYY-MM-DD
  event_time: string | null;
  end_date: string | null;
  recurrence: RecurrencePattern;
  recurrence_end: string | null;
  recurrence_metadata: Record<string, unknown> | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  is_autopay: boolean;
  merchant: string | null;
  account_label: string | null;
  notes: string | null;
  reminder_days: number[];
  color: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CalendarShareRow {
  id: string;
  owner_id: string;
  shared_with_id: string | null;
  organization_id: string | null;
  role: CalendarShareRole;
  status: CalendarShareStatus;
  invite_email: string | null;
  invite_token: string | null;
  shared_event_types: CalendarEventType[] | null;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert types (auto-generated fields optional)
// ---------------------------------------------------------------------------

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CalendarEventInsert = MakeOptional<
  CalendarEventRow,
  | 'id'
  | 'organization_id'
  | 'description'
  | 'category'
  | 'amount'
  | 'currency'
  | 'is_income'
  | 'event_time'
  | 'end_date'
  | 'recurrence'
  | 'recurrence_end'
  | 'recurrence_metadata'
  | 'is_confirmed'
  | 'confirmed_at'
  | 'is_autopay'
  | 'merchant'
  | 'account_label'
  | 'notes'
  | 'reminder_days'
  | 'color'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
>;

export type CalendarEventUpdate = Partial<Omit<CalendarEventRow, 'id' | 'user_id' | 'created_at'>>;

export type CalendarShareInsert = MakeOptional<
  CalendarShareRow,
  | 'id'
  | 'shared_with_id'
  | 'organization_id'
  | 'role'
  | 'status'
  | 'invite_email'
  | 'invite_token'
  | 'shared_event_types'
  | 'can_create'
  | 'can_edit'
  | 'can_delete'
  | 'accepted_at'
  | 'created_at'
  | 'updated_at'
>;

// ---------------------------------------------------------------------------
// Client-side view types
// ---------------------------------------------------------------------------

/** Calendar event enriched with display metadata for the UI. */
export interface CalendarEventView extends CalendarEventRow {
  /** Display color derived from event_type or custom color override. */
  displayColor: string;
  /** Whether the current user owns this event (vs. it being shared). */
  isOwned: boolean;
  /** Name of the person who shared this event (if shared). */
  sharedByName?: string;
}

/** Monthly summary of income vs expenses. */
export interface MonthSummary {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  eventCount: number;
  byType: Partial<Record<CalendarEventType, { count: number; total: number }>>;
}

/** Day cell data for calendar grid rendering. */
export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEventView[];
}
