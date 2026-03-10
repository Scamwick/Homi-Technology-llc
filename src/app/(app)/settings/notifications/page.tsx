'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Bell, Check, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface NotifPrefs {
  assessment_complete: boolean
  score_milestone: boolean
  transformation_update: boolean
  temporal_twin_delivery: boolean
  couple_activity: boolean
  weekly_digest: boolean
  product_updates: boolean
}

const DEFAULT_PREFS: NotifPrefs = {
  assessment_complete: true,
  score_milestone: true,
  transformation_update: true,
  temporal_twin_delivery: true,
  couple_activity: false,
  weekly_digest: true,
  product_updates: false,
}

const SETTINGS: { key: keyof NotifPrefs; label: string; description: string; category: string }[] = [
  {
    key: 'assessment_complete',
    label: 'Assessment Complete',
    description: 'When your assessment is scored and ready to view.',
    category: 'Activity',
  },
  {
    key: 'score_milestone',
    label: 'Score Milestones',
    description: 'When your readiness score crosses a key threshold (65, 75, 90).',
    category: 'Activity',
  },
  {
    key: 'transformation_update',
    label: 'Transformation Updates',
    description: 'Reminders and progress updates on your transformation path.',
    category: 'Activity',
  },
  {
    key: 'temporal_twin_delivery',
    label: 'Temporal Twin Messages',
    description: 'When a scheduled message from your future self is delivered.',
    category: 'Activity',
  },
  {
    key: 'couple_activity',
    label: 'Partner Activity',
    description: 'When your partner completes an assessment or shares results.',
    category: 'Couples',
  },
  {
    key: 'weekly_digest',
    label: 'Weekly Digest',
    description: 'A weekly summary of your readiness progress and insights.',
    category: 'Email',
  },
  {
    key: 'product_updates',
    label: 'Product Updates',
    description: 'New features, improvements, and HōMI announcements.',
    category: 'Email',
  },
]

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadPrefs() }, [])

  const loadPrefs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('notification_prefs')
        .eq('id', user.id)
        .single()
      if (data?.notification_prefs) {
        setPrefs({ ...DEFAULT_PREFS, ...data.notification_prefs })
      }
    } finally {
      setLoading(false)
    }
  }

  const toggle = (key: keyof NotifPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('profiles')
        .update({ notification_prefs: prefs } as any)
        .eq('id', user.id)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const categories = [...new Set(SETTINGS.map((s) => s.category))]

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-text-3 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-yellow" />
            Notifications
          </h1>
          <p className="text-text-2 text-sm mt-0.5">Choose what you want to be notified about.</p>
        </div>
      </div>

      {categories.map((category) => (
        <Card key={category} variant="elevated">
          <div className="px-5 pt-4 pb-2 border-b border-surface-3">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">{category}</p>
          </div>
          <div className="divide-y divide-surface-3">
            {SETTINGS.filter((s) => s.category === category).map((setting) => (
              <div key={setting.key} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-1">{setting.label}</p>
                  <p className="text-xs text-text-3 mt-0.5">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggle(setting.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    prefs[setting.key] ? 'bg-brand-cyan' : 'bg-surface-3'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                      prefs[setting.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        {saved && (
          <Badge variant="emerald" size="sm" className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            Saved
          </Badge>
        )}
        <div className="ml-auto">
          <Button variant="primary" onClick={save} loading={saving}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
