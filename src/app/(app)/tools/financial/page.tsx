import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Home, CreditCard, BarChart2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const TOOLS = [
  {
    href: '/tools/financial/piti',
    icon: Home,
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10',
    border: 'hover:border-brand-cyan/50',
    title: 'PITI Calculator',
    description: 'Monthly payment breakdown — Principal, Interest, Property Tax, Insurance, HOA, and PMI. Includes DTI analysis.',
    badge: null,
  },
  {
    href: '/tools/financial/loans',
    icon: CreditCard,
    color: 'text-brand-emerald',
    bg: 'bg-brand-emerald/10',
    border: 'hover:border-brand-emerald/50',
    title: 'Loan Comparison',
    description: 'Side-by-side comparison of 30yr fixed, 15yr fixed, 5/1 ARM, FHA, VA, and interest-only loans.',
    badge: null,
  },
  {
    href: '/tools/financial/tco',
    icon: BarChart2,
    color: 'text-brand-yellow',
    bg: 'bg-brand-yellow/10',
    border: 'hover:border-brand-yellow/50',
    title: 'Rent vs. Buy',
    description: '30-year total cost of ownership model. Accounts for appreciation, opportunity cost, maintenance, taxes, and breakeven year.',
    badge: 'Most Insight',
  },
]

export default function FinancialToolsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Tools</h1>
        <p className="text-text-2 text-sm mt-0.5">
          Institutional-grade mortgage and homeownership calculators.
        </p>
      </div>

      <div className="space-y-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card variant="elevated" className={`p-5 transition-colors cursor-pointer ${tool.border} group`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-brand flex items-center justify-center flex-shrink-0 ${tool.bg}`}>
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-text-1">{tool.title}</p>
                      {tool.badge && <Badge variant="cyan" size="sm">{tool.badge}</Badge>}
                    </div>
                    <p className="text-sm text-text-2">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-4 group-hover:text-text-2 transition-colors flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4">
          All calculations use standard amortization formulas and state-specific property tax rates (2024 data).
          Results are estimates — consult a licensed mortgage professional before making financial decisions.
        </p>
      </Card>
    </div>
  )
}
