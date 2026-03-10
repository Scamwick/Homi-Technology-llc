import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DollarSign, ClipboardList, Target, Gift, Wrench, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const TOOLS = [
  {
    href: '/tools/homebuying/closing-costs',
    icon: DollarSign,
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10',
    border: 'hover:border-brand-cyan/50',
    title: 'Closing Cost Estimator',
    description: 'Itemized closing costs by state. Lender fees, title, prepaids, transfer taxes, and total cash needed.',
    badge: null,
  },
  {
    href: '/tools/homebuying/offer-strategy',
    icon: Target,
    color: 'text-brand-emerald',
    bg: 'bg-brand-emerald/10',
    border: 'hover:border-brand-emerald/50',
    title: 'Offer Strategy Simulator',
    description: 'Win probability by offer price. Escalation clause modeling. Offer strength score based on contingencies.',
    badge: 'Most Tactical',
  },
  {
    href: '/tools/homebuying/rate-tracker',
    icon: TrendingDown,
    color: 'text-brand-amber',
    bg: 'bg-brand-amber/10',
    border: 'hover:border-brand-amber/50',
    title: 'Mortgage Rate Tracker',
    description: 'Log and compare lender quotes. Best rate, best APR, lowest fees. Monthly payment difference.',
    badge: null,
  },
  {
    href: '/tools/homebuying/inspection',
    icon: Wrench,
    color: 'text-brand-yellow',
    bg: 'bg-brand-yellow/10',
    border: 'hover:border-brand-yellow/50',
    title: 'Inspection Checklist',
    description: 'Room-by-room walkthrough with severity ratings and cost estimates. Exportable punch list.',
    badge: null,
  },
  {
    href: '/tools/homebuying/programs',
    icon: Gift,
    color: 'text-brand-emerald',
    bg: 'bg-brand-emerald/10',
    border: 'hover:border-brand-emerald/50',
    title: 'First-Time Buyer Programs',
    description: 'State-by-state down payment assistance, grants, and loan programs. Eligibility requirements.',
    badge: 'Free Money',
  },
]

export default function HomebuyingToolsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Homebuying Tools</h1>
        <p className="text-text-2 text-sm mt-0.5">
          Closing costs, offer strategy, inspection checklist, mortgage rate tracker, and buyer programs.
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
                      {tool.badge && <Badge variant="emerald" size="sm">{tool.badge}</Badge>}
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
          All estimates use standard industry benchmarks. Closing costs vary by lender, state, and loan type.
          Consult a licensed real estate professional before making offer or financing decisions.
        </p>
      </Card>
    </div>
  )
}
