import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { ProfileProvider } from '@/providers/ProfileProvider';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * App Layout — Server Component auth guard.
 *
 * Verifies the Supabase session on every navigation into the (app) route
 * group. If the user is not authenticated the middleware should have already
 * redirected, but this provides a second layer of protection for edge cases
 * (e.g. session expiry between middleware and render).
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gracefully handle missing Supabase config (dev mode without .env.local)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <AppShell userName="Dev User" userAvatar={undefined}>
        {children}
      </AppShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Extract display name from user metadata; fall back to email prefix.
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'User';

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <ProfileProvider>
      <AppShell userName={fullName} userAvatar={avatarUrl}>
        {children}
      </AppShell>
    </ProfileProvider>
  );
}
