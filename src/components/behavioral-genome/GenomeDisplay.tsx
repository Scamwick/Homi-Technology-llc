'use client'

import { useState, useEffect } from 'react'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
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
  improving: 'text-emerald-400',
  declining: 'text-rose-400',
  stable: 'text-slate-400',
}

export function GenomeDisplay({ genome }: GenomeDisplayProps) {
  const [selectedTrait, setSelectedTrait] = useState<BehavioralTrait | null>(null)

  return (
    <div className="space-y-6">
      {/* Archetype Card */}
      <Card className="bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-emerald-500/10 border-purple-500/30">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
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
          <Brain className="w-5 h-5 text-cyan-400" />
          Your Behavioral Traits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {genome.traits.map((trait, index) => {
            const TrendIcon = trendIcons[trait.trend]
            const trendColor = trendColors[trait.trend]

            return (
              <div
                key={trait.id}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:border-cyan-500/50 ${
                    selectedTrait?.id === trait.id ? 'border-cyan-500' : ''
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
                          progress={trait.score} 
                          size="sm"
                          className={trait.score >= 70 ? 'bg-emerald-500' : trait.score >= 50 ? 'bg-cyan-500' : 'bg-yellow-500'}
                        />
                      </div>
                      <span className={`text-lg font-bold ${
                        trait.score >= 70 ? 'text-emerald-400' : trait.score >= 50 ? 'text-cyan-400' : 'text-yellow-400'
                      }`}>
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
                                className="w-full bg-cyan-500/30 rounded-t"
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
          <Target className="w-5 h-5 text-emerald-400" />
          Decision Patterns
        </h3>
        <div className="space-y-3">
          {genome.patterns.map((pattern, index) => (
            <div
              key={pattern.type}
            >
              <Card className="bg-surface-800/50 border-surface-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{pattern.label}</h4>
                    <span className={`text-sm font-bold ${
                      pattern.score >= 70 ? 'text-emerald-400' : pattern.score >= 50 ? 'text-cyan-400' : 'text-yellow-400'
                    }`}>
                      {pattern.score}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{pattern.description}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {genome.insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Key Insights
          </h3>
          <Card>
            <div className="p-4 space-y-3">
              {genome.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 text-sm">
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
            <Sparkles className="w-5 h-5 text-purple-400" />
            Recommendations
          </h3>
          <Card className="bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border-purple-500/20">
            <div className="p-4 space-y-3">
              {genome.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 text-sm">
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
