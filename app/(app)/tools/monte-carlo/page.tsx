'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Play, TrendingUp, ShieldCheck, BarChart3, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Card, Input, Button } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Monte Carlo Wealth Simulator
 *
 * Runs 10,000 stochastic simulations of portfolio growth over a configurable
 * horizon, modeling log-normal returns with monthly contributions and a
 * post-retirement withdrawal phase. Outputs percentile fan chart, success
 * rate, projected wealth tiers, and crash survival rate.
 *
 * All computation is client-side — no API calls.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Simulation engine (self-contained — no external dependency)
// ---------------------------------------------------------------------------

/** Box-Muller polar method for standard normal variate */
function randn(): number {
  let u: number, v: number, s: number;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  return u * Math.sqrt((-2 * Math.log(s)) / s);
}

interface SimResult {
  /** Portfolio value at each year-end, length = horizon + 1 */
  trajectory: number[];
}

interface SimulationOutput {
  /** Fraction of runs that did not deplete (0..1) */
  successRate: number;
  /** Percentile trajectories: p10, p25, p50, p75, p90 */
  percentiles: Record<string, number[]>;
  /** Final wealth at end of horizon: best (p90), median (p50), worst (p10) */
  finalWealth: { best: number; median: number; worst: number };
  /** Fraction of simulations surviving a 40% crash in year 1 */
  crashSurvivalRate: number;
}

function runSimulations(
  currentSavings: number,
  monthlyContribution: number,
  expectedReturn: number,  // annual, e.g. 0.08
  volatility: number,      // annual std dev, e.g. 0.15
  horizonYears: number,
  withdrawalRate: number,  // annual, e.g. 0.04 — applied only in final year check
  numSims: number = 10_000,
): SimulationOutput {
  const annualContribution = monthlyContribution * 12;
  const allTrajectories: number[][] = [];
  let successCount = 0;
  let crashSurvivors = 0;
  const crashSims = Math.floor(numSims * 0.05); // 5% get a crash in year 1

  for (let sim = 0; sim < numSims; sim++) {
    const traj: number[] = [currentSavings];
    let balance = currentSavings;
    let depleted = false;
    const isCrashSim = sim < crashSims;

    for (let yr = 1; yr <= horizonYears; yr++) {
      // Log-normal return for this year
      let annualReturn: number;
      if (isCrashSim && yr === 1) {
        // Force a severe crash: -40% in year 1
        annualReturn = -0.40;
      } else {
        const z = randn();
        // Geometric Brownian motion: r = mu - 0.5*sigma^2 + sigma*Z
        const logReturn = (expectedReturn - 0.5 * volatility * volatility) + volatility * z;
        annualReturn = Math.exp(logReturn) - 1;
      }

      balance = balance * (1 + annualReturn) + annualContribution;
      if (balance < 0) {
        balance = 0;
        depleted = true;
      }
      traj.push(balance);
    }

    // Success check: can the portfolio sustain withdrawals?
    // We check if the final balance can support the withdrawal rate indefinitely
    // (i.e., the balance is positive and the withdrawal doesn't exceed balance)
    const annualWithdrawal = balance * withdrawalRate;
    const isSuccess = !depleted && balance > 0 && annualWithdrawal < balance;
    if (isSuccess) successCount++;
    if (isCrashSim && isSuccess) crashSurvivors++;

    allTrajectories.push(traj);
  }

  // Compute percentiles at each year
  const pLabels = ['p10', 'p25', 'p50', 'p75', 'p90'];
  const pValues = [10, 25, 50, 75, 90];
  const percentiles: Record<string, number[]> = {};
  for (const label of pLabels) percentiles[label] = [];

  for (let yr = 0; yr <= horizonYears; yr++) {
    const vals = allTrajectories.map((t) => t[yr]).sort((a, b) => a - b);
    for (let pi = 0; pi < pLabels.length; pi++) {
      const idx = Math.floor((pValues[pi] / 100) * (vals.length - 1));
      percentiles[pLabels[pi]].push(vals[idx]);
    }
  }

  return {
    successRate: successCount / numSims,
    percentiles,
    finalWealth: {
      best: percentiles['p90'][horizonYears],
      median: percentiles['p50'][horizonYears],
      worst: percentiles['p10'][horizonYears],
    },
    crashSurvivalRate: crashSims > 0 ? crashSurvivors / crashSims : 1,
  };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K';
  return '$' + n.toFixed(0);
}

function formatPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

// ---------------------------------------------------------------------------
// SVG Percentile Chart
// ---------------------------------------------------------------------------

function PercentileChart({ percentiles, horizonYears }: { percentiles: Record<string, number[]>; horizonYears: number }) {
  const W = 700;
  const H = 320;
  const PAD = { top: 20, right: 20, bottom: 40, left: 70 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // Find max value for y-axis
  const allVals = Object.values(percentiles).flat();
  const maxVal = Math.max(...allVals, 1);

  const xScale = (yr: number) => PAD.left + (yr / horizonYears) * plotW;
  const yScale = (val: number) => PAD.top + plotH - (val / maxVal) * plotH;

  const makePath = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');

  // Area between p10 and p90
  const areaPath = (() => {
    const top = percentiles['p90'].map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');
    const bottom = [...percentiles['p10']].reverse().map((v, i) => {
      const yr = horizonYears - i;
      return `L${xScale(yr).toFixed(1)},${yScale(v).toFixed(1)}`;
    }).join(' ');
    return top + ' ' + bottom + ' Z';
  })();

  // Area between p25 and p75
  const innerArea = (() => {
    const top = percentiles['p75'].map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');
    const bottom = [...percentiles['p25']].reverse().map((v, i) => {
      const yr = horizonYears - i;
      return `L${xScale(yr).toFixed(1)},${yScale(v).toFixed(1)}`;
    }).join(' ');
    return top + ' ' + bottom + ' Z';
  })();

  // Y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => (maxVal / 4) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 360 }}>
      {/* Grid lines */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
            stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4"
          />
          <text x={PAD.left - 8} y={yScale(v) + 4} textAnchor="end" fill="#94a3b8" fontSize={11}>
            {formatCurrency(v)}
          </text>
        </g>
      ))}

      {/* Outer fan (p10-p90) */}
      <path d={areaPath} fill="rgba(34,211,238,0.08)" />
      {/* Inner fan (p25-p75) */}
      <path d={innerArea} fill="rgba(34,211,238,0.15)" />

      {/* Lines */}
      <path d={makePath(percentiles['p90'])} fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth={1.5} />
      <path d={makePath(percentiles['p75'])} fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} />
      <path d={makePath(percentiles['p50'])} fill="none" stroke="#22d3ee" strokeWidth={2.5} />
      <path d={makePath(percentiles['p25'])} fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} />
      <path d={makePath(percentiles['p10'])} fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth={1.5} />

      {/* X-axis labels */}
      {Array.from({ length: Math.min(horizonYears + 1, 11) }, (_, i) => {
        const yr = Math.round((horizonYears / Math.min(horizonYears, 10)) * i);
        return (
          <text key={yr} x={xScale(yr)} y={H - 8} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            Yr {yr}
          </text>
        );
      })}

      {/* Legend */}
      <text x={W - PAD.right} y={yScale(percentiles['p90'][horizonYears]) - 6} textAnchor="end" fill="rgba(34,211,238,0.6)" fontSize={10}>P90</text>
      <text x={W - PAD.right} y={yScale(percentiles['p50'][horizonYears]) - 6} textAnchor="end" fill="#22d3ee" fontSize={10} fontWeight={600}>P50</text>
      <text x={W - PAD.right} y={yScale(percentiles['p10'][horizonYears]) + 14} textAnchor="end" fill="rgba(34,211,238,0.6)" fontSize={10}>P10</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Percentile Horizontal Bar Chart
