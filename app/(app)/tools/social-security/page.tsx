'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock, TrendingUp } from 'lucide-react';
import { Card, Input } from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Social Security Optimizer
 *
 * Compares claiming at 62, 67, and 70. Shows cumulative benefits and
 * break-even ages where delayed claiming surpasses early claiming.
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

interface ClaimingOption {
  age: number;
  monthlyBenefit: number;
  annualBenefit: number;
  cumulativeAt: (targetAge: number) => number;
}

interface SSResult {
  options: ClaimingOption[];
  crossover67vs62: number | null;
  crossover70vs62: number | null;
  crossover70vs67: number | null;
  barData: { age: number; claim62: number; claim67: number; claim70: number }[];
  bestAt85: { age: number; cumulative: number };
  lifetimeAdvantage: number;
}

function calculateSS(
  birthYear: number,
  benefitAt62: number,
  benefitAt67: number,
  benefitAt70: number,
  currentAge: number,
): SSResult {
  const options: ClaimingOption[] = [
    {
      age: 62,
      monthlyBenefit: benefitAt62,
      annualBenefit: benefitAt62 * 12,
      cumulativeAt: (targetAge: number) =>
        targetAge >= 62 ? (targetAge - 62) * benefitAt62 * 12 : 0,
    },
    {
      age: 67,
      monthlyBenefit: benefitAt67,
      annualBenefit: benefitAt67 * 12,
      cumulativeAt: (targetAge: number) =>
        targetAge >= 67 ? (targetAge - 67) * benefitAt67 * 12 : 0,
    },
    {
      age: 70,
      monthlyBenefit: benefitAt70,
      annualBenefit: benefitAt70 * 12,
      cumulativeAt: (targetAge: number) =>
        targetAge >= 70 ? (targetAge - 70) * benefitAt70 * 12 : 0,
    },
  ];

  // Find crossover points
  function findCrossover(laterAge: number, laterBenefit: number, earlierAge: number, earlierBenefit: number): number | null {
    for (let age = laterAge; age <= 100; age++) {
      const laterCum = (age - laterAge) * laterBenefit * 12;
      const earlierCum = (age - earlierAge) * earlierBenefit * 12;
      if (laterCum >= earlierCum && age > laterAge) return age;
    }
    return null;
  }

  const crossover67vs62 = findCrossover(67, benefitAt67, 62, benefitAt62);
  const crossover70vs62 = findCrossover(70, benefitAt70, 62, benefitAt62);
  const crossover70vs67 = findCrossover(70, benefitAt70, 67, benefitAt67);

  // Bar chart data: cumulative at various milestone ages
  const milestones = [70, 75, 80, 85, 90, 95];
  const barData = milestones.map((age) => ({
    age,
    claim62: options[0].cumulativeAt(age),
    claim67: options[1].cumulativeAt(age),
    claim70: options[2].cumulativeAt(age),
  }));

  // Best option at 85
  const cum62at85 = options[0].cumulativeAt(85);
  const cum67at85 = options[1].cumulativeAt(85);
  const cum70at85 = options[2].cumulativeAt(85);
  const bestVal = Math.max(cum62at85, cum67at85, cum70at85);
  const bestAge = bestVal === cum70at85 ? 70 : bestVal === cum67at85 ? 67 : 62;
  const lifetimeAdvantage = cum70at85 - cum62at85;

  return {
    options,
    crossover67vs62,
    crossover70vs62,
    crossover70vs67,
    barData,
    bestAt85: { age: bestAge, cumulative: bestVal },
    lifetimeAdvantage,
  };
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string; name: string }>; label?: number }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg border"
      style={{
        background: 'rgba(10, 22, 40, 0.95)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: '#e2e8f0' }}>
        Age {label}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SocialSecurityPage() {
  const [birthYear, setBirthYear] = useState(1965);
  const [currentAge, setCurrentAge] = useState(59);
  const [benefitAt62, setBenefitAt62] = useState(1800);
  const [benefitAt67, setBenefitAt67] = useState(2600);
  const [benefitAt70, setBenefitAt70] = useState(3300);

  const result = useMemo(
    () => calculateSS(birthYear, benefitAt62, benefitAt67, benefitAt70, currentAge),
    [birthYear, benefitAt62, benefitAt67, benefitAt70, currentAge],
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
            <Clock size={22} style={{ color: '#facc15' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Social Security Optimizer
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              When to claim for maximum lifetime benefit
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
            You can claim Social Security as early as 62, at full retirement age (67 for most people born after 1960),
            or delay until 70 for the maximum benefit. Claiming early means smaller monthly checks for more years.
            Delaying means larger checks but fewer years of payments. The optimal strategy depends on your life expectancy
            and financial needs.
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
            Your Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Birth Year"
              type="number"
              min={1940}
              max={2000}
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value) || 1965)}
              fullWidth
            />
            <Input
              label="Current Age"
              type="number"
              min={30}
              max={75}
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value) || 50)}
              fullWidth
            />
            <div />
            <Input
              label="Estimated Monthly Benefit at 62"
              type="number"
              min={0}
              value={benefitAt62}
              onChange={(e) => setBenefitAt62(Number(e.target.value) || 0)}
              hint="From your SSA statement"
              fullWidth
            />
            <Input
              label="Estimated Monthly Benefit at 67"
              type="number"
              min={0}
              value={benefitAt67}
              onChange={(e) => setBenefitAt67(Number(e.target.value) || 0)}
              hint="Full retirement age benefit"
              fullWidth
            />
            <Input
              label="Estimated Monthly Benefit at 70"
              type="number"
              min={0}
              value={benefitAt70}
              onChange={(e) => setBenefitAt70(Number(e.target.value) || 0)}
              hint="Maximum delayed benefit"
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
        {/* Claiming options comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {result.options.map((opt) => {
            const isBest = opt.age === result.bestAt85.age;
            const borderColor = opt.age === 62 ? '#22d3ee' : opt.age === 67 ? '#34d399' : '#facc15';
            return (
              <Card
                key={opt.age}
                padding="sm"
                style={{
                  borderColor: isBest ? borderColor : undefined,
                  borderWidth: isBest ? 2 : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: borderColor }}>
                    Claim at {opt.age}
                  </p>
                  {isBest && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                    >
                      Best at 85
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {fmt(opt.monthlyBenefit)}
                  <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>/mo</span>
                </p>
                <p className="text-xs mt-1 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {fmt(opt.annualBenefit)}/yr
                </p>
                <p className="text-xs mt-2 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  Cumulative at 85: {fmt(opt.cumulativeAt(85))}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Crossover points */}
        <Card padding="sm">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Break-Even Ages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Claiming at 67 beats 62 at age:
              </p>
              <p className="text-lg font-bold tabular-nums mt-1" style={{ color: '#34d399' }}>
                {result.crossover67vs62 ? `Age ${result.crossover67vs62}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Claiming at 70 beats 62 at age:
              </p>
              <p className="text-lg font-bold tabular-nums mt-1" style={{ color: '#facc15' }}>
                {result.crossover70vs62 ? `Age ${result.crossover70vs62}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Claiming at 70 beats 67 at age:
              </p>
              <p className="text-lg font-bold tabular-nums mt-1" style={{ color: '#22d3ee' }}>
                {result.crossover70vs67 ? `Age ${result.crossover70vs67}` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Result sentence */}
        <Card padding="sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: '#facc15' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Claiming at 70 vs 62 earns you {fmt(result.lifetimeAdvantage)} more over your lifetime (if you live to 85).
            </p>
          </div>
        </Card>

        {/* Chart */}
        <Card padding="md">
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Cumulative Benefits by Age
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Total Social Security income received at each milestone age
          </p>
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="claim62" name="Claim at 62" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="claim67" name="Claim at 67" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="claim70" name="Claim at 70" fill="#facc15" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full" style={{ backgroundColor: '#22d3ee' }} />
              <span className="text-xs" style={{ color: '#94a3b8' }}>Claim at 62</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full" style={{ backgroundColor: '#34d399' }} />
              <span className="text-xs" style={{ color: '#94a3b8' }}>Claim at 67</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full" style={{ backgroundColor: '#facc15' }} />
              <span className="text-xs" style={{ color: '#94a3b8' }}>Claim at 70</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
