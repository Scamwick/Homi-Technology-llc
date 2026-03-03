'use client'


import { Milestone } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Target,
  Wallet,
  Heart,
  Calendar,
  Sparkles
} from 'lucide-react'
import { DimensionType } from '@/types/scoring'

interface MilestoneTrackerProps {
  milestones: Milestone[]
  currentScores: {
    financial: number
    emotional: number
    timing: number
  }
}

const dimensionConfig: Record<DimensionType, { icon: typeof Wallet; color: string; gradient: string }> = {
  financial: { 
    icon: Wallet, 
    color: 'cyan', 
    gradient: 'from-cyan-500 to-cyan-400' 
  },
  emotional: { 
    icon: Heart, 
    color: 'emerald', 
    gradient: 'from-emerald-500 to-emerald-400' 
  },
  timing: { 
    icon: Calendar, 
    color: 'yellow', 
    gradient: 'from-yellow-500 to-yellow-400' 
  },
}

export function MilestoneTracker({ milestones, currentScores }: MilestoneTrackerProps) {
  const getCurrentScoreForDimension = (dimension: DimensionType) => {
    return currentScores[dimension] || 0
  }

  const renderMilestone = (milestone: Milestone, index: number) => {
    const dimension = dimensionConfig[milestone.target_dimension]
    const DimensionIcon = dimension.icon
    const currentScore = getCurrentScoreForDimension(milestone.target_dimension)
    const progress = Math.min(100, Math.round((currentScore / milestone.target_score) * 100))
    const isAchieved = milestone.achieved
    const isClose = !isAchieved && progress >= 80

    return (
      <div
        key={milestone.id}
      >
        <Card 
          className={`relative overflow-hidden transition-all ${
            isAchieved 
              ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30' 
              : isClose
                ? 'bg-surface-800 border-yellow-500/30'
                : 'bg-surface-800 border-surface-700'
          }`}
        >
          {/* Achievement Glow */}
          {isAchieved && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 animate-pulse" />
          )}

          <div className="relative p-5">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${dimension.gradient} flex items-center justify-center ${
                isAchieved ? 'shadow-lg shadow-emerald-500/20' : ''
              }`}>
                {isAchieved ? (
                  <Trophy className="w-7 h-7 text-white" />
                ) : (
                  <DimensionIcon className="w-7 h-7 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white">{milestone.title}</h4>
                  {isAchieved && (
                    <Badge variant="emerald" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Achieved
                    </Badge>
                  )}
                  {isClose && !isAchieved && (
                    <Badge variant="yellow" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Almost There
                    </Badge>
                  )}
                </div>

                <p className="text-slate-400 text-sm mb-3">{milestone.description}</p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Progress</span>
                    <span className={`font-medium ${
                      isAchieved ? 'text-emerald-400' : isClose ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {currentScore} / {milestone.target_score}
                    </span>
                  </div>
                  <ProgressBar 
                    progress={progress} 
                    size="sm"
                    className={isAchieved ? 'bg-emerald-500' : isClose ? 'bg-yellow-500' : undefined}
                  />
                </div>

                {/* Celebration Message (shown when achieved) */}
                {isAchieved && milestone.celebration_message && (
                  <div
                    className="mt-4 pt-4 border-t border-emerald-500/20"
                  >
                    <p className="text-emerald-400 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {milestone.celebration_message}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {isAchieved ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Sort milestones: achieved first, then by progress
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (a.achieved && !b.achieved) return -1
    if (!a.achieved && b.achieved) return 1
    
    const progressA = getCurrentScoreForDimension(a.target_dimension) / a.target_score
    const progressB = getCurrentScoreForDimension(b.target_dimension) / b.target_score
    return progressB - progressA
  })

  return (
    <div className="space-y-4">
      {sortedMilestones.map((milestone, index) => renderMilestone(milestone, index))}

      {milestones.length === 0 && (
        <Card className="text-center py-12">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No milestones set. Complete an assessment to unlock your transformation milestones.</p>
        </Card>
      )}
    </div>
  )
}
