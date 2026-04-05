'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Bell,
  Shield,
  Database,
  ChevronRight,
} from 'lucide-react';
import BillingContent from './billing/BillingContent';
import NotificationsContent from './notifications/NotificationsContent';
import SecurityContent from './security/SecurityContent';
import DataContent from './data/DataContent';
import type { SubscriptionRow } from '@/types/database';
import type { SubscriptionTier } from '@/types/user';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Settings Hub — Sidebar navigation + content area.
 *
 * Desktop: left sidebar with navigation links, right content area.
 * Mobile: horizontal scrolling tabs at top, content below.
 *
 * Fetches user settings data client-side on mount so all tabs
 * render with real data from Supabase.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface SettingsState {
  subscription: SubscriptionRow | null;
  profileTier: SubscriptionTier;
  preferences: Record<string, unknown> | null;
  lastSignIn: string | null;
  email: string;
  name: string;
  provider: string;
}

type SettingsSection = 'billing' | 'notifications' | 'security' | 'data';

interface NavItem {
  key: SettingsSection;
  label: string;
  description: string;
  Icon: typeof CreditCard;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'billing',
    label: 'Billing',
    description: 'Plan, usage & invoices',
    Icon: CreditCard,
  },
  {
    key: 'notifications',
    label: 'Notifications',
    description: 'Email & in-app alerts',
    Icon: Bell,
  },
  {
    key: 'security',
    label: 'Security',
    description: 'Password & sessions',
    Icon: Shield,
  },
  {
    key: 'data',
    label: 'Data & Privacy',
    description: 'Export, deletion & tracking',
    Icon: Database,
  },
];

function renderSection(section: SettingsSection, data: SettingsState) {
  switch (section) {
    case 'billing':
      return <BillingContent subscription={data.subscription} profileTier={data.profileTier} />;
    case 'notifications':
      return <NotificationsContent preferences={data.preferences} />;
    case 'security':
      return <SecurityContent lastSignIn={data.lastSignIn} email={data.email} provider={data.provider} />;
    case 'data':
      return <DataContent email={data.email} name={data.name} preferences={data.preferences} />;
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
};

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSection = (searchParams.get('tab') as SettingsSection) || 'billing';
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [settingsData, setSettingsData] = useState<SettingsState>({
    subscription: null,
    profileTier: 'free',
    preferences: null,
    lastSignIn: null,
    email: '',
    name: '',
    provider: 'email',
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const result = await profileRes.json();
          const profile = result.data?.profile;
          if (profile) {
            setSettingsData(prev => ({
              ...prev,
              email: profile.email ?? '',
              name: profile.display_name ?? '',
              profileTier: (profile.subscription_tier as SubscriptionTier) ?? 'free',
              preferences: profile.preferences ?? null,
              lastSignIn: profile.last_sign_in_at ?? null,
              provider: profile.auth_provider ?? 'email',
            }));
          }
        }
      } catch {
        // Settings page gracefully handles null data
      }
    }
    fetchSettings();
  }, []);

  function navigateTo(section: SettingsSection) {
    setActiveSection(section);
    router.replace(`/settings?tab=${section}`, { scroll: false });
  }

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* ── Page header ── */}
      <motion.div variants={fadeUp} className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage your account, billing, and preferences
        </p>
      </motion.div>

      {/* ── Mobile: Horizontal scrolling tabs ── */}
      <motion.div variants={fadeUp} className="lg:hidden mb-6">
        <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateTo(item.key)}
                className={[
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium',
                  'whitespace-nowrap shrink-0 cursor-pointer',
                  'transition-all duration-[var(--duration-fast)]',
                ].join(' ')}
                style={{
                  backgroundColor: isActive
                    ? 'rgba(34, 211, 238, 0.1)'
                    : 'transparent',
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  border: isActive
                    ? '1px solid rgba(34, 211, 238, 0.3)'
                    : '1px solid transparent',
                }}
              >
                <item.Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Desktop: Sidebar + Content layout ── */}
      <motion.div variants={fadeUp} className="flex gap-6">
        {/* Sidebar — hidden on mobile */}
        <nav className="hidden lg:flex flex-col gap-1 w-64 shrink-0">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateTo(item.key)}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full',
                  'transition-all duration-[var(--duration-fast)] cursor-pointer',
                  'group',
                ].join(' ')}
                style={{
                  backgroundColor: isActive
                    ? 'rgba(30, 41, 59, 0.8)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(34, 211, 238, 0.2)'
                    : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  className="flex size-9 items-center justify-center rounded-lg shrink-0"
                  style={{
                    backgroundColor: isActive
                      ? 'rgba(34, 211, 238, 0.1)'
                      : 'rgba(51, 65, 85, 0.3)',
                  }}
                >
                  <item.Icon
                    size={18}
                    style={{
                      color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: 'rgba(148, 163, 184, 0.6)' }}
                  >
                    {item.description}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{
                    color: isActive ? 'var(--cyan)' : 'rgba(148, 163, 184, 0.3)',
                  }}
                />
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderSection(activeSection, settingsData)}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#0a1628' }} />}>
      <SettingsContent />
    </Suspense>
  );
}
