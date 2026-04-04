'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, TrendingDown } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { DataSourceLabel, type DataSource } from './DataSourceLabel';
import {
  compareStrategies,
  type Debt,
  type PayoffComparison,
} from '@/lib/calculators/debt-payoff';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MiniDebtPayoff — Compact embeddable debt payoff summary
 *
 * Collapsed: total debt + payoff timeline
 * Expanded: debt list + strategy comparison
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface MiniDebtPayoffProps {
  debts?: Debt[];
  extraPayment?: number;
  defaultExpanded?: boolean;
  dataSource?: DataSource;
  onResultChange?: (result: PayoffComparison) => void;
}

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function MiniDebtPayoff({
  debts = [],
  extraPayment = 200,
  defaultExpanded = false,
  dataSource = 'estimate',
  onResultChange,
}: MiniDebtPayoffProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  const comparison = useMemo(() => {
    if (debts.length === 0) return null;
    const c = compareStrategies(debts, extraPayment);
    onResultChange?.(c);
    return c;
  }, [debts, extraPayment, onResultChange]);

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const activeResult = comparison ? comparison[strategy] : null;

  if (debts.length === 0) {
    return (
      <Card padding="sm">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <TrendingDown size={16} style={{ color: 'var(--cyan)' }} />
          <span>No debts tracked</span>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <TrendingDown size={16} style={{ color: 'var(--cyan)' }} />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Total Debt
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums text-[var(--cyan)]">
            {fmt.format(totalDebt)}
          </span>
          {activeResult && (
            <span className="text-xs text-[var(--text-secondary)]">
              {activeResult.totalMonths} mo
            </span>
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-[var(--text-secondary)]" />
          </motion.div>
        </div>
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && comparison && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {/* Debt list */}
              <div className="space-y-1">
                {debts.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[var(--text-secondary)] truncate max-w-[140px]">
                      {d.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-[var(--text-primary)]">
                        {fmt.format(d.balance)}
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {d.annualRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strategy toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStrategy('avalanche')}
                  className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background:
                      strategy === 'avalanche'
                        ? 'rgba(34, 211, 238, 0.15)'
                        : 'transparent',
                    color:
                      strategy === 'avalanche'
                        ? 'var(--cyan)'
                        : 'var(--text-secondary)',
                    border: `1px solid ${
                      strategy === 'avalanche'
                        ? 'rgba(34, 211, 238, 0.3)'
                        : 'rgba(34, 211, 238, 0.1)'
                    }`,
                  }}
                >
                  Avalanche
                </button>
                <button
                  onClick={() => setStrategy('snowball')}
                  className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background:
                      strategy === 'snowball'
                        ? 'rgba(34, 211, 238, 0.15)'
                        : 'transparent',
                    color:
                      strategy === 'snowball'
                        ? 'var(--cyan)'
                        : 'var(--text-secondary)',
                    border: `1px solid ${
                      strategy === 'snowball'
                        ? 'rgba(34, 211, 238, 0.3)'
                        : 'rgba(34, 211, 238, 0.1)'
                    }`,
                  }}
                >
                  Snowball
                </button>
              </div>

              {/* Strategy stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Payoff Time</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {activeResult?.totalMonths ?? 0} months
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Total Interest</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {fmt.format(activeResult?.totalInterest ?? 0)}
                  </p>
                </div>
              </div>

              {/* Interest savings callout */}
              {comparison.interestSaved > 0 && (
                <div
                  className="rounded-lg px-3 py-2 text-xs text-center"
                  style={{
                    background: 'rgba(52, 211, 153, 0.1)',
                    color: 'var(--emerald)',
                  }}
                >
                  Avalanche saves {fmt.format(comparison.interestSaved)} in interest
                  {comparison.monthsSaved > 0 && ` and ${comparison.monthsSaved} months`}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[rgba(34,211,238,0.1)]">
                <DataSourceLabel source={dataSource} />
                <Link
                  href="/tools/debt-payoff"
                  className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--cyan)] transition-colors"
                >
                  Open full planner &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
