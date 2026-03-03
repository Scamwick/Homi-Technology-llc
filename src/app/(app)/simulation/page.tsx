'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { SimulationInputForm } from '@/components/simulation/SimulationInputForm'
import { MonteCarloResults } from '@/components/simulation/MonteCarloResults'
import { Calculator, History, ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface SimulationHistory {
  id: string
  created_at: string
  results: {
    successRate: number
    recommendation: string
    riskLevel: string
  }
}

export default function SimulationPage() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('assessmentId')
  const decisionType = searchParams.get('decisionType') || 'home_buying'

  const [results, setResults] = useState<any>(null)
  const [history, setHistory] = useState<SimulationHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (assessmentId) {
      fetchSimulationHistory()
    }
  }, [assessmentId])

  const fetchSimulationHistory = async () => {
    try {
      const response = await fetch(`/api/simulation/monte-carlo?assessmentId=${assessmentId}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.simulations || [])
      }
    } catch (error) {
      console.error('Error fetching simulation history:', error)
    }
  }

  const handleSimulationComplete = (simulationResults: any) => {
    setResults(simulationResults)
    fetchSimulationHistory()
  }

  const getDecisionTitle = () => {
    const titles: Record<string, string> = {
      home_buying: 'Home Purchase Simulation',
      career_change: 'Career Change Simulation',
      investment: 'Investment Simulation',
      business_launch: 'Business Launch Simulation',
      major_purchase: 'Major Purchase Simulation',
    }
    return titles[decisionType] || 'Financial Simulation'
  }

  if (!assessmentId) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card variant="elevated" className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            No Assessment Selected
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Complete an assessment first to run a personalized Monte Carlo simulation for your decision.
          </p>
          <Link href="/assessments">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View Your Assessments
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">{getDecisionTitle()}</h1>
        </div>
        <p className="text-slate-400">
          Run 10,000 financial simulations to predict outcomes and assess risk
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-1">
          <SimulationInputForm
            assessmentId={assessmentId}
            decisionType={decisionType}
            onSimulationComplete={handleSimulationComplete}
          />

          {/* History Toggle */}
          {history.length > 0 && (
            <Card className="mt-4 bg-surface-800/50 border-surface-700">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium text-white">Simulation History</span>
                </div>
                <span className="text-sm text-slate-400">{history.length} runs</span>
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {history.map((sim) => (
                        <div
                          key={sim.id}
                          className="p-3 bg-surface-700/50 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm text-white">
                              {new Date(sim.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-400">
                              Success: {sim.results.successRate.toFixed(1)}%
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            sim.results.recommendation === 'proceed' ? 'bg-emerald-500/20 text-emerald-400' :
                            sim.results.recommendation === 'caution' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {sim.results.recommendation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MonteCarloResults results={results} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ready to Simulate
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-6">
                    Enter your financial details on the left to run 10,000 Monte Carlo simulations. 
                    We&apos;ll model different scenarios including job loss, market changes, and inflation.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Job Security Modeling
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      Inflation Adjustments
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Investment Returns
                    </span>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
