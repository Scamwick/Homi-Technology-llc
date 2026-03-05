'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ThresholdCompass } from '@/components/brand/ThresholdCompass'
import { ActionItemList } from '@/components/transformation/ActionItemList'
import { MilestoneTracker } from '@/components/transformation/MilestoneTracker'
import { ProgressOverview } from '@/components/transformation/ProgressOverview'
import { CelebrationModal } from '@/components/transformation/CelebrationModal'
import { TransformationPath, Milestone } from '@/types/database'
import { DimensionType } from '@/types/scoring'
import { Sparkles, Target, TrendingUp, Calendar, ArrowRight } from 'lucide-react'

export default function TransformationPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [path, setPath] = useState<TransformationPath | null>(null)
  const [latestAssessment, setLatestAssessment] = useState<any>(null)
  const [celebration, setCelebration] = useState<Milestone | null>(null)
  const [activeTab, setActiveTab] = useState<'actions' | 'milestones' | 'progress'>('actions')

  useEffect(() => {
    fetchTransformationData()
  }, [user])

  const fetchTransformationData = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/transformation')
      if (!response.ok) throw new Error('Failed to fetch transformation data')
      
      const data = await response.json()
      setPath(data.path)
      setLatestAssessment(data.latestAssessment)
      
      // Check for newly achieved milestones
      const newlyAchieved = data.path?.milestones.find(
        (m: Milestone) => m.achieved && !m.achieved_at
      )
      if (newlyAchieved) {
        setCelebration(newlyAchieved)
      }
    } catch (error) {
      console.error('Error fetching transformation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleActionComplete = async (actionId: string, completed: boolean) => {
    if (!path) return

    try {
      const response = await fetch(`/api/transformation/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })

      if (!response.ok) throw new Error('Failed to update action')

      // Update local state
      setPath(prev => {
        if (!prev) return prev
        return {
          ...prev,
          action_items: prev.action_items.map(item =>
            item.id === actionId ? { ...item, completed, completed_at: completed ? new Date().toISOString() : null } : item
          ),
        }
      })
    } catch (error) {
      console.error('Error updating action:', error)
    }
  }

  const handleReassess = () => {
    window.location.href = '/assessments/new'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!path) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card variant="elevated" className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-cyan/20 to-brand-emerald/20 flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-brand-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            No Active Transformation Path
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Complete an assessment first to receive your personalized transformation path with actionable steps to improve your readiness.
          </p>
          <Button variant="primary" onClick={handleReassess}>
            Start New Assessment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    )
  }

  const completedActions = path.action_items.filter(a => a.completed).length
  const totalActions = path.action_items.length
  const progressPercentage = Math.round((completedActions / totalActions) * 100)
  const achievedMilestones = path.milestones.filter(m => m.achieved).length

  const dimensionColors: Record<DimensionType | 'all', string> = {
    financial: 'from-brand-cyan to-brand-cyan',
    emotional: 'from-brand-emerald to-brand-emerald',
    timing: 'from-brand-yellow to-brand-yellow',
    all: 'from-brand-cyan via-brand-emerald to-brand-yellow',
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-brand-cyan" />
          <h1 className="text-3xl font-bold text-white">Your Transformation Path</h1>
        </div>
        <p className="text-slate-400">
          Personalized action plan to strengthen your decision readiness
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-surface-800/50 border-surface-700">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dimensionColors[path.target_dimension]} flex items-center justify-center`}>
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Focus Area</p>
              <p className="text-lg font-semibold text-white capitalize">
                {path.target_dimension === 'all' ? 'All Dimensions' : path.target_dimension}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-cyan flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Progress</p>
              <p className="text-lg font-semibold text-white">{progressPercentage}%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-emerald to-brand-emerald flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Actions</p>
              <p className="text-lg font-semibold text-white">{completedActions}/{totalActions}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-yellow flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Milestones</p>
              <p className="text-lg font-semibold text-white">{achievedMilestones}/{path.milestones.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Compass & Scores */}
        <div className="lg:col-span-1 space-y-6">
          {latestAssessment && (
            <Card variant="elevated" className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Current Readiness</h3>
              <div className="flex justify-center mb-4">
                <ThresholdCompass
                  financial={latestAssessment.financial_score || 0}
                  emotional={latestAssessment.emotional_score || 0}
                  timing={latestAssessment.timing_score || 0}
                  verdict={latestAssessment.verdict || 'not_yet'}
                  size="md"
                  animated
                  showLabels
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-cyan">Financial</span>
                  <span className="text-white font-semibold">{latestAssessment.financial_score}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-emerald">Emotional</span>
                  <span className="text-white font-semibold">{latestAssessment.emotional_score}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-yellow">Timing</span>
                  <span className="text-white font-semibold">{latestAssessment.timing_score}%</span>
                </div>
              </div>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-brand-cyan/10 to-brand-emerald/10 border-brand-cyan/30">
            <h3 className="text-lg font-semibold text-white mb-3">Ready to Reassess?</h3>
            <p className="text-slate-400 text-sm mb-4">
              Take the assessment again to see how your readiness has improved.
            </p>
            <Button variant="primary" className="w-full" onClick={handleReassess}>
              Reassess Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>

        {/* Right Column - Tabs & Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['actions', 'milestones', 'progress'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-brand-cyan text-white'
                    : 'bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            key={activeTab}
            className="animate-in fade-in duration-200"
          >
              {activeTab === 'actions' && (
                <ActionItemList
                  actions={path.action_items}
                  onToggleComplete={handleActionComplete}
                />
              )}

              {activeTab === 'milestones' && (
                <MilestoneTracker
                  milestones={path.milestones}
                  currentScores={{
                    financial: latestAssessment?.financial_score || 0,
                    emotional: latestAssessment?.emotional_score || 0,
                    timing: latestAssessment?.timing_score || 0,
                  }}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressOverview
                  path={path}
                  assessment={latestAssessment}
                />
              )}
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        milestone={celebration}
        onClose={() => setCelebration(null)}
      />
    </div>
  )
}