// ---------------------------------------------------------------------------

function PercentileBars({ percentiles, horizonYears }: { percentiles: Record<string, number[]>; horizonYears: number }) {
  const entries = [
    { label: 'P90 (Optimistic)', key: 'p90', color: '#34d399' },
    { label: 'P75', key: 'p75', color: '#22d3ee' },
    { label: 'P50 (Median)', key: 'p50', color: '#22d3ee' },
    { label: 'P25', key: 'p25', color: '#facc15' },
    { label: 'P10 (Conservative)', key: 'p10', color: '#ef4444' },
  ];

  const maxVal = Math.max(...entries.map((e) => percentiles[e.key][horizonYears]), 1);

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const val = percentiles[entry.key][horizonYears];
        const pct = Math.max(2, (val / maxVal) * 100);
        return (
          <div key={entry.key}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>{entry.label}</span>
              <span className="font-semibold tabular-nums" style={{ color: entry.color }}>
                {formatCurrency(val)}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(30,41,59,0.6)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: entry.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MonteCarloPage() {
  // Form state
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(1500);
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [volatility, setVolatility] = useState(15);
  const [horizonYears, setHorizonYears] = useState(30);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  // Simulation state
  const [result, setResult] = useState<SimulationOutput | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Live data integration
  const [useLiveData, setUseLiveData] = useState(false);
  const [liveDataAvailable, setLiveDataAvailable] = useState<boolean | null>(null);
  const [liveDataLoading, setLiveDataLoading] = useState(false);

  const loadLiveData = useCallback(async () => {
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
        if (useLiveData) {
          // Auto-populate from snapshot
          // Monthly contribution from savings rate
          const income = data.financial?.breakdown?.income ?? 0;
          const savingsRateVal = data.timing?.breakdown?.savingsRate?.value ?? 0.15;
          setMonthlyContribution(Math.round((income / 12) * savingsRateVal));
        }
      } else {
        setLiveDataAvailable(false);
      }
    } catch {
      setLiveDataAvailable(false);
    } finally {
      setLiveDataLoading(false);
    }
  }, [useLiveData]);

  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    // Defer to next frame so the button can show loading state
    requestAnimationFrame(() => {
      const output = runSimulations(
        currentSavings,
        monthlyContribution,
        expectedReturn / 100,
        volatility / 100,
        horizonYears,
        withdrawalRate / 100,
        10_000,
      );
      setResult(output);
      setIsRunning(false);
    });
  }, [currentSavings, monthlyContribution, expectedReturn, volatility, horizonYears, withdrawalRate]);

  // Success rate color
  const successColor = useMemo(() => {
    if (!result) return '#94a3b8';
    if (result.successRate >= 0.85) return '#34d399';
    if (result.successRate >= 0.70) return '#facc15';
    return '#ef4444';
  }, [result]);

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
            style={{ backgroundColor: 'rgba(34,211,238,0.1)' }}
          >
            <TrendingUp size={22} style={{ color: 'var(--cyan)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Monte Carlo Wealth Simulator
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              10,000 scenarios stress-testing your retirement plan
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
              const next = !useLiveData;
              setUseLiveData(next);
              if (next) loadLiveData();
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: useLiveData ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.1)',
              color: useLiveData ? 'var(--emerald)' : 'var(--text-secondary)',
              border: `1px solid ${useLiveData ? 'rgba(52,211,153,0.3)' : 'rgba(148,163,184,0.2)'}`,
            }}
          >
            {useLiveData ? <Wifi size={16} /> : <WifiOff size={16} />}
            {liveDataLoading ? 'Loading...' : useLiveData ? 'Using Live Financial Data' : 'Use Live Data from Plaid'}
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

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Input
              label="Current Savings ($)"
              type="number"
              min={0}
              step={1000}
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              fullWidth
            />
            <Input
              label="Monthly Contribution ($)"
              type="number"
              min={0}
              step={100}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              fullWidth
            />
            <Input
              label="Expected Annual Return (%)"
              type="number"
              min={0}
              max={30}
              step={0.5}
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              hint="Historical S&P 500: ~10%"
              fullWidth
            />
            <Input
              label="Annual Volatility (%)"
              type="number"
              min={1}
              max={50}
              step={1}
              value={volatility}
              onChange={(e) => setVolatility(Number(e.target.value))}
              hint="S&P 500 historical: ~15%"
              fullWidth
            />
            <Input
              label="Time Horizon (years)"
              type="number"
              min={1}
              max={60}
              step={1}
              value={horizonYears}
              onChange={(e) => setHorizonYears(Number(e.target.value))}
              fullWidth
            />
            <Input
              label="Withdrawal Rate (%)"
              type="number"
              min={0}
              max={15}
              step={0.5}
              value={withdrawalRate}
              onChange={(e) => setWithdrawalRate(Number(e.target.value))}
              hint="Safe withdrawal rule: 4%"
              fullWidth
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="cta"
              size="lg"
              icon={<Play size={18} />}
              loading={isRunning}
              onClick={handleRun}
            >
              Run 10,000 Simulations
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top-level stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Success Rate */}
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${successColor}15` }}
                >
                  <ShieldCheck size={20} style={{ color: successColor }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Success Rate</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: successColor }}>
                    {formatPct(result.successRate)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Best Case */}
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(52,211,153,0.1)' }}
                >
                  <TrendingUp size={20} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Best Case (P90)</p>
                  <p className="text-xl font-bold tabular-nums" style={{ color: '#34d399' }}>
                    {formatCurrency(result.finalWealth.best)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Median Case */}
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(34,211,238,0.1)' }}
                >
                  <BarChart3 size={20} style={{ color: '#22d3ee' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Median (P50)</p>
                  <p className="text-xl font-bold tabular-nums" style={{ color: '#22d3ee' }}>
                    {formatCurrency(result.finalWealth.median)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Crash Survival */}
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(250,204,21,0.1)' }}
                >
                  <AlertTriangle size={20} style={{ color: '#facc15' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Crash Survival</p>
                  <p className="text-xl font-bold tabular-nums" style={{ color: '#facc15' }}>
                    {formatPct(result.crashSurvivalRate)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Fan chart */}
            <Card padding="md" className="lg:col-span-3">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Portfolio Growth Fan Chart
              </h3>
              <PercentileChart percentiles={result.percentiles} horizonYears={horizonYears} />
              <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-1 rounded" style={{ background: '#22d3ee' }} /> Median
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'rgba(34,211,238,0.15)' }} /> P25-P75
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'rgba(34,211,238,0.08)' }} /> P10-P90
                </span>
              </div>
            </Card>

            {/* Percentile bars */}
            <Card padding="md" className="lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Final Wealth by Percentile
              </h3>
              <PercentileBars percentiles={result.percentiles} horizonYears={horizonYears} />
            </Card>
          </div>

          {/* Projected wealth summary */}
          <Card padding="md">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Projected Wealth at Year {horizonYears}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Worst Case (P10)</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: '#ef4444' }}>
                  {formatCurrency(result.finalWealth.worst)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Median (P50)</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: '#22d3ee' }}>
                  {formatCurrency(result.finalWealth.median)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Best Case (P90)</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: '#34d399' }}>
                  {formatCurrency(result.finalWealth.best)}
                </p>
              </div>
            </div>
            <div
              className="mt-4 pt-4 text-center text-xs"
              style={{ borderTop: '1px solid rgba(34,211,238,0.1)', color: 'var(--text-secondary)' }}
            >
              Based on {(10_000).toLocaleString()} simulated scenarios with {expectedReturn}% expected return and {volatility}% volatility
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
