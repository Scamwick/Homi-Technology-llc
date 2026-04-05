'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Toggle } from '@/components/ui';
import { BrandedName } from '@/components/brand/BrandedName';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Blind Budget Mode
 *
 * Hides exact dollar amounts and shows ONLY readiness indicators.
 * Reduces anxiety and prevents number-fixation by replacing raw
 * figures with contextual health signals.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

interface BudgetCategory {
  id: string;
  label: string;
  rawValue: string;
  blindLabel: string;
  blindSublabel: string;
  statusColor: string;
  statusBg: string;
  percent: number;
  type: 'signal' | 'ring' | 'progress' | 'temperature';
}

const MOCK_DATA: BudgetCategory[] = [
  {
    id: 'emergency',
    label: 'Emergency Fund',
    rawValue: '$12,450',
    blindLabel: 'Healthy',
    blindSublabel: '6+ months of runway',
    statusColor: '#34d399',
    statusBg: 'rgba(52, 211, 153, 0.15)',
    percent: 100,
    type: 'signal',
  },
  {
    id: 'spending',
    label: 'Monthly Spending',
    rawValue: '$3,200',
    blindLabel: '75% of budget',
    blindSublabel: 'On track this month',
    statusColor: '#22d3ee',
    statusBg: 'rgba(34, 211, 238, 0.15)',
    percent: 75,
    type: 'ring',
  },
  {
    id: 'savings',
    label: 'Savings Goal',
    rawValue: '$8,000 / $50,000',
    blindLabel: '16% there',
    blindSublabel: 'Building steadily',
    statusColor: '#facc15',
    statusBg: 'rgba(250, 204, 21, 0.15)',
    percent: 16,
    type: 'progress',
  },
  {
    id: 'debt',
    label: 'Debt',
    rawValue: '$23,000',
    blindLabel: 'Manageable',
    blindSublabel: 'Declining trend',
    statusColor: '#facc15',
    statusBg: 'rgba(250, 204, 21, 0.15)',
    percent: 45,
    type: 'temperature',
  },
];

