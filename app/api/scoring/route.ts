/**
 * POST /api/scoring — HōMI Score Calculation Endpoint
 * ====================================================
 *
 * Accepts user assessment inputs across three dimensions (financial,
 * emotional, timing), runs the canonical scoring engine, executes a
 * Monte Carlo simulation, and checks for crisis signals via the
 * Safety Canon.
 *
 * If crisis signals are detected, the response includes crisisDetected: true
 * and deflection resources. This is NOT an error — it's a feature. The
 * client should show the deflection UI instead of the results.
 *
 * Rate limiting: TODO — implement with Redis/Upstash. For now, rely on
 * Vercel's built-in rate limiting and the Safety Canon's cooldown system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeScore } from '@/lib/scoring/engine';
import { detectCrisis, collectSignals } from '@/lib/safety';
import { getCrisisResources } from '@/lib/safety/deflection';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Request Validation Schema
// ---------------------------------------------------------------------------

const FinancialInputsSchema = z.object({
  annualIncome: z.number().min(0).describe('Gross annual household income in USD'),
  monthlyDebt: z.number().min(0).describe('Total monthly debt obligations'),
  downPaymentSaved: z.number().min(0).describe('Amount saved toward down payment'),
  targetHomePrice: z.number().min(1).describe('Target purchase price'),
  emergencyFundMonths: z.number().min(0).describe('Months of expenses in emergency fund'),
  creditScore: z.number().min(300).max(850).describe('FICO credit score'),
});

const EmotionalInputsSchema = z.object({
  lifeStability: z.number().min(1).max(10).describe('Life stability (1-10)'),
  confidenceLevel: z.number().min(1).max(10).describe('Decision confidence (1-10)'),
  partnerAlignment: z.number().min(1).max(10).nullable().describe('Partner alignment (1-10, null if single)'),
  fomoLevel: z.number().min(1).max(10).describe('FOMO pressure (1-10)'),
});

const TimingInputsSchema = z.object({
  timeHorizonMonths: z.number().min(0).describe('Months until planned purchase'),
  monthlySavingsRate: z.number().min(0).max(100).describe('Monthly savings rate (0-100%)'),
  downPaymentProgress: z.number().min(0).max(100).describe('Down payment progress (0-100%)'),
});

const ScoringRequestSchema = z.object({
  financial: FinancialInputsSchema,
  emotional: EmotionalInputsSchema,
  timing: TimingInputsSchema,
  // Optional session metadata for crisis detection
  sessionMetadata: z.object({
    answerChangeCount: z.number().min(0).optional(),
    sessionDurationMinutes: z.number().min(0).optional(),
    userId: z.string().min(1).optional(),
  }).optional(),
});

type ScoringRequest = z.infer<typeof ScoringRequestSchema>;

// ---------------------------------------------------------------------------
// Monte Carlo Simulation
// ---------------------------------------------------------------------------

/**
 * Simplified Monte Carlo simulation for homeownership sustainability.
 *
 * Runs N scenarios with randomized market conditions (interest rate
 * changes, income volatility, unexpected expenses) and determines
 * what percentage of scenarios result in sustainable homeownership.
 *
 * TODO: Replace with a more sophisticated simulation engine that
 * accounts for local market conditions, employment sector risk, etc.
 */
