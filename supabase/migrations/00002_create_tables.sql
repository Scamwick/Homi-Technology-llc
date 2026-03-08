-- ═══════════════════════════════════════════════════════════
-- HōMI Database Schema — Migration 00002: Create Tables
-- ═══════════════════════════════════════════════════════════

-- 1. profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'active',
  stripe_customer_id TEXT UNIQUE,
  partner_id UUID,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"email_verdicts": true, "email_nurture": true, "email_product": true, "in_app": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed onboarding flow';
COMMENT ON COLUMN profiles.notification_preferences IS 'User notification preferences as JSON';

-- 2. assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  decision_type decision_type NOT NULL,
  status assessment_status DEFAULT 'in_progress',
  financial_score INTEGER CHECK (financial_score >= 0 AND financial_score <= 100),
  emotional_score INTEGER CHECK (emotional_score >= 0 AND emotional_score <= 100),
  timing_score INTEGER CHECK (timing_score >= 0 AND timing_score <= 100),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  verdict verdict_type,
  financial_sub_scores JSONB,
  emotional_sub_scores JSONB,
  timing_sub_scores JSONB,
  insights JSONB,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE assessments IS 'Decision readiness assessments';
COMMENT ON COLUMN assessments.expires_at IS 'Assessment expires 30 days after creation';
COMMENT ON COLUMN assessments.insights IS 'AI-generated insights per dimension';

-- 3. assessment_responses
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  dimension dimension_type NOT NULL,
  response_value JSONB NOT NULL,
  response_metadata JSONB DEFAULT '{"time_spent_ms": 0, "changes_made": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

COMMENT ON TABLE assessment_responses IS 'Individual question responses for assessments';
COMMENT ON COLUMN assessment_responses.response_metadata IS 'Time spent and changes made per question';

-- 4. transformation_paths
CREATE TABLE transformation_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  target_dimension dimension_type,
  action_items JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, assessment_id)
);

COMMENT ON TABLE transformation_paths IS 'Guided paths for NOT YET users to become READY';
COMMENT ON COLUMN transformation_paths.action_items IS 'List of action items to complete';
COMMENT ON COLUMN transformation_paths.milestones IS 'Milestones with target scores';

-- 5. advisor_conversations
CREATE TABLE advisor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE advisor_conversations IS 'AI advisor chat conversations';

-- 6. advisor_messages
CREATE TABLE advisor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES advisor_conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE advisor_messages IS 'Individual messages in advisor conversations';
COMMENT ON COLUMN advisor_messages.metadata IS 'Model used, tokens, latency, etc.';

-- 7. couples
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_b_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_email TEXT NOT NULL,
  invite_token TEXT NOT NULL UNIQUE,
  status couple_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE couples IS 'Couple relationships for couples mode';
COMMENT ON COLUMN couples.invite_token IS 'Token for partner invite link';

-- 8. couple_assessments
CREATE TABLE couple_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  partner_a_assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  partner_b_assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  combined_score INTEGER CHECK (combined_score >= 0 AND combined_score <= 100),
  alignment_data JSONB,
  joint_verdict joint_verdict_type,
  discussion_prompts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE couple_assessments IS 'Joint assessments for couples';
COMMENT ON COLUMN couple_assessments.alignment_data IS 'Per-dimension alignment comparison';
COMMENT ON COLUMN couple_assessments.discussion_prompts IS 'AI-generated conversation starters';

-- 9. partners (B2B)
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  api_key TEXT UNIQUE,
  api_key_hash TEXT NOT NULL,
  branding JSONB DEFAULT '{"logo_url": "", "primary_color": "#22d3ee", "company_name": "", "welcome_message": ""}'::jsonb,
  pricing_per_assessment INTEGER DEFAULT 0 CHECK (pricing_per_assessment >= 0),
  status partner_status DEFAULT 'pending',
  webhook_url TEXT,
  webhook_events TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE partners IS 'B2B partner accounts';
COMMENT ON COLUMN partners.api_key_hash IS 'Hashed API key for validation';
COMMENT ON COLUMN partners.branding IS 'White-label branding config';

-- 10. partner_clients
CREATE TABLE partner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  external_client_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, user_id)
);

COMMENT ON TABLE partner_clients IS 'Clients referred by B2B partners';
COMMENT ON COLUMN partner_clients.external_client_id IS 'Partner internal ID for this client';

-- 11. payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'usd',
  status payment_status DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE payments IS 'Payment records from Stripe';
COMMENT ON COLUMN payments.amount IS 'Amount in cents';

-- 12. notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.data IS 'Additional context like assessment_id';

-- 13. admin_audit_log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_audit_log IS 'Audit log for admin actions';
COMMENT ON COLUMN admin_audit_log.action IS 'Action performed, e.g., user.suspended';

-- 14. question_bank
CREATE TABLE question_bank (
  id TEXT PRIMARY KEY,
  dimension dimension_type NOT NULL,
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  order_index INTEGER NOT NULL,
  decision_types decision_type[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  scoring_function JSONB NOT NULL
);

COMMENT ON TABLE question_bank IS 'Question bank for assessments';
COMMENT ON COLUMN question_bank.scoring_function IS 'Type and params for score calculation';

-- Add deferred FK after partners table exists
ALTER TABLE profiles
  ADD CONSTRAINT profiles_partner_id_fkey
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;
