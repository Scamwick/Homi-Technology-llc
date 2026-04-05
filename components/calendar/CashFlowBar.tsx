'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import type { CalendarEventRow, CalendarEventType } from '@/types/calendar';
import { EVENT_TYPE_CONFIG } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CashFlowBarProps {
  events: CalendarEventRow[];
  monthLabel: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CashFlowBar({ events, monthLabel }: CashFlowBarProps) {
  const totalIncome = events
    .filter((e) => e.is_income)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = events
    .filter((e) => !e.is_income)
    .reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;

  // Group expenses by type
  const byType = events.reduce<Record<string, number>>((acc, evt) => {
    if (!evt.is_income) {
      acc[evt.event_type] = (acc[evt.event_type] || 0) + evt.amount;
    }
    return acc;
  }, {});

  const confirmedCount = events.filter((e) => e.is_confirmed).length;
  const pendingCount = events.filter((e) => !e.is_confirmed).length;

  return (
    <div
      className="rounded-xl p-4 sm:p-5"
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      {/* Month label */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          {monthLabel} Cash Flow
        </h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          <span>{confirmedCount} confirmed</span>
          <span>&middot;</span>
          <span>{pendingCount} pending</span>
        </div>
      </div>

      {/* Income / Expenses / Net */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} style={{ color: '#34d399' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Income
            </span>
          </div>
          <motion.p
            key={totalIncome}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold"
            style={{ color: '#34d399' }}
          >
            ${totalIncome.toLocaleString()}
          </motion.p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={14} style={{ color: '#f87171' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Expenses
            </span>
          </div>
          <motion.p
            key={totalExpenses}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold"
            style={{ color: '#f87171' }}
          >
            ${totalExpenses.toLocaleString()}
          </motion.p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowRight size={14} style={{ color: netCashFlow >= 0 ? '#34d399' : '#f87171' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Net
            </span>
          </div>
          <motion.p
            key={netCashFlow}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold"
            style={{ color: netCashFlow >= 0 ? '#34d399' : '#f87171' }}
          >
            {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toLocaleString()}
          </motion.p>
        </div>
      </div>

      {/* Expense breakdown bar */}
      {totalExpenses > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Expense breakdown
            </span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            {Object.entries(byType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, amount]) => {
                const config = EVENT_TYPE_CONFIG[type as CalendarEventType];
                const pct = (amount / totalExpenses) * 100;
                return (
                  <motion.div
                    key={type}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-sm"
                    style={{ background: config?.color ?? '#94a3b8' }}
                    title={`${config?.label ?? type}: $${amount.toLocaleString()} (${pct.toFixed(0)}%)`}
                  />
                );
              })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {Object.entries(byType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, amount]) => {
                const config = EVENT_TYPE_CONFIG[type as CalendarEventType];
                return (
                  <div key={type} className="flex items-center gap-1">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: config?.color ?? '#94a3b8' }}
                    />
                    <span className="text-[10px]" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      {config?.label ?? type} ${amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
