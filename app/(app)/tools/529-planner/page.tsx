'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, Input } from '@/components/ui';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * College 529 Planner
 *
 * Projects 529 savings growth and compares against estimated college costs.
 * Shows coverage percentage and required contribution to close the gap.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

interface PlannerResult {
  projectedBalance: number;
  totalCollegeCost: number;
  coveragePercent: number;
  gap: number;
  requiredMonthly: number;
  chartData: { year: number; childAge: number; savings: number; collegeCost: number }[];
}

function calculate529(
  childAge: number,
  targetAge: number,
  monthlyContribution: number,
  expectedReturn: number,
  currentBalance: number,
  annualCollegeCost: number,
): PlannerResult {
  const yearsToCollege = Math.max(targetAge - childAge, 0);
  const totalCollegeCost = annualCollegeCost * 4; // 4-year degree
  const collegeInflation = 0.05; // 5% annual college cost inflation
  const inflatedAnnualCost = annualCollegeCost * Math.pow(1 + collegeInflation, yearsToCollege);
  const inflatedTotalCost = inflatedAnnualCost * 4;

  // Monthly compounding
  const monthlyRate = expectedReturn / 12;
  const totalMonths = yearsToCollege * 12;

  // Future value of current balance
  const fvBalance = currentBalance * Math.pow(1 + monthlyRate, totalMonths);

  // Future value of monthly contributions (annuity)
  const fvContributions =
    totalMonths > 0
      ? monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
      : 0;

  const projectedBalance = fvBalance + fvContributions;
  const coveragePercent = inflatedTotalCost > 0 ? (projectedBalance / inflatedTotalCost) * 100 : 0;
  const gap = Math.max(inflatedTotalCost - projectedBalance, 0);

  // Required monthly to close the gap
  let requiredMonthly = monthlyContribution;
  if (gap > 0 && totalMonths > 0) {
    // We need: fvBalance + required * ((1+r)^n - 1)/r = inflatedTotalCost
    const annuityFactor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
    const needed = inflatedTotalCost - fvBalance;
    requiredMonthly = annuityFactor > 0 ? needed / annuityFactor : 0;
  }

  // Chart data: yearly projection
  const chartData: PlannerResult['chartData'] = [];
  for (let y = 0; y <= yearsToCollege + 4; y++) {
    const months = y * 12;
    const age = childAge + y;

    let savings: number;
    if (months <= totalMonths) {
      const fvBal = currentBalance * Math.pow(1 + monthlyRate, months);
      const fvCont =
        months > 0
          ? monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
          : 0;
      savings = fvBal + fvCont;
    } else {
      // During college, drawdown
      const yearsInCollege = y - yearsToCollege;
      savings = Math.max(projectedBalance - inflatedAnnualCost * yearsInCollege, 0);
    }

    // College cost line: shows 0 before college, then the remaining total cost
    const collegeCost = y >= yearsToCollege ? inflatedTotalCost : 0;

    chartData.push({
      year: y,
      childAge: age,
      savings: Math.round(savings),
      collegeCost: Math.round(y < yearsToCollege ? inflatedTotalCost : inflatedTotalCost),
    });
  }

  return {
    projectedBalance: Math.round(projectedBalance),
    totalCollegeCost: Math.round(inflatedTotalCost),
    coveragePercent: Math.round(coveragePercent * 10) / 10,
    gap: Math.round(gap),
    requiredMonthly: Math.round(requiredMonthly),
    chartData,
  };
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string; payload?: Record<string, unknown> }>; label?: number }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as { childAge: number } | undefined;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg border"
      style={{
        background: 'rgba(10, 22, 40, 0.95)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: '#e2e8f0' }}>
        Year {label} (Child Age {data?.childAge})
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === 'savings' ? '529 Balance' : 'Total College Cost'}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CollegePlannerPage() {
  const [childAge, setChildAge] = useState(5);
  const [targetAge, setTargetAge] = useState(18);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [expectedReturn, setExpectedReturn] = useState(0.07);
  const [currentBalance, setCurrentBalance] = useState(15000);
  const [annualCollegeCost, setAnnualCollegeCost] = useState(35000);

  const result = useMemo(
    () =>
      calculate529(childAge, targetAge, monthlyContribution, expectedReturn, currentBalance, annualCollegeCost),
    [childAge, targetAge, monthlyContribution, expectedReturn, currentBalance, annualCollegeCost],
  );

  const yearsToCollege = Math.max(targetAge - childAge, 0);
  const isFunded = result.coveragePercent >= 100;

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
            style={{ backgroundColor: 'rgba(250,204,21,0.1)' }}
          >
            <GraduationCap size={22} style={{ color: '#facc15' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              College 529 Planner
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Education savings optimization with inflation-adjusted costs
            </p>
          </div>
        </div>
      </motion.div>

      {/* Concept explainer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card padding="sm">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            A 529 plan lets your education savings grow tax-free. Contributions are invested and withdrawals for
            qualified education expenses are not taxed. College costs typically rise ~5% per year, so starting early
            gives compound growth the time to work in your favor.
          </p>
        </Card>
      </motion.div>

      {/* Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Plan Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Child's Current Age"
              type="number"
              min={0}
              max={17}
              value={childAge}
              onChange={(e) => setChildAge(Number(e.target.value) || 0)}
              fullWidth
            />
            <Input
              label="Target College Start Age"
              type="number"
              min={16}
              max={22}
              value={targetAge}
              onChange={(e) => setTargetAge(Number(e.target.value) || 18)}
              fullWidth
            />
            <Input
              label="Current 529 Balance ($)"
              type="number"
              min={0}
              value={currentBalance}
              onChange={(e) => setCurrentBalance(Number(e.target.value) || 0)}
              fullWidth
            />
            <Input
              label="Monthly Contribution ($)"
              type="number"
              min={0}
              step={50}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)}
              fullWidth
            />
            <Input
              label="Expected Annual Return (%)"
              type="number"
              min={0}
              max={15}
              step={0.5}
              value={Math.round(expectedReturn * 100 * 10) / 10}
              onChange={(e) => setExpectedReturn((Number(e.target.value) || 0) / 100)}
              hint="Typical: 6-8% for stock-heavy allocation"
              fullWidth
            />
            <Input
              label="Estimated Annual College Cost ($)"
              type="number"
              min={0}
              step={1000}
              value={annualCollegeCost}
              onChange={(e) => setAnnualCollegeCost(Number(e.target.value) || 0)}
              hint="Today's dollars (inflation applied automatically)"
              fullWidth
            />
          </div>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Years to College
            </p>
            <p className="text-xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>
              {yearsToCollege} years
            </p>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Projected 529 Balance
            </p>
            <p className="text-xl font-bold tabular-nums mt-1" style={{ color: '#22d3ee' }}>
              {fmt(result.projectedBalance)}
            </p>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Est. Total College Cost
            </p>
            <p className="text-xl font-bold tabular-nums mt-1" style={{ color: '#facc15' }}>
              {fmt(result.totalCollegeCost)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              4 years, inflation-adjusted
            </p>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Coverage
            </p>
            <p
              className="text-xl font-bold tabular-nums mt-1"
              style={{ color: isFunded ? '#34d399' : result.coveragePercent >= 75 ? '#facc15' : '#ef4444' }}
            >
              {result.coveragePercent}%
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {isFunded ? 'Fully funded' : `Gap: ${fmt(result.gap)}`}
            </p>
          </Card>
        </div>

        {/* Result sentence */}
        <Card
          padding="sm"
          style={{
            borderLeft: `4px solid ${isFunded ? '#34d399' : '#fb923c'}`,
          }}
        >
          <div className="flex items-start gap-3">
            {isFunded ? (
              <TrendingUp size={20} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <AlertTriangle size={20} style={{ color: '#fb923c', flexShrink: 0, marginTop: 2 }} />
            )}
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                At {fmt(monthlyContribution)}/month, you will have {fmt(result.projectedBalance)} when your child
                starts college (covering {result.coveragePercent}% of estimated costs).
              </p>
              {!isFunded && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  To fully fund college, increase contributions to{' '}
                  <span style={{ color: '#22d3ee', fontWeight: 600 }}>{fmt(result.requiredMonthly)}/month</span>.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card padding="md">
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Savings Growth vs College Cost
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            529 balance projection with total college cost target line
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                  tickLine={false}
                  label={{ value: 'Years from now', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <ReferenceLine
                  y={result.totalCollegeCost}
                  stroke="#facc15"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `College Cost: ${fmt(result.totalCollegeCost)}`,
                    position: 'right',
                    fill: '#facc15',
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  name="529 Balance"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#savingsGradient)"
                  activeDot={{ r: 4, fill: '#22d3ee' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
