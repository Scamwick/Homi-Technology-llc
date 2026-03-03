'use client'


import { ActionItem } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Zap, 
  TrendingUp, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wallet,
  Heart,
  Calendar
} from 'lucide-react'
import { useState } from 'react'
import { DimensionType } from '@/types/scoring'

interface ActionItemListProps {
  actions: ActionItem[]
  onToggleComplete: (actionId: string, completed: boolean) => void
}

const difficultyConfig = {
  easy: { color: 'emerald', icon: Zap, label: 'Easy' },
  medium: { color: 'yellow', icon: TrendingUp, label: 'Medium' },
  hard: { color: 'rose', icon: TrendingUp, label: 'Hard' },
}

const dimensionConfig: Record<DimensionType, { icon: typeof Wallet; color: string; label: string }> = {
  financial: { icon: Wallet, color: 'cyan', label: 'Financial' },
  emotional: { icon: Heart, color: 'emerald', label: 'Emotional' },
  timing: { icon: Calendar, color: 'yellow', label: 'Timing' },
}

export function ActionItemList({ actions, onToggleComplete }: ActionItemListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const completedActions = actions.filter(a => a.completed)
  const pendingActions = actions.filter(a => !a.completed)

  const renderActionCard = (action: ActionItem, index: number) => {
    const isExpanded = expandedId === action.id
    const difficulty = difficultyConfig[action.difficulty]
    const DifficultyIcon = difficulty.icon
    const dimension = dimensionConfig[action.dimension]
    const DimensionIcon = dimension.icon

    return (
      <Card
        key={action.id} 
          className={`transition-all ${
            action.completed 
              ? 'bg-surface-800/50 border-surface-700/50' 
              : 'bg-surface-800 border-surface-700 hover:border-surface-600'
          }`}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              {/* Completion Toggle */}
              <button
                onClick={() => onToggleComplete(action.id, !action.completed)}
                className={`mt-1 flex-shrink-0 transition-all ${
                  action.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-cyan-400'
                }`}
              >
                {action.completed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className={`font-semibold ${action.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {action.title}
                  </h4>
                  <Badge
                    variant="emerald"
                    className="text-xs"
                  >
                    <DifficultyIcon className="w-3 h-3 mr-1" />
                    {difficulty.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <DimensionIcon className={`w-4 h-4 text-${dimension.color}-400`} />
                    {dimension.label}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {action.estimated_duration}
                  </span>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div
                    className="mt-3 pt-3 border-t border-surface-700"
                  >
                    <p className="text-slate-300 mb-4">{action.description}</p>

                    {action.resources.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-400 mb-2">Helpful Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {action.resources.map((resource, idx) => (
                            <a
                              key={idx}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-700 text-sm text-cyan-400 hover:bg-surface-600 transition-colors"
                            >
                              {resource.title}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expand Toggle */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : action.id)}
                className="flex-shrink-0 text-slate-500 hover:text-white transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Next Steps ({pendingActions.length})
          </h3>
          <div className="space-y-3">
            {pendingActions.map((action, index) => renderActionCard(action, index))}
          </div>
        </div>
      )}

      {/* Completed Actions */}
      {completedActions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Completed ({completedActions.length})
          </h3>
          <div className="space-y-3 opacity-60">
            {completedActions.map((action, index) => renderActionCard(action, index))}
          </div>
        </div>
      )}

      {actions.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-slate-400">No actions available. Complete an assessment to get personalized recommendations.</p>
        </Card>
      )}
    </div>
  )
}
