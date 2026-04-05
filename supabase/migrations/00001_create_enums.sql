-- ============================================================================
-- HOMI TECHNOLOGIES LLC - Decision Readiness Intelligence Platform
-- Migration 00001: Create PostgreSQL Enum Types
-- ============================================================================
-- All custom enum types used across the HōMI database schema.
-- These must be created before any tables that reference them.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Subscription & Billing
-- ---------------------------------------------------------------------------

-- Subscription tier determines feature access and assessment limits.
-- free: 1 assessment/month, basic AI advisor
-- plus: 5 assessments/month, full AI advisor, transformation paths
-- pro:  unlimited assessments, couples mode, priority support
-- family: pro features + up to 4 family members
CREATE TYPE subscription_tier AS ENUM (
    'free',
    'plus',
    'pro',
    'family'
);

-- Tracks the lifecycle state of a user's subscription.
CREATE TYPE subscription_status AS ENUM (
    'active',
    'canceled',
    'past_due',
    'trialing'
);

-- Payment transaction status mirroring Stripe payment intent states.
CREATE TYPE payment_status AS ENUM (
    'pending',
    'succeeded',
    'failed',
    'refunded'
);

-- ---------------------------------------------------------------------------
-- Assessment & Scoring
-- ---------------------------------------------------------------------------

-- The category of life decision being evaluated.
-- Each decision type maps to a specific question set from the question bank.
CREATE TYPE decision_type AS ENUM (
    'home_buying',
    'car_purchase',
    'career_change',
    'business_launch',
    'investment',
    'education',
    'retirement',
    'other'
);

-- Lifecycle status of an assessment session.
-- in_progress: user is actively answering questions
-- completed:   all questions answered, scores calculated
-- expired:     assessment older than 30 days, scores may be stale
CREATE TYPE assessment_status AS ENUM (
    'in_progress',
    'completed',
    'expired'
);

-- The final verdict rendered by the scoring engine.
-- Thresholds: READY >= 80, ALMOST_THERE 65-79, BUILD_FIRST 50-64, NOT_YET < 50
CREATE TYPE verdict_type AS ENUM (
    'ready',
    'almost_there',
    'build_first',
    'not_yet'
);

-- The three dimensions of Decision Readiness Intelligence.
-- Financial Reality: 35% weight - can you afford it?
-- Emotional Truth:   35% weight - are you emotionally prepared?
-- Perfect Timing:    30% weight - is now the right time?
CREATE TYPE dimension_type AS ENUM (
    'financial',
    'emotional',
    'timing'
);

-- ---------------------------------------------------------------------------
-- Question Bank
-- ---------------------------------------------------------------------------

-- Input types supported by the assessment question engine.
-- slider:        continuous scale (e.g., 1-10)
-- single_choice: radio-button style, one answer
-- multi_choice:  checkbox style, multiple answers
-- text:          free-form text input
-- number:        numeric input (e.g., income, savings)
CREATE TYPE question_type AS ENUM (
    'slider',
    'single_choice',
    'multi_choice',
    'text',
    'number'
);

-- ---------------------------------------------------------------------------
-- AI Advisor
-- ---------------------------------------------------------------------------

-- Role markers for the AI advisor conversation history.
-- Follows the standard chat completion message format.
CREATE TYPE message_role AS ENUM (
    'user',
    'assistant',
    'system'
);

-- ---------------------------------------------------------------------------
-- Couples Mode
-- ---------------------------------------------------------------------------

-- Status of a couple pairing invitation and relationship.
-- pending:   invite sent, partner_b has not yet accepted
-- active:    both partners confirmed, joint assessments enabled
-- dissolved: couple has been unpaired
CREATE TYPE couple_status AS ENUM (
    'pending',
    'active',
    'dissolved'
);

-- ---------------------------------------------------------------------------
-- Partner / B2B API
-- ---------------------------------------------------------------------------

-- Lifecycle status of a B2B partner integration.
-- pending:   application submitted, awaiting approval
-- active:    API access enabled, can create assessments
-- suspended: access revoked due to policy violation or non-payment
CREATE TYPE partner_status AS ENUM (
    'pending',
    'active',
    'suspended'
);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

-- Categories of in-app notifications to enable filtering and preferences.
CREATE TYPE notification_type AS ENUM (
    'assessment_complete',
    'verdict_ready',
    'transformation_milestone',
    'couple_invite',
    'reassess_reminder',
    'score_improved',
    'system'
);

-- ---------------------------------------------------------------------------
-- User Roles
-- ---------------------------------------------------------------------------

-- Application-level role for RBAC.
-- user:  standard platform user
-- admin: internal staff with elevated permissions
CREATE TYPE user_role AS ENUM (
    'user',
    'admin'
);
