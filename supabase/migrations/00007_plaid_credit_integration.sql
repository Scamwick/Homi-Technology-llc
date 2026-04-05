-- =============================================================================
-- Migration 00007: Plaid Integration, Credit Reports, Financial Snapshots
-- =============================================================================
-- Adds tables for:
--   1. Plaid linked bank items and accounts
--   2. Transaction history (synced via Plaid Transactions API)
--   3. Liabilities (loans, credit cards, mortgages)
--   4. Multi-source credit reports (TransUnion, Experian, Plaid)
--   5. Derived financial snapshots for scoring
--   6. Proactive financial alerts
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE plaid_item_status AS ENUM ('active', 'error', 'expired', 'revoked');
CREATE TYPE credit_source AS ENUM ('transunion', 'experian', 'plaid');
CREATE TYPE credit_score_type AS ENUM ('fico8', 'fico9', 'vantage3', 'vantage4', 'plaid_estimate');
CREATE TYPE alert_type AS ENUM (
  'savings_rate_drop',
  'large_expense',
  'credit_score_change',
  'debt_increase',
  'down_payment_milestone',
  'verdict_change',
  'income_disruption',
  'score_improved'
);
CREATE TYPE alert_status AS ENUM ('pending', 'delivered', 'dismissed', 'actioned');
CREATE TYPE data_source AS ENUM ('plaid', 'self_reported', 'credit_bureau', 'derived');

-- ---------------------------------------------------------------------------
-- 1. Plaid Items (one per institution link)
-- ---------------------------------------------------------------------------

CREATE TABLE plaid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plaid_item_id TEXT NOT NULL UNIQUE,
  plaid_access_token TEXT NOT NULL,
  plaid_cursor TEXT,
  institution_id TEXT,
  institution_name TEXT,
  status plaid_item_status NOT NULL DEFAULT 'active',
  consent_expires_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  products TEXT[] NOT NULL DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plaid_items_user ON plaid_items(user_id);
CREATE INDEX idx_plaid_items_status ON plaid_items(status);

-- ---------------------------------------------------------------------------
-- 2. Plaid Accounts (checking, savings, credit, loan, investment)
-- ---------------------------------------------------------------------------

CREATE TABLE plaid_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_item_id UUID NOT NULL REFERENCES plaid_items(id) ON DELETE CASCADE,
  plaid_account_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  official_name TEXT,
  type TEXT NOT NULL,
  subtype TEXT,
  mask TEXT,
  current_balance DECIMAL,
  available_balance DECIMAL,
  credit_limit DECIMAL,
  iso_currency_code TEXT DEFAULT 'USD',
  is_down_payment_account BOOLEAN NOT NULL DEFAULT false,
  last_balance_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plaid_accounts_item ON plaid_accounts(plaid_item_id);
CREATE INDEX idx_plaid_accounts_type ON plaid_accounts(type);

-- ---------------------------------------------------------------------------
-- 3. Plaid Transactions
-- ---------------------------------------------------------------------------

