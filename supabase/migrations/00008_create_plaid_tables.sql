-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00008: Plaid Bank Connection Tables
-- ============================================================================
-- Adds tables for Plaid-powered bank account linking. Users can connect
-- their financial institutions to auto-populate calendar events with
-- real transactions, balances, and recurring payment detection.
-- Depends on: 00002_create_tables.sql (profiles)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Status of a Plaid bank connection.
CREATE TYPE bank_connection_status AS ENUM (
    'active',       -- Link is healthy, tokens are valid
    'degraded',     -- Some accounts have errors but connection still works
    'disconnected', -- User needs to re-authenticate via Plaid Link update mode
    'revoked'       -- User explicitly disconnected
);

-- Plaid account types.
CREATE TYPE bank_account_type AS ENUM (
    'checking',
    'savings',
    'credit',
    'investment',
    'loan',
    'mortgage',
    'other'
);

-- ---------------------------------------------------------------------------
-- 1. bank_connections
-- ---------------------------------------------------------------------------
-- Represents a single Plaid Item (connection to one financial institution).
-- Each user can have multiple connections to different banks.

CREATE TABLE bank_connections (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Plaid identifiers
    plaid_item_id       text NOT NULL UNIQUE,
    plaid_access_token  text NOT NULL,  -- Encrypted at-rest in production

    -- Institution metadata
    institution_id      text NOT NULL,
    institution_name    text NOT NULL,
    institution_logo    text,           -- Base64 logo from Plaid
    institution_color   text,           -- Primary brand color hex

    -- Connection state
    status              bank_connection_status NOT NULL DEFAULT 'active',
    error_code          text,           -- Plaid error code if degraded/disconnected
    error_message       text,

    -- Sync tracking
    last_synced_at      timestamptz,
    cursor              text,           -- Plaid sync cursor for incremental updates
    consent_expires_at  timestamptz,    -- When Plaid consent expires (if applicable)

    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE bank_connections IS 'Plaid Items: connections to financial institutions via Plaid Link';
COMMENT ON COLUMN bank_connections.plaid_access_token IS 'Plaid access token — must be encrypted at rest in production';
COMMENT ON COLUMN bank_connections.cursor IS 'Plaid transactions sync cursor for incremental fetching';

-- ---------------------------------------------------------------------------
-- 2. linked_accounts
-- ---------------------------------------------------------------------------
-- Individual bank accounts within a Plaid connection (one Item can expose
-- multiple accounts — checking, savings, credit card, etc.).

CREATE TABLE linked_accounts (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id       uuid NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
    user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Plaid identifiers
    plaid_account_id    text NOT NULL UNIQUE,

    -- Account metadata
    name                text NOT NULL,          -- e.g. "Plaid Checking"
    official_name       text,                   -- e.g. "Plaid Gold Standard 0% Interest Checking"
    account_type        bank_account_type NOT NULL DEFAULT 'other',
    subtype             text,                   -- e.g. "checking", "credit card"
    mask                text,                   -- Last 4 digits: "0000"

    -- Balances (updated on each sync)
    balance_current     numeric(14,2),
    balance_available   numeric(14,2),
    balance_limit       numeric(14,2),          -- For credit accounts
    currency            text NOT NULL DEFAULT 'USD',

    -- User preferences
    is_visible          boolean NOT NULL DEFAULT true,  -- User can hide accounts
    nickname            text,                           -- User-defined label override
    color               text,                           -- Custom color hex

    last_synced_at      timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE linked_accounts IS 'Individual bank accounts exposed by a Plaid connection';
COMMENT ON COLUMN linked_accounts.mask IS 'Last 4 digits of the account number';

-- ---------------------------------------------------------------------------
-- 3. bank_transactions
-- ---------------------------------------------------------------------------
-- Transactions pulled from Plaid and mapped to calendar events.
-- Each transaction can optionally be linked to a calendar_event for display.

CREATE TABLE bank_transactions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id          uuid NOT NULL REFERENCES linked_accounts(id) ON DELETE CASCADE,
    user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calendar_event_id   uuid REFERENCES calendar_events(id) ON DELETE SET NULL,

    -- Plaid identifiers
    plaid_transaction_id text NOT NULL UNIQUE,

    -- Transaction details
    name                text NOT NULL,
    merchant_name       text,
    amount              numeric(12,2) NOT NULL,     -- Positive = debit, Negative = credit (Plaid convention)
    currency            text NOT NULL DEFAULT 'USD',
    is_pending          boolean NOT NULL DEFAULT false,

    -- Categorization
    category_primary    text,           -- e.g. "Food and Drink"
    category_detailed   text,           -- e.g. "Restaurants"
    personal_finance_category text,     -- Plaid personal finance category

    -- Date
    transaction_date    date NOT NULL,
    authorized_date     date,

    -- Payment metadata
    payment_channel     text,           -- "online", "in store", "other"
    transaction_type    text,           -- "place", "digital", "special", etc.

    -- Recurrence detection
    is_recurring        boolean NOT NULL DEFAULT false,
    recurring_stream_id text,           -- Links related recurring transactions

    metadata            jsonb DEFAULT '{}'::jsonb,
    created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE bank_transactions IS 'Transactions from Plaid, linked to calendar events for display';
COMMENT ON COLUMN bank_transactions.amount IS 'Plaid convention: positive = money out, negative = money in';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_bank_connections_user ON bank_connections(user_id);
CREATE INDEX idx_bank_connections_item ON bank_connections(plaid_item_id);

CREATE INDEX idx_linked_accounts_connection ON linked_accounts(connection_id);
CREATE INDEX idx_linked_accounts_user ON linked_accounts(user_id);
CREATE INDEX idx_linked_accounts_plaid ON linked_accounts(plaid_account_id);

CREATE INDEX idx_bank_transactions_account ON bank_transactions(account_id);
CREATE INDEX idx_bank_transactions_user ON bank_transactions(user_id);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX idx_bank_transactions_user_date ON bank_transactions(user_id, transaction_date);
CREATE INDEX idx_bank_transactions_plaid ON bank_transactions(plaid_transaction_id);
CREATE INDEX idx_bank_transactions_calendar ON bank_transactions(calendar_event_id) WHERE calendar_event_id IS NOT NULL;
CREATE INDEX idx_bank_transactions_recurring ON bank_transactions(user_id, is_recurring) WHERE is_recurring = true;

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------

ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own bank data
CREATE POLICY bank_connections_own ON bank_connections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY linked_accounts_own ON linked_accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY bank_transactions_own ON bank_transactions
    FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER set_bank_connections_updated_at
    BEFORE UPDATE ON bank_connections
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER set_linked_accounts_updated_at
    BEFORE UPDATE ON linked_accounts
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);
