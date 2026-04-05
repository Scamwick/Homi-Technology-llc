'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardCheck,
  Bot,
  Calculator,
  CalendarDays,
  Users,
  Heart,
  Sparkles,
  Home,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assess', label: 'Assess', icon: ClipboardCheck },
  { href: '/decisions', label: 'Decisions', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/couples', label: 'Couples', icon: Heart },
  { href: '/family', label: 'Family', icon: Home },
  { href: '/advisor', label: 'Advisor', icon: Bot },
  { href: '/tools', label: 'Tools', icon: Calculator },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 64;

interface SidebarProps {
  /** User display name for bottom section */
  userName?: string;
  /** User avatar URL — falls back to initials */
  userAvatar?: string;
  /** Called when sign-out is clicked */
  onSignOut?: () => void;
}

export function Sidebar({ userName = 'User', userAvatar, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      transition={{ duration: 0.3, ease: 'easeInOut' as const }}
      className="relative flex h-screen flex-col overflow-hidden"
      style={{
        backgroundColor: '#0f172a',
        borderRight: '1px solid #1e293b',
      }}
    >
      {/* Top: Logo + collapse toggle */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <Logo size="md" showWordmark={!collapsed} />
        <button
          type="button"
          onClick={toggle}
          className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-slate-dark hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-cyan/10 text-cyan'
                  : 'text-text-secondary hover:bg-slate-dark/50 hover:text-text-primary'
              }`}
            >
              {/* Active indicator: cyan left border */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1 h-[calc(100%-8px)] w-[3px] rounded-r-full"
                  style={{ backgroundColor: '#22d3ee' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <Icon size={20} className="shrink-0" />

              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User section */}
      <div
        className="shrink-0 p-3"
        style={{ borderTop: '1px solid #1e293b' }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: '#34d399' }}
            >
              {initials}
            </div>
          )}

          {!collapsed && (
            <div className="flex min-w-0 flex-1 items-center justify-between">
              <span className="truncate text-sm font-medium text-text-primary">
                {userName}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-slate-dark hover:text-homi-crimson"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
