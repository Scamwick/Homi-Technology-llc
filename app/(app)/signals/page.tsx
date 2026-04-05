'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Clock, TrendingUp, Activity, Info } from 'lucide-react';
import {
  ReadinessSignal,
  ReadinessBar,
  DimensionSignals,
  SignalPulse,
  scoreToTemperature,
} from '@/components/signals';
import { Card } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Signal Dashboard — Visual readiness signal system
 *
 * Gives users at-a-glance readiness indicators across all three dimensions
 * (Financial, Emotional, Timing) with historical context.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock data — wired into live scores when backend is ready
// ---------------------------------------------------------------------------

const MOCK_OVERALL = 72;
const MOCK_FINANCIAL = 78;
const MOCK_EMOTIONAL = 65;
const MOCK_TIMING = 70;

interface HistoryPoint {
  date: string;
  overall: number;
  financial: number;
  emotional: number;
  timing: number;
}

const MOCK_HISTORY: HistoryPoint[] = [
  { date: 'Mar 20', overall: 58, financial: 55, emotional: 60, timing: 52 },
  { date: 'Mar 27', overall: 64, financial: 68, emotional: 62, timing: 58 },
  { date: 'Apr 3', overall: 72, financial: 78, emotional: 65, timing: 70 },
];

// ---------------------------------------------------------------------------
// Dimension detail configs
// ---------------------------------------------------------------------------

interface DimDetail {
  key: 'financial' | 'emotional' | 'timing';
  label: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const DIMENSIONS: DimDetail[] = [
  {
    key: 'financial',
    label: 'Financial',
    icon: Shield,
    color: 'var(--cyan, #22d3ee)',
    bgColor: 'rgba(34, 211, 238, 0.06)',
    borderColor: 'rgba(34, 211, 238, 0.15)',
    description:
      'Tracks your savings, debt-to-income ratio, emergency fund, and credit health to gauge financial preparedness.',
  },
  {
    key: 'emotional',
    label: 'Emotional',
    icon: Heart,
    color: 'var(--emerald, #34d399)',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.15)',
    description:
      'Measures alignment between partners, stress levels, lifestyle expectations, and overall relationship readiness.',
  },
  {
    key: 'timing',
    label: 'Timing',
    icon: Clock,
    color: 'var(--yellow, #facc15)',
    bgColor: 'rgba(250, 204, 21, 0.06)',
    borderColor: 'rgba(250, 204, 21, 0.15)',
    description:
      'Evaluates market conditions, interest rate environment, housing supply, and your personal timeline alignment.',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HistoryRow({ point, prev }: { point: HistoryPoint; prev?: HistoryPoint }) {
  const delta = prev ? point.overall - prev.overall : 0;
  const isPositive = delta > 0;

  return (
    <div
      className="flex items-center justify-between rounded-lg border px-4 py-3"
      style={{
        borderColor: 'rgba(148, 163, 184, 0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
      }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--text-secondary, #94a3b8)' }}
      >
        {point.date}
      </span>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ReadinessSignal score={point.overall} size="sm" showLabel={false} />
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            {point.overall}
          </span>
        </div>

        {prev && (
          <span
            className="text-xs font-semibold tabular-nums"
            style={{
              color: isPositive
                ? 'var(--emerald, #34d399)'
                : 'var(--homi-crimson, #ef4444)',
            }}
          >
            {isPositive ? '+' : ''}{delta}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SignalsPage() {
  const scores: Record<string, number> = {
    financial: MOCK_FINANCIAL,
    emotional: MOCK_EMOTIONAL,
    timing: MOCK_TIMING,
  };

  const overallTemp = scoreToTemperature(MOCK_OVERALL);

  // Pulse color keyed to overall verdict
  const pulseColorMap: Record<string, string> = {
    cool: '#34d399',
    warm: '#facc15',
    'warm+': '#fb923c',
    hot: '#ef4444',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Activity
            size={24}
            style={{ color: 'var(--cyan, #22d3ee)' }}
            strokeWidth={2}
          />
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            Your Readiness Signals
          </h1>
        </div>
        <p
          className="text-sm"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Signals update in real-time as your financial, emotional, and timing readiness changes.
        </p>
      </motion.div>

      {/* ── Overall Signal Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <Card padding="lg" className="relative overflow-hidden mb-6">
          {/* Ambient pulse behind */}
          <SignalPulse
            color={pulseColorMap[overallTemp]}
            intensity={0.3}
            speed="slow"
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              Overall Readiness
            </span>

            <ReadinessSignal
              score={MOCK_OVERALL}
              size="lg"
              showLabel
              animated
            />

            {/* Readiness bar full-width */}
            <div className="w-full max-w-md mt-2">
              <ReadinessBar
                score={MOCK_OVERALL}
                height={10}
                showThresholds
                showLabels
                animated
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Dimension Signals Row ── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <DimensionSignals
          financial={MOCK_FINANCIAL}
          emotional={MOCK_EMOTIONAL}
          timing={MOCK_TIMING}
          layout="horizontal"
          className="justify-center flex-wrap"
        />
      </motion.div>

      {/* ── Dimension Detail Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {DIMENSIONS.map((dim, i) => {
          const Icon = dim.icon;
          const score = scores[dim.key];

          return (
            <motion.div
              key={dim.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <Card
                padding="md"
                className="h-full"
                style={{
                  borderColor: dim.borderColor,
                  backgroundColor: dim.bgColor,
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <Icon
                    size={16}
                    style={{ color: dim.color }}
                    strokeWidth={2.2}
                    aria-hidden
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: dim.color }}
                  >
                    {dim.label}
                  </span>
                  <span className="ml-auto">
                    <ReadinessSignal
                      score={score}
                      size="sm"
                      showLabel={false}
                    />
                  </span>
                </div>

                {/* Score */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: 'var(--text-primary, #e2e8f0)' }}
                  >
                    {score}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-secondary, #94a3b8)' }}
                  >
                    / 100
                  </span>
                </div>

                {/* Mini bar */}
                <ReadinessBar
                  score={score}
                  height={6}
                  showThresholds={false}
                  showLabels={false}
                  animated
                  className="mb-3"
                />

                {/* Description */}
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  {dim.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Signal History ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp
              size={18}
              style={{ color: 'var(--cyan, #22d3ee)' }}
              strokeWidth={2}
            />
            <h2
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              Signal History
            </h2>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {MOCK_HISTORY.map((point, i) => (
              <HistoryRow
                key={point.date}
                point={point}
                prev={i > 0 ? MOCK_HISTORY[i - 1] : undefined}
              />
            ))}
          </div>

          <div
            className="flex items-start gap-2 rounded-lg px-3 py-2"
            style={{
              backgroundColor: 'rgba(34, 211, 238, 0.06)',
              border: '1px solid rgba(34, 211, 238, 0.12)',
            }}
          >
            <Info
              size={14}
              style={{ color: 'var(--cyan, #22d3ee)', marginTop: 2 }}
              strokeWidth={2}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              History updates each time you complete an assessment or when new financial data syncs.
              Complete more assessments to build a richer signal timeline.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
