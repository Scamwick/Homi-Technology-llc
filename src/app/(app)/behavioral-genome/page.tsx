'use client'

import { useState, useEffect } from 'react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { GenomeDisplay } from '@/components/behavioral-genome/GenomeDisplay'
import { 
  Brain, 
  RefreshCw, 
  Info,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface GenomeData {
  userId: string
  traits: any[]
  patterns: any[]
  archetype: string
  archetypeDescription: string
  insights: string[]
  recommendations: string[]
  lastUpdated: string
}

export default function BehavioralGenomePage() {
  const [genome, setGenome] = useState<GenomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchGenome()
  }, [])

  const fetchGenome = async () => {
    try {
      const response = await fetch('/api/behavioral-genome')
      if (response.ok) {
        const data = await response.json()
        setGenome(data.genome)
      }
    } catch (error) {
      console.error('Error fetching genome:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchGenome()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  // Show empty state if no assessments
  const hasNoData = !genome || genome.traits.length === 0

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-cyan/50 to-brand-yellow/50 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Behavioral Genome</h1>
              <p className="text-slate-400">
                Understand your decision-making patterns
              </p>
            </div>
          </div>
          {!hasNoData && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {hasNoData ? (
        <Card className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            No Data Yet
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            Complete at least one assessment to unlock your Behavioral Genome. 
            We&apos;ll analyze your decision-making patterns and provide personalized insights.
          </p>
          <Link href="/assessments/new">
            <Button variant="primary">
              Take Your First Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div
          className="animate-in fade-in slide-in-from-bottom duration-300"
        >
          <GenomeDisplay genome={genome} />
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-8 bg-surface-800/50 border-surface-700">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-white mb-2">How It Works</h4>
              <p className="text-sm text-slate-400">
                Your Behavioral Genome is built from patterns across all your assessments. 
                We analyze your scores, response times, and consistency to identify your 
                decision-making archetype and provide personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
