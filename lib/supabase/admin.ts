import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Create a Supabase client with the service role key.
 * Bypasses RLS — use ONLY in server-side contexts that have no user session:
 *   - Stripe webhooks
 *   - Cron jobs
 *   - User deletion
 *
 * Returns null when env vars are not configured (dev mode).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return null
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
