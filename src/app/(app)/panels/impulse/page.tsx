import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Clock } from 'lucide-react'

export default function PanelComingSoon() {
  return (
    <Card variant="elevated" className="text-center py-16">
      <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center mx-auto mb-4">
        <Clock className="w-6 h-6 text-text-3" />
      </div>
      <h2 className="text-lg font-semibold text-text-1 mb-2">Coming in Sprint 2</h2>
      <p className="text-sm text-text-3 max-w-xs mx-auto">
        These panels are being built now. Check back soon.
      </p>
    </Card>
  )
}
