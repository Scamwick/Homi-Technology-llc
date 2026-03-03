'use client'

import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { TrinityPerspective, TrinityDebate as TrinityDebateType } from '@/lib/trinity/engine'
import { 
  Brain, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  MessageSquare,
  Lightbulb,
  ListTodo,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface TrinityDebateProps {
  debate: TrinityDebateType
}

const perspectiveIcons: Record<string, typeof Brain> = {
  rationalist: Brain,
  intuitive: Sparkles,
  pragmatist: Wrench,
}

const stanceIcons = {
  support: CheckCircle2,
  oppose: XCircle,
  neutral: MinusCircle,
}

const stanceColors = {
  support: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'emerald' as const,
    label: 'Supports',
  },
  oppose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    badge: 'red' as const,
    label: 'Opposes',
  },
  neutral: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    badge: 'yellow' as const,
    label: 'Neutral',
  },
}

export function TrinityDebate({ debate }: TrinityDebateProps) {
  const [expandedPerspective, setExpandedPerspective] = useState<string | null>(null)

  const renderPerspective = (perspective: TrinityPerspective, index: number) => {
    const Icon = perspectiveIcons[perspective.id]
    const StanceIcon = stanceIcons[perspective.stance]
    const stanceStyle = stanceColors[perspective.stance]
    const isExpanded = expandedPerspective === perspective.id

    return (
      <div
        key={perspective.id}
      >
        <Card 
          className={`${stanceStyle.bg} ${stanceStyle.border} border transition-all cursor-pointer`}
          onClick={() => setExpandedPerspective(isExpanded ? null : perspective.id)}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${perspective.color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: perspective.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-white">{perspective.name}</h4>
                  <Badge variant={stanceStyle.badge} className="text-xs">
                    <StanceIcon className="w-3 h-3 mr-1" />
                    {stanceStyle.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400">
                    Confidence: <span className={stanceStyle.text}>{perspective.confidence}%</span>
                  </span>
                </div>

                {/* Recommendation Preview */}
                <p className={`text-sm mt-2 ${stanceStyle.text}`}>
                  {perspective.recommendation.substring(0, 100)}...
                </p>
              </div>

              <button className="flex-shrink-0 text-slate-500">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Expanded Content */}
            
              {isExpanded && (
                <div
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-surface-700/50 space-y-4">
                    {/* Arguments */}
                    {perspective.arguments.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Key Arguments
                        </h5>
                        <ul className="space-y-2">
                          {perspective.arguments.map((arg, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-500 mt-1">•</span>
                              {arg}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Concerns */}
                    {perspective.concerns.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-rose-400 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Concerns
                        </h5>
                        <ul className="space-y-2">
                          {perspective.concerns.map((concern, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-rose-500 mt-1">•</span>
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Full Recommendation */}
                    <div className="p-3 bg-surface-800/50 rounded-lg">
                      <h5 className="text-sm font-medium text-white mb-1">Full Recommendation</h5>
                      <p className={`text-sm ${stanceStyle.text}`}>{perspective.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card variant="elevated">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-slate-400">Your Question</span>
          </div>
          <p className="text-xl font-semibold text-white">{debate.question}</p>
        </div>
      </Card>

      {/* Perspectives */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm">
            3
          </span>
          Three Perspectives
        </h3>
        <div className="space-y-4">
          {debate.perspectives.map((p, i) => renderPerspective(p, i))}
        </div>
      </div>

      {/* Synthesis */}
      <Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-yellow-500/10 border-cyan-500/30">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Synthesis</h3>
            <Badge variant="cyan" className="text-xs">
              {debate.synthesis.confidenceLevel}% Confidence
            </Badge>
          </div>

          <p className="text-slate-300 mb-6">{debate.synthesis.consensus}</p>

          {/* Key Insights */}
          {debate.synthesis.keyInsights.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Key Insights</h4>
              <ul className="space-y-2">
                {debate.synthesis.keyInsights.map((insight, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">→</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {debate.synthesis.actionItems.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {debate.synthesis.actionItems.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
