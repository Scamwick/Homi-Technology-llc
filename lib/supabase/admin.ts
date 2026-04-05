import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase admin client using the service role key.
 * Bypasses RLS — use only for server-side operations like webhooks
 * and background jobs that don't have a user session.
 *
 * Returns null when env vars are missing (dev mode).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