const LS_KEY = 'homi-blind-budget-enabled';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** SVG ring for the spending card */
function ProgressRing({
  percent,
  color,
  size = 80,
  strokeWidth = 6,
}: {
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(148, 163, 184, 0.2)"
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

/** Temperature gauge for debt */
function TemperatureGauge({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  const segments = 5;
  const filled = Math.round((percent / 100) * segments);

  return (
    <div className="flex items-end gap-1.5 h-10">
      {Array.from({ length: segments }).map((_, i) => (
        <motion.div
          key={i}
          className="w-3 rounded-sm"
          style={{
            height: `${((i + 1) / segments) * 100}%`,
            backgroundColor: i < filled ? color : 'rgba(148, 163, 184, 0.2)',
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        />
      ))}
    </div>
  );
}

/** Eye icon for peek button */
function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Budget Card
// ---------------------------------------------------------------------------

function BudgetCard({
  item,
  isBlind,
  index,
}: {
  item: BudgetCategory;
  isBlind: boolean;
  index: number;
}) {
  const [peeking, setPeeking] = useState(false);

  const handlePeek = useCallback(() => {
    if (!isBlind) return;
    setPeeking(true);
    const timer = setTimeout(() => setPeeking(false), 2000);
    return () => clearTimeout(timer);
  }, [isBlind]);

  // Reset peeking if blind mode turns off
  useEffect(() => {
    if (!isBlind) setPeeking(false);
  }, [isBlind]);

  const showNumber = !isBlind || peeking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 * index }}
    >
      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#94a3b8] mb-1">{item.label}</p>

            <AnimatePresence mode="wait">
              {showNumber ? (
                <motion.div
                  key="number"
                  initial={{ opacity: 0, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(6px)' }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-2xl font-bold text-[#e2e8f0] tracking-tight">
                    {item.rawValue}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="blind"
                  initial={{ opacity: 0, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(6px)' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-semibold"
                      style={{
                        color: item.statusColor,
                        backgroundColor: item.statusBg,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.statusColor }}
                      />
                      {item.blindLabel}
                    </span>
                  </div>
                  <p className="text-sm text-[#94a3b8]">{item.blindSublabel}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar for savings type */}
            {item.type === 'progress' && isBlind && !peeking && (
              <div className="mt-3">
                <div className="w-full h-2 rounded-full bg-[rgba(148,163,184,0.2)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.statusColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: visual indicator + peek */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            {/* Indicator */}
            {isBlind && !peeking && (
              <div className="mb-1">
                {item.type === 'ring' && (
                  <ProgressRing percent={item.percent} color={item.statusColor} />
                )}
                {item.type === 'signal' && (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.statusBg }}
                  >
                    <motion.div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: item.statusColor }}
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                )}
                {item.type === 'temperature' && (
                  <TemperatureGauge
                    percent={item.percent}
                    color={item.statusColor}
                  />
                )}
                {item.type === 'progress' && (
                  <div className="text-center">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: item.statusColor }}
                    >
                      {item.percent}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Peek button */}
            {isBlind && (
              <button
                onClick={handlePeek}
                disabled={peeking}
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors"
                style={{
                  color: peeking ? item.statusColor : '#94a3b8',
                  backgroundColor: peeking
                    ? item.statusBg
                    : 'rgba(148, 163, 184, 0.1)',
                }}
                aria-label={peeking ? 'Value visible' : 'Peek at value'}
              >
                <EyeIcon open={peeking} />
                {peeking ? 'Peeking' : 'Peek'}
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function BlindBudgetPage() {
  const [blindMode, setBlindMode] = useState(true);

  // Load preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored !== null) {
        setBlindMode(stored === 'true');
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  // Persist preference
  const handleToggle = useCallback((checked: boolean) => {
    setBlindMode(checked);
    try {
      localStorage.setItem(LS_KEY, String(checked));
    } catch {
      // noop
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" role="img" aria-label="lock">
            &#x1F512;
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e2e8f0]">
            Blind Budget Mode
          </h1>
        </div>
        <p className="text-[#94a3b8] text-base md:text-lg">
          Focus on readiness, not raw numbers. Powered by{' '}
          <BrandedName className="font-semibold" />.
        </p>
      </motion.div>

      {/* ── Toggle ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#e2e8f0] font-semibold text-base">
                Blind Mode
              </p>
              <p className="text-[#94a3b8] text-sm mt-0.5">
                {blindMode
                  ? 'Dollar amounts are hidden. Showing readiness signals only.'
                  : 'All dollar amounts are visible.'}
              </p>
            </div>
            <Toggle
              checked={blindMode}
              onChange={handleToggle}
              label=""
              size="md"
            />
          </div>
        </Card>
      </motion.div>

      {/* ── Budget Cards ── */}
      <div className="grid gap-4">
        {MOCK_DATA.map((item, i) => (
          <BudgetCard
            key={item.id}
            item={item}
            isBlind={blindMode}
            index={i}
          />
        ))}
      </div>

      {/* ── Philosophy ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="thought">
              &#x1F4AD;
            </span>
            Why hide the numbers?
          </h3>
          <div className="space-y-3 text-[#94a3b8] text-sm leading-relaxed">
            <p>
              Behavioral finance research shows that{' '}
              <span className="text-[#22d3ee]">
                exact dollar amounts trigger anxiety
              </span>{' '}
              and can lead to obsessive checking, reactive spending cuts, or
              avoidance altogether. None of these help you make better decisions.
            </p>
            <p>
              Blind Budget Mode replaces raw numbers with{' '}
              <span className="text-[#34d399]">contextual readiness signals</span>
              . Instead of fixating on whether you have $12,450 or $12,451 in
              your emergency fund, you see what actually matters:{' '}
              <span className="text-[#34d399] font-medium">
                you have a healthy runway
              </span>
              .
            </p>
            <p>
              Readiness is about{' '}
              <span className="text-[#facc15]">patterns, not precision</span>.
              The peek button is there when you need specifics, but the default
              view keeps you focused on the trajectory that matters.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
