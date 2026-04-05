'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, Input, Slider } from '@/components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Roth Conversion Optimizer
 *
 * Compares keeping funds in a Traditional IRA vs converting to Roth IRA.
 * Shows break-even year and lifetime tax savings.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Tax bracket options
// ---------------------------------------------------------------------------

const TAX_BRACKETS = [
  { label: '10%', value: 0.10 },
  { label: '12%', value: 0.12 },
  { label: '22%', value: 0.22 },
  { label: '24%', value: 0.24 },
  { label: '32%', value: 0.32 },
  { label: '35%', value: 0.35 },
  { label: '37%', value: 0.37 },
];

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

interface RothResult {
  taxCostNow: number;
  breakEvenYear: number | null;
  lifetimeTaxSavings: number;
  chartData: { year: number; age: number; traditional: number; roth: number }[];
  convertAdvised: boolean;
}

function calculateRoth(
  currentAge: number,
  iraBalance: number,
  currentBracket: number,
  retirementBracket: number,
  conversionAmount: number,
  annualReturn: number,
): RothResult {
  const yearsToProject = Math.max(90 - currentAge, 20);
  const taxCostNow = conversionAmount * currentBracket;

  // Traditional: grows tax-deferred, taxed at retirement bracket on withdrawal
  // Roth: taxed now, then grows and withdrawn tax-free
  const traditionalStart = iraBalance;
  const rothStart = iraBalance - conversionAmount + (conversionAmount - taxCostNow);
  // Actually: Traditional keeps full balance, Roth loses tax payment from outside
  // Scenario A (Traditional): full balance grows, withdrawals taxed at retirement rate
  // Scenario B (Roth conversion): pay tax now (reducing outside funds), converted amount grows tax-free

  const chartData: RothResult['chartData'] = [];
  let breakEvenYear: number | null = null;

  for (let y = 0; y <= yearsToProject; y++) {
    const age = currentAge + y;
    const growth = Math.pow(1 + annualReturn, y);

    // Traditional: full balance grows, but withdrawals taxed
    const tradGross = traditionalStart * growth;
    const tradNet = tradGross * (1 - retirementBracket);

    // Roth: conversion amount already taxed, rest stays traditional
    const unconverted = (iraBalance - conversionAmount) * growth;
    const unconvertedNet = unconverted * (1 - retirementBracket);
    const convertedNet = conversionAmount * growth; // tax-free
    const rothNet = unconvertedNet + convertedNet - taxCostNow * growth;
    // The tax cost grows at the same rate (opportunity cost of paying tax now)
    // Simpler model: Roth net = converted grows tax-free minus what you paid
    // Traditional net = everything taxed at retirement rate

    // Simplified comparison:
    // Traditional after-tax value of the conversion amount portion
    const tradPortionNet = conversionAmount * growth * (1 - retirementBracket);
    // Roth after-tax value: grows tax-free, but paid tax now (that money could have grown)
    const rothPortionNet = conversionAmount * growth - taxCostNow * Math.pow(1 + annualReturn, y);

    // Better simplified model:
    // If you convert $X: pay $X * currentRate now. $X grows tax-free.
    // After-tax Roth value at year y: $X * (1+r)^y
    // Cost: taxCostNow * (1+r)^y (opportunity cost of the tax payment)
    // Net Roth benefit: X*(1+r)^y - taxCostNow*(1+r)^y = (X - taxCostNow)*(1+r)^y

    // If you don't convert:
    // $X grows to X*(1+r)^y, taxed at retirement rate = X*(1+r)^y*(1-retRate)

    const tradValue = conversionAmount * growth * (1 - retirementBracket);
    const rothValue = (conversionAmount - taxCostNow) * growth;

    chartData.push({
      year: y,
      age,
      traditional: Math.round(tradValue),
      roth: Math.round(rothValue),
    });

    if (breakEvenYear === null && rothValue > tradValue && y > 0) {
      breakEvenYear = y;
    }
  }

  // Lifetime tax savings at age 85
  const yearsTo85 = Math.max(85 - currentAge, 10);
  const growth85 = Math.pow(1 + annualReturn, yearsTo85);
  const tradAt85 = conversionAmount * growth85 * (1 - retirementBracket);
  const rothAt85 = (conversionAmount - taxCostNow) * growth85;
  const lifetimeTaxSavings = rothAt85 - tradAt85;

  const convertAdvised = currentBracket < retirementBracket;

  return { taxCostNow, breakEvenYear, lifetimeTaxSavings, chartData, convertAdvised };
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
          {p.dataKey === 'traditional' ? 'Traditional' : 'Roth'}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RothConversionPage() {
  const [currentAge, setCurrentAge] = useState(35);
  const [iraBalance, setIraBalance] = useState(250000);
  const [currentBracketIdx, setCurrentBracketIdx] = useState(2); // 22%
  const [retirementBracketIdx, setRetirementBracketIdx] = useState(3); // 24%
  const [conversionAmount, setConversionAmount] = useState(50000);
  const annualReturn = 0.07;

  const currentBracket = TAX_BRACKETS[currentBracketIdx].value;
  const retirementBracket = TAX_BRACKETS[retirementBracketIdx].value;

  const result = useMemo(
    () =>
      calculateRoth(
        currentAge,
        iraBalance,
        currentBracket,
        retirementBracket,
        Math.min(conversionAmount, iraBalance),
        annualReturn,
      ),
    [currentAge, iraBalance, currentBracket, retirementBracket, conversionAmount],
  );

  const effectiveConversion = Math.min(conversionAmount, iraBalance);

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
            <ArrowLeftRight size={22} style={{ color: '#facc15' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Roth Conversion Optimizer
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Should you convert your Traditional IRA to Roth? Run the math.
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
            A Roth conversion moves money from a Traditional IRA (tax-deferred) to a Roth IRA (tax-free growth).
            You pay income tax on the converted amount today, but all future growth and withdrawals are tax-free.
            The key question: is your current tax rate lower than your expected retirement rate?
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
            Your Situation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Current Age"
              type="number"
              min={18}
              max={80}
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value) || 18)}
              fullWidth
            />
            <Input
              label="Traditional IRA Balance ($)"
              type="number"
              min={0}
              value={iraBalance}
              onChange={(e) => setIraBalance(Number(e.target.value) || 0)}
              fullWidth
            />
            <Input
              label="Conversion Amount ($)"
              type="number"
              min={0}
              max={iraBalance}
              value={conversionAmount}
              onChange={(e) => setConversionAmount(Number(e.target.value) || 0)}
              hint={conversionAmount > iraBalance ? 'Capped at IRA balance' : `Converting ${fmt(effectiveConversion)}`}
              fullWidth
            />
            <div /> {/* spacer for grid alignment */}
            <Slider
              label={`Current Tax Bracket: ${TAX_BRACKETS[currentBracketIdx].label}`}
              min={0}
              max={TAX_BRACKETS.length - 1}
              step={1}
              value={currentBracketIdx}
              onChange={setCurrentBracketIdx}
              color="cyan"
              showValue={false}
            />
            <Slider
              label={`Expected Retirement Bracket: ${TAX_BRACKETS[retirementBracketIdx].label}`}
              min={0}
              max={TAX_BRACKETS.length - 1}
              step={1}
              value={retirementBracketIdx}
              onChange={setRetirementBracketIdx}
              color="emerald"
              showValue={false}
            />
          </div>
        </Card>
      </motion.div>

      {/* Key Insight */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card
          padding="sm"
          style={{
            borderLeft: `4px solid ${result.convertAdvised ? '#34d399' : '#fb923c'}`,
          }}
        >
          <div className="flex items-start gap-3">
            {result.convertAdvised ? (
              <CheckCircle size={20} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <AlertTriangle size={20} style={{ color: '#fb923c', flexShrink: 0, marginTop: 2 }} />
            )}
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {result.convertAdvised
                  ? 'Conversion looks favorable'
                  : 'Conversion may not be optimal'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {result.convertAdvised
                  ? `Your current bracket (${(currentBracket * 100).toFixed(0)}%) is lower than your expected retirement bracket (${(retirementBracket * 100).toFixed(0)}%). Paying taxes now at a lower rate saves money long-term.`
                  : currentBracket === retirementBracket
                    ? `Your current and retirement brackets are the same (${(currentBracket * 100).toFixed(0)}%). The benefit depends on your time horizon and growth.`
                    : `Your current bracket (${(currentBracket * 100).toFixed(0)}%) is higher than your expected retirement bracket (${(retirementBracket * 100).toFixed(0)}%). You may be better off waiting.`}
              </p>
            </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Tax Cost Now
            </p>
            <p className="text-xl font-bold tabular-nums mt-1" style={{ color: '#ef4444' }}>
              {fmt(result.taxCostNow)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {(currentBracket * 100).toFixed(0)}% of {fmt(effectiveConversion)}
            </p>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Break-Even Year
            </p>
            <p
              className="text-xl font-bold tabular-nums mt-1"
              style={{ color: result.breakEvenYear ? '#22d3ee' : '#94a3b8' }}
            >
              {result.breakEvenYear
                ? `Year ${result.breakEvenYear} (Age ${currentAge + result.breakEvenYear})`
                : 'N/A'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {result.breakEvenYear
                ? 'When Roth overtakes Traditional'
                : 'Roth does not overtake Traditional'}
            </p>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Lifetime Tax Savings (to 85)
            </p>
            <p
              className="text-xl font-bold tabular-nums mt-1"
              style={{ color: result.lifetimeTaxSavings > 0 ? '#34d399' : '#ef4444' }}
            >
              {result.lifetimeTaxSavings > 0 ? '+' : ''}
              {fmt(Math.abs(result.lifetimeTaxSavings))}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {result.lifetimeTaxSavings > 0 ? 'saved by converting' : 'lost by converting'}
            </p>
          </Card>
        </div>

        {/* Result sentence */}
        <Card padding="sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: '#facc15' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {result.lifetimeTaxSavings > 0
                ? `Convert ${fmt(effectiveConversion)} this year to save ${fmt(result.lifetimeTaxSavings)} in retirement taxes.`
                : `Converting ${fmt(effectiveConversion)} would cost ${fmt(Math.abs(result.lifetimeTaxSavings))} more than keeping it traditional.`}
            </p>
          </div>
        </Card>

        {/* Chart */}
        <Card padding="md">
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            After-Tax Value Over Time
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Comparing the after-tax value of {fmt(effectiveConversion)} under each scenario (7% annual return)
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                  tickLine={false}
                  label={{ value: 'Years', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
                />
                <Line
                  type="monotone"
                  dataKey="traditional"
                  name="Traditional (taxed at withdrawal)"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22d3ee' }}
                />
                <Line
                  type="monotone"
                  dataKey="roth"
                  name="Roth (tax-free growth)"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
