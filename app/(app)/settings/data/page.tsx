import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DataContent from './DataContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Data & Privacy Settings Page — Server Component
 *
 * Fetches user profile (email, name, privacy preferences) from Supabase
 * and passes to the client-side DataContent component.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function DataPrivacyPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <DataContent email="" name="" preferences={null} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, name, preferences')
    .eq('id', user.id)
    .single();

  return (
    <DataContent
      email={profile?.email ?? user.email ?? ''}
      name={profile?.name ?? ''}
      preferences={(profile?.preferences as Record<string, unknown>) ?? null}
    />
  );
}
