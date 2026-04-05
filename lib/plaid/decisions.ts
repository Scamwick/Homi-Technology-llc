// =============================================================================
// lib/plaid/decisions.ts — Life Decision Library & Regret Prevention
// =============================================================================
// Pre-built readiness templates for life's biggest decisions. Each template
// defines thresholds across all three rings of readiness. The Decision
// Rehearsal Engine simulates the impact of a decision on your HōMI Score.
// =============================================================================

import type { FinancialMetrics } from './insights';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DecisionType =
  | 'home_purchase'
  | 'car_purchase'
  | 'career_change'
  | 'start_business'
  | 'having_baby'
  | 'getting_married'
  | 'retirement'
  | 'major_renovation';

export type ReadinessLevel = 'READY' | 'ALMOST_READY' | 'NOT_READY';
export type RingStatus = 'green' | 'yellow' | 'red';

export interface DecisionTemplate {
  type: DecisionType;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  thresholds: DecisionThresholds;
}

export interface DecisionThresholds {
  // Ring 1 — Financial Reality
  maxDTI: number;
  minEmergencyFundMonths: number;
  minDownPaymentPct?: number; // for purchases
  minSavingsReserve?: number; // absolute $ needed
  maxDebtIncrease?: number; // new monthly obligation allowed

  // Ring 2 — Emotional Truth
  minEmotionalReadiness: number; // 0-100 from assessment

  // Ring 3 — Perfect Timing
  minTimingScore: number; // 0-100
  noMajorLifeEventsMonths?: number; // stability buffer
}

export interface DecisionAnalysis {
  decision: DecisionTemplate;
  overallReadiness: ReadinessLevel;
  regretProbability: number; // 0-100

  // Per-ring breakdown
  financialReality: RingAnalysis;
  emotionalTruth: RingAnalysis;
  perfectTiming: RingAnalysis;

  // Action items to move toward READY
  actionItems: ActionItem[];

  // Countdown
  estimatedDaysToReady: number | null;
}

export interface RingAnalysis {
  score: number; // 0-100
  status: RingStatus;
  factors: RingFactor[];
}

export interface RingFactor {
  label: string;
  current: string;
  target: string;
  met: boolean;
}

export interface ActionItem {
  title: string;
  description: string;
  impact: string; // "Increases Financial Reality by ~8 points"
  priority: 'high' | 'medium' | 'low';
}

// Decision Rehearsal types
export interface DecisionRehearsalInput {
  decisionType: DecisionType;
  amount: number; // total cost / commitment
  downPayment?: number;
  monthlyPayment?: number;
  targetDate: string; // YYYY-MM-DD
}

export interface DecisionRehearsalResult {
  before: { score: number; readiness: ReadinessLevel };
  after: { score: number; readiness: ReadinessLevel };
  scoreDelta: number;
  financialImpact: {
    newDTI: number;
    newEmergencyFundMonths: number;
    newSavingsRate: number;
    liquidReservesAfter: number;
  };
  timingAnalysis: {
    optimalDate: string | null;
    dangerZonesCreated: number;
    recoveryDays: number; // days until readiness recovers to pre-decision level
  };
  verdict: string;
}

// ---------------------------------------------------------------------------
// Decision templates
// ---------------------------------------------------------------------------

