'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowDownUp, Plus, Trash2, Zap, Snowflake, DollarSign, Wifi, WifiOff } from 'lucide-react';
import { Card, Input, Button } from '@/components/ui';
import {
  computePayoff as computePayoffShared,
  type PayoffStrategy,
} from '@/lib/calculators/debt-payoff';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Debt Payoff Planner
 *
 * Compares Avalanche (highest interest first) vs Snowball (smallest balance
 * first) strategies with optional extra monthly payment. Generates payoff
 * timelines and total interest calculations for each strategy.
 *
 * Computation lives in lib/calculators/debt-payoff.ts — shared with the
 * scoring pipeline and AI agent tools. This page provides the interactive UI.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;      // annual interest rate as percentage (e.g. 18.9)
  minPayment: number;
}

interface PayoffEvent {
  debtId: string;
  debtName: string;
  paidOffMonth: number;
}

interface StrategyResult {
  totalInterest: number;
  totalMonths: number;
  payoffOrder: PayoffEvent[];
  monthlyData: { month: number; totalRemaining: number }[];
}

// ---------------------------------------------------------------------------
// Adaptor: maps shared lib result into page-specific display format
// ---------------------------------------------------------------------------

function computePayoff(
  debts: Debt[],
  extraPayment: number,
  strategy: 'avalanche' | 'snowball',
): StrategyResult {
  if (debts.length === 0) {
    return { totalInterest: 0, totalMonths: 0, payoffOrder: [], monthlyData: [] };
  }

  // Map local Debt type to shared lib Debt type
  const sharedDebts = debts.map((d) => ({
    name: d.name,
    balance: d.balance,
    annualRate: d.rate,
    minimumPayment: d.minPayment,
  }));

  const result = computePayoffShared(sharedDebts, extraPayment, strategy as PayoffStrategy);

  // Map shared result back to page-specific format
  return {
    totalInterest: result.totalInterest,
    totalMonths: result.totalMonths,
    payoffOrder: result.payoffOrder.map((p) => {
      const debt = debts.find((d) => d.name === p.name);
      return {
        debtId: debt?.id ?? p.name,
        debtName: p.name,
        paidOffMonth: p.paidOffMonth,
      };
    }),
    monthlyData: result.balanceTimeline.map((bal, month) => ({
      month,
      totalRemaining: bal,
    })),
  };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatMonths(m: number): string {
  const years = Math.floor(m / 12);
  const months = m % 12;
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}yr`;
  return `${years}yr ${months}mo`;
}

// ---------------------------------------------------------------------------
// Timeline Bar Chart
// ---------------------------------------------------------------------------

function TimelineChart({
  avalanche,
  snowball,
  debts,
}: {
  avalanche: StrategyResult;
  snowball: StrategyResult;
  debts: Debt[];
}) {
  const maxMonth = Math.max(avalanche.totalMonths, snowball.totalMonths, 1);

  const COLORS = [
    '#22d3ee', '#34d399', '#facc15', '#f472b6', '#a78bfa',
    '#fb923c', '#38bdf8', '#4ade80', '#fbbf24', '#e879f9',
  ];

  const debtColors = new Map<string, string>();
  debts.forEach((d, i) => debtColors.set(d.id, COLORS[i % COLORS.length]));

  const renderStrategy = (label: string, result: StrategyResult, icon: React.ReactNode) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
        <span className="text-xs tabular-nums ml-auto" style={{ color: 'var(--text-secondary)' }}>
          {formatMonths(result.totalMonths)} total
        </span>
      </div>
      {result.payoffOrder.map((event) => {
        const pct = Math.max(3, (event.paidOffMonth / maxMonth) * 100);
        const color = debtColors.get(event.debtId) ?? '#94a3b8';
        return (
          <div key={event.debtId} className="flex items-center gap-3">
            <span className="text-xs w-24 truncate" style={{ color: 'var(--text-secondary)' }}>
              {event.debtName}
            </span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(30,41,59,0.6)' }}>
              <motion.div
                className="h-full rounded-full flex items-center justify-end pr-2"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <span className="text-[10px] font-semibold" style={{ color: '#0a1628' }}>
                  {formatMonths(event.paidOffMonth)}
                </span>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {renderStrategy(
        'Avalanche (Highest Rate First)',
        avalanche,
        <Zap size={16} style={{ color: '#ef4444' }} />,
      )}
      {renderStrategy(
        'Snowball (Smallest Balance First)',
        snowball,
        <Snowflake size={16} style={{ color: '#22d3ee' }} />,
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default demo debts
// ---------------------------------------------------------------------------

const DEFAULT_DEBTS: Debt[] = [
  { id: crypto.randomUUID(), name: 'Credit Card', balance: 8500, rate: 22.9, minPayment: 200 },
  { id: crypto.randomUUID(), name: 'Car Loan', balance: 15000, rate: 6.5, minPayment: 350 },
  { id: crypto.randomUUID(), name: 'Student Loan', balance: 28000, rate: 5.8, minPayment: 280 },
];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DebtPayoffPage() {
  const [debts, setDebts] = useState<Debt[]>(DEFAULT_DEBTS);
  const [extraPayment, setExtraPayment] = useState(200);
  const [useLiveData, setUseLiveData] = useState(false);
  const [liveDataAvailable, setLiveDataAvailable] = useState<boolean | null>(null);
  const [liveDataLoading, setLiveDataLoading] = useState(false);

  // Load live debt data from Plaid liabilities
  const loadLiveDebts = useCallback(async () => {
    setLiveDataLoading(true);
    try {
      const response = await fetch('/api/scoring/refresh', { method: 'POST' });
      if (!response.ok) {
        setLiveDataAvailable(false);
        return;
      }
      const data = await response.json();
      if (data.dataSource === 'plaid' || data.dataSource === 'hybrid') {
        setLiveDataAvailable(true);
      } else {
        setLiveDataAvailable(false);
      }
    } catch {
      setLiveDataAvailable(false);
    } finally {
      setLiveDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveDebts();
  }, [loadLiveDebts]);

  // New debt form
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState<number | ''>('');
  const [newRate, setNewRate] = useState<number | ''>('');
  const [newMinPayment, setNewMinPayment] = useState<number | ''>('');

  const addDebt = useCallback(() => {
    if (!newName || !newBalance || !newRate || !newMinPayment) return;
    setDebts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newName,
        balance: Number(newBalance),
        rate: Number(newRate),
        minPayment: Number(newMinPayment),
      },
    ]);
    setNewName('');
    setNewBalance('');
    setNewRate('');
    setNewMinPayment('');
  }, [newName, newBalance, newRate, newMinPayment]);

  const removeDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Compute both strategies
  const avalanche = useMemo(() => computePayoff(debts, extraPayment, 'avalanche'), [debts, extraPayment]);
  const snowball = useMemo(() => computePayoff(debts, extraPayment, 'snowball'), [debts, extraPayment]);

  const savings = snowball.totalInterest - avalanche.totalInterest;
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} /> Back to Tools
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="flex size-11 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(52,211,153,0.1)' }}
          >
            <ArrowDownUp size={22} style={{ color: 'var(--emerald)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Debt Payoff Planner
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Avalanche vs Snowball -- find your fastest path to debt freedom
            </p>
          </div>
        </div>
      </motion.div>

      {/* Live Data Toggle */}
      {liveDataAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button
            onClick={() => {
              setUseLiveData(!useLiveData);
              if (!useLiveData) loadLiveDebts();
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: useLiveData ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.1)',
              color: useLiveData ? 'var(--emerald)' : 'var(--text-secondary)',
              border: `1px solid ${useLiveData ? 'rgba(52,211,153,0.3)' : 'rgba(148,163,184,0.2)'}`,
            }}
          >
            {useLiveData ? <Wifi size={16} /> : <WifiOff size={16} />}
            {liveDataLoading ? 'Loading live data...' : useLiveData ? 'Using Live Debt Data' : 'Import Debts from Plaid'}
            {useLiveData && (
              <span
                className="ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: 'rgba(52,211,153,0.2)', color: 'var(--emerald)' }}
              >
                Verified
              </span>
            )}
          </button>
        </motion.div>
      )}

      {/* Current debts list */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Your Debts
          </h3>

          {/* Debt table */}
          {debts.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--text-secondary)' }}>
                    <th className="text-left py-2 pr-3 font-medium text-xs">Name</th>
                    <th className="text-right py-2 px-3 font-medium text-xs">Balance</th>
                    <th className="text-right py-2 px-3 font-medium text-xs">Rate</th>
                    <th className="text-right py-2 px-3 font-medium text-xs">Min Payment</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {debts.map((debt) => (
                      <motion.tr
                        key={debt.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.2 }}
                        style={{ borderTop: '1px solid rgba(34,211,238,0.08)' }}
                      >
                        <td className="py-2.5 pr-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {debt.name}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(debt.balance)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: '#facc15' }}>
                          {debt.rate}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                          {formatCurrency(debt.minPayment)}/mo
                        </td>
                        <td className="py-2.5 pl-2">
                          <button
                            onClick={() => removeDebt(debt.id)}
                            className="p-1.5 rounded-md transition-colors hover:bg-[rgba(239,68,68,0.15)] cursor-pointer"
                            style={{ color: 'var(--text-secondary)' }}
                            aria-label={`Remove ${debt.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Add debt form */}
          <div
            className="pt-4"
            style={{ borderTop: '1px solid rgba(34,211,238,0.1)' }}
          >
            <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Add a Debt
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <Input
                label="Name"
                placeholder="e.g. Visa"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                fullWidth
              />
              <Input
                label="Balance ($)"
                type="number"
                min={0}
                placeholder="5000"
                value={newBalance === '' ? '' : newBalance}
                onChange={(e) => setNewBalance(e.target.value ? Number(e.target.value) : '')}
                fullWidth
              />
              <Input
                label="Rate (%)"
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder="18.9"
                value={newRate === '' ? '' : newRate}
                onChange={(e) => setNewRate(e.target.value ? Number(e.target.value) : '')}
                fullWidth
              />
              <div className="flex gap-2 items-end">
                <Input
                  label="Min Payment ($)"
                  type="number"
                  min={0}
                  placeholder="150"
                  value={newMinPayment === '' ? '' : newMinPayment}
                  onChange={(e) => setNewMinPayment(e.target.value ? Number(e.target.value) : '')}
                  fullWidth
                />
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus size={16} />}
                  onClick={addDebt}
                  disabled={!newName || !newBalance || !newRate || !newMinPayment}
                  className="shrink-0 mb-0.5"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Extra payment */}
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(34,211,238,0.1)' }}>
            <div className="flex items-end gap-3">
              <Input
                label="Extra Monthly Payment ($)"
                type="number"
                min={0}
                step={50}
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                hint="Applied to target debt each month (on top of minimums)"
                leadingIcon={<DollarSign size={16} />}
                className="max-w-xs"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Results */}
      {debts.length > 0 && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Debt */}
            <Card padding="sm">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Total Debt</p>
              <p className="text-xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(totalDebt)}
              </p>
            </Card>

            {/* Avalanche Interest */}
            <Card padding="sm">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} style={{ color: '#ef4444' }} />
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Avalanche Interest</p>
              </div>
              <p className="text-xl font-bold tabular-nums" style={{ color: '#34d399' }}>
                {formatCurrency(avalanche.totalInterest)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Paid off in {formatMonths(avalanche.totalMonths)}
              </p>
            </Card>

            {/* Snowball Interest */}
            <Card padding="sm">
              <div className="flex items-center gap-2 mb-1">
                <Snowflake size={14} style={{ color: '#22d3ee' }} />
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Snowball Interest</p>
              </div>
              <p className="text-xl font-bold tabular-nums" style={{ color: '#22d3ee' }}>
                {formatCurrency(snowball.totalInterest)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Paid off in {formatMonths(snowball.totalMonths)}
              </p>
            </Card>

            {/* Savings */}
            <Card padding="sm">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Avalanche Saves You</p>
              <p
                className="text-xl font-bold tabular-nums mt-1"
                style={{ color: savings > 0 ? '#34d399' : savings < 0 ? '#ef4444' : 'var(--text-primary)' }}
              >
                {savings > 0 ? '+' : ''}{formatCurrency(Math.abs(savings))}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {savings > 0 ? 'less interest vs snowball' : savings < 0 ? 'more interest vs snowball' : 'same as snowball'}
              </p>
            </Card>
          </div>

          {/* Strategy comparison */}
          <Card padding="md">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Strategy Comparison
            </h3>
            <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
              Side-by-side payoff timelines showing when each debt is eliminated
            </p>
            <TimelineChart avalanche={avalanche} snowball={snowball} debts={debts} />
          </Card>

          {/* Payoff balance chart */}
          <Card padding="md">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Total Balance Over Time
            </h3>
            <BalanceChart avalanche={avalanche} snowball={snowball} />
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Balance-over-time SVG chart
// ---------------------------------------------------------------------------

function BalanceChart({ avalanche, snowball }: { avalanche: StrategyResult; snowball: StrategyResult }) {
  const W = 700;
  const H = 280;
  const PAD = { top: 16, right: 20, bottom: 36, left: 70 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxMonth = Math.max(avalanche.totalMonths, snowball.totalMonths, 1);
  const maxBal = Math.max(
    avalanche.monthlyData[0]?.totalRemaining ?? 0,
    snowball.monthlyData[0]?.totalRemaining ?? 0,
    1,
  );

  const xScale = (m: number) => PAD.left + (m / maxMonth) * plotW;
  const yScale = (v: number) => PAD.top + plotH - (v / maxBal) * plotH;

  const makePath = (data: { month: number; totalRemaining: number }[]) => {
    // Sample to keep SVG manageable (max ~120 points)
    const step = Math.max(1, Math.floor(data.length / 120));
    const sampled = data.filter((_, i) => i % step === 0 || i === data.length - 1);
    return sampled
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.month).toFixed(1)},${yScale(d.totalRemaining).toFixed(1)}`)
      .join(' ');
  };

  // Y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => (maxBal / 4) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
      {/* Grid */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
            stroke="rgba(148,163,184,0.1)" strokeDasharray="4 4"
          />
          <text x={PAD.left - 8} y={yScale(v) + 4} textAnchor="end" fill="#94a3b8" fontSize={10}>
            {formatCurrency(v)}
          </text>
        </g>
      ))}

      {/* Avalanche line */}
      <path d={makePath(avalanche.monthlyData)} fill="none" stroke="#ef4444" strokeWidth={2} />

      {/* Snowball line */}
      <path d={makePath(snowball.monthlyData)} fill="none" stroke="#22d3ee" strokeWidth={2} />

      {/* X-axis labels */}
      {Array.from({ length: Math.min(7, maxMonth + 1) }, (_, i) => {
        const m = Math.round((maxMonth / Math.min(6, maxMonth)) * i);
        return (
          <text key={m} x={xScale(m)} y={H - 6} textAnchor="middle" fill="#94a3b8" fontSize={10}>
            {formatMonths(m)}
          </text>
        );
      })}

      {/* Legend */}
      <circle cx={PAD.left + 10} cy={PAD.top + 8} r={4} fill="#ef4444" />
      <text x={PAD.left + 20} y={PAD.top + 12} fill="#ef4444" fontSize={10} fontWeight={600}>Avalanche</text>
      <circle cx={PAD.left + 100} cy={PAD.top + 8} r={4} fill="#22d3ee" />
      <text x={PAD.left + 110} y={PAD.top + 12} fill="#22d3ee" fontSize={10} fontWeight={600}>Snowball</text>
    </svg>
  );
}
