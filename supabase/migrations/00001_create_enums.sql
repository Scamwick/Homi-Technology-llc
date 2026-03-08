-- ═══════════════════════════════════════════════════════════
-- HōMI Database Schema — Migration 00001: Create Enums
-- ═══════════════════════════════════════════════════════════

-- Subscription tier enum
CREATE TYPE subscription_tier AS ENUM ('free', 'plus', 'pro', 'family');

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Decision type enum
CREATE TYPE decision_type AS ENUM ('home_buying', 'career_change', 'investment', 'business_launch', 'major_purchase');

-- Assessment status enum
CREATE TYPE assessment_status AS ENUM ('in_progress', 'completed', 'expired');

-- Verdict type enum
CREATE TYPE verdict_type AS ENUM ('ready', 'not_yet');

-- Dimension type enum (the three dimensions of readiness)
CREATE TYPE dimension_type AS ENUM ('financial', 'emotional', 'timing');

-- Message role enum (for AI advisor)
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- Couple status enum
CREATE TYPE couple_status AS ENUM ('pending', 'active', 'dissolved');

-- Partner status enum (B2B partners)
CREATE TYPE partner_status AS ENUM ('pending', 'active', 'suspended');

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
  'assessment_complete', 
  'verdict_ready', 
  'transformation_milestone', 
  'couple_invite', 
  'reassess_reminder', 
  'system'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- Question type enum
CREATE TYPE question_type AS ENUM ('slider', 'single_choice', 'multi_choice', 'text', 'number');

-- Joint verdict type enum (for couples)
CREATE TYPE joint_verdict_type AS ENUM ('both_ready', 'one_not_yet', 'both_not_yet');

-- User role enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'partner');

-- Add comments for documentation
COMMENT ON TYPE subscription_tier IS 'User subscription tiers: free, plus, pro, family';
COMMENT ON TYPE decision_type IS 'Types of decisions HōMI can assess';
COMMENT ON TYPE dimension_type IS 'The three dimensions of readiness: financial, emotional, timing';
COMMENT ON TYPE verdict_type IS 'Assessment verdict: ready or not_yet';
COMMENT ON TYPE couple_status IS 'Status of a couple relationship';
COMMENT ON TYPE partner_status IS 'Status of B2B partner account';
