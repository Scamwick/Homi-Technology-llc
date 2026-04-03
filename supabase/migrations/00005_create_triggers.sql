-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00005: Create Trigger Functions and Triggers
-- ============================================================================
-- Automated behaviors:
--   1. Auto-create profile when a new user signs up via Supabase Auth
--   2. Auto-update updated_at timestamp on profile changes
--   3. Auto-set completed_at when an assessment status changes to 'completed'
-- Depends on: 00002_create_tables.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Trigger 1: Auto-create profile on auth.users INSERT
-- ---------------------------------------------------------------------------
-- When a new user signs up through Supabase Auth (email, OAuth, magic link),
-- this trigger automatically creates a corresponding profiles row with
-- sensible defaults. The user's display name is extracted from auth metadata
-- if available (e.g., from OAuth providers like Google).

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
        subscription_tier,
        subscription_status,
        onboarding_completed,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        -- Extract full_name from user metadata (set by OAuth providers or signup form)
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
        ),
        -- Extract avatar_url from OAuth provider metadata (Google, GitHub, etc.)
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            NULL
        ),
        'user',
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
    'Creates a profiles row when a new user signs up via Supabase Auth';

-- Attach the trigger to auth.users
-- AFTER INSERT ensures the auth.users row is fully committed before we reference it.
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- Trigger 2: Auto-update updated_at on profiles changes
-- ---------------------------------------------------------------------------
-- Keeps the updated_at timestamp accurate without requiring the client
-- to explicitly set it. This is essential for cache invalidation,
-- sync logic, and audit trails.

CREATE OR REPLACE FUNCTION handle_profile_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_profile_updated() IS
    'Sets updated_at to current timestamp on every profile update';

-- BEFORE UPDATE so we can modify the NEW row before it's written to disk
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_profile_updated();

-- ---------------------------------------------------------------------------
-- Trigger 3: Auto-set completed_at when assessment status -> 'completed'
-- ---------------------------------------------------------------------------
-- When the scoring engine finishes calculating scores and changes the
-- assessment status to 'completed', this trigger automatically sets
-- the completed_at timestamp. This decouples the completion timestamp
-- from the client and ensures consistency.

CREATE OR REPLACE FUNCTION handle_assessment_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only fire when status transitions TO 'completed'
    -- Guard against re-triggering if the row is updated again after completion
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
        NEW.completed_at = now();
    END IF;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_assessment_completed() IS
    'Sets completed_at timestamp when assessment status transitions to completed';

-- BEFORE UPDATE so we can modify the NEW row
CREATE TRIGGER on_assessment_completed
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION handle_assessment_completed();

-- ---------------------------------------------------------------------------
-- Trigger 4: Auto-update updated_at on advisor_conversations changes
-- ---------------------------------------------------------------------------
-- Keeps conversation updated_at accurate for sorting the conversation
-- list by most recently active.

CREATE OR REPLACE FUNCTION handle_conversation_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_conversation_updated() IS
    'Sets updated_at to current timestamp on every conversation update';

CREATE TRIGGER on_conversation_updated
    BEFORE UPDATE ON advisor_conversations
    FOR EACH ROW
    EXECUTE FUNCTION handle_conversation_updated();

-- ---------------------------------------------------------------------------
-- Trigger 5: Auto-update conversation updated_at when a message is added
-- ---------------------------------------------------------------------------
-- When a new message is inserted into a conversation, bump the parent
-- conversation's updated_at so it floats to the top of the sidebar.

CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE advisor_conversations
    SET updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_message() IS
    'Bumps conversation updated_at when a new message is inserted';

CREATE TRIGGER on_message_created
    AFTER INSERT ON advisor_messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_message();
