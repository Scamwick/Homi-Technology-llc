import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in browser (Client Components).
 *
 * Returns null when Supabase env vars are not configured (dev mode).
 * Callers must handle the null case gracefully.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createBrowserClient(url, key);
}
