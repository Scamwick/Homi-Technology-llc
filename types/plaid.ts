// =============================================================================
// types/plaid.ts — Plaid Bank Connection Types
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type BankConnectionStatus = 'active' | 'degraded' | 'disconnected' | 'revoked';
export type BankAccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'mortgage' | 'other';

// ---------------------------------------------------------------------------
// Database Row types
// ---------------------------------------------------------------------------

export interface BankConnectionRow {
  id: string;
  user_id: string;
  plaid_item_id: string;
  plaid_access_token: string;
  institution_id: string;
  institution_name: string;
  institution_logo: string | null;
  institution_color: string | null;
  status: BankConnectionStatus;
  error_code: string | null;
  error_message: string | null;
  last_synced_at: string | null;
  cursor: string | null;
  consent_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkedAccountRow {
  id: string;
  connection_id: string;
  user_id: string;
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  account_type: BankAccountType;
  subtype: string | null;
  mask: string | null;
  balance_current: number | null;
  balance_available: number | null;
  balance_limit: number | null;
  currency: string;
  is_visible: boolean;
  nickname: string | null;
  color: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankTransactionRow {
  id: string;
  account_id: string;
  user_id: string;
  calendar_event_id: string | null;
  plaid_transaction_id: string;
  name: string;
  merchant_name: string | null;
  amount: number;
  currency: string;
  is_pending: boolean;
  category_primary: string | null;
  category_detailed: string | null;
  personal_finance_category: string | null;
  transaction_date: string;
  authorized_date: string | null;
  payment_channel: string | null;
  transaction_type: string | null;
  is_recurring: boolean;
  recurring_stream_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Client-side view types
// ---------------------------------------------------------------------------

/** Bank connection with account summary for display. */
export interface BankConnectionView {
  id: string;
  institution_name: string;
  institution_logo: string | null;
  institution_color: string | null;
  status: BankConnectionStatus;
  error_message: string | null;
  accounts: LinkedAccountView[];
  last_synced_at: string | null;
}

/** Linked account with display-ready fields. */
export interface LinkedAccountView {
  id: string;
  name: string;
  official_name: string | null;
  account_type: BankAccountType;
  mask: string | null;
  balance_current: number | null;
  balance_available: number | null;
  balance_limit: number | null;
  currency: string;
  is_visible: boolean;
  nickname: string | null;
  /** Display name: nickname ?? name */
  display_name: string;
}

/** Transaction enriched for calendar display. */
export interface TransactionView {
  id: string;
  name: string;
  merchant_name: string | null;
  amount: number;
  is_income: boolean;
  category: string | null;
  transaction_date: string;
  is_pending: boolean;
  is_recurring: boolean;
  account_name: string;
  account_mask: string | null;
}

// ---------------------------------------------------------------------------
// API request/response types
// ---------------------------------------------------------------------------

export interface LinkTokenResponse {
  link_token: string;
  expiration: string;
}

export interface ExchangeTokenRequest {
  public_token: string;
  institution_id?: string;
  institution_name?: string;
}

export interface ExchangeTokenResponse {
  connection_id: string;
  accounts: LinkedAccountView[];
}

// ---------------------------------------------------------------------------
// Account type display config
// ---------------------------------------------------------------------------

export interface AccountTypeConfig {
  label: string;
  color: string;
  icon: string;
}

export const ACCOUNT_TYPE_CONFIG: Record<BankAccountType, AccountTypeConfig> = {
  checking:   { label: 'Checking',   color: '#34d399', icon: 'Wallet' },
  savings:    { label: 'Savings',    color: '#22d3ee', icon: 'PiggyBank' },
  credit:     { label: 'Credit',     color: '#f87171', icon: 'CreditCard' },
  investment: { label: 'Investment', color: '#60a5fa', icon: 'TrendingUp' },
  loan:       { label: 'Loan',       color: '#fb923c', icon: 'Building2' },
  mortgage:   { label: 'Mortgage',   color: '#a78bfa', icon: 'Home' },
  other:      { label: 'Other',      color: '#94a3b8', icon: 'CircleDot' },
};

// ---------------------------------------------------------------------------
// Connection status display config
// ---------------------------------------------------------------------------

export const CONNECTION_STATUS_CONFIG: Record<BankConnectionStatus, { label: string; color: string }> = {
  active:       { label: 'Connected',    color: '#34d399' },
  degraded:     { label: 'Needs Attention', color: '#facc15' },
  disconnected: { label: 'Disconnected', color: '#f87171' },
  revoked:      { label: 'Removed',      color: '#94a3b8' },
};
