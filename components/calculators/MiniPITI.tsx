'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, Home } from 'lucide-react';
import { Card, Slider } from '@/components/ui';
import { DataSourceLabel, type DataSource } from './DataSourceLabel';
import { computePITI, type PITIResult } from '@/lib/calculators/piti';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MiniPITI — Compact embeddable PITI breakdown widget
 *
 * Collapsed: one-line monthly payment with housing-ratio color indicator
 * Expanded: donut chart + 3 adjustable inputs
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface MiniPITIProps {
  homePrice?: number;
  downPaymentPercent?: number;
  interestRate?: number;
  monthlyIncome?: number;
  defaultExpanded?: boolean;
  dataSource?: DataSource;
  onResultChange?: (result: PITIResult) => void;
}

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function ratioColor(ratio: number | null): string {
  if (ratio === null) return 'var(--cyan)';
  if (ratio <= 0.28) return 'var(--emerald)';
  if (ratio <= 0.36) return 'var(--yellow)';
  return 'var(--homi-crimson)';
}

function ratioLabel(ratio: number | null): string {
  if (ratio === null) return '';
  const pct = Math.round(ratio * 100);
  if (ratio <= 0.28) return `${pct}% of income`;
  if (ratio <= 0.36) return `${pct}% (guideline: 28%)`;
  return `${pct}% — above guideline`;
}

export function MiniPITI({
  homePrice: initialHomePrice = 400000,
  downPaymentPercent: initialDown = 20,
  interestRate: initialRate = 6.5,
  monthlyIncome,
  defaultExpanded = false,
  dataSource = 'estimate',
  onResultChange,
}: MiniPITIProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [homePrice, setHomePrice] = useState(initialHomePrice);
  const [downPct, setDownPct] = useState(initialDown);
  const [rate, setRate] = useState(initialRate * 10); // stored as x10 for slider precision

  const result = useMemo(() => {
    const r = computePITI({
      homePrice,
      downPaymentPercent: downPct,
      interestRate: rate / 10,
      loanTermYears: 30,
      propertyTaxRate: 1.1,
      annualInsurance: homePrice * 0.004,
      monthlyHOA: 0,
      grossMonthlyIncome: monthlyIncome,
    });
    onResultChange?.(r);
    return r;
  }, [homePrice, downPct, rate, monthlyIncome, onResultChange]);

  const color = ratioColor(result.housingRatio);

  // Donut chart segments
  const segments = [
    { label: 'P&I', value: result.principalAndInterest, color: 'var(--cyan)' },
    { label: 'Tax', value: result.monthlyPropertyTax, color: 'var(--emerald)' },
    { label: 'Insurance', value: result.monthlyInsurance, color: 'var(--yellow)' },
    ...(result.monthlyPMI > 0
      ? [{ label: 'PMI', value: result.monthlyPMI, color: 'var(--homi-amber)' }]
      : []),
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <Card padding="sm">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Home size={16} style={{ color: 'var(--emerald)' }} />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Est. Monthly Payment
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color }}
          >
            {fmt.format(result.totalMonthly)}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-[var(--text-secondary)]" />
          </motion.div>
        </div>
      </button>

      {/* Housing ratio hint */}
      {result.housingRatio !== null && (
        <p
          className="mt-1 text-xs"
          style={{ color }}
        >
          {ratioLabel(result.housingRatio)}
        </p>
      )}

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {/* Mini donut */}
              <div className="flex items-center gap-4">
                <svg width={80} height={80} viewBox="0 0 80 80" className="shrink-0">
                  {(() => {
                    let cumulative = 0;
                    const r = 32;
                    const circumference = 2 * Math.PI * r;
                    return segments.map((seg) => {
                      const pct = total > 0 ? seg.value / total : 0;
                      const offset = cumulative;
                      cumulative += pct;
                      return (
                        <circle
                          key={seg.label}
                          cx={40}
                          cy={40}
                          r={r}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth={8}
                          strokeDasharray={`${pct * circumference} ${circumference}`}
                          strokeDashoffset={-offset * circumference}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {segments.map((seg) => (
                    <span key={seg.label} className="flex items-center gap-1">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-[var(--text-secondary)]">{seg.label}</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {fmt.format(seg.value)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Adjustable inputs */}
              <Slider
                label="Home Price"
                min={100000}
                max={1500000}
                step={5000}
                value={homePrice}
                onChange={setHomePrice}
                color="emerald"
                showValue={false}
              />
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>$100K</span>
                <span className="font-medium text-[var(--text-primary)]">{fmt.format(homePrice)}</span>
                <span>$1.5M</span>
              </div>

              <Slider
                label="Down Payment"
                min={0}
                max={50}
                step={1}
                value={downPct}
                onChange={setDownPct}
                color="cyan"
                showValue={false}
              />
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>0%</span>
                <span className="font-medium text-[var(--text-primary)]">{downPct}%</span>
                <span>50%</span>
              </div>

              <Slider
                label="Interest Rate"
                min={20}
                max={100}
                step={1}
                value={rate}
                onChange={setRate}
                color="yellow"
                showValue={false}
              />
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>2%</span>
                <span className="font-medium text-[var(--text-primary)]">{(rate / 10).toFixed(1)}%</span>
                <span>10%</span>
              </div>

              {/* Data source + full calculator link */}
              <div className="flex items-center justify-between pt-2 border-t border-[rgba(34,211,238,0.1)]">
                <DataSourceLabel source={dataSource} />
                <Link
                  href="/tools/piti"
                  className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--cyan)] transition-colors"
                >
                  Open full calculator &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
