-- ============================================================================
-- HOMI TECHNOLOGIES LLC - Decision Readiness Intelligence Platform
-- Migration 00002: Create All Tables
-- ============================================================================
-- 14 tables comprising the complete HōMI data model.
-- Depends on: 00001_create_enums.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------
-- Extends Supabase auth.users with application-specific fields.
-- Created automatically via trigger on auth.users INSERT (see 00005).
-- This is the central user identity table for the platform.
CREATE TABLE profiles (
    id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email         text NOT NULL,
    full_name     text,
    avatar_url    text,
    role          user_role NOT NULL DEFAULT 'user',
    subscription_tier   subscription_tier NOT NULL DEFAULT 'free',
    subscription_status subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id  text UNIQUE,
    partner_id          uuid,  -- FK added after partners table is created
    onboarding_completed boolean NOT NULL DEFAULT false,
    notification_preferences jsonb NOT NULL DEFAULT '{
        "email_enabled": true,
        "push_enabled": true,
        "assessment_complete": true,
        "verdict_ready": true,
        "transformation_milestone": true,
        "couple_invite": true,
        "reassess_reminder": true,
        "score_improved": true,
        "system": true
    }'::jsonb,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users with HōMI-specific data';
COMMENT ON COLUMN profiles.partner_id IS 'If this user belongs to a B2B partner organization';
COMMENT ON COLUMN profiles.notification_preferences IS 'Per-category notification opt-in/out settings';

