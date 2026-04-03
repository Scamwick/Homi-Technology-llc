'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AppShell — Client wrapper that provides the authenticated app chrome:
 * sidebar navigation + content area. Receives user data from the server
 * layout and handles client-side sign-out.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface AppShellProps {
  /** Display name from the user profile / metadata. */
  userName: string;
  /** Avatar URL if available. */
  userAvatar?: string;
  children: React.ReactNode;
}

export function AppShell({ userName, userAvatar, children }: AppShellProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={userName}
        userAvatar={userAvatar}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

export default AppShell;
