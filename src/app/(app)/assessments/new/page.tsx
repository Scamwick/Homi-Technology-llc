'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Home, 
  Briefcase, 
  TrendingUp, 
  Rocket, 
  ShoppingBag,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const decisionTypes = [
  {
    id: 'home_buying',
    label: 'Home Buying',
    description: 'Evaluate your readiness to purchase a home',
    icon: Home,
    color: 'cyan',
    popular: true,
    available: true,
    questionCount: 42,
    duration: '12 min',
  },
  {
    id: 'career_change',
    label: 'Career Change',
    description: 'Assess if it\'s the right time for a new career',
    icon: Briefcase,
    color: 'emerald',
    popular: false,
    available: true,
    questionCount: 38,
    duration: '10 min',
  },
  {
    id: 'investment',
    label: 'Investment',
    description: 'Evaluate your readiness for major investments',
    icon: TrendingUp,
    color: 'yellow',
    popular: false,
    available: true,
    questionCount: 35,
    duration: '9 min',
  },
  {
    id: 'business_launch',
    label: 'Business Launch',
    description: 'Assess your readiness to start a business',
    icon: Rocket,
    color: 'slate',
    popular: false,
    available: false,
    questionCount: 45,
    duration: '14 min',
  },
  {
    id: 'major_purchase',
    label: 'Major Purchase',
    description: 'Evaluate readiness for large purchases',
    icon: ShoppingBag,
    color: 'slate',
    popular: false,
    available: false,
    questionCount: 32,
    duration: '8 min',
  },
]

export default function NewAssessmentPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [recentAssessments, setRecentAssessments] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check for pre-selected decision type from onboarding
    const preselected = sessionStorage.getItem('selectedDecisionType')
    if (preselected) {
      setSelectedType(preselected)
      sessionStorage.removeItem('selectedDecisionType')
    }

    // Fetch recent assessments
    async function fetchRecent() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('assessments' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
        
        if (data) {
          setRecentAssessments(data)
        }
      }
    }

    fetchRecent()
  }, [])

  async function createAssessment() {
    if (!selectedType) return

    setIsCreating(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data, error } = await (supabase as any)
        .from('assessments')
        .insert({
          user_id: user.id,
          decision_type: selectedType,
          status: 'in_progress',
        })
        .select()
        .single()

      if (data && !error) {
        router.push(`/assessments/${data.id}/flow`)
      } else {
        setIsCreating(false)
      }
    }
  }

  const selectedDecision = decisionTypes.find(d => d.id === selectedType)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">New Assessment</h1>
        <p className="text-text-2">Choose the decision you want to evaluate</p>
      </div>

      {/* Recent assessments */}
      {recentAssessments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-text-3 mb-3">Recent Assessments</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentAssessments.map((assessment) => (
              <button
                key={assessment.id}
                onClick={() => setSelectedType(assessment.decision_type)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-brand border whitespace-nowrap
                  ${selectedType === assessment.decision_type
                    ? 'border-brand-cyan bg-brand-cyan/10'
                    : 'border-surface-3 bg-surface-1 hover:border-surface-4'
                  }
                `}
              >
                <CheckCircle className="w-4 h-4 text-brand-emerald" />
                <span className="capitalize">{assessment.decision_type.replace('_', ' ')}</span>
                <span className="text-text-3 text-sm">
                  {new Date(assessment.created_at).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Decision type cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {decisionTypes.map((type, index) => {
          const Icon = type.icon
          const isSelected = selectedType === type.id
          const isDisabled = !type.available

          return (
            <button
              key={type.id}
              onClick={() => !isDisabled && setSelectedType(type.id)}
              disabled={isDisabled}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`
                animate-in fade-in slide-in-from-bottom
                relative p-6 rounded-brand border text-left transition-all h-full
                ${isSelected
                  ? 'border-brand-cyan bg-brand-cyan/10'
                  : 'border-surface-3 bg-surface-1 hover:border-surface-4'
                }
                ${isDisabled && 'opacity-50 cursor-not-allowed'}
              `}
            >
              {type.popular && (
                <Badge variant="cyan" size="sm" className="absolute -top-2 left-4">
                  Most Popular
                </Badge>
              )}
              {!type.available && (
                <Badge variant="default" size="sm" className="absolute -top-2 right-4">
                  Coming Soon
                </Badge>
              )}

              <div className={`
                w-12 h-12 rounded-brand flex items-center justify-center mb-4
                ${type.color === 'cyan' ? 'bg-brand-cyan/10' :
                  type.color === 'emerald' ? 'bg-brand-emerald/10' :
                  type.color === 'yellow' ? 'bg-brand-yellow/10' :
                  'bg-surface-2'
                }
              `}>
                <Icon className={`w-6 h-6 ${
                  type.color === 'cyan' ? 'text-brand-cyan' :
                  type.color === 'emerald' ? 'text-brand-emerald' :
                  type.color === 'yellow' ? 'text-brand-yellow' :
                  'text-text-3'
                }`} />
              </div>

              <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
              <p className="text-text-2 text-sm mb-4">{type.description}</p>

              <div className="flex items-center gap-4 text-sm text-text-3">
                <span>{type.questionCount} questions</span>
                <span>~{type.duration}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected decision info */}
      {selectedDecision && (
        <div
          className="animate-in fade-in slide-in-from-bottom duration-300"
        >
          <Card variant="elevated" padding="lg" className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Ready to assess: {selectedDecision.label}
                </h3>
                <p className="text-text-2 text-sm">
                  This assessment will evaluate your readiness across three dimensions: 
                  Financial Reality, Emotional Truth, and Perfect Timing.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-brand-cyan">
                  {selectedDecision.questionCount}
                </div>
                <div className="text-text-3 text-sm">questions</div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={createAssessment}
              loading={isCreating}
            >
              Start Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
