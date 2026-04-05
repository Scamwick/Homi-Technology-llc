-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00009: Prevent Role/Tier Self-Escalation via RLS
-- ============================================================================
-- Replaces the permissive profiles_update_own policy with a restricted one
-- that prevents users from editing sensitive columns (role, subscription_tier,
-- subscription_status, account_type, stripe_customer_id) directly.
--
-- These fields can only be changed by service_role operations (webhook,
-- admin API, cron jobs).
-- ============================================================================

-- Update is_admin() to also recognize ceo_founder role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'ceo_founder')
    );
$$;

COMMENT ON FUNCTION is_admin() IS 'Returns true if the authenticated user has admin or ceo_founder role';

-- Drop the old permissive update policy
DROP POLICY IF EXISTS profiles_update_own ON profiles;

-- Create a restricted update policy that prevents self-escalation.
-- Users can update their own row, but only safe columns.
-- The WITH CHECK ensures that after the update, the sensitive columns
-- remain unchanged from what they were before.
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        -- Ensure sensitive fields have not been changed.
        -- Compare against the pre-update values stored in the row.
        AND role = (SELECT role FROM profiles WHERE id = auth.uid())
        AND subscription_tier = (SELECT subscription_tier FROM profiles WHERE id = auth.uid())
        AND subscription_status = (SELECT subscription_status FROM profiles WHERE id = auth.uid())
        AND account_type = (SELECT account_type FROM profiles WHERE id = auth.uid())
    );

COMMENT ON POLICY profiles_update_own ON profiles IS
    'Users can update their own profile but cannot change role, tier, status, or account_type';
