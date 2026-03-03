'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { TrinityDebate } from '@/components/trinity/TrinityDebate'
import { TrinityDebate as TrinityDebateType } from '@/lib/trinity/engine'
import { 
  Users, 
  MessageSquare, 
  Sparkles, 
  ArrowLeft, 
  Lock,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'

export default function TrinityPage() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('assessmentId')

  const [question, setQuestion] = useState('')
  const [debate, setDebate] = useState<TrinityDebateType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [history, setHistory] = useState<TrinityDebateType[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    checkAccess()
    if (assessmentId) {
      fetchHistory()
    }
  }, [assessmentId])

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setHasAccess(['plus', 'pro', 'family'].includes(data.tier))
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/trinity?assessmentId=${assessmentId}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.debates || [])
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assessmentId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/trinity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          userQuestion: question || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'UPGRADE_REQUIRED') {
          setError('This feature requires a Plus or Pro subscription')
        } else {
          throw new Error(data.error || 'Failed to generate debate')
        }
        return
      }

      setDebate(data.debate)
      fetchHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card variant="elevated" className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Trinity Engine is a Pro Feature
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Get three AI perspectives on your decision. Upgrade to Plus or Pro to unlock the Trinity Engine.
          </p>
          <Link href="/settings/billing">
            <Button variant="primary">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!assessmentId) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card variant="elevated" className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            No Assessment Selected
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Select an assessment to get three AI perspectives on your decision.
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-purple-500 to-yellow-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Trinity Engine</h1>
          <Badge variant="purple">PRO</Badge>
        </div>
        <p className="text-slate-400">
          Get three AI perspectives on your decision: The Rationalist, The Intuitive, and The Pragmatist
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input */}
        <div className="lg:col-span-1">
          <Card variant="elevated">
            <form onSubmit={handleSubmit} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Ask the Trinity</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Your Question (optional)
                  </label>
                  <Input
                    placeholder="e.g., Should I wait for interest rates to drop?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                    <p className="text-rose-400 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Consulting the Trinity...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Perspectives
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card className="mt-4 bg-surface-800/50 border-surface-700">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium text-white">Past Debates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{history.length}</span>
                  {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
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
                      {history.map((deb) => (
                        <button
                          key={deb.id}
                          onClick={() => setDebate(deb)}
                          className="w-full p-3 bg-surface-700/50 rounded-lg text-left hover:bg-surface-700 transition-colors"
                        >
                          <p className="text-sm text-white truncate">{deb.question}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(deb.createdAt).toLocaleDateString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* How it Works */}
          <Card className="mt-4 bg-surface-800/50 border-surface-700">
            <div className="p-4">
              <h4 className="text-sm font-medium text-white mb-3">How It Works</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <p className="text-sm text-slate-400">The Rationalist analyzes data and logical outcomes</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <p className="text-sm text-slate-400">The Intuitive considers emotions and gut feelings</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <p className="text-sm text-slate-400">The Pragmatist evaluates real-world constraints</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {debate ? (
              <motion.div
                key="debate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TrinityDebate debate={debate} />
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
                    <Users className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ready for Three Perspectives
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Enter a question or leave it blank to get a general analysis. 
                    The Trinity will debate your decision from three unique viewpoints.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
