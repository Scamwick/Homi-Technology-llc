'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  Zap,
  Brain,
  Network,
  Target,
  TrendingUp,
  Shield,
} from 'lucide-react'

const panelGroups = [
  { href: '/panels/strategy', label: 'Strategy',  icon: TrendingUp, color: 'text-brand-cyan'    },
  { href: '/panels/mindful',  label: 'Mindful',   icon: Brain,      color: 'text-brand-emerald' },
  { href: '/panels/command',  label: 'Command',   icon: Zap,        color: 'text-brand-yellow'  },
  { href: '/panels/impulse',  label: 'Impulse',   icon: Shield,     color: 'text-brand-amber'   },
  { href: '/panels/network',  label: 'Network',   icon: Network,    color: 'text-brand-cyan'    },
  { href: '/panels/outcomes', label: 'Outcomes',  icon: Target,     color: 'text-brand-emerald' },
]

export default function PanelsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Intelligence Panels</h1>
        <p className="text-text-3 text-sm">Deep analysis tools for every dimension of your decision.</p>
      </div>

      {/* Group nav */}
      <div className="flex flex-wrap gap-2 mb-8">
        {panelGroups.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-brand-sm text-sm font-medium transition-all',
                active
                  ? 'bg-surface-3 text-text-1 border border-surface-4'
                  : 'text-text-3 hover:text-text-2 hover:bg-surface-2 border border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? color : 'text-text-3')} />
              {label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
