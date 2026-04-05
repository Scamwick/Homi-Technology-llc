-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00007: Add Extra Columns
-- ============================================================================
-- Adds columns referenced by application code but missing from the original
-- schema: assessment input storage, notification metadata, couples settings.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- assessments: store raw inputs for reassessment pre-fill & audit
-- ---------------------------------------------------------------------------
ALTER TABLE assessments
    ADD COLUMN IF NOT EXISTS financial_inputs jsonb,
    ADD COLUMN IF NOT EXISTS emotional_inputs jsonb,
    ADD COLUMN IF NOT EXISTS timing_inputs   jsonb,
    ADD COLUMN IF NOT EXISTS confidence_band text CHECK (confidence_band IN ('high', 'medium', 'low')),
    ADD COLUMN IF NOT EXISTS crisis_detected boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS version         text;

COMMENT ON COLUMN assessments.financial_inputs IS 'Raw financial dimension inputs stored as JSONB for reassessment pre-fill';
COMMENT ON COLUMN assessments.confidence_band IS 'Confidence in score quality: high, medium, or low';
COMMENT ON COLUMN assessments.crisis_detected IS 'Whether the Safety Canon detected crisis signals during this assessment';
COMMENT ON COLUMN assessments.version IS 'Scoring methodology version (semver) for historical comparisons';

-- ---------------------------------------------------------------------------
-- notifications: delivery tracking & priority
-- ---------------------------------------------------------------------------
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS read_at   timestamptz,
    ADD COLUMN IF NOT EXISTS priority  text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    ADD COLUMN IF NOT EXISTS channels  text[] NOT NULL DEFAULT '{in_app}';

COMMENT ON COLUMN notifications.read_at IS 'Timestamp when the notification was read';
COMMENT ON COLUMN notifications.priority IS 'Urgency level for rendering and delivery';
COMMENT ON COLUMN notifications.channels IS 'Channels this notification was delivered through';

-- ---------------------------------------------------------------------------
-- couples: sharing preferences
-- ---------------------------------------------------------------------------
ALTER TABLE couples
    ADD COLUMN IF NOT EXISTS share_assessments    boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS share_full_breakdown boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN couples.share_assessments IS 'Whether assessments are automatically shared between partners';
COMMENT ON COLUMN couples.share_full_breakdown IS 'Whether full breakdowns are shared (vs. summary only)';
