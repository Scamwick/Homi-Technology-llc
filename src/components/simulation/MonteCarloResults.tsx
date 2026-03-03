'use client'


import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Shield,
  BarChart3,
  PieChart,
} from 'lucide-react'

interface MonteCarloResultsProps {
  results: {
    iterations: number
    successRate: number
    averageFinalNetWorth: number
    medianFinalNetWorth: number
    minFinalNetWorth: number
    maxFinalNetWorth: number
    bankruptcyRate: number
    emergencyFundDepletionRate: number
    probabilityOfAffordingIn1Year: number
    probabilityOfAffordingIn3Years: number
    probabilityOfAffordingIn5Years: number
    confidenceInterval: {
      lower: number
      upper: number
    }
    recommendation: 'proceed' | 'caution' | 'wait'
    riskLevel: 'low' | 'medium' | 'high'
  }
}

export function MonteCarloResults({ results }: MonteCarloResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  const recommendationConfig = {
    proceed: {
      icon: CheckCircle2,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      title: 'Proceed with Confidence',
      description: 'Your financial position strongly supports this decision.',
    },
    caution: {
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      title: 'Proceed with Caution',
      description: 'Consider additional safeguards before proceeding.',
    },
    wait: {
      icon: Clock,
      color: 'rose',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
      title: 'Wait and Build',
      description: 'Your financial position needs strengthening first.',
    },
  }

  const riskConfig = {
    low: { color: 'text-emerald-400', bgColor: 'bg-emerald-500', label: 'Low Risk' },
    medium: { color: 'text-yellow-400', bgColor: 'bg-yellow-500', label: 'Medium Risk' },
    high: { color: 'text-rose-400', bgColor: 'bg-rose-500', label: 'High Risk' },
  }

  const rec = recommendationConfig[results.recommendation]
  const RecIcon = rec.icon
  const risk = riskConfig[results.riskLevel]

  return (
    <div className="space-y-6">
      {/* Recommendation Card */}
      <Card className={`${rec.bgColor} ${rec.borderColor} border-2`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl ${rec.bgColor} flex items-center justify-center flex-shrink-0`}>
              <RecIcon className={`w-7 h-7 ${rec.textColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{rec.title}</h3>
                <Badge variant="emerald">
                  {risk.label}
                </Badge>
              </div>
              <p className="text-slate-400">{rec.description}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Success Rate</span>
            </div>
            <p className={`text-2xl font-bold ${
              results.successRate >= 80 ? 'text-emerald-400' : 
              results.successRate >= 60 ? 'text-yellow-400' : 'text-rose-400'
            }`}>
              {results.successRate.toFixed(1)}%
            </p>
            <ProgressBar 
              progress={results.successRate} 
              size="sm" 
              className={results.successRate >= 80 ? 'bg-emerald-500' : results.successRate >= 60 ? 'bg-yellow-500' : 'bg-rose-500'}
            />
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">Avg Final Net Worth</span>
            </div>
            <p className={`text-2xl font-bold ${
              results.averageFinalNetWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatCurrency(results.averageFinalNetWorth)}
            </p>
            <p className="text-xs text-slate-500">
              Median: {formatCurrency(results.medianFinalNetWorth)}
            </p>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-sm text-slate-400">Bankruptcy Risk</span>
            </div>
            <p className={`text-2xl font-bold ${
              results.bankruptcyRate < 5 ? 'text-emerald-400' : 
              results.bankruptcyRate < 15 ? 'text-yellow-400' : 'text-rose-400'
            }`}>
              {results.bankruptcyRate.toFixed(1)}%
            </p>
            <ProgressBar 
              progress={results.bankruptcyRate} 
              size="sm" 
              className="bg-rose-500"
            />
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Emergency Fund Risk</span>
            </div>
            <p className={`text-2xl font-bold ${
              results.emergencyFundDepletionRate < 20 ? 'text-emerald-400' : 
              results.emergencyFundDepletionRate < 40 ? 'text-yellow-400' : 'text-rose-400'
            }`}>
              {results.emergencyFundDepletionRate.toFixed(1)}%
            </p>
            <ProgressBar 
              progress={results.emergencyFundDepletionRate} 
              size="sm" 
              className="bg-yellow-500"
            />
          </div>
        </Card>
      </div>

      {/* Probability Timeline */}
      <Card>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Probability of Affording</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Within 1 Year</span>
                <span className={`font-medium ${
                  results.probabilityOfAffordingIn1Year >= 70 ? 'text-emerald-400' : 
                  results.probabilityOfAffordingIn1Year >= 40 ? 'text-yellow-400' : 'text-rose-400'
                }`}>
                  {results.probabilityOfAffordingIn1Year.toFixed(1)}%
                </span>
              </div>
              <ProgressBar 
                progress={results.probabilityOfAffordingIn1Year}
                className={results.probabilityOfAffordingIn1Year >= 70 ? 'bg-emerald-500' : 
                          results.probabilityOfAffordingIn1Year >= 40 ? 'bg-yellow-500' : 'bg-rose-500'}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Within 3 Years</span>
                <span className={`font-medium ${
                  results.probabilityOfAffordingIn3Years >= 70 ? 'text-emerald-400' : 
                  results.probabilityOfAffordingIn3Years >= 40 ? 'text-yellow-400' : 'text-rose-400'
                }`}>
                  {results.probabilityOfAffordingIn3Years.toFixed(1)}%
                </span>
              </div>
              <ProgressBar 
                progress={results.probabilityOfAffordingIn3Years}
                className={results.probabilityOfAffordingIn3Years >= 70 ? 'bg-emerald-500' : 
                          results.probabilityOfAffordingIn3Years >= 40 ? 'bg-yellow-500' : 'bg-rose-500'}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Within 5 Years</span>
                <span className={`font-medium ${
                  results.probabilityOfAffordingIn5Years >= 70 ? 'text-emerald-400' : 
                  results.probabilityOfAffordingIn5Years >= 40 ? 'text-yellow-400' : 'text-rose-400'
                }`}>
                  {results.probabilityOfAffordingIn5Years.toFixed(1)}%
                </span>
              </div>
              <ProgressBar 
                progress={results.probabilityOfAffordingIn5Years}
                className={results.probabilityOfAffordingIn5Years >= 70 ? 'bg-emerald-500' : 
                          results.probabilityOfAffordingIn5Years >= 40 ? 'bg-yellow-500' : 'bg-rose-500'}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Confidence Interval */}
      <Card>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">90% Confidence Interval</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-surface-700 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500"
                />
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                  style={{ left: '5%' }}
                />
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                  style={{ left: '95%' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-rose-400">
                  {formatCurrency(results.confidenceInterval.lower)}
                </span>
                <span className="text-slate-500">Range of outcomes</span>
                <span className="text-emerald-400">
                  {formatCurrency(results.confidenceInterval.upper)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Based on {results.iterations.toLocaleString()} simulations. 
            90% of outcomes fall between these values.
          </p>
        </div>
      </Card>

      {/* Net Worth Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4 text-center">
            <TrendingDown className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-1">Minimum Outcome</p>
            <p className={`text-xl font-bold ${results.minFinalNetWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(results.minFinalNetWorth)}
            </p>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4 text-center">
            <PieChart className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-1">Median Outcome</p>
            <p className={`text-xl font-bold ${results.medianFinalNetWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(results.medianFinalNetWorth)}
            </p>
          </div>
        </Card>

        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-1">Maximum Outcome</p>
            <p className="text-xl font-bold text-emerald-400">
              {formatCurrency(results.maxFinalNetWorth)}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
