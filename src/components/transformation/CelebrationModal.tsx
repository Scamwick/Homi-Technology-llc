'use client'

import { useEffect } from 'react'
import { Milestone } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Trophy, Sparkles, X, PartyPopper } from 'lucide-react'
import confetti from 'canvas-confetti'

interface CelebrationModalProps {
  milestone: Milestone | null
  onClose: () => void
}

export function CelebrationModal({ milestone, onClose }: CelebrationModalProps) {
  useEffect(() => {
    if (milestone) {
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22d3ee', '#34d399', '#facc15'],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22d3ee', '#34d399', '#facc15'],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()
    }
  }, [milestone])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!milestone) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-surface-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-gradient-to-br from-surface-800 to-surface-900 border border-brand-emerald/30 rounded-2xl p-8 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-emerald/10 via-brand-cyan/10 to-brand-yellow/10" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-center">
              <PartyPopper className="w-12 h-12 text-brand-emerald" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-brand-emerald mb-2">
                🎉 {milestone.title}
              </h2>
              <p className="text-xl text-brand-emerald/30 mb-4">
                {milestone.description}
              </p>
            </div>

            <div className="bg-gradient-to-r from-brand-emerald/20 to-brand-cyan/20 border border-brand-emerald/30 rounded-xl p-4 mb-6">
              <p className="text-brand-emerald font-medium">
                {milestone.celebration_message}
              </p>
            </div>

            <Button variant="primary" onClick={onClose} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Continue Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
