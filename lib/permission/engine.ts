/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Permission Engine — "Ask Before You Spend"
 *
 * Evaluates a spending request against the user's financial context and
 * returns a behavioral-finance-informed permission result. All logic is
 * deterministic and uses mock heuristics (no real financial analysis).
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserContext {
  emergencyFund: number;
  monthlyIncome: number;
  savingsGoal: number;
}

export interface PermissionResult {
  granted: boolean;
  reasoning: string;
  suggestion: string;
  impactScore: number; // 0–100, higher = more impact on finances
  verdict: 'granted' | 'caution' | 'denied';
}

export interface PermissionEntry {
  id: string;
  amount: number;
  description: string;
  result: PermissionResult;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Default user context (mock)
// ---------------------------------------------------------------------------

export const DEFAULT_USER_CONTEXT: UserContext = {
  emergencyFund: 8500,
  monthlyIncome: 5200,
  savingsGoal: 15000,
};

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export function checkPermission(
  amount: number,
  description: string,
  userContext: UserContext = DEFAULT_USER_CONTEXT,
): PermissionResult {
  const { emergencyFund, monthlyIncome, savingsGoal } = userContext;

  const incomeRatio = amount / monthlyIncome;
  const fundRatio = amount / emergencyFund;
  const savingsImpact = amount / savingsGoal;

  // Calculate months of emergency fund remaining after purchase
  const monthsRemaining = (emergencyFund - amount) / (monthlyIncome * 0.3);

  // Impact score: weighted composite
  const impactScore = Math.min(
    100,
    Math.round(incomeRatio * 40 + fundRatio * 35 + savingsImpact * 25),
  );

  // Deny: amount exceeds emergency fund or > 50% of monthly income
  if (amount > emergencyFund) {
    return {
      granted: false,
      verdict: 'denied',
      impactScore,
      reasoning:
        `This $${amount.toLocaleString()} purchase would exceed your emergency fund ` +
        `of $${emergencyFund.toLocaleString()}. Spending beyond your safety net ` +
        `creates financial vulnerability.`,
      suggestion:
        `Consider saving an additional $${(amount - emergencyFund + 1000).toLocaleString()} ` +
        `before making this purchase. Break it into smaller milestones.`,
    };
  }

  if (incomeRatio > 0.5) {
    return {
      granted: false,
      verdict: 'denied',
      impactScore,
      reasoning:
        `At $${amount.toLocaleString()}, this represents ${Math.round(incomeRatio * 100)}% ` +
        `of your monthly income. Spending more than half your income on a single ` +
        `purchase significantly impacts your financial stability.`,
      suggestion:
        `Wait until you can cover this from savings rather than current income. ` +
        `Consider the 48-hour rule: revisit this decision in two days.`,
    };
  }

  // Caution: amount > 10% of monthly income or reduces emergency fund below 3 months
  if (incomeRatio > 0.1 || monthsRemaining < 3) {
    const cautionReasons: string[] = [];
    const cautionSuggestions: string[] = [];

    if (incomeRatio > 0.1) {
      cautionReasons.push(
        `This $${amount.toLocaleString()} purchase is ${Math.round(incomeRatio * 100)}% ` +
        `of your monthly income`,
      );
    }
    if (monthsRemaining < 3) {
      cautionReasons.push(
        `it would reduce your emergency fund below 3 months of expenses ` +
        `(${monthsRemaining.toFixed(1)} months remaining)`,
      );
      cautionSuggestions.push(
        `Build your emergency fund to cover at least 3 months before this purchase`,
      );
    }

    cautionSuggestions.push(
      `Consider waiting 2 weeks and reassessing how you feel about "${description}"`,
    );

    return {
      granted: true,
      verdict: 'caution',
      impactScore,
      reasoning: cautionReasons.join(', and ') + '.',
      suggestion: cautionSuggestions.join('. ') + '.',
    };
  }

  // Granted: low impact purchase
  return {
    granted: true,
    verdict: 'granted',
    impactScore,
    reasoning:
      `This $${amount.toLocaleString()} purchase represents ${Math.round(incomeRatio * 100)}% ` +
      `of your monthly income and keeps your emergency fund healthy. ` +
      `This aligns with responsible spending.`,
    suggestion:
      `You're in a good position for this purchase. Track it in your budget ` +
      `to maintain awareness of your spending patterns.`,
  };
}