-- ---------------------------------------------------------------------------
-- 2. assessments
-- ---------------------------------------------------------------------------
-- Core assessment records. Each assessment evaluates decision readiness
-- across three dimensions: Financial Reality, Emotional Truth, Perfect Timing.
-- Scores are 0-100. Overall score uses weighted formula:
--   overall = (financial * 0.35) + (emotional * 0.35) + (timing * 0.30)
-- Verdict thresholds: READY >= 80, ALMOST_THERE 65-79, BUILD_FIRST 50-64, NOT_YET < 50
CREATE TABLE assessments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    decision_type   decision_type NOT NULL,
    status          assessment_status NOT NULL DEFAULT 'in_progress',
    -- Dimension scores (0-100 scale, NULL until calculated)
    financial_score numeric(5,2) CHECK (financial_score >= 0 AND financial_score <= 100),
    emotional_score numeric(5,2) CHECK (emotional_score >= 0 AND emotional_score <= 100),
    timing_score    numeric(5,2) CHECK (timing_score >= 0 AND timing_score <= 100),
    overall_score   numeric(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
    verdict         verdict_type,
    -- Detailed sub-dimension breakdowns for granular insights
    financial_sub_scores jsonb,  -- e.g. {"income_ratio": 85, "savings_buffer": 72, "debt_load": 90}
    emotional_sub_scores jsonb,  -- e.g. {"confidence": 80, "stress_level": 65, "support_network": 90}
    timing_sub_scores    jsonb,  -- e.g. {"market_conditions": 75, "life_stage": 88, "urgency": 60}
    -- AI-generated insights and recommendations
    insights        jsonb,       -- e.g. {"strengths": [...], "risks": [...], "next_steps": [...]}
    completed_at    timestamptz,
    expires_at      timestamptz DEFAULT (now() + interval '30 days'),
    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE assessments IS 'Decision readiness assessments with tri-dimensional scoring';
COMMENT ON COLUMN assessments.overall_score IS 'Weighted: financial(35%) + emotional(35%) + timing(30%)';
COMMENT ON COLUMN assessments.expires_at IS 'Assessments expire after 30 days to encourage reassessment';

-- ---------------------------------------------------------------------------
-- 3. assessment_responses
-- ---------------------------------------------------------------------------
-- Individual question responses within an assessment session.
-- Stores both the raw response value and optional metadata (timing, revisions).
CREATE TABLE assessment_responses (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id     uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id       text NOT NULL,  -- References question_bank.id
    dimension         dimension_type NOT NULL,
    response_value    jsonb NOT NULL,  -- Polymorphic: {"value": 75000} or {"value": "option_a"} or {"value": [1,3,5]}
    response_metadata jsonb,           -- Optional: {"time_spent_ms": 4200, "revised": false}
    created_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE assessment_responses IS 'Individual question responses within an assessment';
COMMENT ON COLUMN assessment_responses.response_value IS 'Polymorphic JSON: number, string, or array depending on question_type';

-- ---------------------------------------------------------------------------
-- 4. transformation_paths
-- ---------------------------------------------------------------------------
-- Personalized improvement plans generated after an assessment.
-- Guides users from their current score toward decision readiness.
CREATE TABLE transformation_paths (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id    uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    target_dimension dimension_type NOT NULL,
    -- Structured action items with progress tracking
    action_items     jsonb NOT NULL DEFAULT '[]'::jsonb,
    -- e.g. [{"id": "ai_1", "title": "Build 3-month emergency fund", "completed": false, "due_date": "2025-03-01"}]
    milestones       jsonb NOT NULL DEFAULT '[]'::jsonb,
    -- e.g. [{"id": "ms_1", "title": "Emergency fund at 50%", "target_score": 70, "reached": false}]
    started_at       timestamptz DEFAULT now(),
    completed_at     timestamptz,
    created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE transformation_paths IS 'Personalized improvement plans targeting specific dimensions';
COMMENT ON COLUMN transformation_paths.action_items IS 'Ordered list of actionable steps with completion tracking';

-- ---------------------------------------------------------------------------
-- 5. advisor_conversations
-- ---------------------------------------------------------------------------
-- Thread containers for AI advisor chat sessions.
-- Each conversation can optionally be linked to a specific assessment.
CREATE TABLE advisor_conversations (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
    title         text NOT NULL DEFAULT 'New Conversation',
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE advisor_conversations IS 'AI advisor conversation threads, optionally linked to assessments';

-- ---------------------------------------------------------------------------
-- 6. advisor_messages
-- ---------------------------------------------------------------------------
-- Individual messages within an advisor conversation.
-- Stores the full message history for context continuity.
CREATE TABLE advisor_messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES advisor_conversations(id) ON DELETE CASCADE,
    role            message_role NOT NULL,
    content         text NOT NULL,
    metadata        jsonb,  -- e.g. {"model": "claude-3", "tokens_used": 450, "cited_assessment": "uuid"}
    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE advisor_messages IS 'Chat messages within AI advisor conversations';
COMMENT ON COLUMN advisor_messages.metadata IS 'Model info, token usage, and assessment references';

-- ---------------------------------------------------------------------------
-- 7. couples
-- ---------------------------------------------------------------------------
-- Couples mode allows two partners to compare assessments and receive
-- joint readiness verdicts with alignment analysis.
CREATE TABLE couples (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_a_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    partner_b_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
    invite_email  text NOT NULL,
    invite_token  text NOT NULL UNIQUE,
    status        couple_status NOT NULL DEFAULT 'pending',
    created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE couples IS 'Partner pairings for joint decision readiness assessment';
COMMENT ON COLUMN couples.invite_token IS 'Unique token sent via email for partner_b to accept the invite';

-- ---------------------------------------------------------------------------
-- 8. couple_assessments
-- ---------------------------------------------------------------------------
-- Joint assessment records comparing both partners' individual assessments.
-- Generates alignment scores and discussion prompts for areas of divergence.
CREATE TABLE couple_assessments (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id               uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    partner_a_assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    partner_b_assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
    combined_score          numeric(5,2) CHECK (combined_score >= 0 AND combined_score <= 100),
    alignment_data          jsonb,
    -- e.g. {"financial_alignment": 0.85, "emotional_alignment": 0.62, "timing_alignment": 0.91, "divergence_areas": [...]}
    joint_verdict           verdict_type,
    discussion_prompts      jsonb,
    -- e.g. [{"dimension": "emotional", "prompt": "You scored confidence differently. Discuss what concerns each of you."}]
    created_at              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE couple_assessments IS 'Joint assessments comparing partner readiness with alignment analysis';
COMMENT ON COLUMN couple_assessments.alignment_data IS 'Per-dimension alignment scores and divergence areas';

-- ---------------------------------------------------------------------------
-- 9. partners (B2B API)
-- ---------------------------------------------------------------------------
-- B2B partner organizations that integrate HōMI assessments into their
-- platforms (e.g., mortgage lenders, financial advisors, real estate apps).
CREATE TABLE partners (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name          text NOT NULL,
    contact_email         text NOT NULL,
    api_key               text NOT NULL UNIQUE,
    api_key_hash          text NOT NULL,
    branding              jsonb,
    -- e.g. {"logo_url": "...", "primary_color": "#1a2b3c", "display_name": "Partner Co"}
    pricing_per_assessment numeric(8,2) NOT NULL DEFAULT 0.00,
    status                partner_status NOT NULL DEFAULT 'pending',
    webhook_url           text,
    webhook_events        text[] DEFAULT '{}',
    -- e.g. {"assessment.completed", "verdict.ready"}
    created_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE partners IS 'B2B partner organizations with API access for white-label assessments';
COMMENT ON COLUMN partners.api_key_hash IS 'Bcrypt hash of the API key; raw key shown only at creation';

-- ---------------------------------------------------------------------------
-- 10. partner_clients
-- ---------------------------------------------------------------------------
-- Maps partner organizations to the end-users they've onboarded.
-- Enables partners to track their clients' assessment activity.
CREATE TABLE partner_clients (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id        uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    external_client_id text,  -- Partner's own ID for this client
    notes             text,
    created_at        timestamptz NOT NULL DEFAULT now(),
    UNIQUE (partner_id, user_id)
);

COMMENT ON TABLE partner_clients IS 'Mapping of B2B partner organizations to their end-user clients';

-- ---------------------------------------------------------------------------
-- 11. payments
-- ---------------------------------------------------------------------------
-- Payment transaction records mirroring Stripe events.
-- Used for billing history, subscription management, and revenue tracking.
CREATE TABLE payments (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_payment_intent_id text UNIQUE,
    stripe_subscription_id   text,
    amount                  integer NOT NULL,  -- Amount in cents
    currency                text NOT NULL DEFAULT 'usd',
    status                  payment_status NOT NULL DEFAULT 'pending',
    description             text,
    created_at              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE payments IS 'Stripe payment transaction records for subscriptions and one-time purchases';
COMMENT ON COLUMN payments.amount IS 'Amount in smallest currency unit (cents for USD)';

-- ---------------------------------------------------------------------------
-- 12. notifications
-- ---------------------------------------------------------------------------
-- In-app notification feed for users.
-- Supports filtering by type and read/unread state.
CREATE TABLE notifications (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       text NOT NULL,
    body        text,
    read        boolean NOT NULL DEFAULT false,
    action_url  text,       -- Deep link within the app, e.g. "/assessments/uuid"
    data        jsonb,      -- Arbitrary payload for the notification handler
    created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS 'In-app notification feed with per-type categorization';

-- ---------------------------------------------------------------------------
-- 13. question_bank
-- ---------------------------------------------------------------------------
-- Master repository of assessment questions.
-- Questions are tagged by dimension, decision type, and scoring weight.
-- The scoring_function JSONB defines how raw responses map to 0-100 scores.
CREATE TABLE question_bank (
    id               text PRIMARY KEY,  -- e.g. 'fin_income', 'emo_confidence'
    dimension        dimension_type NOT NULL,
    category         text NOT NULL,     -- Sub-category within dimension, e.g. 'income', 'savings', 'confidence'
    question_text    text NOT NULL,
    question_type    question_type NOT NULL,
    options          jsonb,             -- For choice types: [{"value": "a", "label": "Less than $3,000"}]
    weight           numeric(3,2) NOT NULL DEFAULT 1.00 CHECK (weight > 0 AND weight <= 2.00),
    order_index      integer NOT NULL,
    decision_types   text[] NOT NULL DEFAULT '{}',  -- Which decision types this question applies to
    scoring_function jsonb NOT NULL,
    -- e.g. {"type": "linear_scale", "min": 0, "max": 200000, "optimal_min": 60000}
    -- e.g. {"type": "option_map", "scores": {"a": 20, "b": 50, "c": 80, "d": 100}}
    active           boolean NOT NULL DEFAULT true,
    created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE question_bank IS 'Master question repository with scoring functions per dimension and decision type';
COMMENT ON COLUMN question_bank.id IS 'Human-readable ID: dimension prefix + descriptor (e.g. fin_income)';
COMMENT ON COLUMN question_bank.scoring_function IS 'Defines how raw responses map to 0-100 normalized scores';

-- ---------------------------------------------------------------------------
-- 14. admin_audit_log
-- ---------------------------------------------------------------------------
-- Immutable audit trail for all admin actions.
-- Used for compliance, debugging, and accountability.
CREATE TABLE admin_audit_log (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action        text NOT NULL,       -- e.g. 'user.suspend', 'partner.approve', 'assessment.delete'
    target_type   text NOT NULL,       -- e.g. 'user', 'partner', 'assessment'
    target_id     text NOT NULL,       -- UUID or identifier of the affected resource
    metadata      jsonb,               -- Additional context: {"reason": "...", "previous_state": {...}}
    created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE admin_audit_log IS 'Immutable audit trail for all administrative actions';

-- ---------------------------------------------------------------------------
-- Deferred Foreign Keys
-- ---------------------------------------------------------------------------
-- Add the partner_id FK on profiles now that the partners table exists.
ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_partner
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;
