'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { PartnerInvite } from '@/components/couples/PartnerInvite'
import { CoupleStatus } from '@/components/couples/CoupleStatus'
import { 
  Users, 
  Heart, 
  Lock,
  Sparkles,
  ArrowRight,
  ClipboardList,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface Couple {
  id: string
  partner_a_id: string
  partner_b_id: string | null
  invite_email: string
  status: 'pending' | 'active' | 'dissolved'
  created_at: string
}

export default function CouplesPage() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token')

  const [couple, setCouple] = useState<Couple | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    fetchCoupleData()
  }, [])

  // Handle invite token
  useEffect(() => {
    if (inviteToken && !loading && hasAccess) {
      handleJoinInvite()
    }
  }, [inviteToken, loading, hasAccess])

  const fetchCoupleData = async () => {
    try {
      const response = await fetch('/api/couples')
      
      if (response.status === 403) {
        const data = await response.json()
        if (data.code === 'UPGRADE_REQUIRED') {
          setHasAccess(false)
          setLoading(false)
          return
        }
      }

      if (response.ok) {
        const data = await response.json()
        setCouple(data.couple)
        setUserId(data.user?.id || '')
        setHasAccess(true)
      }
    } catch (error) {
      console.error('Error fetching couple data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinInvite = async () => {
    if (!inviteToken) return

    setJoining(true)
    setJoinError(null)

    try {
      const response = await fetch('/api/couples/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: inviteToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join')
      }

      setCouple(data.couple)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card variant="elevated" className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Couples Mode is a Pro Feature
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Take assessments with your partner, compare alignment, and make decisions together. 
            Upgrade to Pro to unlock Couples Mode.
          </p>
          <Link href="/settings/billing">
            <Button variant="primary">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Show join screen if there's an invite token
  if (inviteToken && !couple) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card variant="elevated" className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            You've Been Invited!
          </h1>
          <p className="text-slate-400 mb-8">
            Someone wants to take decision readiness assessments with you.
          </p>

          {joinError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg mb-6 max-w-sm mx-auto">
              <p className="text-rose-400 text-sm">{joinError}</p>
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleJoinInvite}
            disabled={joining}
          >
            {joining ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Joining...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Accept Invitation
              </>
            )}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Couples Mode</h1>
          <Badge variant="purple">PRO</Badge>
        </div>
        <p className="text-slate-400">
          Take assessments together, compare alignment, and make decisions as a team.
        </p>
      </div>

      {!couple ? (
        <PartnerInvite onInviteSent={fetchCoupleData} />
      ) : (
        <div className="space-y-6">
          <CoupleStatus 
            couple={couple} 
            userId={userId}
            onDissolve={() => setCouple(null)}
          />

          {couple.status === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/assessments/new?mode=couple">
                <Card className="h-full hover:border-cyan-500/50 transition-colors cursor-pointer group">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                        <ClipboardList className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">New Joint Assessment</h3>
                        <p className="text-sm text-slate-400 mb-3">
                          Take an assessment together and see how aligned you are.
                        </p>
                        <span className="text-cyan-400 text-sm flex items-center gap-1">
                          Start Assessment <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/couples/results">
                <Card className="h-full hover:border-emerald-500/50 transition-colors cursor-pointer group">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <BarChart3 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">View Alignment</h3>
                        <p className="text-sm text-slate-400 mb-3">
                          See your results and get discussion prompts.
                        </p>
                        <span className="text-emerald-400 text-sm flex items-center gap-1">
                          View Results <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
