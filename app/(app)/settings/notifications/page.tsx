import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NotificationsContent from './NotificationsContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Notifications Settings Page — Server Component
 *
 * Fetches user profile preferences from Supabase and passes to the
 * client-side NotificationsContent component.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function NotificationsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <NotificationsContent preferences={null} />;
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
    .select('preferences')
    .eq('id', user.id)
    .single();

  return (
    <NotificationsContent
      preferences={(profile?.preferences as Record<string, unknown>) ?? null}
    />
  );
}
