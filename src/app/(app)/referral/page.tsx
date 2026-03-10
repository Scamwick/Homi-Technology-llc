'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ring } from '@/components/ui/Ring'
import { Spinner } from '@/components/ui/Spinner'
import { Users, Copy, Check, Gift, ArrowRight, Link2 } from 'lucide-react'
import Link from 'next/link'

const REWARDS = [
  { milestone: 1,  label: '1 referral',  reward: '1 free month Pro',    color: 'cyan'    as const },
  { milestone: 3,  label: '3 referrals', reward: '3 free months Pro',   color: 'emerald' as const },
  { milestone: 5,  label: '5 referrals', reward: '6 free months Pro',   color: 'yellow'  as const },
  { milestone: 10, label: '10 referrals',reward: 'Lifetime Pro access', color: 'amber'   as const },
]

export default function ReferralPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const [{ data: profileData }, { count }] = await Promise.all([
        supabase.from('profiles').select('referral_code, subscription_tier').eq('id', user.id).single(),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', user.id),
      ])

      setProfile(profileData)
      setReferralCount(count ?? 0)
    } finally {
      setLoading(false)
    }
  }

  const referralCode = profile?.referral_code ?? user?.id?.slice(0, 8)?.toUpperCase()
  const referralLink = `https://xn--hmi-qxa.com/signup?ref=${referralCode}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const nextMilestone = REWARDS.find((r) => r.milestone > referralCount) ?? REWARDS[REWARDS.length - 1]
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((referralCount / nextMilestone.milestone) * 100))
    : 100

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refer &amp; Earn</h1>
        <p className="text-text-2 text-sm mt-0.5">Share HōMI with friends. Earn free Pro access.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="elevated" className="p-5 text-center space-y-2">
          <p className="text-3xl font-bold font-mono text-brand-cyan">{referralCount}</p>
          <p className="text-xs text-text-3">Friends referred</p>
        </Card>
        <Card variant="elevated" className="p-5 text-center space-y-2">
          <div className="flex justify-center">
            <Ring value={progressToNext} size={56} color="cyan" label="%" />
          </div>
          <p className="text-xs text-text-3">To next reward</p>
        </Card>
      </div>

      {/* Referral link */}
      <Card variant="elevated">
        <div className="px-5 pt-4 pb-2 border-b border-surface-3 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-brand-cyan" />
          <p className="text-sm font-semibold text-text-1">Your Referral Link</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-brand border border-surface-3 bg-surface-2">
            <span className="flex-1 text-sm font-mono text-text-2 truncate">{referralLink}</span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-brand-sm bg-brand-cyan/10 text-brand-cyan text-xs font-medium hover:bg-brand-cyan/20 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-text-4">
            Your code: <span className="font-mono text-text-2">{referralCode}</span> — shared via this link, new signups are automatically attributed to you.
          </p>
        </div>
      </Card>

      {/* Rewards ladder */}
      <Card variant="elevated">
        <div className="px-5 pt-4 pb-2 border-b border-surface-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-brand-yellow" />
          <p className="text-sm font-semibold text-text-1">Reward Milestones</p>
        </div>
        <div className="divide-y divide-surface-3">
          {REWARDS.map((r) => {
            const unlocked = referralCount >= r.milestone
            return (
              <div key={r.milestone} className={`flex items-center justify-between px-5 py-4 ${unlocked ? 'bg-brand-emerald/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                    unlocked ? 'bg-brand-emerald text-surface-0' : 'bg-surface-2 text-text-3'
                  }`}>
                    {unlocked ? '✓' : r.milestone}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-1">{r.label}</p>
                    <p className="text-xs text-text-3">{r.reward}</p>
                  </div>
                </div>
                <Badge variant={unlocked ? 'emerald' : r.color} size="sm">
                  {unlocked ? 'Unlocked' : `${r.milestone - referralCount} to go`}
                </Badge>
              </div>
            )
          })}
        </div>
      </Card>

      {/* How it works */}
      <Card variant="elevated">
        <div className="px-5 pt-4 pb-2 border-b border-surface-3">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider">How It Works</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            { step: '1', text: 'Share your unique referral link with friends.' },
            { step: '2', text: 'They sign up and complete their first assessment.' },
            { step: '3', text: 'You earn free Pro access based on milestones.' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.step}
              </div>
              <p className="text-sm text-text-2">{s.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
