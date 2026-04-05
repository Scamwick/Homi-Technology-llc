'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Handshake,
  BarChart3,
  FileText,
  ScrollText,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/assessments', label: 'Assessments', icon: ClipboardCheck },
  { href: '/admin/partners', label: 'Partners', icon: Handshake },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminRole() {
      const supabase = createClient();
      if (!supabase) {
        // Dev mode — Supabase not configured
        setIsAdmin(true);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
    }

    checkAdminRole();
  }, []);

  // Loading state while checking role
  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <p className="text-[#94a3b8]">Checking access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <p className="text-[#94a3b8]">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a1628]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[rgba(34,211,238,0.1)] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#22d3ee] to-[#34d399]">
            <Shield className="h-5 w-5 text-[#0a1628]" />
          </div>
          <div>
            <span className="text-base font-semibold text-[#e2e8f0]">
              H&#x14D;MI
            </span>
            <span className="ml-2 inline-flex items-center rounded-full bg-[rgba(34,211,238,0.15)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#22d3ee]">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[rgba(34,211,238,0.1)] text-[#22d3ee]'
                        : 'text-[#94a3b8] hover:bg-[rgba(30,41,59,0.5)] hover:text-[#e2e8f0]'
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-[rgba(34,211,238,0.1)] px-3 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#94a3b8] transition-colors hover:bg-[rgba(30,41,59,0.5)] hover:text-[#e2e8f0]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
