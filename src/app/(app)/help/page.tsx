import Link from 'next/link'
import { HelpCircle, ClipboardList, MessageSquare, LifeBuoy } from 'lucide-react'

import { Card } from '@/components/ui/Card'

export default function HelpPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Help</h1>
        <p className="text-slate-400 mt-2">Quick routes for common tasks.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/assessments/new">
          <Card className="h-full hover:border-brand-cyan/50 transition-colors">
            <div className="p-5">
              <ClipboardList className="w-6 h-6 text-brand-cyan mb-3" />
              <h2 className="text-lg font-semibold text-white mb-2">Start an Assessment</h2>
              <p className="text-slate-400 text-sm">Begin a new readiness check in about 12 minutes.</p>
            </div>
          </Card>
        </Link>

        <Link href="/temporal-twin">
          <Card className="h-full hover:border-brand-emerald/50 transition-colors">
            <div className="p-5">
              <MessageSquare className="w-6 h-6 text-brand-emerald mb-3" />
              <h2 className="text-lg font-semibold text-white mb-2">Talk to AI Advisor</h2>
              <p className="text-slate-400 text-sm">Open Temporal Twin for guided decision conversations.</p>
            </div>
          </Card>
        </Link>
      </div>

      <Card>
        <div className="p-5 flex items-start gap-3">
          <LifeBuoy className="w-5 h-5 text-brand-yellow mt-0.5" />
          <p className="text-slate-300 text-sm">
            If you hit a broken screen, go to Dashboard and use the left navigation. Core paths are now active.
          </p>
        </div>
      </Card>
    </div>
  )
}