export const DECISION_TEMPLATES: DecisionTemplate[] = [
  {
    type: 'home_purchase',
    label: 'Home Purchase',
    description: 'Buying a home — the biggest financial decision most people make.',
    icon: 'Home',
    thresholds: {
      maxDTI: 0.28,
      minEmergencyFundMonths: 6,
      minDownPaymentPct: 20,
      minSavingsReserve: 10000,
      maxDebtIncrease: 2500,
      minEmotionalReadiness: 70,
      minTimingScore: 60,
      noMajorLifeEventsMonths: 6,
    },
  },
  {
    type: 'car_purchase',
    label: 'Car Purchase',
    description: 'Buying or financing a vehicle.',
    icon: 'Car',
    thresholds: {
      maxDTI: 0.33,
      minEmergencyFundMonths: 3,
      minDownPaymentPct: 15,
      maxDebtIncrease: 600,
      minEmotionalReadiness: 60,
      minTimingScore: 50,
    },
  },
  {
    type: 'career_change',
    label: 'Career Change',
    description: 'Switching jobs, industries, or going back to school.',
    icon: 'Briefcase',
    thresholds: {
      maxDTI: 0.25,
      minEmergencyFundMonths: 6,
      minSavingsReserve: 15000,
      minEmotionalReadiness: 75,
      minTimingScore: 55,
      noMajorLifeEventsMonths: 3,
    },
  },
  {
    type: 'start_business',
    label: 'Start a Business',
    description: 'Launching a business or going full-time on a side project.',
    icon: 'Rocket',
    thresholds: {
      maxDTI: 0.20,
      minEmergencyFundMonths: 12,
      minSavingsReserve: 25000,
      minEmotionalReadiness: 80,
      minTimingScore: 65,
      noMajorLifeEventsMonths: 6,
    },
  },
  {
    type: 'having_baby',
    label: 'Having a Baby',
    description: 'Growing your family — one of the most rewarding and expensive decisions.',
    icon: 'Baby',
    thresholds: {
      maxDTI: 0.30,
      minEmergencyFundMonths: 6,
      minSavingsReserve: 10000,
      maxDebtIncrease: 500,
      minEmotionalReadiness: 75,
      minTimingScore: 60,
    },
  },
  {
    type: 'getting_married',
    label: 'Getting Married',
    description: 'Combining lives, finances, and futures.',
    icon: 'Heart',
    thresholds: {
      maxDTI: 0.30,
      minEmergencyFundMonths: 3,
      minSavingsReserve: 15000,
      minEmotionalReadiness: 85,
      minTimingScore: 50,
    },
  },
  {
    type: 'retirement',
    label: 'Retirement',
    description: 'Transitioning out of full-time work.',
    icon: 'Sunset',
    thresholds: {
      maxDTI: 0.15,
      minEmergencyFundMonths: 24,
      minSavingsReserve: 500000,
      minEmotionalReadiness: 70,
      minTimingScore: 70,
    },
  },
  {
    type: 'major_renovation',
    label: 'Major Renovation',
    description: 'Home renovation, addition, or major repair.',
    icon: 'Hammer',
    thresholds: {
      maxDTI: 0.33,
      minEmergencyFundMonths: 3,
      minSavingsReserve: 10000,
      maxDebtIncrease: 800,
      minEmotionalReadiness: 60,
      minTimingScore: 50,
    },
  },
];

// ---------------------------------------------------------------------------
// Analysis engine
// ---------------------------------------------------------------------------

/**
 * Analyzes a user's readiness for a specific life decision using verified
 * financial data. Returns per-ring breakdown, action items, and regret
 * probability.
 */