function runMonteCarloSimulation(inputs: ScoringRequest) {
  const SCENARIOS = 1000;
  const { financial, timing } = inputs;

  // Derived values
  const monthlyIncome = financial.annualIncome / 12;
  const dti = monthlyIncome > 0 ? financial.monthlyDebt / monthlyIncome : 1;
  const downPaymentPercent = financial.targetHomePrice > 0
    ? financial.downPaymentSaved / financial.targetHomePrice
    : 0;

  // Estimated monthly mortgage (simplified: 30yr fixed, estimated rate)
  const loanAmount = financial.targetHomePrice - financial.downPaymentSaved;
  const baseRate = financial.creditScore >= 740 ? 0.065
    : financial.creditScore >= 700 ? 0.070
    : financial.creditScore >= 660 ? 0.075
    : 0.085;
  const monthlyRate = baseRate / 12;
  const numPayments = 360; // 30 years
  const baseMortgage = monthlyRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments;

  // Property tax + insurance estimate (1.5% of home price annually)
  const monthlyExtras = (financial.targetHomePrice * 0.015) / 12;
  const totalMonthlyHousing = baseMortgage + monthlyExtras;

  // PMI if < 20% down
  const pmiMonthly = downPaymentPercent < 0.2 ? loanAmount * 0.005 / 12 : 0;
  const totalWithPMI = totalMonthlyHousing + pmiMonthly;

  let successes = 0;
  const netWorthDeltas: number[] = [];

  // Seeded pseudo-random for determinism in tests
  // Using a simple LCG since we don't need cryptographic quality
  let seed = 42;
  function nextRandom(): number {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  for (let i = 0; i < SCENARIOS; i++) {
    // Randomize market conditions
    const rateShock = (nextRandom() - 0.5) * 0.04; // +/- 2% rate change
    const incomeVolatility = 1 + (nextRandom() - 0.5) * 0.3; // +/- 15% income change
    const unexpectedExpense = nextRandom() < 0.15 ? monthlyIncome * 2 : 0; // 15% chance of major expense
    const homeValueChange = 1 + (nextRandom() - 0.3) * 0.4; // Skewed positive appreciation

    // Adjusted monthly budget
    const adjustedIncome = monthlyIncome * incomeVolatility;
    const adjustedMortgage = totalWithPMI * (1 + rateShock * 3); // ARM sensitivity
    const adjustedDti = adjustedMortgage / adjustedIncome;
    const emergencyBuffer = financial.emergencyFundMonths * monthlyIncome;

    // Survival criteria:
    // 1. Can afford adjusted mortgage (DTI < 50%)
    // 2. Emergency fund covers unexpected expenses
    // 3. Not underwater on the home
    const canAfford = adjustedDti < 0.5;
    const canSurviveEmergency = emergencyBuffer > unexpectedExpense;
    const notUnderwater = financial.targetHomePrice * homeValueChange > loanAmount * 0.9;

    const survived = canAfford && canSurviveEmergency && notUnderwater;
    if (survived) successes++;

    // Net worth delta: home equity gain/loss - costs
    const equityDelta = financial.targetHomePrice * (homeValueChange - 1);
    const costOfOwnership = totalWithPMI * 12 * 5; // 5-year cost
    const savingsGrowth = (timing.monthlySavingsRate / 100) * monthlyIncome * 12 * 5;
    netWorthDeltas.push(equityDelta - costOfOwnership + savingsGrowth - unexpectedExpense);
  }

  // Sort for percentile calculations
  netWorthDeltas.sort((a, b) => a - b);

  // Crash survival: scenarios where home value drops 20%+ and user survives
  let crashSurvivals = 0;
  let crashCount = 0;
  seed = 42; // Reset seed for crash simulation
  for (let i = 0; i < SCENARIOS; i++) {
    nextRandom(); // Advance to same position
    const incomeVolatility = 1 + (nextRandom() - 0.5) * 0.3;
    nextRandom(); // Skip unexpected expense
    const homeValueChange = 1 + (nextRandom() - 0.3) * 0.4;

    if (homeValueChange < 0.8) {
      crashCount++;
      const adjustedIncome = monthlyIncome * incomeVolatility;
      const adjustedDti = totalWithPMI / adjustedIncome;
      if (adjustedDti < 0.5 && financial.emergencyFundMonths >= 3) {
        crashSurvivals++;
      }
    }
  }

  // Hard gate: DTI > 50% forces BUILD_FIRST regardless of score
  const gateApplied = dti > 0.5;

  return {
    successRate: Math.round((successes / SCENARIOS) * 100) / 100,
    scenariosRun: SCENARIOS,
    p10: Math.round(netWorthDeltas[Math.floor(SCENARIOS * 0.1)]),
    p50: Math.round(netWorthDeltas[Math.floor(SCENARIOS * 0.5)]),
    p90: Math.round(netWorthDeltas[Math.floor(SCENARIOS * 0.9)]),
    crashSurvivalRate: crashCount > 0
      ? Math.round((crashSurvivals / crashCount) * 100) / 100
      : 1,
    gateApplied,
  };
}

// ---------------------------------------------------------------------------
// Helper: Transform API inputs to scoring engine format
// ---------------------------------------------------------------------------

function transformToEngineInputs(inputs: ScoringRequest) {
  const { financial, emotional, timing } = inputs;

  const monthlyIncome = financial.annualIncome / 12;
  const dti = monthlyIncome > 0 ? financial.monthlyDebt / monthlyIncome : 1;
  const downPaymentPercent = financial.targetHomePrice > 0
    ? financial.downPaymentSaved / financial.targetHomePrice
    : 0;

  return {
    debtToIncomeRatio: dti,
    downPaymentPercent,
    emergencyFundMonths: financial.emergencyFundMonths,
    creditScore: financial.creditScore,
    lifeStability: emotional.lifeStability,
    confidenceLevel: emotional.confidenceLevel,
    partnerAlignment: emotional.partnerAlignment,
    fomoLevel: emotional.fomoLevel,
    timeHorizonMonths: timing.timeHorizonMonths,
    savingsRate: timing.monthlySavingsRate / 100, // Convert percentage to ratio
    downPaymentProgress: timing.downPaymentProgress / 100, // Convert percentage to ratio
  };
}

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // --- Parse & Validate ---
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = ScoringRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const inputs = parsed.data;

    // --- Run Scoring Engine ---
    const engineInputs = transformToEngineInputs(inputs);
    const scoreResult = computeScore(engineInputs);

    // --- Run Monte Carlo ---
    const monteCarlo = runMonteCarloSimulation(inputs);

    // --- Apply hard gate ---
    let verdict = scoreResult.verdict;
    if (monteCarlo.gateApplied && (verdict === 'READY' || verdict === 'ALMOST_THERE')) {
      verdict = 'BUILD_FIRST';
    }

    // --- Run Crisis Detection ---
    const sliderValues = [
      inputs.emotional.lifeStability,
      inputs.emotional.confidenceLevel,
      inputs.emotional.fomoLevel,
      ...(inputs.emotional.partnerAlignment !== null
        ? [inputs.emotional.partnerAlignment]
        : []),
    ];

    const crisisSignals = collectSignals({
      answerChangeCount: inputs.sessionMetadata?.answerChangeCount,
      sessionDurationMinutes: inputs.sessionMetadata?.sessionDurationMinutes,
      sliderValues,
      fomoLevel: inputs.emotional.fomoLevel,
      confidenceLevel: inputs.emotional.confidenceLevel,
      lifeStability: inputs.emotional.lifeStability,
      partnerAlignment: inputs.emotional.partnerAlignment,
      timeHorizonMonths: inputs.timing.timeHorizonMonths,
    });

    const crisisResult = detectCrisis(crisisSignals);

    // --- Determine confidence band ---
    const hasAllFinancial = inputs.financial.annualIncome > 0 &&
      inputs.financial.targetHomePrice > 0;
    const hasEmotional = inputs.emotional.lifeStability >= 1 &&
      inputs.emotional.confidenceLevel >= 1;
    const confidenceBand = hasAllFinancial && hasEmotional
      ? (scoreResult.warnings.length === 0 ? 'high' : 'medium')
      : 'low';

    // --- Build Assessment ID ---
    const assessmentId = crypto.randomUUID();
    const now = new Date().toISOString();

    // --- Build Response ---
    const response = {
      id: assessmentId,
      userId: inputs.sessionMetadata?.userId ?? 'anonymous',
      overall: scoreResult.score,
      financial: {
        score: Math.round((scoreResult.financial.total / 35) * 100),
        maxContribution: 35,
        contribution: scoreResult.financial.total,
        breakdown: {
          dti: { value: engineInputs.debtToIncomeRatio, maxPoints: 10, points: scoreResult.financial.debtToIncome },
          downPayment: { value: engineInputs.downPaymentPercent, maxPoints: 10, points: scoreResult.financial.downPayment },
          emergencyFund: { value: engineInputs.emergencyFundMonths, maxPoints: 8, points: scoreResult.financial.emergencyFund },
          creditScore: { value: engineInputs.creditScore, maxPoints: 7, points: scoreResult.financial.creditHealth },
        },
      },
      emotional: {
        score: Math.round((scoreResult.emotional.total / 35) * 100),
        maxContribution: 35,
        contribution: scoreResult.emotional.total,
        breakdown: {
          lifeStability: { value: inputs.emotional.lifeStability, maxPoints: 9, points: scoreResult.emotional.lifeStability },
          confidence: { value: inputs.emotional.confidenceLevel, maxPoints: 9, points: scoreResult.emotional.confidenceLevel },
          partnerAlignment: { value: inputs.emotional.partnerAlignment ?? 0, maxPoints: 9, points: scoreResult.emotional.partnerAlignment },
          fomoCheck: { value: inputs.emotional.fomoLevel, maxPoints: 8, points: scoreResult.emotional.fomoCheck },
        },
      },
      timing: {
        score: Math.round((scoreResult.timing.total / 30) * 100),
        maxContribution: 30,
        contribution: scoreResult.timing.total,
        breakdown: {
          timeHorizon: { value: inputs.timing.timeHorizonMonths, maxPoints: 10, points: scoreResult.timing.timeHorizon },
          savingsRate: { value: engineInputs.savingsRate, maxPoints: 10, points: scoreResult.timing.savingsRate },
          downPaymentProgress: { value: engineInputs.downPaymentProgress, maxPoints: 10, points: scoreResult.timing.downPaymentProgress },
        },
      },
      verdict,
      confidenceBand,
      monteCarlo,
      warnings: scoreResult.warnings,
      crisisDetected: crisisResult.detected,
      crisisResult: crisisResult.detected ? {
        action: crisisResult.action,
        signals: crisisResult.signals,
        cooldownUntil: crisisResult.cooldownUntil,
        resources: getCrisisResources(),
      } : undefined,
      createdAt: now,
      version: '1.0.0',
    };

    // Persist assessment to Supabase
    let persistedId: string | undefined;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: saved } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            financial_inputs: inputs.financial,
            emotional_inputs: inputs.emotional,
            timing_inputs: inputs.timing,
            overall_score: response.overall,
            financial_score: response.financial.score,
            financial_breakdown: response.financial.breakdown,
            emotional_score: response.emotional.score,
            emotional_breakdown: response.emotional.breakdown,
            timing_score: response.timing.score,
            timing_breakdown: response.timing.breakdown,
            verdict: response.verdict,
            confidence_band: response.confidenceBand,
            crisis_detected: response.crisisDetected,
            version: response.version,
          })
          .select('id')
          .single();

        if (saved) {
          persistedId = saved.id;

          // Persist Monte Carlo results
          if (response.monteCarlo) {
            await supabase.from('monte_carlo_results').insert({
              assessment_id: saved.id,
              success_rate: response.monteCarlo.successRate,
              scenarios_run: response.monteCarlo.scenariosRun,
              p10: response.monteCarlo.p10,
              p50: response.monteCarlo.p50,
              p90: response.monteCarlo.p90,
              crash_survival_rate: response.monteCarlo.crashSurvivalRate,
              gate_applied: response.monteCarlo.gateApplied,
            });
          }
        }
      }
    } catch (persistError) {
      console.error('[Scoring API] Persistence error (non-fatal):', persistError);
    }

    return NextResponse.json(
      { ...response, id: persistedId ?? response.id },
      { status: 200, headers: CORS_HEADERS },
    );

  } catch (error) {
    console.error('[Scoring API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
