-- ═══════════════════════════════════════════════════════════
-- HōMI Database Schema — Migration 00003: Create Indexes
-- ═══════════════════════════════════════════════════════════

-- profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_partner_id ON profiles(partner_id);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- assessments indexes
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_user_created ON assessments(user_id, created_at DESC);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_verdict ON assessments(verdict);
CREATE INDEX idx_assessments_decision_type ON assessments(decision_type);
CREATE INDEX idx_assessments_expires ON assessments(expires_at);

-- assessment_responses indexes
CREATE INDEX idx_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX idx_responses_question_id ON assessment_responses(question_id);
CREATE INDEX idx_responses_dimension ON assessment_responses(dimension);

-- transformation_paths indexes
CREATE INDEX idx_transformation_user_id ON transformation_paths(user_id);
CREATE INDEX idx_transformation_assessment_id ON transformation_paths(assessment_id);
CREATE INDEX idx_transformation_status ON transformation_paths(status);

-- advisor_conversations indexes
CREATE INDEX idx_conversations_user_id ON advisor_conversations(user_id);
CREATE INDEX idx_conversations_assessment_id ON advisor_conversations(assessment_id);
CREATE INDEX idx_conversations_updated ON advisor_conversations(updated_at DESC);

-- advisor_messages indexes
CREATE INDEX idx_messages_conversation_id ON advisor_messages(conversation_id);
CREATE INDEX idx_messages_created ON advisor_messages(created_at);

-- couples indexes
CREATE INDEX idx_couples_partner_a ON couples(partner_a_id);
CREATE INDEX idx_couples_partner_b ON couples(partner_b_id);
CREATE INDEX idx_couples_invite_token ON couples(invite_token);
CREATE INDEX idx_couples_status ON couples(status);

-- couple_assessments indexes
CREATE INDEX idx_couple_assessments_couple_id ON couple_assessments(couple_id);
CREATE INDEX idx_couple_assessments_partner_a ON couple_assessments(partner_a_assessment_id);
CREATE INDEX idx_couple_assessments_partner_b ON couple_assessments(partner_b_assessment_id);

-- partners indexes
CREATE INDEX idx_partners_api_key ON partners(api_key);
CREATE INDEX idx_partners_status ON partners(status);

-- partner_clients indexes
CREATE INDEX idx_partner_clients_partner_id ON partner_clients(partner_id);
CREATE INDEX idx_partner_clients_user_id ON partner_clients(user_id);
CREATE INDEX idx_partner_clients_external ON partner_clients(partner_id, external_client_id);

-- payments indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);

-- notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- admin_audit_log indexes
CREATE INDEX idx_audit_admin_user ON admin_audit_log(admin_user_id);
CREATE INDEX idx_audit_created ON admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_target ON admin_audit_log(target_type, target_id);

-- question_bank indexes
CREATE INDEX idx_questions_dimension ON question_bank(dimension);
CREATE INDEX idx_questions_category ON question_bank(category);
CREATE INDEX idx_questions_order ON question_bank(dimension, order_index);
CREATE INDEX idx_questions_active ON question_bank(active);
CREATE INDEX idx_questions_decision_types ON question_bank USING GIN(decision_types);
