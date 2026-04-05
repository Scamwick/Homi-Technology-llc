/**
 * Proactive Financial Alerts Engine
 * ====================================
 *
 * Monitors financial snapshots and triggers alerts when significant
 * changes are detected. The HōMI agent references these alerts
 * proactively in conversations.
 *
 * Alert triggers:
 *   - Savings rate dropped >10% month-over-month
 *   - Large unexpected expense (>$500 outside normal patterns)
 *   - Credit score change (up or down >15 points)
 *   - Debt balance increase (new debt or missed payment)
 *   - Down payment milestone reached (25%, 50%, 75%, 100%)
 *   - Score verdict would change based on new data
 *   - Monthly income pattern disruption
 */

import { createClient } from '@/lib/supabase/server';
import { ALERT_TEMPLATES, type AlertTemplate } from './templates';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Alert {
  type: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'positive' | 'critical';
  data: Record<string, unknown>;
  previousValue: number | null;
  currentValue: number | null;
  changePercent: number | null;
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Evaluates all alert rules for a user based on their latest
 * financial snapshot vs. their previous snapshot.
 *
 * Creates alert records in the database for any triggered rules.
 */
export async function evaluateAlerts(userId: string): Promise<Alert[]> {
  const supabase = await createClient();

  // Get the two most recent snapshots for comparison
  const { data: snapshots } = await supabase
    .from('financial_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_at', { ascending: false })
    .limit(2);

  if (!snapshots || snapshots.length === 0) return [];

  const current = snapshots[0];
  const previous = snapshots.length > 1 ? snapshots[1] : null;

  const alerts: Alert[] = [];

  // 1. Savings rate drop
  if (previous) {
    const currentRate = Number(current.savings_rate);
    const previousRate = Number(previous.savings_rate);
    const dropPercent = previousRate > 0
      ? ((previousRate - currentRate) / previousRate) * 100
      : 0;

    if (dropPercent > 10) {
      alerts.push(
        buildAlert('savings_rate_drop', {
          previousValue: previousRate,
          currentValue: currentRate,
          changePercent: -dropPercent,
        }),
      );
    }
  }

  // 2. Credit score change
  if (previous && current.reconciled_credit_score && previous.reconciled_credit_score) {
    const diff = current.reconciled_credit_score - previous.reconciled_credit_score;
    if (Math.abs(diff) > 15) {
      alerts.push(
        buildAlert(
          diff > 0 ? 'score_improved' : 'credit_score_change',
          {
            previousValue: previous.reconciled_credit_score,
            currentValue: current.reconciled_credit_score,
            changePercent: null,
          },
        ),
      );
    }
  }

  // 3. Debt increase
  if (previous) {
    const currentDebt = Number(current.total_credit_card_debt) + Number(current.total_loan_debt);
    const previousDebt = Number(previous.total_credit_card_debt) + Number(previous.total_loan_debt);
    const increase = currentDebt - previousDebt;

    if (increase > 500) {
      alerts.push(
        buildAlert('debt_increase', {
          previousValue: previousDebt,
          currentValue: currentDebt,
          changePercent: previousDebt > 0 ? (increase / previousDebt) * 100 : null,
        }),
      );
    }
  }

  // 4. Down payment milestones
  const { data: assessment } = await supabase
    .from('assessments')
    .select('financial_sub_scores')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (assessment) {
    const targetPrice = assessment.financial_sub_scores?.targetHomePrice ?? 400000;
    const targetDown = targetPrice * 0.20;
    const downPayment = Number(current.down_payment_available);
    const progress = targetDown > 0 ? (downPayment / targetDown) * 100 : 0;

    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (previous) {
        const prevProgress = targetDown > 0
          ? (Number(previous.down_payment_available) / targetDown) * 100
          : 0;

        if (prevProgress < milestone && progress >= milestone) {
          alerts.push(
            buildAlert('down_payment_milestone', {
              previousValue: prevProgress,
              currentValue: progress,
              changePercent: null,
              milestone,
            }),
          );
        }
      }
    }
  }

  // 5. Income disruption
  if (previous) {
    const currentIncome = Number(current.estimated_monthly_income);
    const previousIncome = Number(previous.estimated_monthly_income);
    const drop = previousIncome > 0
      ? ((previousIncome - currentIncome) / previousIncome) * 100
      : 0;

    if (drop > 20) {
      alerts.push(
        buildAlert('income_disruption', {
          previousValue: previousIncome,
          currentValue: currentIncome,
          changePercent: -drop,
        }),
      );
    }
  }

  // 6. Large unexpected expense
  const { data: recentTxns } = await supabase
    .from('plaid_transactions')
    .select('amount, merchant_name, name, date')
    .in(
      'plaid_account_id',
      (await supabase
        .from('plaid_accounts')
        .select('id')
        .in(
          'plaid_item_id',
          (await supabase
            .from('plaid_items')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
          ).data?.map((i) => i.id) ?? [],
        )
      ).data?.map((a) => a.id) ?? [],
    )
    .gt('amount', 500)
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('amount', { ascending: false })
    .limit(3);

  if (recentTxns && recentTxns.length > 0) {
    for (const txn of recentTxns) {
      alerts.push(
        buildAlert('large_expense', {
          previousValue: null,
          currentValue: Number(txn.amount),
          changePercent: null,
          merchant: txn.merchant_name ?? txn.name ?? 'Unknown',
          date: txn.date,
        }),
      );
    }
  }

  // Store alerts in database
  if (alerts.length > 0) {
    await supabase.from('financial_alerts').insert(
      alerts.map((alert) => ({
        user_id: userId,
        type: alert.type,
        title: alert.title,
        body: alert.body,
        severity: alert.severity,
        data: alert.data,
        previous_value: alert.previousValue,
        current_value: alert.currentValue,
        change_percent: alert.changePercent,
      })),
    );
  }

  return alerts;
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function buildAlert(
  type: string,
  params: {
    previousValue: number | null;
    currentValue: number | null;
    changePercent: number | null;
    [key: string]: unknown;
  },
): Alert {
  const template = ALERT_TEMPLATES[type];

  if (!template) {
    return {
      type,
      title: 'Financial Update',
      body: 'A change was detected in your financial data.',
      severity: 'info',
      data: params,
      previousValue: params.previousValue,
      currentValue: params.currentValue,
      changePercent: params.changePercent,
    };
  }

  return {
    type,
    title: template.title(params),
    body: template.body(params),
    severity: template.severity,
    data: params,
    previousValue: params.previousValue,
    currentValue: params.currentValue,
    changePercent: params.changePercent,
  };
}
