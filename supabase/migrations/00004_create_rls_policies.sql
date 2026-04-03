-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00004: Row Level Security Policies
-- ============================================================================
-- Comprehensive RLS policies for all 14 tables.
-- Principle: users access only their own data unless explicitly shared.
-- Admin users (role = 'admin') have elevated read access.
-- Partners can read assessments for their linked clients.
-- Depends on: 00002_create_tables.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable RLS on ALL tables
-- ============================================================================
-- RLS must be enabled even on tables with no user-facing policies
-- to prevent accidental exposure via the API.

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples              ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_assessments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners             ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank        ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log      ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Helper function for admin role check
-- ============================================================================
-- Reusable function to check if the current authenticated user is an admin.
-- Avoids repeating the subquery in every admin policy.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
$$;

COMMENT ON FUNCTION is_admin() IS 'Returns true if the authenticated user has the admin role';

-- ============================================================================
-- STEP 3: Policies per table
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

-- Users can read their own profile (for the account/settings page)
CREATE POLICY profiles_select_own ON profiles
    FOR SELECT
    USING (auth.uid() = id);
COMMENT ON POLICY profiles_select_own ON profiles IS
    'Users can read their own profile data';

-- Users can update their own profile (name, avatar, notification prefs)
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
COMMENT ON POLICY profiles_update_own ON profiles IS
    'Users can update their own profile fields';

-- Admins can read all profiles (for the admin user management dashboard)
CREATE POLICY profiles_select_admin ON profiles
    FOR SELECT
    USING (is_admin());
COMMENT ON POLICY profiles_select_admin ON profiles IS
    'Admins can read all user profiles for management purposes';

-- ---------------------------------------------------------------------------
-- assessments
-- ---------------------------------------------------------------------------

-- Users can create their own assessments
CREATE POLICY assessments_insert_own ON assessments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
COMMENT ON POLICY assessments_insert_own ON assessments IS
    'Users can create assessments for themselves';

-- Users can read their own assessments (dashboard, history, review)
CREATE POLICY assessments_select_own ON assessments
    FOR SELECT
    USING (auth.uid() = user_id);
COMMENT ON POLICY assessments_select_own ON assessments IS
    'Users can view their own assessment history and results';

-- Users can update their own assessments (submit responses, complete)
CREATE POLICY assessments_update_own ON assessments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
COMMENT ON POLICY assessments_update_own ON assessments IS
    'Users can update their own in-progress assessments';

-- Users can delete their own assessments (data privacy / cleanup)
CREATE POLICY assessments_delete_own ON assessments
    FOR DELETE
    USING (auth.uid() = user_id);
COMMENT ON POLICY assessments_delete_own ON assessments IS
    'Users can delete their own assessments for data privacy';

-- Partners can read assessments for their linked clients
-- This powers the partner dashboard showing client readiness status.
CREATE POLICY assessments_select_partner ON assessments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM partner_clients pc
            JOIN partners p ON p.id = pc.partner_id
            JOIN profiles pr ON pr.id = auth.uid()
            WHERE pc.user_id = assessments.user_id
            AND pr.partner_id = p.id
            AND p.status = 'active'
        )
    );
COMMENT ON POLICY assessments_select_partner ON assessments IS
    'Active partners can read assessments for their linked clients';

-- Admins can read all assessments (analytics, support, compliance)
CREATE POLICY assessments_select_admin ON assessments
    FOR SELECT
    USING (is_admin());
COMMENT ON POLICY assessments_select_admin ON assessments IS
    'Admins can read all assessments for analytics and support';

-- ---------------------------------------------------------------------------
-- assessment_responses
-- ---------------------------------------------------------------------------

-- Users can insert responses for their own assessments
CREATE POLICY responses_insert_own ON assessment_responses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = assessment_responses.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );
COMMENT ON POLICY responses_insert_own ON assessment_responses IS
    'Users can submit responses for their own assessments';

-- Users can read responses for their own assessments
CREATE POLICY responses_select_own ON assessment_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = assessment_responses.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );
COMMENT ON POLICY responses_select_own ON assessment_responses IS
    'Users can review their own assessment responses';

-- Users can update responses (revise answers during in-progress assessment)
CREATE POLICY responses_update_own ON assessment_responses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments
            WHERE assessments.id = assessment_responses.assessment_id
            AND assessments.user_id = auth.uid()
            AND assessments.status = 'in_progress'
        )
    );
COMMENT ON POLICY responses_update_own ON assessment_responses IS
    'Users can revise responses while assessment is in progress';

-- ---------------------------------------------------------------------------
-- transformation_paths
-- ---------------------------------------------------------------------------

-- Users can CRUD their own transformation paths
CREATE POLICY transformation_select_own ON transformation_paths
    FOR SELECT
    USING (auth.uid() = user_id);
