'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Palette,
  Code2,
  CreditCard,
  Building2,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  Icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/partner', Icon: LayoutDashboard },
  { label: 'Clients', href: '/partner/clients', Icon: Users },
  { label: 'Analytics', href: '/partner/analytics', Icon: BarChart3 },
  { label: 'Branding', href: '/partner/branding', Icon: Palette },
  { label: 'API', href: '/partner/api', Icon: Code2 },
  { label: 'Billing', href: '/partner/billing', Icon: CreditCard },
];

interface PartnerNavProps {
  children: React.ReactNode;
  companyName: string;
  partnerRole: string;
}

export function PartnerNav({ children, companyName, partnerRole }: PartnerNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--navy, #0a1628)' }}>
      <aside
        className="fixed left-0 top-0 bottom-0 z-30 flex w-64 flex-col border-r"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(34, 211, 238, 0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
            >
              <Building2 size={20} style={{ color: 'var(--cyan, #22d3ee)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-semibold"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              >
                {companyName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: 'rgba(34, 211, 238, 0.15)',
                    color: 'var(--cyan, #22d3ee)',
                  }}
                >
                  Partner
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  {partnerRole}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/partner'
                ? pathname === '/partner'
                : pathname.startsWith(item.href) && item.href !== '/partner';

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  color: isActive
                    ? 'var(--cyan, #22d3ee)'
                    : 'var(--text-secondary, #94a3b8)',
                  backgroundColor: isActive
                    ? 'rgba(34, 211, 238, 0.08)'
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.05)';
                    e.currentTarget.style.color = 'var(--text-primary, #e2e8f0)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)';
                  }
                }}
              >
                <item.Icon size={18} />
                {item.label}
                {isActive && (
                  <span
                    className="ml-auto size-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--cyan, #22d3ee)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className="p-4 border-t"
          style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              Powered by
            </span>
            <span
              className="text-xs font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #22d3ee, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              H&#x14D;MI
            </span>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        <div className="flex-1 p-8">{children}</div>
        <footer
          className="flex items-center justify-center py-6 border-t"
          style={{ borderColor: 'rgba(34, 211, 238, 0.06)' }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'rgba(148, 163, 184, 0.4)' }}
            >
              Powered by
            </span>
            <span
              className="text-xs font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #22d3ee, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              H&#x14D;MI
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
