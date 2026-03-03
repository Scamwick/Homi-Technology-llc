'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Card } from '@/components/ui/Card'
import { SliderInput } from '@/components/assessment/SliderInput'
import { ChoiceInput } from '@/components/assessment/ChoiceInput'
import { NumberInput } from '@/components/assessment/NumberInput'
import { ArrowLeft, ArrowRight, Save, Clock } from 'lucide-react'
import { Question, DimensionType, DIMENSION_COLORS, DIMENSION_LABELS } from '@/types/scoring'

interface AssessmentResponse {
  question_id: string
  response_value: number | string | string[]
  response_metadata: {
    time_spent_ms: number
    changes_made: number
  }
}

export default function AssessmentFlowPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string
  const supabase = createClient()

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, AssessmentResponse>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [assessment, setAssessment] = useState<any>(null)

  // Fetch questions and existing responses
  useEffect(() => {
    async function fetchData() {
      // Fetch assessment
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      if (assessmentData) {
        setAssessment(assessmentData)

        // Fetch questions for this decision type
        const { data: questionsData } = await supabase
          .from('question_bank')
          .select('*')
          .contains('decision_types', [assessmentData.decision_type])
          .eq('active', true)
          .order('order_index', { ascending: true })

        if (questionsData) {
          setQuestions(questionsData as Question[])

          // Fetch existing responses
          const { data: responsesData } = await supabase
            .from('assessment_responses')
            .select('*')
            .eq('assessment_id', assessmentId)

          if (responsesData) {
            const existingResponses: Record<string, AssessmentResponse> = {}
            for (const r of responsesData) {
              existingResponses[r.question_id] = {
                question_id: r.question_id,
                response_value: r.response_value,
                response_metadata: r.response_metadata,
              }
            }
            setResponses(existingResponses)
          }
        }
      }

      setIsLoading(false)
      setQuestionStartTime(Date.now())
    }

    fetchData()
  }, [assessmentId])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const handleResponse = useCallback((value: number | string | string[]) => {
    if (!currentQuestion) return

    const timeSpent = Date.now() - questionStartTime
    const existingResponse = responses[currentQuestion.id]

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        question_id: currentQuestion.id,
        response_value: value,
        response_metadata: {
          time_spent_ms: existingResponse 
            ? existingResponse.response_metadata.time_spent_ms + timeSpent
            : timeSpent,
          changes_made: existingResponse 
            ? existingResponse.response_metadata.changes_made + 1
            : 1,
        },
      },
    }))
  }, [currentQuestion, questionStartTime, responses])

  const saveResponse = async () => {
    if (!currentQuestion) return

    const response = responses[currentQuestion.id]
    if (!response) return

    setIsSaving(true)

    await supabase
      .from('assessment_responses')
      .upsert({
        assessment_id: assessmentId,
        question_id: currentQuestion.id,
        dimension: currentQuestion.dimension,
        response_value: response.response_value,
        response_metadata: response.response_metadata,
      }, {
        onConflict: 'assessment_id,question_id'
      })

    setIsSaving(false)
  }

  const goToNext = async () => {
    await saveResponse()

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setQuestionStartTime(Date.now())
    } else {
      // Complete assessment
      await completeAssessment()
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setQuestionStartTime(Date.now())
    }
  }

  const completeAssessment = async () => {
    await supabase
      .from('assessments')
      .update({ status: 'completed' })
      .eq('id', assessmentId)

    router.push(`/assessments/${assessmentId}`)
  }

  const getDimensionColor = (dimension: DimensionType) => {
    return DIMENSION_COLORS[dimension]
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-surface-2 rounded w-1/4" />
          <div className="h-8 bg-surface-2 rounded w-3/4" />
          <div className="h-32 bg-surface-2 rounded" />
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-text-2">No questions available for this assessment.</p>
      </div>
    )
  }

  const hasResponse = !!responses[currentQuestion.id]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getDimensionColor(currentQuestion.dimension) }}
            />
            <span className="text-sm text-text-2">
              {DIMENSION_LABELS[currentQuestion.dimension]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-3">
            <Clock className="w-4 h-4" />
            <span>Question {currentIndex + 1} of {questions.length}</span>
          </div>
        </div>

        <ProgressBar 
          value={progress} 
          color={currentQuestion.dimension}
          showLabel={false}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="elevated" padding="lg" className="mb-6">
            <h2 className="text-xl font-semibold mb-6">
              {currentQuestion.question_text}
            </h2>

            {/* Input based on question type */}
            <div className="mb-6">
              {currentQuestion.question_type === 'slider' && (
                <SliderInput
                  value={responses[currentQuestion.id]?.response_value as number || 50}
                  onChange={handleResponse}
                  color={currentQuestion.dimension}
                  min={0}
                  max={100}
                />
              )}

              {currentQuestion.question_type === 'single_choice' && currentQuestion.options && (
                <ChoiceInput
                  options={currentQuestion.options}
                  value={responses[currentQuestion.id]?.response_value as string || ''}
                  onChange={handleResponse}
                  type="single"
                />
              )}

              {currentQuestion.question_type === 'multi_choice' && currentQuestion.options && (
                <ChoiceInput
                  options={currentQuestion.options}
                  value={(responses[currentQuestion.id]?.response_value as string[]) || []}
                  onChange={handleResponse}
                  type="multi"
                />
              )}

              {currentQuestion.question_type === 'number' && (
                <NumberInput
                  value={responses[currentQuestion.id]?.response_value as number || 0}
                  onChange={handleResponse}
                  placeholder="Enter a number"
                />
              )}
            </div>

            {/* Category hint */}
            <div className="text-sm text-text-3">
              Category: <span className="capitalize">{currentQuestion.category.replace('_', ' ')}</span>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-sm text-text-3 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Saving...
            </span>
          )}

          <Button
            variant="primary"
            onClick={goToNext}
            disabled={!hasResponse}
          >
            {currentIndex < questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Complete
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save and exit */}
      <div className="mt-8 text-center">
        <button
          onClick={async () => {
            await saveResponse()
            router.push('/dashboard')
          }}
          className="text-text-3 text-sm hover:text-text-2 transition-colors"
        >
          Save progress and exit
        </button>
      </div>
    </div>
  )
}
