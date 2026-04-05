'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Card, Slider } from '@/components/ui';
import { ScoreOrb } from '@/components/scoring/ScoreOrb';
import {
  computeScore,
  type AssessmentInputs,
  type Verdict,
} from '@/lib/scoring/engine';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MiniScoreImpact — "What-if" scenario modeler
 *
 * Shows current score and lets users explore how specific financial actions
 * would change their HōMI-Score in real time.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface MiniScoreImpactProps {
  /** Current scoring inputs (baseline for comparison). */
  baseInputs: AssessmentInputs;
  defaultExpanded?: boolean;
  className?: string;
}

const VERDICT_LABEL: Record<Verdict, string> = {
  READY: 'Ready',
  ALMOST_THERE: 'Almost There',
  BUILD_FIRST: 'Build First',
  NOT_YET: 'Not Yet',
};

function verdictColor(v: Verdict): string {
  switch (v) {
    case 'READY': return 'var(--emerald)';
    case 'ALMOST_THERE': return 'var(--yellow)';
    case 'BUILD_FIRST': return 'var(--homi-amber)';
    case 'NOT_YET': return 'var(--homi-crimson)';
  }
}

export function MiniScoreImpact({
  baseInputs,
  defaultExpanded = false,
  className,
}: MiniScoreImpactProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // What-if adjustments (deltas from baseline)
  const [debtReduction, setDebtReduction] = useState(0); // $ amount
  const [extraSavings, setExtraSavings] = useState(0);   // $ per month
  const [creditBoost, setCreditBoost] = useState(0);      // points

  const baseResult = useMemo(() => computeScore(baseInputs), [baseInputs]);

  const whatIfResult = useMemo(() => {
    // Derive modified inputs from deltas
    const monthlyIncome = baseInputs.debtToIncomeRatio > 0
      ? 1 / baseInputs.debtToIncomeRatio // approximate monthly income as 1/DTI (normalized)
      : 1;
    // DTI with reduced debt: assume debtReduction removes that monthly payment
    const estimatedMonthlyDebtReduction = debtReduction > 0 ? debtReduction * 0.02 : 0; // ~2% of balance as monthly payment
    const newDTI = Math.max(
      0,
      baseInputs.debtToIncomeRatio - (estimatedMonthlyDebtReduction * baseInputs.debtToIncomeRatio),
    );

    // Savings rate boost
    const newSavingsRate = Math.min(1, baseInputs.savingsRate + (extraSavings / 10000));

    // Credit score boost
    const newCreditScore = Math.min(850, baseInputs.creditScore + creditBoost);

    return computeScore({
      ...baseInputs,
      debtToIncomeRatio: newDTI,
      savingsRate: newSavingsRate,
      creditScore: newCreditScore,
    });
  }, [baseInputs, debtReduction, extraSavings, creditBoost]);

  const delta = Math.round((whatIfResult.score - baseResult.score) * 10) / 10;
  const hasChange = delta !== 0;
  const verdictChanged = whatIfResult.verdict !== baseResult.verdict;

  const resetSliders = useCallback(() => {
    setDebtReduction(0);
    setExtraSavings(0);
    setCreditBoost(0);
  }, []);

  return (
    <Card padding="sm" className={className}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: 'var(--cyan)' }} />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Score Impact
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
            {baseResult.score}
          </span>
          {hasChange && (
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: delta > 0 ? 'var(--emerald)' : 'var(--homi-crimson)' }}
            >
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-[var(--text-secondary)]" />
          </motion.div>
        </div>
      </button>

      {/* Expanded */}
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
              {/* Score comparison */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <ScoreOrb score={baseResult.score} size="sm" animate={false} />
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">Current</p>
                </div>
                {hasChange && (
                  <>
                    <div className="flex flex-col items-center">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: delta > 0 ? 'var(--emerald)' : 'var(--homi-crimson)' }}
                      >
                        &rarr;
                      </span>
                    </div>
                    <div className="text-center">
                      <ScoreOrb score={whatIfResult.score} size="sm" animate={false} />
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">What If</p>
                    </div>
                  </>
                )}
              </div>

              {/* Verdict change */}
              {verdictChanged && (
                <div
                  className="rounded-lg px-3 py-2 text-xs text-center font-medium"
                  style={{
                    background: 'rgba(52, 211, 153, 0.1)',
                    color: 'var(--emerald)',
                  }}
                >
                  <span style={{ color: verdictColor(baseResult.verdict) }}>
                    {VERDICT_LABEL[baseResult.verdict]}
                  </span>
                  {' '}&rarr;{' '}
                  <span style={{ color: verdictColor(whatIfResult.verdict) }}>
                    {VERDICT_LABEL[whatIfResult.verdict]}
                  </span>
                </div>
              )}

              {/* What-if sliders */}
              <div className="space-y-3">
                <Slider
                  label="Pay off debt"
                  min={0}
                  max={50000}
                  step={1000}
                  value={debtReduction}
                  onChange={setDebtReduction}
                  color="cyan"
                  showValue={false}
                />
                <p className="text-xs text-[var(--text-secondary)] -mt-2">
                  {debtReduction > 0
                    ? `Pay off $${debtReduction.toLocaleString()} of debt`
                    : 'Drag to simulate paying off debt'}
                </p>

                <Slider
                  label="Save more per month"
                  min={0}
                  max={2000}
                  step={50}
                  value={extraSavings}
                  onChange={setExtraSavings}
                  color="emerald"
                  showValue={false}
                />
                <p className="text-xs text-[var(--text-secondary)] -mt-2">
                  {extraSavings > 0
                    ? `Save $${extraSavings.toLocaleString()}/mo more`
                    : 'Drag to simulate extra savings'}
                </p>

                <Slider
                  label="Improve credit score"
                  min={0}
                  max={100}
                  step={5}
                  value={creditBoost}
                  onChange={setCreditBoost}
                  color="yellow"
                  showValue={false}
                />
                <p className="text-xs text-[var(--text-secondary)] -mt-2">
                  {creditBoost > 0
                    ? `+${creditBoost} credit score points`
                    : 'Drag to simulate credit improvement'}
                </p>
              </div>

              {/* Reset */}
              {hasChange && (
                <button
                  onClick={resetSliders}
                  className="w-full text-xs text-[var(--text-secondary)] hover:text-[var(--cyan)] transition-colors"
                >
                  Reset scenarios
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
