'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Home,
  Car,
  Briefcase,
  Rocket,
  Baby,
  Heart,
  Sunset,
  Hammer,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Circle,
  TrendingDown,
  TrendingUp,
  Clock,
  DollarSign,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import {
  DECISION_TEMPLATES,
  analyzeDecisionReadiness,
  rehearseDecision,
} from '@/lib/plaid/decisions';
import type {
  DecisionType,
  DecisionTemplate,
  DecisionAnalysis,
  DecisionRehearsalResult,
  ReadinessLevel,
  RingStatus,
} from '@/lib/plaid/decisions';
import type { FinancialMetrics } from '@/lib/plaid/insights';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Decision Center — Life Decision Library + Rehearsal Engine
 *
 * Browse life decisions, see per-ring readiness analysis, and rehearse
 * the financial impact before committing.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, typeof Home> = {
  Home,
  Car,
  Briefcase,
  Rocket,
  Baby,
  Heart,
  Sunset,
  Hammer,
};

// ---------------------------------------------------------------------------
// Ring status colors
// ---------------------------------------------------------------------------

function ringColor(status: RingStatus): string {
  switch (status) {
    case 'green': return '#34d399';
    case 'yellow': return '#facc15';
    case 'red': return '#f87171';
  }
}

function readinessColor(level: ReadinessLevel): string {
  switch (level) {
    case 'READY': return '#34d399';
    case 'ALMOST_READY': return '#facc15';
    case 'NOT_READY': return '#f87171';
  }
}

function readinessLabel(level: ReadinessLevel): string {
  switch (level) {
    case 'READY': return 'Ready';
    case 'ALMOST_READY': return 'Almost Ready';
    case 'NOT_READY': return 'Not Ready Yet';
  }
}

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ---------------------------------------------------------------------------
// Component: Decision Card (library grid)
// ---------------------------------------------------------------------------

