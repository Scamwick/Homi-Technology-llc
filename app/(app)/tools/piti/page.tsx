'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Home, DollarSign, Percent, Wifi, WifiOff } from 'lucide-react';
import { Card, Input } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PITI Calculator (Monthly Housing Cost Breakdown)
 *
 * Computes full monthly housing payment with principal, interest, taxes,
 * insurance, PMI, and HOA. Renders an SVG donut chart with segment breakdown
 * and auto-recalculates as inputs change.
 *
 * All computation is client-side.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Computation
// ---------------------------------------------------------------------------

interface PITIBreakdown {
  principal: number;
  interest: number;
  taxes: number;
  insurance: number;
  pmi: number;
  hoa: number;
  total: number;
}

interface AmortizationSummary {
  totalPaid: number;
  totalInterest: number;
  totalPrincipal: number;
}

function computePITI(
  homePrice: number,
  downPaymentPct: number,
  interestRate: number,   // annual, e.g. 6.5
  loanTermYears: number,  // 15 or 30
  propertyTaxRate: number, // annual, e.g. 1.2%
  annualInsurance: number, // e.g. 1800
  hoaDues: number,         // monthly
): { breakdown: PITIBreakdown; amortization: AmortizationSummary } {
  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;

  // Monthly P&I (standard amortization formula)
  let monthlyPI: number;
  if (monthlyRate === 0) {
    monthlyPI = loanAmount / numPayments;
  } else {
    monthlyPI =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // First-month interest and principal split
  const firstMonthInterest = loanAmount * monthlyRate;
  const firstMonthPrincipal = monthlyPI - firstMonthInterest;

  // Monthly property taxes
  const monthlyTaxes = (homePrice * (propertyTaxRate / 100)) / 12;

  // Monthly insurance
  const monthlyInsurance = annualInsurance / 12;

  // PMI: auto-added if down payment < 20%
  let monthlyPMI = 0;
  if (downPaymentPct < 20) {
    // Standard PMI rate: ~0.5-1.5% of loan amount annually
    // Use a sliding scale based on LTV
    const ltv = loanAmount / homePrice;
    let pmiRate: number;
    if (ltv > 0.95) pmiRate = 0.014;
    else if (ltv > 0.90) pmiRate = 0.011;
    else if (ltv > 0.85) pmiRate = 0.008;
    else pmiRate = 0.005;
    monthlyPMI = (loanAmount * pmiRate) / 12;
  }

  const total = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyPMI + hoaDues;

  // Amortization summary
  const totalPaid = monthlyPI * numPayments;
  const totalInterest = totalPaid - loanAmount;

  return {
    breakdown: {
      principal: firstMonthPrincipal,
      interest: firstMonthInterest,
      taxes: monthlyTaxes,
      insurance: monthlyInsurance,
      pmi: monthlyPMI,
      hoa: hoaDues,
      total,
    },
    amortization: {
      totalPaid: totalPaid + (monthlyTaxes + monthlyInsurance + monthlyPMI + hoaDues) * numPayments,
      totalInterest,
      totalPrincipal: loanAmount,
    },
  };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCurrencyExact(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ---------------------------------------------------------------------------
// SVG Donut Chart
// ---------------------------------------------------------------------------

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ segments, total }: { segments: DonutSegment[]; total: number }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 110;
  const innerR = 72;

  // Filter out zero segments
  const activeSegments = segments.filter((s) => s.value > 0);
  if (activeSegments.length === 0 || total === 0) {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: size }}>
        <circle cx={cx} cy={cy} r={outerR} fill="rgba(30,41,59,0.6)" stroke="rgba(148,163,184,0.2)" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={innerR} fill="#0a1628" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={14}>
          No data
        </text>
      </svg>
    );
  }

  // Build arcs
  let cumulativeAngle = -90; // Start at top (12 o'clock)
  const arcs = activeSegments.map((seg) => {
    const angle = (seg.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
        // eslint-disable-next-line react-hooks/immutability
    cumulativeAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1Outer = cx + outerR * Math.cos(startRad);
    const y1Outer = cy + outerR * Math.sin(startRad);
    const x2Outer = cx + outerR * Math.cos(endRad);
    const y2Outer = cy + outerR * Math.sin(endRad);

    const x1Inner = cx + innerR * Math.cos(endRad);
    const y1Inner = cy + innerR * Math.sin(endRad);
    const x2Inner = cx + innerR * Math.cos(startRad);
    const y2Inner = cy + innerR * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      'Z',
    ].join(' ');

    return { ...seg, path, midAngle: (startAngle + endAngle) / 2 };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: size }}>
      {/* Arcs */}
      {arcs.map((arc, i) => (
        <motion.path
          key={i}
          d={arc.path}
          fill={arc.color}
          stroke="#0a1628"
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="transition-opacity hover:opacity-80"
        />
      ))}

      {/* Inner circle (donut hole) */}
      <circle cx={cx} cy={cy} r={innerR} fill="#0a1628" />

      {/* Center text */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={500}>
        Monthly
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#e2e8f0" fontSize={20} fontWeight={700}>
        {formatCurrency(total)}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PITIPage() {
  // Inputs
  const [homePrice, setHomePrice] = useState(425000);
  const [downPaymentPct, setDownPaymentPct] = useState(10);
  const [interestRate, setInterestRate] = useState(6.75);
  const [loanTerm, setLoanTerm] = useState<15 | 30>(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
  const [annualInsurance, setAnnualInsurance] = useState(1800);
  const [hoaDues, setHoaDues] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>('');

  // Live data integration
  const [useLiveData, setUseLiveData] = useState(false);
  const [liveDataLoading, setLiveDataLoading] = useState(false);
  const [liveDataAvailable, setLiveDataAvailable] = useState<boolean | null>(null);

  const loadLiveData = useCallback(async () => {
    setLiveDataLoading(true);
    try {
      const response = await fetch('/api/scoring/refresh', { method: 'POST' });
      if (!response.ok) {
        setLiveDataAvailable(false);
        setUseLiveData(false);
        return;
      }
      const data = await response.json();
      if (data.dataSource === 'plaid' || data.dataSource === 'hybrid') {
        setLiveDataAvailable(true);
        // Auto-populate income from Plaid
        if (data.financial?.breakdown?.income) {
          setMonthlyIncome(Math.round(data.financial.breakdown.income / 12));
        }
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
    // Check if live data is available on mount
    loadLiveData();
  }, [loadLiveData]);

  // Auto-compute
  const { breakdown, amortization } = useMemo(
    () =>
      computePITI(
        homePrice,
        downPaymentPct,
        interestRate,
        loanTerm,
        propertyTaxRate,
        annualInsurance,
        hoaDues,
      ),
    [homePrice, downPaymentPct, interestRate, loanTerm, propertyTaxRate, annualInsurance, hoaDues],
  );

  const segments: DonutSegment[] = [
    { label: 'Principal', value: breakdown.principal, color: '#22d3ee' },
    { label: 'Interest', value: breakdown.interest, color: '#f472b6' },
    { label: 'Property Tax', value: breakdown.taxes, color: '#facc15' },
    { label: 'Insurance', value: breakdown.insurance, color: '#34d399' },
    { label: 'PMI', value: breakdown.pmi, color: '#ef4444' },
    { label: 'HOA', value: breakdown.hoa, color: '#a78bfa' },
  ];

  const activeSegments = segments.filter((s) => s.value > 0);

  const affordabilityPct =
    monthlyIncome && typeof monthlyIncome === 'number' && monthlyIncome > 0
      ? (breakdown.total / monthlyIncome) * 100
      : null;

  const downPaymentAmount = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPaymentAmount;

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
            <Home size={22} style={{ color: 'var(--emerald)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              PITI Calculator
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Full monthly housing cost breakdown -- principal, interest, taxes, insurance
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
              if (!useLiveData) loadLiveData();
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: useLiveData ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.1)',
              color: useLiveData ? 'var(--emerald)' : 'var(--text-secondary)',
              border: `1px solid ${useLiveData ? 'rgba(52,211,153,0.3)' : 'rgba(148,163,184,0.2)'}`,
            }}
          >
            {useLiveData ? <Wifi size={16} /> : <WifiOff size={16} />}
            {liveDataLoading ? 'Loading live data...' : useLiveData ? 'Using Live Bank Data' : 'Use Live Data from Plaid'}
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input form — left column */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Loan Details
            </h3>
            <div className="space-y-4">
              <Input
                label="Home Price ($)"
                type="number"
                min={0}
                step={5000}
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                leadingIcon={<DollarSign size={16} />}
                fullWidth
              />
              <Input
                label="Down Payment (%)"
                type="number"
                min={0}
                max={100}
                step={1}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                leadingIcon={<Percent size={16} />}
                hint={`${formatCurrency(downPaymentAmount)} down, ${formatCurrency(loanAmount)} loan`}
                fullWidth
              />
              <Input
                label="Interest Rate (%)"
                type="number"
                min={0}
                max={20}
                step={0.125}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                fullWidth
              />

              {/* Loan term toggle */}
              <div>
                <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Loan Term
                </label>
                <div className="flex gap-2">
                  {([15, 30] as const).map((term) => (
                    <button
                      key={term}
                      onClick={() => setLoanTerm(term)}
                      className="flex-1 h-10 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        background: loanTerm === term ? 'rgba(34,211,238,0.15)' : 'rgba(30,41,59,0.5)',
                        border: `1px solid ${loanTerm === term ? 'var(--cyan)' : 'rgba(148,163,184,0.2)'}`,
                        color: loanTerm === term ? 'var(--cyan)' : 'var(--text-secondary)',
                      }}
                    >
                      {term} Years
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Taxes, Insurance & HOA
            </h3>
            <div className="space-y-4">
              <Input
                label="Property Tax Rate (%)"
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={propertyTaxRate}
                onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
                hint={`${formatCurrency(homePrice * (propertyTaxRate / 100))} / year`}
                fullWidth
              />
              <Input
                label="Annual Homeowner's Insurance ($)"
                type="number"
                min={0}
                step={100}
                value={annualInsurance}
                onChange={(e) => setAnnualInsurance(Number(e.target.value))}
                hint={`${formatCurrency(annualInsurance / 12)} / month`}
                fullWidth
              />
              <Input
                label="Monthly HOA Dues ($)"
                type="number"
                min={0}
                step={25}
                value={hoaDues}
                onChange={(e) => setHoaDues(Number(e.target.value))}
                fullWidth
              />
              {breakdown.pmi > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                >
                  <span className="font-semibold">PMI Auto-Applied:</span>
                  <span>{formatCurrencyExact(breakdown.pmi)}/mo (down payment &lt; 20%)</span>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Affordability Check (Optional)
            </h3>
            <Input
              label="Gross Monthly Income ($)"
              type="number"
              min={0}
              step={500}
              value={monthlyIncome === '' ? '' : monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value ? Number(e.target.value) : '')}
              placeholder="Enter to see ratio"
              leadingIcon={<DollarSign size={16} />}
              fullWidth
            />
            {affordabilityPct !== null && (
              <motion.div
                className="mt-3 px-3 py-2 rounded-lg text-sm"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background:
                    affordabilityPct <= 28
                      ? 'rgba(52,211,153,0.08)'
                      : affordabilityPct <= 36
                        ? 'rgba(250,204,21,0.08)'
                        : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${
                    affordabilityPct <= 28
                      ? 'rgba(52,211,153,0.2)'
                      : affordabilityPct <= 36
                        ? 'rgba(250,204,21,0.2)'
                        : 'rgba(239,68,68,0.2)'
                  }`,
                  color:
                    affordabilityPct <= 28
                      ? '#34d399'
                      : affordabilityPct <= 36
                        ? '#facc15'
                        : '#ef4444',
                }}
              >
                <span className="font-bold tabular-nums">{affordabilityPct.toFixed(1)}%</span>
                <span className="ml-1.5 text-xs">
                  of your gross income
                  {affordabilityPct <= 28
                    ? ' -- within recommended 28% guideline'
                    : affordabilityPct <= 36
                      ? ' -- above 28%, approaching the 36% ceiling'
                      : ' -- exceeds 36% debt-to-income limit'}
                </span>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Results — right column */}
        <motion.div
          className="lg:col-span-3 space-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Total monthly payment */}
          <Card padding="lg">
            <div className="text-center mb-6">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Total Monthly Payment
              </p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {formatCurrencyExact(breakdown.total)}
              </p>
            </div>

            {/* Donut + Legend */}
            <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
              <DonutChart segments={segments} total={breakdown.total} />

              <div className="space-y-2.5">
                {activeSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs w-24" style={{ color: 'var(--text-secondary)' }}>
                      {seg.label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: seg.color }}>
                      {formatCurrencyExact(seg.value)}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      ({breakdown.total > 0 ? ((seg.value / breakdown.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Breakdown bars */}
          <Card padding="md">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Payment Breakdown
            </h3>
            <div className="space-y-3">
              {activeSegments.map((seg) => {
                const pct = breakdown.total > 0 ? (seg.value / breakdown.total) * 100 : 0;
                return (
                  <div key={seg.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
                      <span className="font-semibold tabular-nums" style={{ color: seg.color }}>
                        {formatCurrencyExact(seg.value)}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,41,59,0.6)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: seg.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(1, pct)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Amortization summary */}
          <Card padding="md">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {loanTerm}-Year Amortization Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Total Paid Over Life
                </p>
                <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(amortization.totalPaid)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Total Interest
                </p>
                <p className="text-xl font-bold tabular-nums" style={{ color: '#f472b6' }}>
                  {formatCurrency(amortization.totalInterest)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Total Principal
                </p>
                <p className="text-xl font-bold tabular-nums" style={{ color: '#22d3ee' }}>
                  {formatCurrency(amortization.totalPrincipal)}
                </p>
              </div>
            </div>

            {/* Interest-to-principal ratio bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: '#22d3ee' }}>Principal</span>
                <span style={{ color: '#f472b6' }}>Interest</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex" style={{ background: 'rgba(30,41,59,0.6)' }}>
                <motion.div
                  className="h-full"
                  style={{ background: '#22d3ee' }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      amortization.totalPrincipal + amortization.totalInterest > 0
                        ? (amortization.totalPrincipal / (amortization.totalPrincipal + amortization.totalInterest)) * 100
                        : 50
                    }%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <motion.div
                  className="h-full flex-1"
                  style={{ background: '#f472b6' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                <span>
                  {amortization.totalPrincipal + amortization.totalInterest > 0
                    ? ((amortization.totalPrincipal / (amortization.totalPrincipal + amortization.totalInterest)) * 100).toFixed(0)
                    : 50}
                  %
                </span>
                <span>
                  {amortization.totalPrincipal + amortization.totalInterest > 0
                    ? ((amortization.totalInterest / (amortization.totalPrincipal + amortization.totalInterest)) * 100).toFixed(0)
                    : 50}
                  %
                </span>
              </div>
            </div>
          </Card>

          {/* Loan details summary */}
          <Card padding="sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loan Amount</p>
                <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(loanAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Down Payment</p>
                <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(downPaymentAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>LTV Ratio</p>
                <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {homePrice > 0 ? ((loanAmount / homePrice) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Monthly P&I</p>
                <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrencyExact(breakdown.principal + breakdown.interest)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
