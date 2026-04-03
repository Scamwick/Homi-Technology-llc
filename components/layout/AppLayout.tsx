'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  LayoutDashboard,
  ClipboardCheck,
  Bot,
  Calculator,
  Users,
} from 'lucide-react';
import { Sidebar } from './Sidebar';

import type { LucideIcon } from 'lucide-react';

/* ─── Mobile bottom tab items (5 main items) ─── */
interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MOBILE_TABS: TabItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assess', label: 'Assess', icon: ClipboardCheck },
  { href: '/agent', label: 'Agent', icon: Bot },
  { href: '/tools', label: 'Tools', icon: Calculator },
  { href: '/marketplace', label: 'Market', icon: Users },
];

/* ─── Top bar inside main content area ─── */
interface TopBarProps {
  title: string;
  userName?: string;
  userAvatar?: string;
}

function TopBar({ title, userName = 'User', userAvatar }: TopBarProps) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-8"
      style={{ borderBottom: '1px solid #1e293b' }}
    >
      <h1 className="text-lg font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-slate-dark hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {/* Unread count badge */}
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-[#0a1628]"
            style={{ backgroundColor: '#facc15' }}
          >
            4
          </span>
        </Link>

        {/* User avatar */}
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-[#0a1628]"
            style={{ backgroundColor: '#34d399' }}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}

/* ─── Mobile bottom tab bar ─── */
function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
      }}
    >
      {MOBILE_TABS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-cyan' : 'text-text-secondary'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── AppLayout: main authenticated page wrapper ─── */
export interface AppLayoutProps {
  children: ReactNode;
  /** Page title shown in the top bar */
  pageTitle?: string;
  /** User display name */
  userName?: string;
  /** User avatar URL */
  userAvatar?: string;
  /** Sign-out handler */
  onSignOut?: () => void;
}

export function AppLayout({
  children,
  pageTitle = 'Dashboard',
  userName = 'User',
  userAvatar,
  onSignOut,
}: AppLayoutProps) {
  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#0a1628' }}
    >
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          userName={userName}
          userAvatar={userAvatar}
          onSignOut={onSignOut}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title={pageTitle}
          userName={userName}
          userAvatar={userAvatar}
        />

        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  );
}

export default AppLayout;
