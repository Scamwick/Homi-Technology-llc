-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00007: Financial Calendar & Sharing
-- ============================================================================
-- Adds calendar_events and calendar_shares tables for the Financial Calendar
-- feature. Supports paychecks, bills, investments, and other financial events
-- with family/enterprise sharing capabilities.
-- Depends on: 00002_create_tables.sql (profiles, organizations)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Category of financial calendar event.
CREATE TYPE calendar_event_type AS ENUM (
    'paycheck',
    'bill',
    'investment',
    'transfer',
    'subscription',
    'tax',
    'loan_payment',
    'savings_deposit',
    'other'
);

-- Recurrence pattern for repeating events.
CREATE TYPE recurrence_pattern AS ENUM (
    'none',
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'yearly'
);

-- Access level for calendar sharing.
CREATE TYPE calendar_share_role AS ENUM (
    'viewer',
    'editor',
    'admin'
);

-- Status of a calendar share invitation.
CREATE TYPE calendar_share_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'revoked'
);

-- ---------------------------------------------------------------------------
-- 1. calendar_events
-- ---------------------------------------------------------------------------
-- Core table for financial calendar entries. Each event represents a single
-- or recurring financial occurrence (paycheck, bill, investment, etc.).

CREATE TABLE calendar_events (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,

    -- Event metadata
    title           text NOT NULL,
    description     text,
    event_type      calendar_event_type NOT NULL,
    category        text,  -- User-defined sub-category, e.g. "Utilities", "401k"

    -- Financial details
    amount          numeric(12,2) NOT NULL DEFAULT 0,
    currency        text NOT NULL DEFAULT 'USD',
    is_income       boolean NOT NULL DEFAULT false,  -- true = money in, false = money out

    -- Schedule
    event_date      date NOT NULL,
    event_time      time,
    end_date        date,  -- For date-range events (e.g. tax season)

    -- Recurrence
    recurrence      recurrence_pattern NOT NULL DEFAULT 'none',
    recurrence_end  date,  -- NULL = recurs indefinitely
    recurrence_metadata jsonb,
    -- e.g. {"day_of_month": 15, "weekday": "friday", "occurrences": 24}

    -- Tracking
    is_confirmed    boolean NOT NULL DEFAULT false,  -- Has the transaction actually occurred?
    confirmed_at    timestamptz,
    is_autopay      boolean NOT NULL DEFAULT false,
    merchant        text,  -- e.g. "Electric Company", "Fidelity", "Employer Inc."
    account_label   text,  -- e.g. "Chase Checking", "Vanguard Brokerage"
    notes           text,

    -- Alert / reminder
    reminder_days   integer[] DEFAULT '{}',  -- Days before event to send reminder, e.g. {1, 3, 7}

    -- Metadata
    color           text,  -- Hex color for UI display, e.g. "#22d3ee"
    metadata        jsonb DEFAULT '{}'::jsonb,

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE calendar_events IS 'Financial calendar events: paychecks, bills, investments, and more';
COMMENT ON COLUMN calendar_events.amount IS 'Absolute monetary value; is_income indicates direction';
COMMENT ON COLUMN calendar_events.recurrence_metadata IS 'Additional recurrence details (day of month, weekday, occurrence count)';
COMMENT ON COLUMN calendar_events.organization_id IS 'If set, this event belongs to a shared family/enterprise calendar';

-- ---------------------------------------------------------------------------
-- 2. calendar_shares
-- ---------------------------------------------------------------------------
-- Enables sharing calendars between users. Supports family mode (share with
-- household members) and enterprise mode (share within an organization).

CREATE TABLE calendar_shares (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    shared_with_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,

    -- Access control
    role            calendar_share_role NOT NULL DEFAULT 'viewer',
    status          calendar_share_status NOT NULL DEFAULT 'pending',

    -- Invitation
    invite_email    text,  -- For pending invitations to non-users
    invite_token    text UNIQUE,

    -- Filters: which event types are shared (NULL = all)
    shared_event_types calendar_event_type[],

    -- Permissions
    can_create      boolean NOT NULL DEFAULT false,
    can_edit        boolean NOT NULL DEFAULT false,
    can_delete      boolean NOT NULL DEFAULT false,

    accepted_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    -- Either shared_with_id or organization_id must be set
    CONSTRAINT chk_share_target CHECK (
        shared_with_id IS NOT NULL OR organization_id IS NOT NULL
    )
);

COMMENT ON TABLE calendar_shares IS 'Calendar sharing between users and organizations (family/enterprise)';
COMMENT ON COLUMN calendar_shares.shared_event_types IS 'NULL means all event types are shared';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_org_id ON calendar_events(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, event_date);

CREATE INDEX idx_calendar_shares_owner ON calendar_shares(owner_id);
CREATE INDEX idx_calendar_shares_shared_with ON calendar_shares(shared_with_id) WHERE shared_with_id IS NOT NULL;
CREATE INDEX idx_calendar_shares_org ON calendar_shares(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_calendar_shares_token ON calendar_shares(invite_token) WHERE invite_token IS NOT NULL;

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_shares ENABLE ROW LEVEL SECURITY;

-- Users can see their own events
CREATE POLICY calendar_events_own ON calendar_events
    FOR ALL USING (auth.uid() = user_id);

-- Users can see events shared with them via calendar_shares
CREATE POLICY calendar_events_shared ON calendar_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM calendar_shares cs
            WHERE cs.shared_with_id = auth.uid()
              AND cs.status = 'accepted'
              AND (
                  cs.owner_id = calendar_events.user_id
                  OR cs.organization_id = calendar_events.organization_id
              )
        )
    );

-- Users can see their own shares (as owner)
CREATE POLICY calendar_shares_owner ON calendar_shares
    FOR ALL USING (auth.uid() = owner_id);

-- Users can see shares where they are the recipient
CREATE POLICY calendar_shares_recipient ON calendar_shares
    FOR SELECT USING (auth.uid() = shared_with_id);

-- Recipients can update their own share (accept/decline)
CREATE POLICY calendar_shares_recipient_update ON calendar_shares
    FOR UPDATE USING (auth.uid() = shared_with_id);

-- ---------------------------------------------------------------------------
-- Triggers: auto-update updated_at
-- ---------------------------------------------------------------------------

CREATE TRIGGER set_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER set_calendar_shares_updated_at
    BEFORE UPDATE ON calendar_shares
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);