COMMENT ON POLICY transformation_select_own ON transformation_paths IS
    'Users can view their own transformation paths';

CREATE POLICY transformation_insert_own ON transformation_paths
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
COMMENT ON POLICY transformation_insert_own ON transformation_paths IS
    'Users can create transformation paths for themselves';

CREATE POLICY transformation_update_own ON transformation_paths
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
COMMENT ON POLICY transformation_update_own ON transformation_paths IS
    'Users can update progress on their own transformation paths';

CREATE POLICY transformation_delete_own ON transformation_paths
    FOR DELETE
    USING (auth.uid() = user_id);
COMMENT ON POLICY transformation_delete_own ON transformation_paths IS
    'Users can delete their own transformation paths';

-- ---------------------------------------------------------------------------
-- advisor_conversations
-- ---------------------------------------------------------------------------

-- Users can CRUD their own conversations
CREATE POLICY conversations_select_own ON advisor_conversations
    FOR SELECT
    USING (auth.uid() = user_id);
COMMENT ON POLICY conversations_select_own ON advisor_conversations IS
    'Users can view their own advisor conversations';

CREATE POLICY conversations_insert_own ON advisor_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
COMMENT ON POLICY conversations_insert_own ON advisor_conversations IS
    'Users can create new advisor conversations';

CREATE POLICY conversations_update_own ON advisor_conversations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
COMMENT ON POLICY conversations_update_own ON advisor_conversations IS
    'Users can update their own conversation titles';

CREATE POLICY conversations_delete_own ON advisor_conversations
    FOR DELETE
    USING (auth.uid() = user_id);
COMMENT ON POLICY conversations_delete_own ON advisor_conversations IS
    'Users can delete their own conversations';

-- ---------------------------------------------------------------------------
-- advisor_messages
-- ---------------------------------------------------------------------------

-- Users can read messages only from their own conversations.
-- This is the key privacy boundary: no cross-user message access.
CREATE POLICY messages_select_own ON advisor_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM advisor_conversations
            WHERE advisor_conversations.id = advisor_messages.conversation_id
            AND advisor_conversations.user_id = auth.uid()
        )
    );
COMMENT ON POLICY messages_select_own ON advisor_messages IS
    'Users can only read messages from their own conversations';

-- Users can insert messages into their own conversations
CREATE POLICY messages_insert_own ON advisor_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM advisor_conversations
            WHERE advisor_conversations.id = advisor_messages.conversation_id
            AND advisor_conversations.user_id = auth.uid()
        )
    );
COMMENT ON POLICY messages_insert_own ON advisor_messages IS
    'Users can send messages in their own conversations';

-- ---------------------------------------------------------------------------
-- couples
-- ---------------------------------------------------------------------------

-- Users can read couples where they are either partner
CREATE POLICY couples_select_own ON couples
    FOR SELECT
    USING (auth.uid() = partner_a_id OR auth.uid() = partner_b_id);
COMMENT ON POLICY couples_select_own ON couples IS
    'Users can view couple records they are a member of';

-- Users can create a couple (initiating partner becomes partner_a)
CREATE POLICY couples_insert_own ON couples
    FOR INSERT
    WITH CHECK (auth.uid() = partner_a_id);
COMMENT ON POLICY couples_insert_own ON couples IS
    'Users can create a couple invitation as partner_a';

-- Either partner can update the couple (e.g., accept invite, dissolve)
CREATE POLICY couples_update_own ON couples
    FOR UPDATE
    USING (auth.uid() = partner_a_id OR auth.uid() = partner_b_id);
COMMENT ON POLICY couples_update_own ON couples IS
    'Either partner can update couple status (accept, dissolve)';

-- ---------------------------------------------------------------------------
-- couple_assessments
-- ---------------------------------------------------------------------------

-- Users can read couple assessments where they are in the couple
CREATE POLICY couple_assessments_select_own ON couple_assessments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM couples
            WHERE couples.id = couple_assessments.couple_id
            AND (couples.partner_a_id = auth.uid() OR couples.partner_b_id = auth.uid())
        )
    );
COMMENT ON POLICY couple_assessments_select_own ON couple_assessments IS
    'Users can view couple assessments for couples they belong to';

-- Users can create couple assessments for their own couple
CREATE POLICY couple_assessments_insert_own ON couple_assessments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM couples
            WHERE couples.id = couple_assessments.couple_id
            AND (couples.partner_a_id = auth.uid() OR couples.partner_b_id = auth.uid())
        )
    );
COMMENT ON POLICY couple_assessments_insert_own ON couple_assessments IS
    'Users can create couple assessments for their own couple';

-- ---------------------------------------------------------------------------
-- partners (B2B)
-- ---------------------------------------------------------------------------

