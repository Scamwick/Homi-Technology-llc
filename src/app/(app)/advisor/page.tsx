import Link from 'next/link'
import { MessageSquare, ArrowRight } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdvisorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Advisor</h1>
        <p className="text-slate-400 mt-2">
          Your advisor tools are available in Temporal Twin.
        </p>
      </div>

      <Card className="border-brand-cyan/30 bg-brand-cyan/10">
        <div className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-brand-cyan" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">Open Temporal Twin</h2>
            <p className="text-slate-300 mb-4">
              Continue with guided AI conversations, scenario prompts, and decision support.
            </p>
            <Link href="/temporal-twin">
              <Button variant="primary">
                Go to Temporal Twin
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
