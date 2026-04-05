'use client';

import { useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Repeat,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import type { BankTransactionRow } from '@/types/plaid';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransactionListProps {
  transactions: BankTransactionRow[];
  selectedDate: string | null; // YYYY-MM-DD or null for all
  onMatchToEvent?: (transactionId: string) => void;
}

// ---------------------------------------------------------------------------
// Category display
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  INCOME: '#34d399',
  TRANSFER_IN: '#34d399',
  LOAN_PAYMENTS: '#f472b6',
  RENT_AND_UTILITIES: '#f87171',
  FOOD_AND_DRINK: '#fb923c',
  ENTERTAINMENT: '#a78bfa',
  TRANSPORTATION: '#60a5fa',
  GENERAL_MERCHANDISE: '#94a3b8',
  GENERAL_SERVICES: '#94a3b8',
  TRANSFER_OUT: '#22d3ee',
  GOVERNMENT_AND_NON_PROFIT: '#fbbf24',
};

function formatCategory(raw: string | null): string {
  if (!raw) return 'Other';
  return raw
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransactionList({ transactions, selectedDate, onMatchToEvent }: TransactionListProps) {
  const filtered = useMemo(() => {
    let txns = transactions;
    if (selectedDate) {
      txns = txns.filter((t) => t.transaction_date === selectedDate);
    }
    return txns.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
  }, [transactions, selectedDate]);

  const totalIncome = filtered
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalExpenses = filtered
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  if (filtered.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          {selectedDate ? 'No imported transactions on this date.' : 'No imported transactions this month.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <ArrowDownLeft size={12} style={{ color: '#34d399' }} />
          <span className="text-xs font-semibold" style={{ color: '#34d399' }}>
            +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowUpRight size={12} style={{ color: '#f87171' }} />
          <span className="text-xs font-semibold" style={{ color: '#f87171' }}>
            -${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Transaction items */}
      <div className="space-y-1">
        {filtered.map((txn) => {
          const isIncome = txn.amount < 0;
          const absAmount = Math.abs(txn.amount);
          const categoryColor = CATEGORY_COLORS[txn.category_primary ?? ''] ?? '#94a3b8';
          const meta = txn.metadata as Record<string, unknown>;
          const isAnomaly = meta?.anomaly === true;

          return (
            <div
              key={txn.id}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 group"
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderLeft: `2px dashed ${isIncome ? '#34d399' : categoryColor}`,
                opacity: txn.is_pending ? 0.7 : 0.85,
              }}
            >
              {/* Amount arrow */}
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: isIncome ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                }}
              >
                {isIncome ? (
                  <ArrowDownLeft size={14} style={{ color: '#34d399' }} />
                ) : (
                  <ArrowUpRight size={14} style={{ color: '#f87171' }} />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p
                    className="text-xs font-medium truncate italic"
                    style={{ color: 'var(--text-primary, #e2e8f0)' }}
                  >
                    {txn.merchant_name ?? txn.name}
                  </p>
                  {isAnomaly && (
                    <AlertTriangle size={11} style={{ color: '#facc15' }} />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {/* Category pill */}
                  <span
                    className="text-[9px] font-medium rounded px-1.5 py-0.5"
                    style={{ background: `${categoryColor}15`, color: categoryColor }}
                  >
                    {formatCategory(txn.category_primary)}
                  </span>
                  {/* Date */}
                  {!selectedDate && (
                    <span className="text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
                      {formatDate(txn.transaction_date)}
                    </span>
                  )}
                  {/* Pending badge */}
                  {txn.is_pending && (
                    <span className="flex items-center gap-0.5 text-[9px]" style={{ color: '#facc15' }}>
                      <Clock size={9} />
                      Pending
                    </span>
                  )}
                  {/* Recurring badge */}
                  {txn.is_recurring && (
                    <span className="flex items-center gap-0.5 text-[9px]" style={{ color: '#22d3ee' }}>
                      <Repeat size={9} />
                      Recurring
                    </span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: isIncome ? '#34d399' : '#f87171' }}
                >
                  {isIncome ? '+' : '-'}${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Match action (visible on hover) */}
              {onMatchToEvent && !txn.calendar_event_id && (
                <button
                  type="button"
                  onClick={() => onMatchToEvent(txn.id)}
                  className="hidden group-hover:flex items-center gap-0.5 text-[9px] rounded px-1.5 py-1 cursor-pointer shrink-0"
                  style={{ background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee' }}
                  title="Match to calendar event"
                >
                  <Link2 size={9} />
                  Match
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
