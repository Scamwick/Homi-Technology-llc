'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { EVENT_TYPE_CONFIG, RECURRENCE_LABELS } from '@/types/calendar';
import type { CalendarEventType, RecurrencePattern } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventFormData {
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
}

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  initialDate?: string;
}

const EVENT_TYPES = Object.entries(EVENT_TYPE_CONFIG) as [CalendarEventType, typeof EVENT_TYPE_CONFIG[CalendarEventType]][];
const RECURRENCE_OPTIONS = Object.entries(RECURRENCE_LABELS) as [RecurrencePattern, string][];

const INITIAL_STATE: EventFormData = {
  title: '',
  event_type: 'bill',
  amount: '',
  is_income: false,
  event_date: '',
  recurrence: 'none',
  merchant: '',
  account_label: '',
  category: '',
  is_autopay: false,
  notes: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventForm({ isOpen, onClose, onSubmit, initialDate }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>({
    ...INITIAL_STATE,
    event_date: initialDate ?? '',
  });

  function handleChange(field: keyof EventFormData, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-set is_income when event_type changes
      if (field === 'event_type') {
        const config = EVENT_TYPE_CONFIG[value as CalendarEventType];
        if (config) next.is_income = config.isIncome;
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.event_date) return;
    onSubmit(form);
    setForm({ ...INITIAL_STATE, event_date: initialDate ?? '' });
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-xl overflow-hidden"
            style={{
              background: '#0f172a',
              border: '1px solid rgba(34, 211, 238, 0.15)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}
            >
              <div className="flex items-center gap-2">
                <Plus size={18} style={{ color: 'var(--cyan, #22d3ee)' }} />
                <h2
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  New Financial Event
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 transition-colors cursor-pointer"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Electric Bill, Salary, 401k Contribution"
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                    color: 'var(--text-primary, #e2e8f0)',
                  }}
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {EVENT_TYPES.map(([type, config]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleChange('event_type', type)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer"
                      style={{
                        background: form.event_type === type
                          ? `${config.color}20`
                          : 'rgba(30, 41, 59, 0.5)',
                        border: `1px solid ${form.event_type === type ? config.color : 'rgba(148, 163, 184, 0.08)'}`,
                        color: form.event_type === type ? config.color : 'var(--text-secondary, #94a3b8)',
                      }}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ background: config.color }}
                      />
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount + Income toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Amount
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: 'var(--text-secondary, #94a3b8)' }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg pl-7 pr-3 py-2 text-sm outline-none"
                      style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                        color: 'var(--text-primary, #e2e8f0)',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Direction
                  </label>
                  <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(148, 163, 184, 0.12)' }}>
                    <button
                      type="button"
                      onClick={() => handleChange('is_income', true)}
                      className="flex-1 py-2 text-xs font-medium transition-colors cursor-pointer"
                      style={{
                        background: form.is_income ? 'rgba(52, 211, 153, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                        color: form.is_income ? '#34d399' : 'var(--text-secondary, #94a3b8)',
                      }}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('is_income', false)}
                      className="flex-1 py-2 text-xs font-medium transition-colors cursor-pointer"
                      style={{
                        background: !form.is_income ? 'rgba(248, 113, 113, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                        color: !form.is_income ? '#f87171' : 'var(--text-secondary, #94a3b8)',
                      }}
                    >
                      Expense
                    </button>
                  </div>
                </div>
              </div>

              {/* Date + Recurrence */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => handleChange('event_date', e.target.value)}
                    required
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      color: 'var(--text-primary, #e2e8f0)',
                      colorScheme: 'dark',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Recurrence
                  </label>
                  <select
                    value={form.recurrence}
                    onChange={(e) => handleChange('recurrence', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none appearance-none cursor-pointer"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      color: 'var(--text-primary, #e2e8f0)',
                    }}
                  >
                    {RECURRENCE_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Merchant + Account */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Merchant / Payer
                  </label>
                  <input
                    type="text"
                    value={form.merchant}
                    onChange={(e) => handleChange('merchant', e.target.value)}
                    placeholder="e.g. Netflix, Employer Inc."
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      color: 'var(--text-primary, #e2e8f0)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Account
                  </label>
                  <input
                    type="text"
                    value={form.account_label}
                    onChange={(e) => handleChange('account_label', e.target.value)}
                    placeholder="e.g. Chase Checking"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      color: 'var(--text-primary, #e2e8f0)',
                    }}
                  />
                </div>
              </div>

              {/* Category + Autopay */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    placeholder="e.g. Utilities, Retirement"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      color: 'var(--text-primary, #e2e8f0)',
                    }}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_autopay}
                      onChange={(e) => handleChange('is_autopay', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      Autopay enabled
                    </span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                    color: 'var(--text-primary, #e2e8f0)',
                  }}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    color: 'var(--text-secondary, #94a3b8)',
                    background: 'rgba(30, 41, 59, 0.5)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: 'rgba(34, 211, 238, 0.15)',
                    color: '#22d3ee',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                  }}
                >
                  Add Event
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
