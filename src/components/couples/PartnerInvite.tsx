'use client'

import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Users, Mail, Send, Heart } from 'lucide-react'

interface PartnerInviteProps {
  onInviteSent: () => void
}

export function PartnerInvite({ onInviteSent }: PartnerInviteProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/couples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerEmail: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'UPGRADE_REQUIRED') {
          setError('Couples Mode requires a Pro subscription')
        } else {
          throw new Error(data.error || 'Failed to send invite')
        }
        return
      }

      setSuccess(true)
      onInviteSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-gradient-to-br from-brand-crimson/10 to-brand-cyan/10 border-brand-crimson/30">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-emerald/20 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-brand-emerald" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Invitation Sent!</h3>
          <p className="text-slate-400">
            We've sent an invitation to {email}. They'll be able to join and take assessments with you.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="elevated">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-crimson/50 to-brand-cyan/50 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Invite Your Partner</h3>
          <p className="text-slate-400">
            Take assessments together and see how aligned you are on your big decisions.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Partner's Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="email"
                placeholder="partner@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-brand-crimson/10 border border-brand-crimson/30 rounded-lg">
              <p className="text-brand-crimson text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Sending Invite...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-surface-700">
          <p className="text-sm text-slate-500 text-center">
            Your partner will receive an email with instructions to join.
          </p>
        </div>
      </form>
    </Card>
  )
}
