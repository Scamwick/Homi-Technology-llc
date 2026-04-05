'use client';

import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  Receipt,
  TrendingUp,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Building2,
  PiggyBank,
  CircleDot,
  CheckCircle2,
  Clock,
  RotateCw,
  type LucideIcon,
} from 'lucide-react';
import { EVENT_TYPE_CONFIG, RECURRENCE_LABELS } from '@/types/calendar';
import type { CalendarEventRow, CalendarEventType } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  Banknote,
  Receipt,
  TrendingUp,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Building2,
  PiggyBank,
  CircleDot,
};

function getIcon(eventType: CalendarEventType): LucideIcon {
  const config = EVENT_TYPE_CONFIG[eventType];
  return ICON_MAP[config.icon] ?? CircleDot;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventListProps {
  events: CalendarEventRow[];
  selectedDate: Date | null;
  onConfirmEvent?: (eventId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventList({ events, selectedDate, onConfirmEvent }: EventListProps) {
  const dateLabel = selectedDate
    ? format(selectedDate, 'EEEE, MMMM d, yyyy')
    : 'All Events';

  const filteredEvents = selectedDate
    ? events.filter((e) => e.event_date === format(selectedDate, 'yyyy-MM-dd'))
    : events;

  const totalIn = filteredEvents
    .filter((e) => e.is_income)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalOut = filteredEvents
    .filter((e) => !e.is_income)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          {dateLabel}
        </h3>
        {filteredEvents.length > 0 && (
          <div className="flex gap-4 mt-1">
            {totalIn > 0 && (
              <span className="text-xs font-medium" style={{ color: '#34d399' }}>
                +${totalIn.toLocaleString()}
              </span>
            )}
            {totalOut > 0 && (
              <span className="text-xs font-medium" style={{ color: '#f87171' }}>
                -${totalOut.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Event list */}
      <AnimatePresence mode="popLayout">
        {filteredEvents.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm py-6 text-center"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            No events{selectedDate ? ' on this day' : ''}
          </motion.p>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((evt) => {
              const config = EVENT_TYPE_CONFIG[evt.event_type];
              const displayColor = evt.color || config.color;
              const Icon = getIcon(evt.event_type);

              return (
                <motion.div
                  key={evt.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3 rounded-lg p-3"
                  style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: `1px solid ${displayColor}20`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${displayColor}15` }}
                  >
                    <Icon size={18} style={{ color: displayColor }} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: 'var(--text-primary, #e2e8f0)' }}
                      >
                        {evt.title}
                      </span>
                      {evt.is_confirmed && (
                        <CheckCircle2 size={14} style={{ color: '#34d399' }} />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      {evt.merchant && (
                        <span
                          className="text-xs"
                          style={{ color: 'var(--text-secondary, #94a3b8)' }}
                        >
                          {evt.merchant}
                        </span>
                      )}
                      {evt.account_label && (
                        <>
                          <span style={{ color: 'rgba(148, 163, 184, 0.3)' }}>&middot;</span>
                          <span
                            className="text-xs"
                            style={{ color: 'var(--text-secondary, #94a3b8)' }}
                          >
                            {evt.account_label}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: `${displayColor}15`, color: displayColor }}
                      >
                        {config.label}
                      </span>
                      {evt.recurrence !== 'none' && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary, #94a3b8)' }}
                        >
                          <RotateCw size={10} />
                          {RECURRENCE_LABELS[evt.recurrence]}
                        </span>
                      )}
                      {evt.is_autopay && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee' }}
                        >
                          <Clock size={10} />
                          Autopay
                        </span>
                      )}
                      {evt.category && (
                        <span
                          className="text-[10px]"
                          style={{ color: 'var(--text-secondary, #94a3b8)' }}
                        >
                          {evt.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className="text-sm font-bold"
                      style={{ color: evt.is_income ? '#34d399' : '#f87171' }}
                    >
                      {evt.is_income ? '+' : '-'}${evt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {!evt.is_confirmed && onConfirmEvent && (
                      <button
                        type="button"
                        onClick={() => onConfirmEvent(evt.id)}
                        className="text-[10px] font-medium rounded px-2 py-0.5 transition-colors cursor-pointer"
                        style={{
                          background: 'rgba(52, 211, 153, 0.1)',
                          color: '#34d399',
                        }}
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
