/**
 * validators/calendar.ts — Zod schemas for Financial Calendar API
 */

import { z } from 'zod';

const calendarEventTypes = [
  'paycheck', 'bill', 'investment', 'transfer', 'subscription',
  'tax', 'loan_payment', 'savings_deposit', 'other',
] as const;

const recurrencePatterns = [
  'none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly',
] as const;

const shareRoles = ['viewer', 'editor', 'admin'] as const;

// ---------------------------------------------------------------------------
// Create / Update event
// ---------------------------------------------------------------------------

export const createCalendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  event_type: z.enum(calendarEventTypes),
  category: z.string().max(100).optional(),
  amount: z.number().min(0).default(0),
  currency: z.string().length(3).default('USD'),
  is_income: z.boolean().default(false),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  event_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  recurrence: z.enum(recurrencePatterns).default('none'),
  recurrence_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  recurrence_metadata: z.record(z.string(), z.unknown()).optional(),
  is_autopay: z.boolean().default(false),
  merchant: z.string().max(200).optional(),
  account_label: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  reminder_days: z.array(z.number().int().min(0).max(90)).default([]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  organization_id: z.string().uuid().optional(),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();

// ---------------------------------------------------------------------------
// Create share
// ---------------------------------------------------------------------------

export const createCalendarShareSchema = z.object({
  shared_with_email: z.string().email().optional(),
  shared_with_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  role: z.enum(shareRoles).default('viewer'),
  shared_event_types: z.array(z.enum(calendarEventTypes)).optional(),
  can_create: z.boolean().default(false),
  can_edit: z.boolean().default(false),
  can_delete: z.boolean().default(false),
}).refine(
  (data) => data.shared_with_email || data.shared_with_id || data.organization_id,
  { message: 'Must provide shared_with_email, shared_with_id, or organization_id' },
);

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

export const calendarQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  event_type: z.enum(calendarEventTypes).optional(),
  include_shared: z.enum(['true', 'false']).default('true'),
});
