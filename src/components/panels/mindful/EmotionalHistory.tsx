'use client'

import { useState } from 'react'
import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ring } from '@/components/ui/Ring'
import { ChevronDown, ChevronRight, Heart, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CheckIn {
  id: string
  date: string
  mood: 'hopeful' | 'cautious' | 'determined' | 'anxious' | 'neutral'
  confidence: number
  notes: string
  trends: string
}

interface EmotionalHistoryProps {
  moodScore: number
  trend: 'rising' | 'stable' | 'falling'
  recentCheckIns: CheckIn[]
  onStartCheckIn?: () => void
}

const moodConfig = {
  hopeful:    { emoji: '🌅', variant: 'emerald' as const, color: 'border-brand-emerald/30 bg-brand-emerald/5' },
  cautious:   { emoji: '⚠️', variant: 'yellow'  as const, color: 'border-brand-yellow/30 bg-brand-yellow/5'   },
  determined: { emoji: '💪', variant: 'cyan'    as const, color: 'border-brand-cyan/30 bg-brand-cyan/5'       },
  anxious:    { emoji: '😰', variant: 'red'     as const, color: 'border-brand-crimson/30 bg-brand-crimson/5' },
  neutral:    { emoji: '😐', variant: 'default' as const, color: 'border-surface-3 bg-surface-2'              },
}

const trendConfig = {
  rising:  { label: 'Rising',  variant: 'emerald' as const },
  stable:  { label: 'Stable',  variant: 'cyan'    as const },
  falling: { label: 'Falling', variant: 'red'     as const },
}

function ringColor(score: number): 'emerald' | 'yellow' | 'amber' | 'crimson' {
  if (score >= 70) return 'emerald'
  if (score >= 50) return 'yellow'
  if (score >= 35) return 'amber'
  return 'crimson'
}

export function EmotionalHistory({ moodScore, trend, recentCheckIns, onStartCheckIn }: EmotionalHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const trendMeta = trendConfig[trend]

  return (
    <div className="space-y-4">
      {/* Current emotional state */}
      <PanelCard title="Current Emotional State" icon={<Heart className="w-4 h-4" />} accentColor="emerald">
        <div className="flex items-center gap-6">
          <Ring value={moodScore} size={80} color={ringColor(moodScore)} label="Mood" />
          <div className="space-y-2">
            <p className="text-sm text-text-2">Based on your recent check-ins</p>
            <Badge variant={trendMeta.variant} size="sm" dot>
              {trendMeta.label}
            </Badge>
          </div>
        </div>
      </PanelCard>

      {/* Check-in history */}
      <PanelCard title="Recent Check-Ins" icon={<Heart className="w-4 h-4" />}>
        <div className="space-y-2">
          {recentCheckIns.length === 0 ? (
            <p className="text-sm text-text-3 text-center py-4">No check-ins yet.</p>
          ) : (
            recentCheckIns.map((checkin) => {
              const config = moodConfig[checkin.mood]
              const isOpen = expanded === checkin.id
              return (
                <div key={checkin.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : checkin.id)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-brand-sm border text-left transition-all',
                      config.color
                    )}
                  >
                    <span className="text-xl flex-shrink-0">{config.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-text-1 capitalize">
                          {checkin.mood}
                        </span>
                        <Badge variant={config.variant} size="sm">{checkin.confidence}%</Badge>
                      </div>
                      <p className="text-xs text-text-3">{checkin.date}</p>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-text-3 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-3 flex-shrink-0 mt-0.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className={cn('rounded-b-brand-sm border border-t-0 px-4 py-3 space-y-1', config.color)}>
                      <p className="text-sm text-text-2">{checkin.notes}</p>
                      <p className="text-xs text-text-3 font-mono">{checkin.trends}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </PanelCard>

      {/* Quick check-in CTA */}
      <PanelCard title="How Are You Feeling?" accentColor="cyan" icon={<PlusCircle className="w-4 h-4" />}>
        <p className="text-sm text-text-2 mb-4">
          A quick emotional check-in helps us understand your readiness better over time.
        </p>
        <Button variant="primary" size="sm" onClick={onStartCheckIn}>
          Start Check-In
        </Button>
      </PanelCard>
    </div>
  )
}