CREATE TABLE plaid_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_account_id UUID NOT NULL REFERENCES plaid_accounts(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT NOT NULL UNIQUE,
  amount DECIMAL NOT NULL,
  iso_currency_code TEXT DEFAULT 'USD',
  category TEXT[],
  personal_finance_category JSONB,
  merchant_name TEXT,
  name TEXT,
  date DATE NOT NULL,
  authorized_date DATE,
  pending BOOLEAN NOT NULL DEFAULT false,
  payment_channel TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plaid_txn_account ON plaid_transactions(plaid_account_id);
CREATE INDEX idx_plaid_txn_date ON plaid_transactions(date DESC);
CREATE INDEX idx_plaid_txn_category ON plaid_transactions USING GIN(category);

-- ---------------------------------------------------------------------------
-- 4. Plaid Liabilities (credit cards, mortgages, student loans)
-- ---------------------------------------------------------------------------

CREATE TABLE plaid_liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_account_id UUID NOT NULL REFERENCES plaid_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  minimum_payment DECIMAL,
  last_payment_amount DECIMAL,
  last_payment_date DATE,
  next_payment_due_date DATE,
  apr DECIMAL,
  interest_rate_type TEXT,
  balance DECIMAL,
  origination_date DATE,
  origination_principal DECIMAL,
  term TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plaid_liab_account ON plaid_liabilities(plaid_account_id);

-- ---------------------------------------------------------------------------
-- 5. Credit Reports (multi-source)
-- ---------------------------------------------------------------------------

CREATE TABLE credit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source credit_source NOT NULL,
  score INTEGER,
  score_type credit_score_type,
  factors TEXT[],
  report_date DATE,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_credit_reports_user ON credit_reports(user_id);
CREATE INDEX idx_credit_reports_source ON credit_reports(source);
CREATE INDEX idx_credit_reports_fetched ON credit_reports(fetched_at DESC);

-- ---------------------------------------------------------------------------
-- 6. Financial Snapshots (derived from Plaid + credit data)
-- ---------------------------------------------------------------------------

CREATE TABLE financial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Balances
  total_checking DECIMAL NOT NULL DEFAULT 0,
  total_savings DECIMAL NOT NULL DEFAULT 0,
  total_investments DECIMAL NOT NULL DEFAULT 0,
  total_credit_card_debt DECIMAL NOT NULL DEFAULT 0,
  total_loan_debt DECIMAL NOT NULL DEFAULT 0,

  -- Derived metrics
  total_monthly_debt_payments DECIMAL NOT NULL DEFAULT 0,
  estimated_monthly_income DECIMAL NOT NULL DEFAULT 0,
  estimated_monthly_expenses DECIMAL NOT NULL DEFAULT 0,
  debt_to_income_ratio DECIMAL NOT NULL DEFAULT 0,
  savings_rate DECIMAL NOT NULL DEFAULT 0,
  emergency_fund_months DECIMAL NOT NULL DEFAULT 0,
  down_payment_available DECIMAL NOT NULL DEFAULT 0,
  net_worth DECIMAL NOT NULL DEFAULT 0,

  -- Credit (reconciled from multi-source)
  reconciled_credit_score INTEGER,
  credit_sources JSONB,

  -- Metadata
  data_sources data_source[] NOT NULL DEFAULT '{}',
  plaid_items_included UUID[] DEFAULT '{}',
  analysis_window_days INTEGER NOT NULL DEFAULT 90,
  confidence TEXT NOT NULL DEFAULT 'medium',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_snapshots_user ON financial_snapshots(user_id);
CREATE INDEX idx_snapshots_time ON financial_snapshots(snapshot_at DESC);

-- ---------------------------------------------------------------------------
-- 7. Financial Alerts
-- ---------------------------------------------------------------------------

CREATE TABLE financial_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  status alert_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  data JSONB,
  previous_value DECIMAL,
  current_value DECIMAL,
  change_percent DECIMAL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_user ON financial_alerts(user_id);
CREATE INDEX idx_alerts_status ON financial_alerts(status);
CREATE INDEX idx_alerts_type ON financial_alerts(type);
CREATE INDEX idx_alerts_triggered ON financial_alerts(triggered_at DESC);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "plaid_items_own" ON plaid_items
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "plaid_accounts_own" ON plaid_accounts
  FOR ALL USING (
    plaid_item_id IN (SELECT id FROM plaid_items WHERE user_id = auth.uid())
  );

CREATE POLICY "plaid_transactions_own" ON plaid_transactions
  FOR ALL USING (
    plaid_account_id IN (
      SELECT pa.id FROM plaid_accounts pa
      JOIN plaid_items pi ON pa.plaid_item_id = pi.id
      WHERE pi.user_id = auth.uid()
    )
  );

CREATE POLICY "plaid_liabilities_own" ON plaid_liabilities
  FOR ALL USING (
    plaid_account_id IN (
      SELECT pa.id FROM plaid_accounts pa
      JOIN plaid_items pi ON pa.plaid_item_id = pi.id
      WHERE pi.user_id = auth.uid()
    )
  );

CREATE POLICY "credit_reports_own" ON credit_reports
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "financial_snapshots_own" ON financial_snapshots
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "financial_alerts_own" ON financial_alerts
  FOR ALL USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Triggers: auto-update updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_plaid_items_updated
  BEFORE UPDATE ON plaid_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_plaid_accounts_updated
  BEFORE UPDATE ON plaid_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_plaid_liabilities_updated
  BEFORE UPDATE ON plaid_liabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
