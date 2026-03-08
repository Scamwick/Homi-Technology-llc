-- ═══════════════════════════════════════════════════════════
-- HōMI Database Schema — Migration 00004: RLS Policies
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- PROFILES POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role can read all profiles (for partner access)
CREATE POLICY "Service role can read all profiles" ON profiles
  FOR SELECT TO service_role USING (true);

-- ═══════════════════════════════════════════════════════════
-- ASSESSMENTS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read own assessments
CREATE POLICY "Users can read own assessments" ON assessments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create own assessments
CREATE POLICY "Users can create own assessments" ON assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own in-progress assessments
CREATE POLICY "Users can update own in-progress assessments" ON assessments
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND status = 'in_progress'
  );

-- Partners can read their clients' assessments (read-only)
CREATE POLICY "Partners can read client assessments" ON assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM partner_clients pc
      JOIN partners p ON pc.partner_id = p.id
      WHERE pc.user_id = assessments.user_id
      AND p.contact_email = auth.email()
    )
  );

-- ═══════════════════════════════════════════════════════════
-- ASSESSMENT_RESPONSES POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read responses for own assessments
CREATE POLICY "Users can read own responses" ON assessment_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_responses.assessment_id
      AND a.user_id = auth.uid()
    )
  );

-- Users can insert responses for own assessments
CREATE POLICY "Users can insert own responses" ON assessment_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_responses.assessment_id
      AND a.user_id = auth.uid()
      AND a.status = 'in_progress'
    )
  );

-- ═══════════════════════════════════════════════════════════
-- TRANSFORMATION_PATHS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read own transformation paths
CREATE POLICY "Users can read own paths" ON transformation_paths
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update own active paths
CREATE POLICY "Users can update own paths" ON transformation_paths
  FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- ADVISOR_CONVERSATIONS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read own conversations
CREATE POLICY "Users can read own conversations" ON advisor_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create own conversations
CREATE POLICY "Users can create own conversations" ON advisor_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own conversations (title, etc.)
CREATE POLICY "Users can update own conversations" ON advisor_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- ADVISOR_MESSAGES POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read messages in their conversations
CREATE POLICY "Users can read own messages" ON advisor_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM advisor_conversations c
      WHERE c.id = advisor_messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

-- Users can insert messages to their conversations
CREATE POLICY "Users can insert own messages" ON advisor_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM advisor_conversations c
      WHERE c.id = advisor_messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════
-- COUPLES POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read couples they are part of
CREATE POLICY "Users can read own couples" ON couples
  FOR SELECT USING (
    auth.uid() = partner_a_id 
    OR auth.uid() = partner_b_id
  );

-- Users can create couples (as partner_a)
CREATE POLICY "Users can create couples" ON couples
  FOR INSERT WITH CHECK (auth.uid() = partner_a_id);

-- Users can update couples they are part of
CREATE POLICY "Users can update own couples" ON couples
  FOR UPDATE USING (
    auth.uid() = partner_a_id 
    OR auth.uid() = partner_b_id
  );

-- ═══════════════════════════════════════════════════════════
-- COUPLE_ASSESSMENTS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read couple assessments for their couples
CREATE POLICY "Users can read own couple assessments" ON couple_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples c
      WHERE c.id = couple_assessments.couple_id
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

-- ═══════════════════════════════════════════════════════════
-- PARTNERS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Partners can read own record
CREATE POLICY "Partners can read own record" ON partners
  FOR SELECT USING (contact_email = auth.email());

-- Only service role can insert/update partners
CREATE POLICY "Service role can manage partners" ON partners
  FOR ALL TO service_role USING (true);

-- ═══════════════════════════════════════════════════════════
-- PARTNER_CLIENTS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Partners can read their own clients
CREATE POLICY "Partners can read own clients" ON partner_clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM partners p
      WHERE p.id = partner_clients.partner_id
      AND p.contact_email = auth.email()
    )
  );

-- ═══════════════════════════════════════════════════════════
-- PAYMENTS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read own payments
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert payments (from Stripe webhook)
CREATE POLICY "Service role can insert payments" ON payments
  FOR INSERT TO service_role WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- NOTIFICATIONS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can read own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Only service role can insert notifications
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT TO service_role WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- ADMIN_AUDIT_LOG POLICIES
-- ═══════════════════════════════════════════════════════════

-- Only admins can read audit log
CREATE POLICY "Admins can read audit log" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Only service role can insert audit log
CREATE POLICY "Service role can insert audit log" ON admin_audit_log
  FOR INSERT TO service_role WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- QUESTION_BANK POLICIES
-- ═══════════════════════════════════════════════════════════

-- Everyone can read active questions
CREATE POLICY "Everyone can read active questions" ON question_bank
  FOR SELECT USING (active = true);

-- Only service role can manage questions
CREATE POLICY "Service role can manage questions" ON question_bank
  FOR ALL TO service_role USING (true);
