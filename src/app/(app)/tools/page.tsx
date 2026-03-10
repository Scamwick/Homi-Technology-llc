import { Card } from '@/components/ui/Card'
import { DollarSign, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ToolsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tools</h1>
        <p className="text-text-2 text-sm mt-0.5">Specialized calculators and analysis tools.</p>
      </div>

      <Link href="/tools/financial">
        <Card variant="elevated" className="p-5 hover:border-brand-cyan/50 transition-colors cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-brand bg-brand-cyan/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-brand-cyan" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-1 mb-1">Financial Tools</p>
              <p className="text-sm text-text-2">PITI calculator, loan comparison, and rent vs. buy analysis.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-text-4 group-hover:text-text-2 transition-colors mt-1 flex-shrink-0" />
          </div>
        </Card>
      </Link>

      <Link href="/tools/homebuying">
        <Card variant="elevated" className="p-5 hover:border-brand-emerald/50 transition-colors cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-brand bg-brand-emerald/10 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-brand-emerald" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-1 mb-1">Homebuying Tools</p>
              <p className="text-sm text-text-2">Closing costs, offer strategy, inspection checklist, mortgage rate tracker, and buyer programs.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-text-4 group-hover:text-text-2 transition-colors mt-1 flex-shrink-0" />
          </div>
        </Card>
      </Link>
    </div>
  )
}
