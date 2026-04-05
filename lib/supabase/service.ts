import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client using the service role key.
 *
 * This bypasses RLS and should ONLY be used in server-side contexts
 * like cron jobs, webhooks, and admin operations — never in user-facing
 * request handlers where the user-scoped client should be used instead.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase service role configuration is missing');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
