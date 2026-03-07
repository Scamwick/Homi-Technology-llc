'use client'

import { useState, useEffect } from 'react'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import {
  Users,
  ClipboardList,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Shield,
  BarChart3,
  PieChart
} from 'lucide-react'

interface AdminStats {
  users: {
    total: number
    newToday: number
  }
  assessments: {
    total: number
    completed: number
    completionRate: number
  }
  subscriptions: Array<{ subscription_tier: string; count: number }>
  revenue: {
    total: number
  }
  verdicts: Array<{ verdict: string; count: number }>
  recentAssessments: Array<{
    id: string
    decision_type: string
    status: string
    verdict: string
    overall_score: number
    created_at: string
    profiles: { email: string }
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      
      if (response.status === 403) {
        setError('You do not have admin access')
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card className="text-center py-16">
          <Shield className="w-16 h-16 text-brand-crimson mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-slate-400">{error}</p>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  const readyCount = stats.verdicts.find(v => v.verdict === 'ready')?.count || 0
  const notYetCount = stats.verdicts.find(v => v.verdict === 'not_yet')?.count || 0

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-crimson/50 to-brand-amber/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Badge variant="red">ADMIN</Badge>
        </div>
        <p className="text-slate-400">Platform overview and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-cyan/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-cyan" />
              </div>
              <span className="text-slate-400 text-sm">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.users.total.toLocaleString()}</p>
            <p className="text-sm text-brand-emerald mt-1">
              +{stats.users.newToday} today
            </p>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-emerald/20 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-brand-emerald" />
              </div>
              <span className="text-slate-400 text-sm">Assessments</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.assessments.total.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-1">
              {stats.assessments.completionRate}% completion rate
            </p>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-brand-yellow" />
              </div>
              <span className="text-slate-400 text-sm">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.revenue.total)}</p>
            <p className="text-sm text-slate-400 mt-1">Lifetime</p>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-cyan/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-cyan" />
              </div>
              <span className="text-slate-400 text-sm">Completed</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.assessments.completed.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-1">
              {readyCount} ready, {notYetCount} not yet
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <PieChart className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-lg font-semibold text-white">Subscription Tiers</h3>
            </div>
            <div className="space-y-3">
              {stats.subscriptions.map((sub) => (
                <div key={sub.subscription_tier} className="flex items-center justify-between">
                  <span className="text-slate-400 capitalize">{sub.subscription_tier}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(sub.count / stats.users.total) * 100}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          sub.subscription_tier === 'pro' || sub.subscription_tier === 'family'
                            ? 'bg-brand-emerald'
                            : sub.subscription_tier === 'plus'
                            ? 'bg-brand-cyan'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <span className="text-white font-medium w-12 text-right">{sub.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Verdict Distribution */}
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <BarChart3 className="w-5 h-5 text-brand-emerald" />
              <h3 className="text-lg font-semibold text-white">Verdict Distribution</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-brand-emerald flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    READY
                  </span>
                  <span className="text-white font-medium">{readyCount}</span>
                </div>
                <div className="h-3 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(readyCount / (readyCount + notYetCount)) * 100 || 0}%` }}
                    className="h-full bg-brand-emerald rounded-full transition-all duration-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-brand-yellow flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    NOT YET
                  </span>
                  <span className="text-white font-medium">{notYetCount}</span>
                </div>
                <div className="h-3 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(notYetCount / (readyCount + notYetCount)) * 100 || 0}%` }}
                    className="h-full bg-brand-yellow rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card className="mt-6">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Assessments</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-surface-700">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Verdict</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-surface-800">
                    <td className="py-3 text-slate-300">{assessment.profiles?.email}</td>
                    <td className="py-3 text-slate-300 capitalize">
                      {assessment.decision_type.replace('_', ' ')}
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={assessment.status === 'completed' ? 'emerald' : 'yellow'}
                        className="text-xs"
                      >
                        {assessment.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {assessment.verdict && (
                        <Badge 
                          variant={assessment.status === 'completed' ? 'emerald' : 'yellow'}
                          className="text-xs"
                        >
                          {assessment.verdict}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 text-white font-medium">
                      {assessment.overall_score || '-'}%
                    </td>
                    <td className="py-3 text-slate-400 text-sm">
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
