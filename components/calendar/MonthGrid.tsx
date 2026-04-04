'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { EVENT_TYPE_CONFIG } from '@/types/calendar';
import type { CalendarEventRow } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonthGridProps {
  currentMonth: Date;
  events: CalendarEventRow[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getEventsForDate(events: CalendarEventRow[], date: Date): CalendarEventRow[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return events.filter((e) => e.event_date === dateStr);
}

function formatAmount(amount: number, isIncome: boolean): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return isIncome ? `+${formatted}` : `-${formatted}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MonthGrid({ currentMonth, events, selectedDate, onSelectDate }: MonthGridProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px" style={{ background: 'rgba(30, 41, 59, 0.3)' }}>
        {calendarDays.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          const dayEvents = getEventsForDate(events, day);
          const hasIncome = dayEvents.some((e) => e.is_income);
          const hasExpense = dayEvents.some((e) => !e.is_income);

          return (
            <motion.button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex flex-col items-start p-1.5 sm:p-2 min-h-[80px] sm:min-h-[100px] text-left transition-colors cursor-pointer"
              style={{
                background: selected
                  ? 'rgba(34, 211, 238, 0.08)'
                  : today
                    ? 'rgba(52, 211, 153, 0.04)'
                    : 'rgba(15, 23, 42, 0.9)',
                borderLeft: selected ? '2px solid #22d3ee' : '2px solid transparent',
                opacity: inMonth ? 1 : 0.35,
              }}
            >
              {/* Day number */}
              <span
                className="text-xs sm:text-sm font-semibold"
                style={{
                  color: today
                    ? 'var(--emerald, #34d399)'
                    : selected
                      ? 'var(--cyan, #22d3ee)'
                      : 'var(--text-primary, #e2e8f0)',
                }}
              >
                {format(day, 'd')}
              </span>

              {/* Event pills (max 3 visible) */}
              <div className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                {dayEvents.slice(0, 3).map((evt) => {
                  const config = EVENT_TYPE_CONFIG[evt.event_type];
                  const displayColor = evt.color || config.color;
                  return (
                    <div
                      key={evt.id}
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] sm:text-xs leading-tight truncate"
                      style={{
                        background: `${displayColor}15`,
                        color: displayColor,
                      }}
                    >
                      <span className="truncate hidden sm:inline">{evt.title}</span>
                      <span className="sm:hidden truncate">{formatAmount(evt.amount, evt.is_income)}</span>
                      <span className="ml-auto shrink-0 font-medium hidden sm:inline">
                        {formatAmount(evt.amount, evt.is_income)}
                      </span>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span
                    className="text-[10px] pl-1"
                    style={{ color: 'var(--text-secondary, #94a3b8)' }}
                  >
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>

              {/* Income/expense dot indicators */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  {hasIncome && (
                    <span className="size-1.5 rounded-full" style={{ background: '#34d399' }} />
                  )}
                  {hasExpense && (
                    <span className="size-1.5 rounded-full" style={{ background: '#f87171' }} />
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
