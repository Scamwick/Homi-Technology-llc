import Link from 'next/link'
import { FileText, ClipboardList, TrendingUp } from 'lucide-react'

import { Card } from '@/components/ui/Card'

export default function ReportsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 mt-2">
          Review your readiness history and progress snapshots.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/assessments">
          <Card className="h-full hover:border-brand-cyan/50 transition-colors">
            <div className="p-5">
              <ClipboardList className="w-6 h-6 text-brand-cyan mb-3" />
              <h2 className="text-lg font-semibold text-white mb-2">Assessment History</h2>
              <p className="text-slate-400 text-sm">
                View previous assessments and detailed verdict outcomes.
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/transformation">
          <Card className="h-full hover:border-brand-emerald/50 transition-colors">
            <div className="p-5">
              <TrendingUp className="w-6 h-6 text-brand-emerald mb-3" />
              <h2 className="text-lg font-semibold text-white mb-2">Transformation Progress</h2>
              <p className="text-slate-400 text-sm">
                Track milestones, action completion, and readiness improvement.
              </p>
            </div>
          </Card>
        </Link>
      </div>

      <Card>
        <div className="p-5 flex items-start gap-3">
          <FileText className="w-5 h-5 text-brand-yellow mt-0.5" />
          <p className="text-slate-300 text-sm">
            Exportable reporting is enabled in the next update cycle. Existing data is live and available through
            your assessment and transformation pages now.
          </p>
        </div>
      </Card>
    </div>
  )
}
