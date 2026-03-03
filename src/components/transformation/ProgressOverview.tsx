'use client'


import { TransformationPath } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  CheckCircle2,
  Clock,
  Zap,
  Award,
  BarChart3
} from 'lucide-react'

interface ProgressOverviewProps {
  path: TransformationPath
  assessment: any
}

export function ProgressOverview({ path, assessment }: ProgressOverviewProps) {
  const completedActions = path.action_items.filter(a => a.completed).length
  const totalActions = path.action_items.length
  const actionProgress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0

  const achievedMilestones = path.milestones.filter(m => m.achieved).length
  const totalMilestones = path.milestones.length
  const milestoneProgress = totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0

  // Calculate days since started
  const daysSinceStarted = Math.floor(
    (Date.now() - new Date(path.started_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Count actions by difficulty
  const easyActions = path.action_items.filter(a => a.difficulty === 'easy')
  const mediumActions = path.action_items.filter(a => a.difficulty === 'medium')
  const hardActions = path.action_items.filter(a => a.difficulty === 'hard')

  const easyCompleted = easyActions.filter(a => a.completed).length
  const mediumCompleted = mediumActions.filter(a => a.completed).length
  const hardCompleted = hardActions.filter(a => a.completed).length

  const stats = [
    {
      label: 'Easy Actions',
      completed: easyCompleted,
      total: easyActions.length,
      color: 'emerald',
    },
    {
      label: 'Medium Actions',
      completed: mediumCompleted,
      total: mediumActions.length,
      color: 'yellow',
    },
    {
      label: 'Hard Actions',
      completed: hardCompleted,
      total: hardActions.length,
      color: 'rose',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card variant="elevated">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
            <p className="text-slate-400 text-sm">Your transformation journey at a glance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action Progress */}
          <div className="text-center p-4 bg-surface-800/50 rounded-xl">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-cyan-500"
                  strokeDasharray={`${actionProgress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{actionProgress}%</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Actions Complete</p>
            <p className="text-white font-medium">{completedActions} of {totalActions}</p>
          </div>

          {/* Milestone Progress */}
          <div className="text-center p-4 bg-surface-800/50 rounded-xl">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${milestoneProgress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{milestoneProgress}%</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Milestones Achieved</p>
            <p className="text-white font-medium">{achievedMilestones} of {totalMilestones}</p>
          </div>

          {/* Time Tracking */}
          <div className="text-center p-4 bg-surface-800/50 rounded-xl">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-400 flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-400 text-sm">Days on Path</p>
            <p className="text-white font-medium">{daysSinceStarted} days</p>
          </div>
        </div>
      </Card>

      {/* Action Breakdown */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Action Breakdown</h3>
            <p className="text-slate-400 text-sm">Progress by difficulty level</p>
          </div>
        </div>

        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">{stat.label}</span>
                <span className="text-white font-medium">
                  {stat.completed} / {stat.total}
                </span>
              </div>
              <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${stat.color}-500 rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      {path.action_items.some(a => a.completed) && (
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <p className="text-slate-400 text-sm">Your latest completions</p>
            </div>
          </div>

          <div className="space-y-3">
            {path.action_items
              .filter(a => a.completed && a.completed_at)
              .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
              .slice(0, 5)
              .map((action, index) => (
                <div
                  key={action.id}
                  className="flex items-center gap-3 p-3 bg-surface-800/50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{action.title}</p>
                    <p className="text-slate-500 text-xs">
                      Completed {new Date(action.completed_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <Award className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Assessment Summary */}
      {assessment && (
        <Card className="bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border-cyan-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Based on Your Assessment</h3>
              <p className="text-slate-400 text-sm">
                From {new Date(assessment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-surface-800/50 rounded-lg">
              <p className="text-2xl font-bold text-cyan-400">{assessment.financial_score}%</p>
              <p className="text-slate-400 text-xs">Financial</p>
            </div>
            <div className="text-center p-3 bg-surface-800/50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-400">{assessment.emotional_score}%</p>
              <p className="text-slate-400 text-xs">Emotional</p>
            </div>
            <div className="text-center p-3 bg-surface-800/50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">{assessment.timing_score}%</p>
              <p className="text-slate-400 text-xs">Timing</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
