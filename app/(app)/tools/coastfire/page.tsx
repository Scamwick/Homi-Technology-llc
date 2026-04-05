'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Compass, PartyPopper, Target } from 'lucide-react';
import { Card, Input, Slider } from '@/components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CoastFIRE Calculator
 *
 * Calculates the "coast number" — the portfolio value today that will grow
 * to your retirement target with zero additional contributions.
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

interface CoastResult {
  requiredAtRetirement: number;
  coastNumber: number;
  hasCoasted: boolean;
  surplus: number;
  deficit: number;
  monthlySavingsNeeded: number;
  yearsToCoast: number | null;
  chartData: { year: number; age: number; coastTrajectory: number; targetLine: number }[];
}

function calculateCoastFIRE(
  currentAge: number,
  retirementAge: number,
  currentInvestments: number,
  expectedReturn: number,
  desiredRetirementIncome: number,
  withdrawalRate: number,
): CoastResult {
  const yearsToRetirement = Math.max(retirementAge - currentAge, 1);

  // Required portfolio at retirement
  const requiredAtRetirement = desiredRetirementIncome / withdrawalRate;

  // Coast number: what you need TODAY to grow to requiredAtRetirement with no contributions
  const coastNumber = requiredAtRetirement / Math.pow(1 + expectedReturn, yearsToRetirement);

  const hasCoasted = currentInvestments >= coastNumber;
  const surplus = hasCoasted ? currentInvestments - coastNumber : 0;
  const deficit = hasCoasted ? 0 : coastNumber - currentInvestments;

  // Monthly savings needed to reach coast number
  let monthlySavingsNeeded = 0;
  if (!hasCoasted) {
    // FV of monthly contributions to bridge the gap
    // We need: currentInvestments + contributions_FV = coastNumber (in present value terms)
    // Actually we need to find monthly saving such that the gap is covered
    // Gap in FV terms: coastNumber - currentInvestments (both in today's dollars)
    // Monthly savings for N months at monthly rate r to accumulate to gap:
    const monthlyRate = expectedReturn / 12;
    const totalMonths = yearsToRetirement * 12;
    // But we want to reach coast number, which means we can stop saving once we hit it
    // Simplification: how much per month to go from currentInvestments to coastNumber
    // over a reasonable time frame (half the years to retirement)
    const savingYears = Math.min(yearsToRetirement, 10);
    const savingMonths = savingYears * 12;
    if (savingMonths > 0 && monthlyRate > 0) {
      const fvCurrent = currentInvestments * Math.pow(1 + monthlyRate, savingMonths);
      const fvNeeded = coastNumber * Math.pow(1 + monthlyRate, savingMonths); // coast number also grows
      // Wait, the coast number itself changes as time passes (fewer years to retirement)
      // Simplification: how much monthly to accumulate the deficit
      const annuityFactor = (Math.pow(1 + monthlyRate, savingMonths) - 1) / monthlyRate;
      monthlySavingsNeeded = annuityFactor > 0 ? deficit / annuityFactor : 0;
    }
  }

  // Calculate years to coast at current savings rate (assuming some monthly contribution)
  let yearsToCoast: number | null = null;
  if (!hasCoasted && monthlySavingsNeeded > 0) {
    // Iteratively find when investments reach coast number for that future date
    for (let y = 1; y <= yearsToRetirement; y++) {
      const futureCoastNumber = requiredAtRetirement / Math.pow(1 + expectedReturn, yearsToRetirement - y);
      const futureBalance = currentInvestments * Math.pow(1 + expectedReturn, y);
      if (futureBalance >= futureCoastNumber) {
        yearsToCoast = y;
        break;
      }
    }
  }

  // Chart: show portfolio growth with NO contributions (coast trajectory)
  const chartData: CoastResult['chartData'] = [];
  const yearsToProject = yearsToRetirement + 5;
  for (let y = 0; y <= yearsToProject; y++) {
    const age = currentAge + y;
    const coastTrajectory = currentInvestments * Math.pow(1 + expectedReturn, y);
    chartData.push({
      year: y,
      age,
      coastTrajectory: Math.round(coastTrajectory),
      targetLine: Math.round(requiredAtRetirement),
    });
  }

  return {
    requiredAtRetirement: Math.round(requiredAtRetirement),
    coastNumber: Math.round(coastNumber),
    hasCoasted,
    surplus: Math.round(surplus),
    deficit: Math.round(deficit),
    monthlySavingsNeeded: Math.round(monthlySavingsNeeded),
    yearsToCoast,
    chartData,
  };
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string; payload?: Record<string, unknown> }>; label?: number }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as { age: number } | undefined;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg border"
      style={{
        background: 'rgba(10, 22, 40, 0.95)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: '#e2e8f0' }}>
        Year {label} (Age {data?.age})
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === 'coastTrajectory' ? 'Portfolio (no contributions)' : 'Retirement Target'}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CoastFIREPage() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [currentInvestments, setCurrentInvestments] = useState(150000);
  const [expectedReturn, setExpectedReturn] = useState(0.07);
  const [desiredRetirementIncome, setDesiredRetirementIncome] = useState(80000);
  const [withdrawalRatePct, setWithdrawalRatePct] = useState(4);

  const withdrawalRate = withdrawalRatePct / 100;

  const result = useMemo(
    () =>
      calculateCoastFIRE(
        currentAge,
        retirementAge,
        currentInvestments,
        expectedReturn,
        desiredRetirementIncome,
        withdrawalRate,
      ),
    [currentAge, retirementAge, currentInvestments, expectedReturn, desiredRetirementIncome, withdrawalRate],
  );

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
            <Compass size={22} style={{ color: '#facc15' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              CoastFIRE Calculator
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              When can you stop saving and coast to retirement?
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
            CoastFIRE is the point where your existing investments, if left untouched, will grow to support your
            desired retirement income through compound growth alone. Once you reach your coast number, you only
            need to cover current expenses -- no more retirement saving required.
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
            Your Numbers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Current Age"
              type="number"
              min={18}
              max={70}
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value) || 18)}
              fullWidth
            />
            <Input
              label="Target Retirement Age"
              type="number"
              min={30}
              max={80}
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value) || 60)}
              fullWidth
            />
            <Input
              label="Current Investments ($)"
              type="number"
              min={0}
              value={currentInvestments}
              onChange={(e) => setCurrentInvestments(Number(e.target.value) || 0)}
              hint="Total retirement portfolio value"
              fullWidth
            />
            <Input
              label="Expected Annual Return (%)"
              type="number"
              min={1}
              max={15}
              step={0.5}
              value={Math.round(expectedReturn * 100 * 10) / 10}
              onChange={(e) => setExpectedReturn((Number(e.target.value) || 7) / 100)}
              hint="Historical average: 7-10%"
              fullWidth
            />
            <Input
              label="Desired Retirement Income ($/yr)"
              type="number"
              min={0}
              step={5000}
              value={desiredRetirementIncome}
              onChange={(e) => setDesiredRetirementIncome(Number(e.target.value) || 0)}
              fullWidth
            />
            <Slider
              label={`Withdrawal Rate: ${withdrawalRatePct}%`}
              min={2}
              max={6}
              step={0.5}
              value={withdrawalRatePct}
              onChange={setWithdrawalRatePct}
              color="cyan"
              showValue={false}
              className="pt-1"
            />
          </div>
        </Card>
      </motion.div>

      {/* Coast Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {result.hasCoasted ? (
          <Card
            padding="md"
            style={{
              borderColor: 'rgba(52, 211, 153, 0.5)',
              borderWidth: 2,
              background: 'rgba(52, 211, 153, 0.08)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex size-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(52,211,153,0.15)' }}
              >
                <PartyPopper size={28} style={{ color: '#34d399' }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: '#34d399' }}>
                  You have coasted!
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your {fmt(currentInvestments)} exceeds your coast number of {fmt(result.coastNumber)} by{' '}
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{fmt(result.surplus)}</span>.
                  Even without another dollar saved, compound growth will carry you to retirement.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            padding="md"
            style={{
              borderLeft: '4px solid #fb923c',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex size-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(251,146,60,0.1)' }}
              >
                <Target size={28} style={{ color: '#fb923c' }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  You need {fmt(result.deficit)} more to coast.
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Your coast number is {fmt(result.coastNumber)}. You currently have {fmt(currentInvestments)}.
                  {result.monthlySavingsNeeded > 0 && (
                    <>
                      {' '}Save{' '}
                      <span style={{ color: '#22d3ee', fontWeight: 600 }}>
                        {fmt(result.monthlySavingsNeeded)}/month
                      </span>{' '}
                      to reach your coast number.
                    </>
                  )}
                </p>
                {result.yearsToCoast !== null && (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    At current growth rate (no contributions), you will coast in{' '}
                    <span style={{ color: '#facc15', fontWeight: 600 }}>
                      {result.yearsToCoast} year{result.yearsToCoast !== 1 ? 's' : ''} (age {currentAge + result.yearsToCoast})
                    </span>.
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
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
              Coast Number
            </p>
            <p className="text-xl font-bold tabular-nums mt-1" style={{ color: '#22d3ee' }}>
              {fmt(result.coastNumber)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              What you need today
            </p>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Current Investments
            </p>
            <p
              className="text-xl font-bold tabular-nums mt-1"
              style={{ color: result.hasCoasted ? '#34d399' : 'var(--text-primary)' }}
            >
              {fmt(currentInvestments)}
            </p>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Required at Retirement
            </p>
            <p className="text-xl font-bold tabular-nums mt-1" style={{ color: '#facc15' }}>
              {fmt(result.requiredAtRetirement)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {fmt(desiredRetirementIncome)}/yr at {withdrawalRatePct}% WR
            </p>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Years to Retirement
            </p>
            <p className="text-xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>
              {Math.max(retirementAge - currentAge, 0)} years
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Retiring at age {retirementAge}
            </p>
          </Card>
        </div>

        {/* Chart */}
        <Card padding="md">
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Coast Trajectory
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Projected portfolio growth with no additional contributions
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis
                  dataKey="age"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                  tickLine={false}
                  label={{ value: 'Age', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
                    return `$${(v / 1000).toFixed(0)}k`;
                  }}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <ReferenceLine
                  y={result.requiredAtRetirement}
                  stroke="#facc15"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `Target: ${fmt(result.requiredAtRetirement)}`,
                    position: 'right',
                    fill: '#facc15',
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  x={retirementAge}
                  stroke="rgba(148,163,184,0.3)"
                  strokeDasharray="4 4"
                  label={{
                    value: `Retire at ${retirementAge}`,
                    position: 'top',
                    fill: '#94a3b8',
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="coastTrajectory"
                  name="Portfolio (no contributions)"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22d3ee' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