export function analyzeDecisionReadiness(
  decisionType: DecisionType,
  metrics: FinancialMetrics,
  emotionalScore: number = 50, // default if no assessment completed
  timingScore: number = 50,
): DecisionAnalysis {
  const template = DECISION_TEMPLATES.find((t) => t.type === decisionType);
  if (!template) throw new Error(`Unknown decision type: ${decisionType}`);

  const { thresholds } = template;

  // ── Ring 1: Financial Reality ──
  const financialFactors: RingFactor[] = [
    {
      label: 'Debt-to-Income Ratio',
      current: `${(metrics.actualDTI * 100).toFixed(1)}%`,
      target: `< ${(thresholds.maxDTI * 100).toFixed(0)}%`,
      met: metrics.actualDTI <= thresholds.maxDTI,
    },
    {
      label: 'Emergency Fund',
      current: `${metrics.emergencyFundMonths.toFixed(1)} months`,
      target: `≥ ${thresholds.minEmergencyFundMonths} months`,
      met: metrics.emergencyFundMonths >= thresholds.minEmergencyFundMonths,
    },
  ];
  if (thresholds.minSavingsReserve) {
    financialFactors.push({
      label: 'Savings Reserve',
      current: `$${metrics.liquidReserves.toLocaleString()}`,
      target: `≥ $${thresholds.minSavingsReserve.toLocaleString()}`,
      met: metrics.liquidReserves >= thresholds.minSavingsReserve,
    });
  }

  const financialMetCount = financialFactors.filter((f) => f.met).length;
  const financialScore = Math.round((financialMetCount / financialFactors.length) * 100);
  const financialStatus: RingStatus = financialScore >= 75 ? 'green' : financialScore >= 40 ? 'yellow' : 'red';

  // ── Ring 2: Emotional Truth ──
  const emotionalFactors: RingFactor[] = [
    {
      label: 'Emotional Readiness',
      current: `${emotionalScore}/100`,
      target: `≥ ${thresholds.minEmotionalReadiness}/100`,
      met: emotionalScore >= thresholds.minEmotionalReadiness,
    },
  ];
  const emotionalStatus: RingStatus = emotionalScore >= thresholds.minEmotionalReadiness ? 'green' : emotionalScore >= thresholds.minEmotionalReadiness * 0.7 ? 'yellow' : 'red';

  // ── Ring 3: Perfect Timing ──
  const timingFactors: RingFactor[] = [
    {
      label: 'Timing Score',
      current: `${timingScore}/100`,
      target: `≥ ${thresholds.minTimingScore}/100`,
      met: timingScore >= thresholds.minTimingScore,
    },
    {
      label: 'Cash Flow Stability',
      current: metrics.dangerZones.length === 0 ? 'No danger zones' : `${metrics.dangerZones.length} danger zone(s)`,
      target: 'No danger zones in next 30 days',
      met: metrics.dangerZones.length === 0,
    },
  ];
  const timingMetCount = timingFactors.filter((f) => f.met).length;
  const timingScoreCalc = Math.round((timingMetCount / timingFactors.length) * 100);
  const timingStatus: RingStatus = timingScoreCalc >= 75 ? 'green' : timingScoreCalc >= 40 ? 'yellow' : 'red';

  // ── Overall readiness ──
  const allFactors = [...financialFactors, ...emotionalFactors, ...timingFactors];
  const totalMet = allFactors.filter((f) => f.met).length;
  const overallPct = totalMet / allFactors.length;

  let overallReadiness: ReadinessLevel = 'NOT_READY';
  if (overallPct >= 0.8 && financialStatus !== 'red') {
    overallReadiness = 'READY';
  } else if (overallPct >= 0.5) {
    overallReadiness = 'ALMOST_READY';
  }

  // ── Regret probability ──
  // Higher readiness = lower regret
  const regretProbability = Math.round(Math.max(0, Math.min(100,
    100 - (overallPct * 100) - (financialScore > 75 ? 10 : 0) - (emotionalScore > 70 ? 5 : 0),
  )));

  // ── Action items ──
  const actionItems: ActionItem[] = [];

  if (!financialFactors[0].met) {
    const dtiGap = metrics.actualDTI - thresholds.maxDTI;
    const monthlyReduction = Math.round(metrics.verifiedMonthlyIncome * dtiGap);
    actionItems.push({
      title: `Reduce monthly debt by $${monthlyReduction.toLocaleString()}`,
      description: `Your DTI is ${(metrics.actualDTI * 100).toFixed(1)}%. Reduce obligations by $${monthlyReduction}/month to hit the ${(thresholds.maxDTI * 100).toFixed(0)}% threshold.`,
      impact: 'Increases Financial Reality ring by ~8 points',
      priority: 'high',
    });
  }

  if (!financialFactors[1].met) {
    const monthsNeeded = thresholds.minEmergencyFundMonths - metrics.emergencyFundMonths;
    const avgExpenses = metrics.liquidReserves / (metrics.emergencyFundMonths || 0.1);
    const dollarsNeeded = Math.round(monthsNeeded * avgExpenses);
    actionItems.push({
      title: `Add $${dollarsNeeded.toLocaleString()} to emergency fund`,
      description: `You have ${metrics.emergencyFundMonths.toFixed(1)} months of reserves. Add $${dollarsNeeded.toLocaleString()} to reach ${thresholds.minEmergencyFundMonths} months.`,
      impact: 'Increases Financial Reality ring by ~5 points',
      priority: 'high',
    });
  }

  if (metrics.dangerZones.length > 0) {
    actionItems.push({
      title: 'Resolve cash flow danger zones',
      description: `${metrics.dangerZones.length} upcoming date(s) where your balance drops below $500. Align bill timing with income to eliminate gaps.`,
      impact: 'Improves Perfect Timing ring and reduces stress',
      priority: 'medium',
    });
  }

  if (metrics.totalSubscriptionMonthly > 100) {
    actionItems.push({
      title: `Review $${metrics.totalSubscriptionMonthly.toFixed(0)}/month in subscriptions`,
      description: `You have ${metrics.subscriptions.length} recurring subscriptions totaling $${metrics.totalSubscriptionAnnual.toFixed(0)}/year. Canceling unused ones directly reduces DTI.`,
      impact: 'Reduces DTI and increases savings rate',
      priority: 'medium',
    });
  }

  // Estimate days to ready
  let estimatedDaysToReady: number | null = null;
  if (overallReadiness !== 'READY') {
    const monthlySavings = metrics.verifiedMonthlyIncome * metrics.savingsRate;
    if (monthlySavings > 0) {
      const biggestGap = financialFactors.filter((f) => !f.met).length > 0
        ? 90 // rough estimate: 3 months per unmet financial factor
        : 30;
      estimatedDaysToReady = biggestGap * financialFactors.filter((f) => !f.met).length || 30;
    }
  }

  return {
    decision: template,
    overallReadiness,
    regretProbability,
    financialReality: { score: financialScore, status: financialStatus, factors: financialFactors },
    emotionalTruth: { score: emotionalScore, status: emotionalStatus, factors: emotionalFactors },
    perfectTiming: { score: timingScoreCalc, status: timingStatus, factors: timingFactors },
    actionItems,
    estimatedDaysToReady,
  };
}

// ---------------------------------------------------------------------------
// Decision rehearsal engine
// ---------------------------------------------------------------------------

/**
 * Simulates the impact of a potential decision on the user's financial
 * readiness. Shows before/after HōMI Score, identifies optimal timing,
 * and calculates recovery period.
 */
