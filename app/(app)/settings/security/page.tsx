import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SecurityContent from './SecurityContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Security Settings Page — Server Component
 *
 * Fetches current session metadata from Supabase auth and passes
 * to the client-side SecurityContent component.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function SecurityPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <SecurityContent
        lastSignIn={null}
        email=""
        provider="email"
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Extract session metadata from the auth user
  const lastSignIn = user.last_sign_in_at ?? null;
  const provider = user.app_metadata?.provider ?? 'email';

  return (
    <SecurityContent
      lastSignIn={lastSignIn}
      email={user.email ?? ''}
      provider={provider}
    />
  );
}
