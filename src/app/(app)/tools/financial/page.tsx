import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Home, CreditCard, BarChart2, Receipt, Users, Layers, RefreshCw, Anchor, Dice5, Waves, Scale, Grid3X3, Landmark, ArrowRight, TrendingDown, GraduationCap } from 'lucide-react'
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
    section: 'mortgage',
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
    section: 'mortgage',
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
    section: 'mortgage',
  },
  {
    href: '/tools/financial/tax',
    icon: Receipt,
    color: 'text-brand-amber',
    bg: 'bg-brand-amber/10',
    border: 'hover:border-brand-amber/50',
    title: 'Tax Bracket Analysis',
    description: '2024 federal + state brackets. Marginal vs effective rate. Roth conversion room calculator.',
    badge: null,
    section: 'retirement',
  },
  {
    href: '/tools/financial/social-security',
    icon: Users,
    color: 'text-brand-emerald',
    bg: 'bg-brand-emerald/10',
    border: 'hover:border-brand-emerald/50',
    title: 'Social Security Strategy',
    description: 'Compare claiming at 62, 64, 67, and 70. Lifetime totals, breakeven analysis, and optimal strategy.',
    badge: null,
    section: 'retirement',
  },
  {
    href: '/tools/financial/withdrawal',
    icon: Layers,
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10',
    border: 'hover:border-brand-cyan/50',
    title: 'Withdrawal Sequencing',
    description: 'Optimal retirement account withdrawal order. RMD projections. Roth conversion opportunities. Tax minimization.',
    badge: 'Advanced',
    section: 'retirement',
  },
  {
    href: '/tools/financial/roth-conversion',
    icon: RefreshCw,
    color: 'text-brand-emerald',
    bg: 'bg-brand-emerald/10',
    border: 'hover:border-brand-emerald/50',
    title: 'Roth Conversion Optimizer',
    description: 'Year-by-year ladder to fill tax brackets before RMDs. Reduces RMD exposure. Effective rate on conversions.',
    badge: null,
    section: 'retirement',
  },
  {
    href: '/tools/financial/coast-fire',
    icon: Anchor,
    color: 'text-brand-yellow',
    bg: 'bg-brand-yellow/10',
    border: 'hover:border-brand-yellow/50',
    title: 'Coast FIRE Calculator',
    description: 'How much do you need now to coast to retirement? FI number, Lean FIRE, Fat FIRE, and return-rate scenarios.',
    badge: null,
    section: 'fire',
  },
  {
    href: '/tools/financial/monte-carlo',
    icon: Dice5,
    color: 'text-brand-crimson',
    bg: 'bg-brand-crimson/10',
    border: 'hover:border-brand-crimson/50',
    title: 'Monte Carlo Simulation',
    description: '500-scenario portfolio survival analysis. Survival rate, risk of ruin, and percentile fan through age 95.',
    badge: 'Advanced',
    section: 'fire',
  },
  {
    href: '/tools/financial/cash-flow',
    icon: Waves,
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10',
    border: 'hover:border-brand-cyan/50',
    title: 'Cash Flow Diagram',
    description: 'Gross income → taxes → expenses → savings breakdown. Savings rate, effective tax rate, unallocated cash.',
    badge: null,
    section: 'fire',
  },
  {
    href: '/tools/financial/net-worth',
    icon: Scale,
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10',
    border: 'hover:border-brand-cyan/50',
    title: 'Net Worth Tracker',
    description: 'Add assets and liabilities. Asset allocation breakdown. Highest-rate debt priority. Debt-free timeline.',
    badge: null,
    section: 'planning',
  },
  {
    href: '/tools/financial/bond-ladder',
    icon: Grid3X3,
    color: 'text-brand-amber',
    bg: 'bg-brand-amber/10',
    border: 'hover:border-brand-amber/50',
    title: 'Bond / CD Ladder',
    description: 'Staggered maturities for predictable income. Edit yields per rung. Blended yield and reinvestment modeling.',
    badge: null,
    section: 'planning',
  },
  {
    href: '/tools/financial/home-equity',
    icon: Home,
    color: 'text-brand-yellow',
    bg: 'bg-brand-yellow/10',
    border: 'hover:border-brand-yellow/50',
    title: 'Home Equity Optimizer',
    description: 'HELOC vs cash-out refi vs leave alone. Interest cost comparison. Recommendation based on rate spread.',
    badge: null,
    section: 'planning',
  },
  {
    href: '/tools/financial/estate-tax',
    icon: Landmark,
    color: 'text-brand-crimson',
    bg: 'bg-brand-crimson/10',
    border: 'hover:border-brand-crimson/50',
    title: 'Estate Tax & Step-Up Basis',
    description: '2024 exemptions ($13.61M/person). Step-up savings on taxable accounts and real estate. Inheritance strategies.',
    badge: 'Advanced',
    section: 'planning',
  },
  {
    href: '/tools/financial/debt-payoff',
    icon: TrendingDown,
    color: 'text-brand-crimson',
    bg: 'bg-brand-crimson/10',
    border: 'hover:border-brand-crimson/50',
    title: 'Debt Avalanche vs Snowball',
    description: 'Side-by-side payoff comparison. Interest saved, months saved, and payoff order. Amortization chart.',
    badge: null,
    section: 'planning',
  },
  {
    href: '/tools/financial/college-529',
    icon: GraduationCap,
    color: 'text-brand-yellow',
    bg: 'bg-brand-yellow/10',
    border: 'hover:border-brand-yellow/50',
    title: '529 College Savings',
    description: '529 balance projection vs projected 4-year cost. Monthly contribution needed. State tax savings estimate.',
    badge: null,
    section: 'planning',
  },
]

const SECTIONS = [
  { key: 'mortgage', label: 'Mortgage & Homeownership' },
  { key: 'retirement', label: 'Retirement & Tax Planning' },
  { key: 'fire', label: 'FIRE & Portfolio Analysis' },
  { key: 'planning', label: 'Wealth Planning & Estate' },
]

export default function FinancialToolsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Financial Tools</h1>
        <p className="text-text-2 text-sm mt-0.5">
          16 institutional-grade calculators across mortgage, retirement, FIRE, and estate planning.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.key} className="space-y-3">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">{section.label}</p>
          {TOOLS.filter((t) => t.section === section.key).map((tool) => {
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
      ))}

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4">
          All calculations use standard formulas, 2024 federal/state tax data, and state-specific property tax rates.
          Results are estimates — consult a licensed professional before making financial decisions.
        </p>
      </Card>
    </div>
  )
}