export function rehearseDecision(
  input: DecisionRehearsalInput,
  currentMetrics: FinancialMetrics,
): DecisionRehearsalResult {
  const { amount, downPayment = 0, monthlyPayment = 0 } = input;

  // Current readiness
  const currentScore = computeSimpleReadinessScore(currentMetrics);
  const currentReadiness = scoreToReadiness(currentScore);

  // Post-decision projections
  const newLiquidReserves = currentMetrics.liquidReserves - downPayment;
  const newMonthlyDebt = currentMetrics.verifiedMonthlyDebt + monthlyPayment;
  const newDTI = currentMetrics.verifiedMonthlyIncome > 0
    ? newMonthlyDebt / currentMetrics.verifiedMonthlyIncome
    : 0;
  const avgExpenses = currentMetrics.liquidReserves / (currentMetrics.emergencyFundMonths || 0.1);
  const newEmergencyFundMonths = avgExpenses > 0 ? newLiquidReserves / avgExpenses : 0;
  const newSavingsRate = currentMetrics.verifiedMonthlyIncome > 0
    ? (currentMetrics.verifiedMonthlyIncome - (avgExpenses + monthlyPayment)) / currentMetrics.verifiedMonthlyIncome
    : 0;

  // Post-decision score
  const postMetrics: FinancialMetrics = {
    ...currentMetrics,
    liquidReserves: newLiquidReserves,
    verifiedMonthlyDebt: newMonthlyDebt,
    actualDTI: newDTI,
    emergencyFundMonths: newEmergencyFundMonths,
    savingsRate: newSavingsRate,
  };
  const postScore = computeSimpleReadinessScore(postMetrics);
  const postReadiness = scoreToReadiness(postScore);

  // How many new danger zones does this create?
  const newDangerZones = newLiquidReserves < 500 ? 1 : 0;

  // Recovery: how many days until savings restore pre-decision emergency fund?
  const monthlySavings = currentMetrics.verifiedMonthlyIncome * Math.max(newSavingsRate, 0);
  const reserveDeficit = currentMetrics.liquidReserves - newLiquidReserves;
  const recoveryDays = monthlySavings > 0
    ? Math.ceil((reserveDeficit / monthlySavings) * 30)
    : 365;

  // Verdict
  let verdict: string;
  if (postReadiness === 'READY') {
    verdict = `You remain READY after this decision. Your score drops by ${currentScore - postScore} points but stays above the threshold. Go for it when the timing is right.`;
  } else if (currentReadiness === 'READY') {
    verdict = `This decision moves you from READY to ${postReadiness}. Your emergency fund drops to ${newEmergencyFundMonths.toFixed(1)} months and DTI rises to ${(newDTI * 100).toFixed(1)}%. Consider waiting ${recoveryDays} days to build a larger buffer.`;
  } else {
    verdict = `You're currently ${currentReadiness} and this decision would keep you at ${postReadiness}. Score impact: ${currentScore - postScore} points. Focus on the action items in your readiness analysis first.`;
  }

  return {
    before: { score: currentScore, readiness: currentReadiness },
    after: { score: postScore, readiness: postReadiness },
    scoreDelta: postScore - currentScore,
    financialImpact: {
      newDTI,
      newEmergencyFundMonths,
      newSavingsRate,
      liquidReservesAfter: newLiquidReserves,
    },
    timingAnalysis: {
      optimalDate: null, // TODO: find date when score recovers
      dangerZonesCreated: newDangerZones,
      recoveryDays,
    },
    verdict,
  };
}

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

function computeSimpleReadinessScore(metrics: FinancialMetrics): number {
  let score = 50; // base

  // DTI scoring (0-25 points)
  if (metrics.actualDTI <= 0.20) score += 25;
  else if (metrics.actualDTI <= 0.28) score += 20;
  else if (metrics.actualDTI <= 0.36) score += 10;
  else score += 0;

  // Emergency fund (0-25 points)
  if (metrics.emergencyFundMonths >= 6) score += 25;
  else if (metrics.emergencyFundMonths >= 3) score += 15;
  else if (metrics.emergencyFundMonths >= 1) score += 5;
  else score -= 10;

  // Savings rate (0-15 points)
  if (metrics.savingsRate >= 0.20) score += 15;
  else if (metrics.savingsRate >= 0.10) score += 10;
  else if (metrics.savingsRate >= 0.05) score += 5;
  else score -= 5;

  // Danger zones penalty
  score -= metrics.dangerZones.length * 5;

  return Math.max(0, Math.min(100, score));
}

function scoreToReadiness(score: number): ReadinessLevel {
  if (score >= 75) return 'READY';
  if (score >= 50) return 'ALMOST_READY';
  return 'NOT_READY';
}
