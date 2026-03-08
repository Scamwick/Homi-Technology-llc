'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  X,
  Plus,
} from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
  user: { id: string; email: string }
  profile: { role: string; subscription_tier: string } | null
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assessments', href: '/assessments', icon: ClipboardList },
  { name: 'AI Companion', href: '/companion', icon: MessageSquare },
  { name: 'Temporal Twin', href: '/temporal-twin', icon: TrendingUp },
  { name: 'Couples Mode', href: '/couples', icon: Users, proOnly: true },
  { name: 'Reports', href: '/reports', icon: FileText },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export function AppLayout({ children, user, profile }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'family'

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-surface-1 border-r border-surface-3 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-surface-3">
            <Logo size="md" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-text-3 hover:text-text-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const isLocked = item.proOnly && !isPro

              return (
                <Link
                  key={item.name}
                  href={isLocked ? '/settings/billing' : item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-brand-sm text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-cyan/10 text-brand-cyan'
                      : 'text-text-2 hover:bg-surface-2 hover:text-text-1',
                    isLocked && 'opacity-50'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.name}</span>
                  {isLocked && (
                    <Badge variant="cyan" size="sm">PRO</Badge>
                  )}
                </Link>
              )
            })}

            <div className="pt-4 mt-4 border-t border-surface-3">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-brand-sm text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-cyan/10 text-brand-cyan'
                        : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User card */}
          <div className="p-4 border-t border-surface-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <Badge variant="cyan" size="sm">
                  {profile?.subscription_tier || 'free'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-lg border-b border-surface-3">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-text-3 hover:text-text-1"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Breadcrumbs could go here */}
            </div>

            <div className="flex items-center gap-4">
              <Link href="/assessments/new">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </Link>

              <NotificationDropdown />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
