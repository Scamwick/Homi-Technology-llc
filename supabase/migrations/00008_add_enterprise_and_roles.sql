-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00008: Add Enterprise Tiers, CEO/Employee Roles, Account Type
-- ============================================================================
-- Adds:
--   1. Enterprise subscription tiers (enterprise_free, enterprise_paid)
--   2. Extended user roles (ceo_founder, employee)
--   3. Account type enum and column (individual, enterprise)
--   4. Notification type 'info' value
-- Depends on: 00001_create_enums.sql, 00002_create_tables.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extend subscription_tier enum with enterprise tiers
-- ---------------------------------------------------------------------------
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'enterprise_free';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'enterprise_paid';

-- ---------------------------------------------------------------------------
-- 2. Extend user_role enum with ceo_founder and employee
-- ---------------------------------------------------------------------------
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ceo_founder';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employee';

-- ---------------------------------------------------------------------------
-- 3. Extend notification_type enum with 'info'
-- ---------------------------------------------------------------------------
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'info';

-- ---------------------------------------------------------------------------
-- 4. Create account_type enum and add column to profiles
-- ---------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('individual', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS account_type account_type NOT NULL DEFAULT 'individual';

COMMENT ON COLUMN public.profiles.account_type IS
    'Whether this is a personal account or a business/organization account';

-- ---------------------------------------------------------------------------
-- 5. Update the handle_new_user trigger to include account_type
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        role,
        account_type,
        subscription_tier,
        subscription_status,
        onboarding_completed,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            NULL
        ),
        'user',
        'individual',
        'free',
        'active',
        false,
        now(),
        now()
    );
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_user() IS
    'Creates a profiles row when a new user signs up via Supabase Auth (includes account_type)';
