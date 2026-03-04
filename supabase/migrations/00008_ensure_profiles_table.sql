-- Ensure profiles table exists and is exposed to PostgREST
CREATE TABLE IF NOT EXISTS public.profiles (
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

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'partners'
  ) THEN
    ALTER TABLE public.profiles
      DROP CONSTRAINT IF EXISTS profiles_partner_id_fkey;
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_partner_id_fkey
      FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can read all profiles" ON public.profiles;
CREATE POLICY "Service role can read all profiles" ON public.profiles
  FOR SELECT TO service_role USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated, service_role;
GRANT SELECT ON public.profiles TO anon;

NOTIFY pgrst, 'reload schema';
