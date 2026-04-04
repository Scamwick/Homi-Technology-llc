/**
 * POST /api/scoring/refresh — On-Demand Score Refresh from Plaid
 * ================================================================
 *
 * Triggers a fresh HoMI-Score calculation using the latest Plaid data.
 * Flow: Fetch Plaid data → Derive snapshot → Combine with latest
 *       emotional/timing assessment → Run scoring engine + Monte Carlo.
 *
 * This endpoint is called when:
 *   1. User explicitly requests a score refresh
 *   2. Dashboard detects stale data
 *   3. Plaid webhook triggers a recalculation
 *
 * Response: Full scoring result with data source indicators.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeScore } from '@/lib/scoring/engine';
import { snapshotToScoringInputs, mergeWithSelfReported } from '@/lib/scoring/plaid-adapter';
import { getLatestCreditScore } from '@/lib/credit/service';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    // 1. Get latest financial snapshot (Plaid-derived)
    const { data: snapshot } = await supabase
      .from('financial_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single();

    // 2. Get latest assessment for emotional/timing data
    const { data: assessment } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (!assessment) {
      return NextResponse.json(
        { error: 'No completed assessment found. Please complete an assessment first.' },
        { status: 404 },
      );
    }

    // 3. Get credit score
    const creditResult = await getLatestCreditScore(user.id);
    const creditScore = creditResult?.reconciledScore ?? 650; // Fallback

    // 4. Build scoring inputs
    const emotionalInputs = {
      lifeStability: assessment.emotional_sub_scores?.lifeStability?.value ?? 5,
      confidenceLevel: assessment.emotional_sub_scores?.confidence?.value ?? 5,
      partnerAlignment: assessment.emotional_sub_scores?.partnerAlignment?.value ?? null,
      fomoLevel: assessment.emotional_sub_scores?.fomoCheck?.value ?? 5,
    };

    const timingInputs = {
      timeHorizonMonths: assessment.timing_sub_scores?.timeHorizon?.value ?? 12,
    };

    let scoringInputs;
    let dataSource = 'self_reported' as string;

    if (snapshot) {
      // Use Plaid data for financial dimension
      const plaidSnapshot = {
        id: snapshot.id,
        userId: user.id,
        snapshotAt: snapshot.snapshot_at,
        totalChecking: Number(snapshot.total_checking),
        totalSavings: Number(snapshot.total_savings),
        totalInvestments: Number(snapshot.total_investments),
        totalCreditCardDebt: Number(snapshot.total_credit_card_debt),
        totalLoanDebt: Number(snapshot.total_loan_debt),
        totalMonthlyDebtPayments: Number(snapshot.total_monthly_debt_payments),
        estimatedMonthlyIncome: Number(snapshot.estimated_monthly_income),
        estimatedMonthlyExpenses: Number(snapshot.estimated_monthly_expenses),
        debtToIncomeRatio: Number(snapshot.debt_to_income_ratio),
        savingsRate: Number(snapshot.savings_rate),
        emergencyFundMonths: Number(snapshot.emergency_fund_months),
        downPaymentAvailable: Number(snapshot.down_payment_available),
        netWorth: Number(snapshot.net_worth),
        reconciledCreditScore: snapshot.reconciled_credit_score,
        dataSources: snapshot.data_sources ?? [],
        confidence: snapshot.confidence ?? 'medium',
      };

      const targetHomePrice = assessment.financial_sub_scores?.targetHomePrice ??
        assessment.timing_sub_scores?.targetHomePrice ?? 400000;

      scoringInputs = snapshotToScoringInputs(
        plaidSnapshot,
        targetHomePrice,
        creditScore,
        emotionalInputs,
        timingInputs,
      );
      dataSource = 'plaid';
    } else {
      // Fall back to self-reported data from assessment
      scoringInputs = {
        financial: {
          annualIncome: assessment.financial_sub_scores?.income?.value ?? 0,
          monthlyDebt: assessment.financial_sub_scores?.dti?.value ?? 0,
          downPaymentSaved: assessment.financial_sub_scores?.downPayment?.value ?? 0,
          targetHomePrice: assessment.financial_sub_scores?.targetHomePrice ?? 400000,
          emergencyFundMonths: assessment.financial_sub_scores?.emergencyFund?.value ?? 0,
          creditScore,
        },
        emotional: emotionalInputs,
        timing: {
          timeHorizonMonths: timingInputs.timeHorizonMonths,
          monthlySavingsRate: assessment.timing_sub_scores?.savingsRate?.value ?? 10,
          downPaymentProgress: assessment.timing_sub_scores?.downPaymentProgress?.value ?? 0,
        },
        dataSource: 'self_reported' as const,
      };
      dataSource = 'self_reported';
    }

    // 5. Transform to engine format and compute score
    const monthlyIncome = scoringInputs.financial.annualIncome / 12;
    const dti = monthlyIncome > 0
      ? scoringInputs.financial.monthlyDebt / monthlyIncome
      : 1;
    const downPaymentPercent = scoringInputs.financial.targetHomePrice > 0
      ? scoringInputs.financial.downPaymentSaved / scoringInputs.financial.targetHomePrice
      : 0;

    const engineInputs = {
      debtToIncomeRatio: dti,
      downPaymentPercent,
      emergencyFundMonths: scoringInputs.financial.emergencyFundMonths,
      creditScore: scoringInputs.financial.creditScore,
      lifeStability: scoringInputs.emotional.lifeStability,
      confidenceLevel: scoringInputs.emotional.confidenceLevel,
      partnerAlignment: scoringInputs.emotional.partnerAlignment,
      fomoLevel: scoringInputs.emotional.fomoLevel,
      timeHorizonMonths: scoringInputs.timing.timeHorizonMonths,
      savingsRate: scoringInputs.timing.monthlySavingsRate / 100,
      downPaymentProgress: scoringInputs.timing.downPaymentProgress / 100,
    };

    const scoreResult = computeScore(engineInputs);

    // 6. Determine confidence band (enhanced for Plaid)
    const confidenceBand = dataSource === 'plaid'
      ? 'verified'
      : dataSource === 'hybrid'
        ? 'high'
        : scoreResult.warnings.length === 0
          ? 'high'
          : 'medium';

    // 7. Build response
    return NextResponse.json({
      overall: scoreResult.score,
      verdict: scoreResult.verdict,
      financial: {
        score: Math.round((scoreResult.financial.total / 35) * 100),
        contribution: scoreResult.financial.total,
        breakdown: scoreResult.financial,
      },
      emotional: {
        score: Math.round((scoreResult.emotional.total / 35) * 100),
        contribution: scoreResult.emotional.total,
        breakdown: scoreResult.emotional,
      },
      timing: {
        score: Math.round((scoreResult.timing.total / 30) * 100),
        contribution: scoreResult.timing.total,
        breakdown: scoreResult.timing,
      },
      confidenceBand,
      dataSource,
      snapshotId: snapshot?.id ?? null,
      creditScore: {
        score: creditScore,
        confidence: creditResult?.confidence ?? 'low',
        sources: creditResult?.sources?.length ?? 0,
      },
      warnings: scoreResult.warnings,
      refreshedAt: new Date().toISOString(),
      version: '2.0.0', // v2 = Plaid-enhanced scoring
    });
  } catch (error) {
    console.error('[Scoring Refresh] Error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh score' },
      { status: 500 },
    );
  }
}
