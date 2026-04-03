-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00003: Create Performance Indexes
-- ============================================================================
-- Indexes optimized for the most common query patterns:
--   - Dashboard: user's assessments sorted by date
--   - Filtering: by verdict, decision type, status
--   - Conversations: messages in chronological order
--   - Notifications: unread notifications feed
--   - Payments: lookup by Stripe IDs
--   - Partners: client lookups
-- Depends on: 00002_create_tables.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- assessments
-- ---------------------------------------------------------------------------

-- Primary dashboard query: "Show me my assessments, newest first"
-- Also used for: assessment count per user, latest assessment lookup
CREATE INDEX idx_assessments_user_created
    ON assessments (user_id, created_at DESC);

-- Filter assessments by verdict for analytics and reporting
-- e.g. "How many users are READY?" or "Show all BUILD_FIRST assessments"
CREATE INDEX idx_assessments_verdict
    ON assessments (verdict)
    WHERE verdict IS NOT NULL;

-- Filter by decision type for category-specific dashboards and analytics
CREATE INDEX idx_assessments_decision_type
    ON assessments (decision_type);

-- Filter by status for cleanup jobs (expire old in_progress assessments)
-- and for in-progress assessment resumption
CREATE INDEX idx_assessments_status
    ON assessments (status);

-- ---------------------------------------------------------------------------
-- assessment_responses
-- ---------------------------------------------------------------------------

-- Load all responses for a given assessment (scoring, review, display)
CREATE INDEX idx_assessment_responses_assessment
    ON assessment_responses (assessment_id);

-- ---------------------------------------------------------------------------
-- advisor_messages
-- ---------------------------------------------------------------------------

-- Chronological message retrieval within a conversation
-- This is the primary query for rendering the chat UI
CREATE INDEX idx_advisor_messages_conversation_created
    ON advisor_messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- advisor_conversations
-- ---------------------------------------------------------------------------

-- List a user's conversations for the sidebar/conversation picker
CREATE INDEX idx_advisor_conversations_user
    ON advisor_conversations (user_id, updated_at DESC);

-- ---------------------------------------------------------------------------
-- partner_clients
-- ---------------------------------------------------------------------------

-- Partner dashboard: list all clients for a partner organization
CREATE INDEX idx_partner_clients_partner
    ON partner_clients (partner_id);

-- Reverse lookup: find which partner(s) a user belongs to
CREATE INDEX idx_partner_clients_user
    ON partner_clients (user_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

-- Notification feed: unread notifications for a user, newest first
-- Partial index on read=false for efficient unread count queries
CREATE INDEX idx_notifications_user_read_created
    ON notifications (user_id, read, created_at DESC);

-- Unread count badge query optimization
CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id)
    WHERE read = false;

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------

-- Payment history for a user's billing page
CREATE INDEX idx_payments_user
    ON payments (user_id, created_at DESC);

-- Stripe webhook handler: look up payment by Stripe payment intent ID
CREATE INDEX idx_payments_stripe_intent
    ON payments (stripe_payment_intent_id)
    WHERE stripe_payment_intent_id IS NOT NULL;

-- Stripe webhook handler: look up payments by subscription ID
CREATE INDEX idx_payments_stripe_subscription
    ON payments (stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- transformation_paths
-- ---------------------------------------------------------------------------

-- User's transformation paths for the progress dashboard
CREATE INDEX idx_transformation_paths_user
    ON transformation_paths (user_id);

-- Link transformation paths back to assessments
CREATE INDEX idx_transformation_paths_assessment
    ON transformation_paths (assessment_id);

-- ---------------------------------------------------------------------------
-- couples
-- ---------------------------------------------------------------------------

-- Look up couples by either partner for the couples dashboard
CREATE INDEX idx_couples_partner_a
    ON couples (partner_a_id);

CREATE INDEX idx_couples_partner_b
    ON couples (partner_b_id)
    WHERE partner_b_id IS NOT NULL;

-- Invite acceptance flow: look up couple by invite token
-- (Already UNIQUE constraint, but explicit for documentation)

-- ---------------------------------------------------------------------------
-- couple_assessments
-- ---------------------------------------------------------------------------

-- Joint assessment history for a couple
CREATE INDEX idx_couple_assessments_couple
    ON couple_assessments (couple_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- admin_audit_log
-- ---------------------------------------------------------------------------

-- Admin activity review: filter by admin user
CREATE INDEX idx_audit_log_admin
    ON admin_audit_log (admin_user_id, created_at DESC);

-- Investigation: find all actions targeting a specific resource
CREATE INDEX idx_audit_log_target
    ON admin_audit_log (target_type, target_id);

-- ---------------------------------------------------------------------------
-- question_bank
-- ---------------------------------------------------------------------------

-- Load questions for a specific dimension (assessment engine)
CREATE INDEX idx_question_bank_dimension
    ON question_bank (dimension, order_index)
    WHERE active = true;
