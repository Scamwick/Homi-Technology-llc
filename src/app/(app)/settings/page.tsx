import Link from 'next/link'
import { CreditCard, Bell, Shield } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-text-2 mt-2">Manage your account preferences and billing.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/settings/billing">
          <Card variant="elevated" className="h-full hover:border-brand-cyan/50 transition-colors cursor-pointer">
            <div className="p-5">
              <CreditCard className="w-6 h-6 text-brand-cyan mb-3" />
              <h2 className="text-lg font-semibold mb-2">Billing</h2>
              <p className="text-text-2 text-sm">Upgrade plans, review subscriptions, and manage payments.</p>
            </div>
          </Card>
        </Link>

        <Link href="/settings/notifications">
          <Card variant="elevated" className="h-full hover:border-brand-yellow/50 transition-colors cursor-pointer">
            <div className="p-5">
              <Bell className="w-6 h-6 text-brand-yellow mb-3" />
              <h2 className="text-lg font-semibold mb-2">Notifications</h2>
              <p className="text-text-2 text-sm">Control what alerts and digests you receive.</p>
            </div>
          </Card>
        </Link>

        <Link href="/settings/security">
          <Card variant="elevated" className="h-full hover:border-brand-emerald/50 transition-colors cursor-pointer">
            <div className="p-5">
              <Shield className="w-6 h-6 text-brand-emerald mb-3" />
              <h2 className="text-lg font-semibold mb-2">Security</h2>
              <p className="text-text-2 text-sm">Change your password and manage active sessions.</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
