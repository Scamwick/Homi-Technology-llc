/**
 * Financial Context for AI Agents
 * ==================================
 *
 * Provides structured financial context that gets injected into AI
 * agent system prompts. This gives the HōMI agent, advisor, and
 * Trinity Engine real-time awareness of the user's financial situation.
 *
 * The context is formatted as natural language that Claude can reference
 * in conversations.
 */

import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FinancialContext {
  /** Whether the user has connected Plaid. */
  hasPlaidConnection: boolean;
  /** Formatted text block for AI system prompts. */
  contextText: string;
  /** Structured data for tool use. */
  data: {
    accounts: AccountSummary[];
    snapshot: SnapshotSummary | null;
    recentAlerts: AlertSummary[];
    creditScore: number | null;
    lastSyncedAt: string | null;
  };
}

interface AccountSummary {
  name: string;
  type: string;
  balance: number;
  institution: string;
}

interface SnapshotSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  dti: number;
  emergencyMonths: number;
  downPayment: number;
  netWorth: number;
  snapshotAt: string;
}

interface AlertSummary {
  type: string;
  title: string;
  body: string;
  triggeredAt: string;
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Builds a comprehensive financial context for an AI agent.
 * Returns both a formatted text block and structured data.
 */
export async function getFinancialContext(
  userId: string,
): Promise<FinancialContext> {
  const supabase = await createClient();

  // 1. Check for Plaid connections
  const { data: plaidItems } = await supabase
    .from('plaid_items')
    .select('id, institution_name, status, last_synced_at')
    .eq('user_id', userId)
    .eq('status', 'active');

  const hasPlaidConnection = (plaidItems?.length ?? 0) > 0;

  if (!hasPlaidConnection) {
    return {
      hasPlaidConnection: false,
      contextText: '--- Financial Data ---\nNo bank accounts connected. Financial data is self-reported from the assessment questionnaire.',
      data: {
        accounts: [],
        snapshot: null,
        recentAlerts: [],
        creditScore: null,
        lastSyncedAt: null,
      },
    };
  }

  // 2. Get account summaries
  const itemIds = plaidItems!.map((i) => i.id);
  const { data: accounts } = await supabase
    .from('plaid_accounts')
    .select('name, type, subtype, current_balance, plaid_item_id')
    .in('plaid_item_id', itemIds);

  const accountSummaries: AccountSummary[] = (accounts ?? []).map((a) => ({
    name: a.name,
    type: `${a.type}${a.subtype ? ` (${a.subtype})` : ''}`,
    balance: Number(a.current_balance) || 0,
    institution: plaidItems!.find((i) => i.id === a.plaid_item_id)?.institution_name ?? 'Unknown',
  }));

  // 3. Get latest snapshot
  const { data: snapshot } = await supabase
    .from('financial_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .single();

  const snapshotSummary: SnapshotSummary | null = snapshot
    ? {
        monthlyIncome: Number(snapshot.estimated_monthly_income),
        monthlyExpenses: Number(snapshot.estimated_monthly_expenses),
        savingsRate: Number(snapshot.savings_rate),
        dti: Number(snapshot.debt_to_income_ratio),
        emergencyMonths: Number(snapshot.emergency_fund_months),
        downPayment: Number(snapshot.down_payment_available),
        netWorth: Number(snapshot.net_worth),
        snapshotAt: snapshot.snapshot_at,
      }
    : null;

  // 4. Get recent alerts
  const { data: alerts } = await supabase
    .from('financial_alerts')
    .select('type, title, body, triggered_at')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('triggered_at', { ascending: false })
    .limit(5);

  const alertSummaries: AlertSummary[] = (alerts ?? []).map((a) => ({
    type: a.type,
    title: a.title,
    body: a.body,
    triggeredAt: a.triggered_at,
  }));

  // 5. Get credit score
  const { data: creditReport } = await supabase
    .from('credit_reports')
    .select('score')
    .eq('user_id', userId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single();

  const lastSynced = plaidItems!.reduce((latest, item) => {
    if (!item.last_synced_at) return latest;
    return !latest || new Date(item.last_synced_at) > new Date(latest)
      ? item.last_synced_at
      : latest;
  }, null as string | null);

  // 6. Build context text for AI consumption
  const contextText = buildContextText(
    accountSummaries,
    snapshotSummary,
    alertSummaries,
    creditReport?.score ?? null,
    lastSynced,
  );

  return {
    hasPlaidConnection: true,
    contextText,
    data: {
      accounts: accountSummaries,
      snapshot: snapshotSummary,
      recentAlerts: alertSummaries,
      creditScore: creditReport?.score ?? null,
      lastSyncedAt: lastSynced,
    },
  };
}

// ---------------------------------------------------------------------------
// Internal: Build Context Text
// ---------------------------------------------------------------------------

function buildContextText(
  accounts: AccountSummary[],
  snapshot: SnapshotSummary | null,
  alerts: AlertSummary[],
  creditScore: number | null,
  lastSynced: string | null,
): string {
  const lines: string[] = ['--- Live Financial Data (Verified via Plaid) ---'];

  if (lastSynced) {
    lines.push(`Last synced: ${new Date(lastSynced).toLocaleDateString()}`);
  }

  // Account overview
  lines.push('', 'Linked Accounts:');
  for (const account of accounts) {
    const balanceStr = formatCurrency(account.balance);
    lines.push(`  - ${account.name} (${account.type}) at ${account.institution}: ${balanceStr}`);
  }

  // Financial snapshot
  if (snapshot) {
    lines.push('', 'Financial Overview:');
    lines.push(`  Monthly Income: ${formatCurrency(snapshot.monthlyIncome)}`);
    lines.push(`  Monthly Expenses: ${formatCurrency(snapshot.monthlyExpenses)}`);
    lines.push(`  Savings Rate: ${(snapshot.savingsRate * 100).toFixed(1)}%`);
    lines.push(`  Debt-to-Income Ratio: ${(snapshot.dti * 100).toFixed(1)}%`);
    lines.push(`  Emergency Fund: ${snapshot.emergencyMonths.toFixed(1)} months`);
    lines.push(`  Down Payment Saved: ${formatCurrency(snapshot.downPayment)}`);
    lines.push(`  Net Worth: ${formatCurrency(snapshot.netWorth)}`);
  }

  if (creditScore) {
    lines.push(`  Credit Score: ${creditScore} (verified multi-source)`);
  }

  // Pending alerts
  if (alerts.length > 0) {
    lines.push('', 'Recent Alerts (address proactively):');
    for (const alert of alerts) {
      lines.push(`  - [${alert.type}] ${alert.title}: ${alert.body}`);
    }
  }

  return lines.join('\n');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
