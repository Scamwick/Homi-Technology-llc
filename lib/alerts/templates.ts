/**
 * Alert Templates
 * =================
 *
 * Message templates for each alert type. Used by the alerts engine
 * to generate human-readable alert messages.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AlertTemplate {
  severity: 'info' | 'warning' | 'positive' | 'critical';
  title: (params: Record<string, unknown>) => string;
  body: (params: Record<string, unknown>) => string;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const ALERT_TEMPLATES: Record<string, AlertTemplate> = {
  savings_rate_drop: {
    severity: 'warning',
    title: () => 'Savings Rate Declined',
    body: (params) => {
      const prev = ((params.previousValue as number) * 100).toFixed(1);
      const curr = ((params.currentValue as number) * 100).toFixed(1);
      return `Your savings rate dropped from ${prev}% to ${curr}%. This affects your HoMI-Score timing dimension. Let's look at what changed.`;
    },
  },

  large_expense: {
    severity: 'info',
    title: (params) => `Large Transaction: ${formatCurrency(params.currentValue as number)}`,
    body: (params) => {
      const merchant = params.merchant as string;
      return `A ${formatCurrency(params.currentValue as number)} charge at ${merchant} was detected. If this was unexpected, it may impact your emergency fund coverage.`;
    },
  },

  credit_score_change: {
    severity: 'warning',
    title: () => 'Credit Score Decreased',
    body: (params) => {
      const prev = params.previousValue as number;
      const curr = params.currentValue as number;
      const diff = curr - prev;
      return `Your credit score dropped ${Math.abs(diff)} points (${prev} to ${curr}). This directly affects your Financial Reality score. Common causes: new credit inquiry, increased utilization, or late payment.`;
    },
  },

  score_improved: {
    severity: 'positive',
    title: () => 'Credit Score Improved',
    body: (params) => {
      const prev = params.previousValue as number;
      const curr = params.currentValue as number;
      const diff = curr - prev;
      return `Your credit score went up ${diff} points (${prev} to ${curr}). Great progress — this strengthens your Financial Reality dimension.`;
    },
  },

  debt_increase: {
    severity: 'warning',
    title: () => 'Debt Balance Increased',
    body: (params) => {
      const prev = params.previousValue as number;
      const curr = params.currentValue as number;
      const increase = curr - prev;
      return `Your total debt increased by ${formatCurrency(increase)} (now ${formatCurrency(curr)}). This will raise your DTI ratio and may affect your HoMI-Score.`;
    },
  },

  down_payment_milestone: {
    severity: 'positive',
    title: (params) => `Down Payment Milestone: ${params.milestone}%`,
    body: (params) => {
      const milestone = params.milestone as number;
      if (milestone >= 100) {
        return 'You have reached 100% of your down payment goal. Your Perfect Timing dimension just got a major boost.';
      }
      return `You have saved ${milestone}% of your down payment goal. Keep this momentum going — every dollar moves you closer to READY.`;
    },
  },

  verdict_change: {
    severity: 'info',
    title: () => 'Your Verdict Has Changed',
    body: (params) => {
      const prev = params.previousVerdict as string;
      const curr = params.currentVerdict as string;
      return `Based on your latest financial data, your verdict moved from ${prev} to ${curr}. Open your dashboard to see the full breakdown.`;
    },
  },

  income_disruption: {
    severity: 'critical',
    title: () => 'Income Pattern Change Detected',
    body: (params) => {
      const drop = Math.abs(params.changePercent as number).toFixed(0);
      return `Your estimated monthly income dropped ${drop}% from the previous period. If this is temporary, your score will recover. If permanent, let's reassess your timeline together.`;
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
