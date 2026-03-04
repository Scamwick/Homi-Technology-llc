'use client'

import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Trash2,
  Link as LinkIcon
} from 'lucide-react'

interface Couple {
  id: string
  partner_a_id: string
  partner_b_id: string | null
  invite_email: string
  status: 'pending' | 'active' | 'dissolved'
  created_at: string
}

interface CoupleStatusProps {
  couple: Couple
  userId: string
  onDissolve: () => void
}

export function CoupleStatus({ couple, userId, onDissolve }: CoupleStatusProps) {
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false)
  const [dissolving, setDissolving] = useState(false)

  const isPartnerA = couple.partner_a_id === userId
  const isActive = couple.status === 'active'
  const isPending = couple.status === 'pending'

  const handleDissolve = async () => {
    setDissolving(true)
    try {
      const response = await fetch('/api/couples', {
        method: 'DELETE',
      })

      if (response.ok) {
        onDissolve()
      }
    } catch (error) {
      console.error('Error dissolving couple:', error)
    } finally {
      setDissolving(false)
    }
  }

  return (
    <Card variant="elevated">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-crimson/50 to-brand-cyan/50 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Couple Mode</h3>
              <Badge
                variant="emerald"
                className="text-xs mt-1"
              >
                {isActive ? 'Active' : 'Pending'}
              </Badge>
            </div>
          </div>

          {!showDissolveConfirm ? (
            <button
              onClick={() => setShowDissolveConfirm(true)}
              className="p-2 text-slate-500 hover:text-brand-crimson transition-colors"
              title="Dissolve relationship"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDissolveConfirm(false)}
                className="px-3 py-1 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDissolve}
                disabled={dissolving}
                className="px-3 py-1 text-sm bg-brand-crimson/50 text-white rounded-lg hover:bg-brand-crimson disabled:opacity-50"
              >
                {dissolving ? '...' : 'Confirm'}
              </button>
            </div>
          )}
        </div>

        {isPending && (
          <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-brand-yellow font-medium">Waiting for Partner</p>
                <p className="text-sm text-slate-400 mt-1">
                  Invitation sent to <strong>{couple.invite_email}</strong>. 
                  They need to accept to activate Couples Mode.
                </p>
              </div>
            </div>
          </div>
        )}

        {isActive && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-surface-700/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-brand-emerald/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
              </div>
              <div>
                <p className="text-sm text-white">Partner Connected</p>
                <p className="text-xs text-slate-400">
                  Since {new Date(couple.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-surface-700/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-brand-cyan" />
              </div>
              <div>
                <p className="text-sm text-white">Joint Assessments</p>
                <p className="text-xs text-slate-400">
                  Take assessments together and compare results
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
