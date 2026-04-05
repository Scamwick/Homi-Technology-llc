'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandedName } from '@/components/brand';
import { Card, Button, Input, Badge } from '@/components/ui';
import {
  checkPermission,
  DEFAULT_USER_CONTEXT,
  type PermissionResult,
  type PermissionEntry,
} from '@/lib/permission/engine';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Permission System — "Ask Before You Spend"
 *
 * Behavioral finance check-in: users describe a purchase and HōMI evaluates
 * whether it aligns with their readiness goals. Uses mock financial context.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock history for demo
// ---------------------------------------------------------------------------

const INITIAL_HISTORY: PermissionEntry[] = [
  {
    id: '1',
    amount: 85,
    description: 'New running shoes',
    result: {
      granted: true,
      verdict: 'granted',
      impactScore: 8,
      reasoning:
        'This $85 purchase represents 2% of your monthly income and keeps your emergency fund healthy.',
      suggestion: 'Track it in your budget to maintain awareness.',
    },
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    amount: 450,
    description: 'Weekend trip with friends',
    result: {
      granted: true,
      verdict: 'caution',
      impactScore: 34,
      reasoning:
        'This $450 purchase is 9% of your monthly income, approaching the caution threshold.',
      suggestion:
        'Consider waiting 2 weeks and reassessing how you feel about this trip.',
    },
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '3',
    amount: 1200,
    description: 'New laptop for freelancing',
    result: {
      granted: true,
      verdict: 'caution',
      impactScore: 52,
      reasoning:
        'This $1,200 purchase is 23% of your monthly income, and it would reduce your emergency fund below 3 months.',
      suggestion:
        'Build your emergency fund to cover at least 3 months before this purchase.',
    },
    timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: '4',
    amount: 35,
    description: 'Cookbook from bookstore',
    result: {
      granted: true,
      verdict: 'granted',
      impactScore: 3,
      reasoning:
        'This $35 purchase represents less than 1% of your monthly income. This aligns with responsible spending.',
      suggestion: 'Track it in your budget to maintain awareness.',
    },
    timestamp: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: '5',
    amount: 3500,
    description: 'Used car down payment',
    result: {
      granted: false,
      verdict: 'denied',
      impactScore: 88,
      reasoning:
        'At $3,500, this represents 67% of your monthly income. Spending more than half your income on a single purchase significantly impacts your financial stability.',
      suggestion:
        'Wait until you can cover this from savings rather than current income.',
    },
    timestamp: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Verdict styling
// ---------------------------------------------------------------------------

const VERDICT_CONFIG = {
  granted: {
    label: 'Permission Granted',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    badgeVariant: 'success' as const,
    icon: '\u2705',
  },
  caution: {
    label: 'Pause and Reconsider',
    color: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.1)',
    borderColor: 'rgba(251, 146, 60, 0.3)',
    badgeVariant: 'caution' as const,
    icon: '\u26A0\uFE0F',
  },
  denied: {
    label: 'Not Recommended',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    badgeVariant: 'danger' as const,
    icon: '\u26D4',
  },
};

// ---------------------------------------------------------------------------
// Readiness Signal (inline, since components/signals doesn't exist yet)
// ---------------------------------------------------------------------------

function ReadinessSignal({ score }: { score: number }) {
  const getColor = () => {
    if (score <= 25) return '#34d399';
    if (score <= 50) return '#facc15';
    if (score <= 75) return '#fb923c';
    return '#ef4444';
  };

  const color = getColor();

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="rgba(30, 41, 59, 0.8)"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${(score / 100) * 125.66} 125.66`}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.6s ease',
            }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <div>
        <p className="text-xs text-[#94a3b8]">Impact Score</p>
        <p className="text-sm font-medium" style={{ color }}>
          {score <= 25
            ? 'Low Impact'
            : score <= 50
              ? 'Moderate'
              : score <= 75
                ? 'Significant'
                : 'High Impact'}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function PermissionPage() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<PermissionResult | null>(null);
  const [history, setHistory] = useState<PermissionEntry[]>(INITIAL_HISTORY);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCheck = useCallback(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !description.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simulate brief analysis delay
    setTimeout(() => {
      const permResult = checkPermission(
        numAmount,
        description.trim(),
        DEFAULT_USER_CONTEXT,
      );
      setResult(permResult);

      // Add to history
      const entry: PermissionEntry = {
        id: Date.now().toString(),
        amount: numAmount,
        description: description.trim(),
        result: permResult,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 5));
      setIsAnalyzing(false);
    }, 800);
  }, [amount, description]);

  const handleReset = useCallback(() => {
    setAmount('');
    setDescription('');
    setResult(null);
  }, []);

  const verdictConfig = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" role="img" aria-label="shield">
            &#x1F6E1;&#xFE0F;
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e2e8f0]">
            Permission System
          </h1>
        </div>
        <p className="text-[#94a3b8] text-base md:text-lg">
          Ask <BrandedName className="font-semibold" /> before you spend.
          Check if a purchase aligns with your readiness goals.
        </p>
      </motion.div>

      {/* ── Input Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
      >
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">
            What are you about to spend?
          </h2>
          <p className="text-sm text-[#94a3b8] mb-6">
            Enter the amount and describe what you&apos;re considering. <BrandedName /> will analyze
            whether it aligns with your financial readiness.
          </p>

          <div className="space-y-4">
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              leadingIcon={
                <span className="text-[#94a3b8] text-sm font-medium">$</span>
              }
              fullWidth
            />
            <Input
              label="Description"
              type="text"
              placeholder="e.g., New winter jacket, concert tickets, laptop repair..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="cta"
                onClick={handleCheck}
                loading={isAnalyzing}
                disabled={
                  !amount || !description.trim() || parseFloat(amount) <= 0
                }
              >
                Check with H\u014DMI
              </Button>
              {result && (
                <Button variant="ghost" onClick={handleReset}>
                  Start Over
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Result Card ── */}
      <AnimatePresence mode="wait">
        {result && verdictConfig && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div
              className="rounded-[var(--radius-lg)] p-6 backdrop-blur-[10px]"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: `1px solid ${verdictConfig.borderColor}`,
              }}
            >
              {/* Verdict header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{verdictConfig.icon}</span>
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: verdictConfig.color }}
                    >
                      {verdictConfig.label}
                    </h3>
                    <p className="text-sm text-[#94a3b8]">
                      ${parseFloat(amount).toLocaleString()} &mdash;{' '}
                      {description}
                    </p>
                  </div>
                </div>
                <ReadinessSignal score={result.impactScore} />
              </div>

              {/* Reasoning */}
              <div
                className="rounded-[var(--radius-md)] p-4 mb-4"
                style={{ background: verdictConfig.bgColor }}
              >
                <p className="text-sm font-medium text-[#e2e8f0] mb-1">
                  Analysis
                </p>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {result.reasoning}
                </p>
              </div>

              {/* Suggestion */}
              <div className="rounded-[var(--radius-md)] p-4 bg-[rgba(34,211,238,0.05)] border border-[rgba(34,211,238,0.15)]">
                <p className="text-sm font-medium text-[#22d3ee] mb-1">
                  Suggestion
                </p>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {result.suggestion}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Financial Context (readonly display) ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        <Card padding="md">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3 flex items-center gap-2">
            <span className="text-base" role="img" aria-label="chart">
              &#x1F4CA;
            </span>
            Your Financial Context
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#94a3b8]">Emergency Fund</p>
              <p className="text-lg font-bold text-[#22d3ee]">
                ${DEFAULT_USER_CONTEXT.emergencyFund.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8]">Monthly Income</p>
              <p className="text-lg font-bold text-[#34d399]">
                ${DEFAULT_USER_CONTEXT.monthlyIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8]">Savings Goal</p>
              <p className="text-lg font-bold text-[#facc15]">
                ${DEFAULT_USER_CONTEXT.savingsGoal.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── History ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
      >
        <h2 className="text-lg font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="history">
            &#x1F4CB;
          </span>
          Recent Permission Checks
        </h2>
        <div className="space-y-3">
          {history.slice(0, 5).map((entry, i) => {
            const config = VERDICT_CONFIG[entry.result.verdict];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">{config.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#e2e8f0] truncate">
                          {entry.description}
                        </p>
                        <p className="text-xs text-[#94a3b8]">
                          {new Date(entry.timestamp).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-[#e2e8f0]">
                        ${entry.amount.toLocaleString()}
                      </span>
                      <Badge variant={config.badgeVariant} dot>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