function DecisionCard({
  template,
  analysis,
  onClick,
}: {
  template: DecisionTemplate;
  analysis: DecisionAnalysis | null;
  onClick: () => void;
}) {
  const Icon = ICON_MAP[template.icon] ?? Circle;

  return (
    <motion.div variants={fadeUp}>
      <Card interactive padding="md">
        <button
          type="button"
          onClick={onClick}
          className="w-full text-left flex flex-col gap-3 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
            >
              <Icon size={20} style={{ color: '#22d3ee' }} />
            </div>
            {analysis && (
              <Badge
                variant={
                  analysis.overallReadiness === 'READY'
                    ? 'success'
                    : analysis.overallReadiness === 'ALMOST_READY'
                      ? 'warning'
                      : 'danger'
                }
              >
                {readinessLabel(analysis.overallReadiness)}
              </Badge>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
              {template.label}
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              {template.description}
            </p>
          </div>

          {analysis && (
            <div className="flex gap-2 mt-1">
              {[
                { label: 'Financial', status: analysis.financialReality.status },
                { label: 'Emotional', status: analysis.emotionalTruth.status },
                { label: 'Timing', status: analysis.perfectTiming.status },
              ].map((ring) => (
                <span
                  key={ring.label}
                  className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${ringColor(ring.status)}15`,
                    color: ringColor(ring.status),
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: ringColor(ring.status) }} />
                  {ring.label}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 mt-1" style={{ color: '#22d3ee' }}>
            <span className="text-xs font-medium">
              {analysis ? 'View Analysis' : 'Connect bank to analyze'}
            </span>
            <ChevronRight size={14} />
          </div>
        </button>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Component: Decision Detail View
// ---------------------------------------------------------------------------

function DecisionDetail({
  analysis,
  metrics,
  onBack,
}: {
  analysis: DecisionAnalysis;
  metrics: FinancialMetrics;
  onBack: () => void;
}) {
  const [rehearsalAmount, setRehearsalAmount] = useState('');
  const [rehearsalDown, setRehearsalDown] = useState('');
  const [rehearsalMonthly, setRehearsalMonthly] = useState('');
  const [rehearsalResult, setRehearsalResult] = useState<DecisionRehearsalResult | null>(null);

  const handleRehearsal = useCallback(() => {
    const amount = parseFloat(rehearsalAmount.replace(/[^0-9.]/g, '')) || 0;
    const down = parseFloat(rehearsalDown.replace(/[^0-9.]/g, '')) || 0;
    const monthly = parseFloat(rehearsalMonthly.replace(/[^0-9.]/g, '')) || 0;

    if (amount <= 0) return;

    const result = rehearseDecision(
      {
        decisionType: analysis.decision.type,
        amount,
        downPayment: down,
        monthlyPayment: monthly,
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      metrics,
    );
    setRehearsalResult(result);
  }, [rehearsalAmount, rehearsalDown, rehearsalMonthly, analysis.decision.type, metrics]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-lg cursor-pointer"
          style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)' }}
        >
          <ArrowLeft size={16} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
        </button>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
            {analysis.decision.label}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge
              variant={
                analysis.overallReadiness === 'READY'
                  ? 'success'
                  : analysis.overallReadiness === 'ALMOST_READY'
                    ? 'warning'
                    : 'danger'
              }
            >
              {readinessLabel(analysis.overallReadiness)}
            </Badge>
            <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Regret probability: {analysis.regretProbability}%
            </span>
          </div>
        </div>
      </div>

      {/* Ring breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Financial Reality', ring: analysis.financialReality, Icon: DollarSign },
          { label: 'Emotional Truth', ring: analysis.emotionalTruth, Icon: Heart },
          { label: 'Perfect Timing', ring: analysis.perfectTiming, Icon: Clock },
        ].map((r) => (
          <Card key={r.label} padding="md">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <r.Icon size={16} style={{ color: ringColor(r.ring.status) }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    {r.label}
                  </span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${ringColor(r.ring.status)}20`,
                    color: ringColor(r.ring.status),
                  }}
                >
                  {r.ring.score}/100
                </span>
              </div>

              <div className="space-y-2">
                {r.ring.factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {f.met ? (
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: '#34d399' }} />
                    ) : (
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: '#f87171' }} />
                    )}
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                        {f.label}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {f.current} → Target: {f.target}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action items */}
      {analysis.actionItems.length > 0 && (
        <Card padding="md">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: '#22d3ee' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Path to Ready
              </span>
              {analysis.estimatedDaysToReady && (
                <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Est. {analysis.estimatedDaysToReady} days
                </span>
              )}
            </div>
            <ul className="space-y-3">
              {analysis.actionItems.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="mt-1 size-5 shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: item.priority === 'high'
                        ? 'rgba(248, 113, 113, 0.15)'
                        : 'rgba(250, 204, 21, 0.12)',
                      color: item.priority === 'high' ? '#f87171' : '#facc15',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                      {item.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      {item.description}
                    </p>
                    <p className="text-[10px] mt-1 font-medium" style={{ color: '#22d3ee' }}>
                      {item.impact}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Decision Rehearsal */}
      <Card padding="md">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} style={{ color: '#a78bfa' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
              Decision Rehearsal
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa' }}>
              Simulate
            </span>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
            Enter the numbers for your {analysis.decision.label.toLowerCase()} to see how it would impact your readiness score.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Total Amount
              </label>
              <input
                type="text"
                value={rehearsalAmount}
                onChange={(e) => setRehearsalAmount(e.target.value)}
                placeholder="$300,000"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  color: 'var(--text-primary, #e2e8f0)',
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Down Payment
              </label>
              <input
                type="text"
                value={rehearsalDown}
                onChange={(e) => setRehearsalDown(e.target.value)}
                placeholder="$60,000"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  color: 'var(--text-primary, #e2e8f0)',
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Monthly Payment
              </label>
              <input
                type="text"
                value={rehearsalMonthly}
                onChange={(e) => setRehearsalMonthly(e.target.value)}
                placeholder="$2,200"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  color: 'var(--text-primary, #e2e8f0)',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRehearsal}
            className="rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-all"
            style={{
              backgroundColor: 'rgba(167, 139, 250, 0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(167, 139, 250, 0.3)',
            }}
          >
            Rehearse This Decision
          </button>

          {/* Rehearsal Results */}
          <AnimatePresence>
            {rehearsalResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Score delta */}
                <div className="flex items-center gap-6 py-3 px-4 rounded-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
                  <div className="text-center">
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Before</p>
                    <p className="text-2xl font-bold" style={{ color: readinessColor(rehearsalResult.before.readiness) }}>
                      {rehearsalResult.before.score}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: readinessColor(rehearsalResult.before.readiness) }}>
                      {readinessLabel(rehearsalResult.before.readiness)}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    {rehearsalResult.scoreDelta < 0 ? (
                      <TrendingDown size={20} style={{ color: '#f87171' }} />
                    ) : (
                      <TrendingUp size={20} style={{ color: '#34d399' }} />
                    )}
                    <span
                      className="text-sm font-bold"
                      style={{ color: rehearsalResult.scoreDelta < 0 ? '#f87171' : '#34d399' }}
                    >
                      {rehearsalResult.scoreDelta > 0 ? '+' : ''}{rehearsalResult.scoreDelta}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>After</p>
                    <p className="text-2xl font-bold" style={{ color: readinessColor(rehearsalResult.after.readiness) }}>
                      {rehearsalResult.after.score}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: readinessColor(rehearsalResult.after.readiness) }}>
                      {readinessLabel(rehearsalResult.after.readiness)}
                    </p>
                  </div>
                </div>

                {/* Impact grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'New DTI', value: `${(rehearsalResult.financialImpact.newDTI * 100).toFixed(1)}%` },
                    { label: 'Emergency Fund', value: `${rehearsalResult.financialImpact.newEmergencyFundMonths.toFixed(1)}mo` },
                    { label: 'Savings Rate', value: `${(rehearsalResult.financialImpact.newSavingsRate * 100).toFixed(1)}%` },
                    { label: 'Recovery', value: `${rehearsalResult.timingAnalysis.recoveryDays} days` },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg p-2.5" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary, #94a3b8)' }}>{stat.label}</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary, #e2e8f0)' }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Verdict */}
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    {rehearsalResult.verdict}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DecisionCenterPage() {
  const [selectedDecision, setSelectedDecision] = useState<DecisionType | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [analyses, setAnalyses] = useState<Map<DecisionType, DecisionAnalysis>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch Plaid data and compute metrics
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [accountsRes, txRes] = await Promise.all([
          fetch('/api/plaid/accounts'),
          fetch('/api/plaid/transactions?limit=200'),
        ]);

        const accountsData = await accountsRes.json();
        const txData = await txRes.json();

        if (cancelled) return;
        if (!accountsData.success || !txData.success) return;
        if (!txData.data?.length) return;

        const { deriveFinancialMetrics } = await import('@/lib/plaid/insights');
        const m = deriveFinancialMetrics(
          txData.data,
          accountsData.data.flatMap((c: { accounts: unknown[] }) => c.accounts),
          accountsData.data,
        );

        if (cancelled) return;
        setMetrics(m);

        // Analyze all decisions
        const map = new Map<DecisionType, DecisionAnalysis>();
        for (const template of DECISION_TEMPLATES) {
          const analysis = analyzeDecisionReadiness(template.type, m);
          map.set(template.type, analysis);
        }
        setAnalyses(map);
      } catch {
        // Page still renders without Plaid data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const selectedAnalysis = selectedDecision ? analyses.get(selectedDecision) ?? null : null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(167, 139, 250, 0.12)' }}
          >
            <Sparkles size={20} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              Decision Center
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Explore life decisions, see your readiness, and rehearse the impact.
            </p>
          </div>
        </div>
      </motion.div>

      {/* No Plaid data banner */}
      {!loading && !metrics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card padding="md">
            <div className="flex items-center gap-4">
              <AlertTriangle size={20} style={{ color: '#facc15' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Connect your bank for personalized analysis
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  The Decision Center uses your verified financial data to analyze readiness across all three rings. Connect your bank accounts in the Financial Calendar to get started.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedAnalysis && metrics ? (
          <DecisionDetail
            key="detail"
            analysis={selectedAnalysis}
            metrics={metrics}
            onBack={() => setSelectedDecision(null)}
          />
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {DECISION_TEMPLATES.map((template) => (
              <DecisionCard
                key={template.type}
                template={template}
                analysis={analyses.get(template.type) ?? null}
                onClick={() => {
                  if (metrics) {
                    setSelectedDecision(template.type);
                  }
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