-- Partners can read their own organization record
CREATE POLICY partners_select_own ON partners
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.partner_id = partners.id
        )
    );
COMMENT ON POLICY partners_select_own ON partners IS
    'Partner users can read their own organization record';

-- Admins can CRUD all partner records
CREATE POLICY partners_select_admin ON partners
    FOR SELECT
    USING (is_admin());
COMMENT ON POLICY partners_select_admin ON partners IS
    'Admins can read all partner organizations';

CREATE POLICY partners_insert_admin ON partners
    FOR INSERT
    WITH CHECK (is_admin());
COMMENT ON POLICY partners_insert_admin ON partners IS
    'Admins can create new partner organizations';

CREATE POLICY partners_update_admin ON partners
    FOR UPDATE
    USING (is_admin());
COMMENT ON POLICY partners_update_admin ON partners IS
    'Admins can update partner organization details and status';

CREATE POLICY partners_delete_admin ON partners
    FOR DELETE
    USING (is_admin());
COMMENT ON POLICY partners_delete_admin ON partners IS
    'Admins can delete partner organizations';

-- ---------------------------------------------------------------------------
-- partner_clients
-- ---------------------------------------------------------------------------

-- Partners can read their own client mappings
CREATE POLICY partner_clients_select_own ON partner_clients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.partner_id = partner_clients.partner_id
        )
    );
COMMENT ON POLICY partner_clients_select_own ON partner_clients IS
    'Partner users can view their own client list';

-- Users can see their own partner_client record (know which partner they belong to)
CREATE POLICY partner_clients_select_user ON partner_clients
    FOR SELECT
    USING (auth.uid() = user_id);
COMMENT ON POLICY partner_clients_select_user ON partner_clients IS
    'Users can see their own partner client mapping';

-- Admins can read all partner-client mappings
CREATE POLICY partner_clients_select_admin ON partner_clients
    FOR SELECT
    USING (is_admin());
COMMENT ON POLICY partner_clients_select_admin ON partner_clients IS
    'Admins can view all partner-client relationships';

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------

-- Users can read their own payment history
CREATE POLICY payments_select_own ON payments
    FOR SELECT
    USING (auth.uid() = user_id);
COMMENT ON POLICY payments_select_own ON payments IS
    'Users can view their own payment and billing history';

-- Admins can read all payments (for financial reporting)
CREATE POLICY payments_select_admin ON payments
    FOR SELECT
    USING (is_admin());
COMMENT ON POLICY payments_select_admin ON payments IS
    'Admins can view all payment records for reporting';

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

-- Users can read their own notifications
CREATE POLICY notifications_select_own ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);
COMMENT ON POLICY notifications_select_own ON notifications IS
    'Users can read their own notification feed';

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
COMMENT ON POLICY notifications_update_own ON notifications IS
    'Users can mark their own notifications as read';

-- ---------------------------------------------------------------------------
-- question_bank
-- ---------------------------------------------------------------------------

-- All authenticated users can read active questions (needed for assessments)
-- Questions are not user-specific data; they are shared reference content.
CREATE POLICY question_bank_select_authenticated ON question_bank
    FOR SELECT
    USING (auth.role() = 'authenticated');
COMMENT ON POLICY question_bank_select_authenticated ON question_bank IS
    'All authenticated users can read the question bank for assessments';

-- Only admins can modify the question bank
CREATE POLICY question_bank_insert_admin ON question_bank
    FOR INSERT
    WITH CHECK (is_admin());
COMMENT ON POLICY question_bank_insert_admin ON question_bank IS
    'Only admins can add new questions to the bank';

CREATE POLICY question_bank_update_admin ON question_bank
    FOR UPDATE
    USING (is_admin());
COMMENT ON POLICY question_bank_update_admin ON question_bank IS
    'Only admins can modify existing questions';

CREATE POLICY question_bank_delete_admin ON question_bank
    FOR DELETE
    USING (is_admin());
COMMENT ON POLICY question_bank_delete_admin ON question_bank IS
    'Only admins can delete questions from the bank';

-- ---------------------------------------------------------------------------
-- admin_audit_log
-- ---------------------------------------------------------------------------

-- Only admins can insert audit log entries
CREATE POLICY audit_log_insert_admin ON admin_audit_log
    FOR INSERT
    WITH CHECK (is_admin());
COMMENT ON POLICY audit_log_insert_admin ON admin_audit_log IS
    'Only admins can create audit log entries';

-- Only admins can read the audit log
CREATE POLICY audit_log_select_admin ON admin_audit_log
    FOR SELECT
    USING (is_admin());
COMMENT ON POLICY audit_log_select_admin ON admin_audit_log IS
    'Only admins can review the audit trail';
