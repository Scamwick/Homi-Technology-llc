'use client'

import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain, 
  Target, 
  Lightbulb,
  User,
  Sparkles
} from 'lucide-react'

interface BehavioralTrait {
  id: string
  name: string
  description: string
  score: number
  trend: 'improving' | 'declining' | 'stable'
  history: Array<{ date: string; score: number }>
}

interface DecisionPattern {
  type: string
  score: number
  label: string
  description: string
}

interface GenomeData {
  userId: string
  traits: BehavioralTrait[]
  patterns: DecisionPattern[]
  archetype: string
  archetypeDescription: string
  insights: string[]
  recommendations: string[]
  lastUpdated: string
}

interface GenomeDisplayProps {
  genome: GenomeData
}

const trendIcons = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
}

const trendColors = {
  improving: 'text-brand-emerald',
  declining: 'text-brand-crimson',
  stable: 'text-slate-400',
}

const VERDICT_THRESHOLDS = {
  ready: 80,
  caution: 65,
  build: 50,
} as const

function getScoreColor(score: number) {
  if (score >= VERDICT_THRESHOLDS.ready) return 'brand-emerald'
  if (score >= VERDICT_THRESHOLDS.caution) return 'brand-yellow'
  if (score >= VERDICT_THRESHOLDS.build) return 'brand-yellow'
  return 'brand-crimson'
}

export function GenomeDisplay({ genome }: GenomeDisplayProps) {
  const [selectedTrait, setSelectedTrait] = useState<BehavioralTrait | null>(null)

  return (
    <div className="space-y-6">
      {/* Archetype Card */}
      <Card className="bg-gradient-to-br from-brand-cyan/10 via-brand-cyan/10 to-brand-emerald/10 border-brand-cyan/30">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-cyan/50 to-brand-cyan flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Your Decision-Making Archetype</p>
              <h2 className="text-2xl font-bold text-white">{genome.archetype}</h2>
            </div>
          </div>
          <p className="text-slate-300">{genome.archetypeDescription}</p>
        </div>
      </Card>

      {/* Traits Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-brand-cyan" />
          Your Behavioral Traits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {genome.traits.map((trait) => {
            const TrendIcon = trendIcons[trait.trend]
            const trendColor = trendColors[trait.trend]
            const scoreColor = getScoreColor(trait.score)

            return (
              <div
                key={trait.id}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:border-brand-cyan/50 ${
                    selectedTrait?.id === trait.id ? 'border-brand-cyan' : ''
                  }`}
                  onClick={() => setSelectedTrait(selectedTrait?.id === trait.id ? null : trait)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{trait.name}</h4>
                      <div className={`flex items-center gap-1 ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="text-xs capitalize">{trait.trend}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{trait.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar
                          value={trait.score}
                          size="sm"
                          className={scoreColor === 'brand-emerald' ? 'bg-brand-emerald' : scoreColor === 'brand-yellow' ? 'bg-brand-yellow' : 'bg-brand-crimson/50'}
                        />
                      </div>
                      <span className={`text-lg font-bold ${scoreColor === 'brand-emerald' ? 'text-brand-emerald' : scoreColor === 'brand-yellow' ? 'text-brand-yellow' : 'text-brand-crimson'}`}>
                        {trait.score}%
                      </span>
                    </div>

                    {/* Expanded History */}
                    {selectedTrait?.id === trait.id && trait.history.length > 1 && (
                      <div
                        className="mt-4 pt-4 border-t border-surface-700"
                      >
                        <p className="text-sm text-slate-400 mb-3">History</p>
                        <div className="flex items-end gap-2 h-20">
                          {trait.history.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center">
                              <div 
                                className="w-full bg-brand-cyan/30 rounded-t"
                                style={{ height: `${h.score}%` }}
                              />
                              <span className="text-xs text-slate-500 mt-1">
                                {new Date(h.date).toLocaleDateString(undefined, { month: 'short' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Decision Patterns */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-emerald" />
          Decision Patterns
        </h3>
        <div className="space-y-3">
          {genome.patterns.map((pattern) => (
            (() => {
              const scoreColor = getScoreColor(pattern.score)
              return (
            <div
              key={pattern.type}
            >
              <Card className="bg-surface-800/50 border-surface-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{pattern.label}</h4>
                    <span className={`text-sm font-bold ${scoreColor === 'brand-emerald' ? 'text-brand-emerald' : scoreColor === 'brand-yellow' ? 'text-brand-yellow' : 'text-brand-crimson'}`}>
                      {pattern.score}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{pattern.description}</p>
                </div>
              </Card>
            </div>
              )
            })()
          ))}
        </div>
      </div>

      {/* Insights */}
      {genome.insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brand-yellow" />
            Key Insights
          </h3>
          <Card>
            <div className="p-4 space-y-3">
              {genome.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0 text-brand-cyan text-sm">
                    {index + 1}
                  </span>
                  <p className="text-slate-300">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {genome.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-cyan" />
            Recommendations
          </h3>
          <Card className="bg-gradient-to-br from-brand-cyan/5 to-brand-cyan/5 border-brand-cyan/20">
            <div className="p-4 space-y-3">
              {genome.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0 text-brand-cyan text-sm">
                    {index + 1}
                  </span>
                  <p className="text-slate-300">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
