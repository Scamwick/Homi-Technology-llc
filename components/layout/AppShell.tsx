'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Logo } from '@/components/brand/Logo';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const authStoreSignOut = useAuthStore((s) => s.signOut);

  async function handleSignOut() {
    try {
      // Clear Zustand auth store
      await authStoreSignOut();
    } catch {
      // If store sign-out fails, still sign out via direct client call
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          userName={userName}
          userAvatar={userAvatar}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Mobile header + content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header
          className="flex h-14 shrink-0 items-center justify-between px-4 md:hidden"
          style={{
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <Logo size="sm" showWordmark />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-slate-dark hover:text-white"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div
            className="border-b px-4 py-3 md:hidden"
            style={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: '#34d399' }}
                  >
                    {userName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-text-primary">
                  {userName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-dark hover:text-homi-crimson"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
