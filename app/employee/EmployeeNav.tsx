'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HeadphonesIcon,
  TrendingUp,
  ListTodo,
  CalendarDays,
  MessageSquare,
  Briefcase,
  ChevronLeft,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/employee', label: 'Overview', icon: LayoutDashboard },
  { href: '/employee/support', label: 'Support Queue', icon: HeadphonesIcon },
  { href: '/employee/sales', label: 'Sales Pipeline', icon: TrendingUp },
  { href: '/employee/tasks', label: 'My Tasks', icon: ListTodo },
  { href: '/employee/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/employee/comms', label: 'Communications', icon: MessageSquare },
];

export function EmployeeNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0a1628]">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-[rgba(34,211,238,0.1)] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#34d399] to-[#22d3ee]">
            <Briefcase className="h-5 w-5 text-[#0a1628]" />
          </div>
          <div>
            <span className="text-base font-semibold text-[#e2e8f0]">
              H&#x14D;MI
            </span>
            <span className="ml-2 inline-flex items-center rounded-full bg-[rgba(52,211,153,0.15)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#34d399]">
              Employee
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/employee'
                  ? pathname === '/employee'
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[rgba(52,211,153,0.1)] text-[#34d399]'
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

      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
