import Link from 'next/link'
import { Settings, CreditCard, Bell, Shield } from 'lucide-react'

import { Card } from '@/components/ui/Card'

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account preferences and billing.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/settings/billing">
          <Card className="h-full hover:border-brand-cyan/50 transition-colors">
            <div className="p-5">
              <CreditCard className="w-6 h-6 text-brand-cyan mb-3" />
              <h2 className="text-lg font-semibold text-white mb-2">Billing</h2>
              <p className="text-slate-400 text-sm">Upgrade plans, review subscriptions, and manage payments.</p>
            </div>
          </Card>
        </Link>

        <Card className="h-full border-surface-3">
          <div className="p-5">
            <Bell className="w-6 h-6 text-brand-yellow mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">Notifications</h2>
            <p className="text-slate-400 text-sm">Notification controls are enabled by your profile preferences.</p>
          </div>
        </Card>

        <Card className="h-full border-surface-3">
          <div className="p-5">
            <Shield className="w-6 h-6 text-brand-emerald mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">Security</h2>
            <p className="text-slate-400 text-sm">Password reset and session controls are available on auth pages.</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-5 flex items-start gap-3">
          <Settings className="w-5 h-5 text-slate-300 mt-0.5" />
          <p className="text-slate-300 text-sm">
            Additional per-user settings will be added progressively; no dead links remain in this section.
          </p>
        </div>
      </Card>
    </div>
  )
}
