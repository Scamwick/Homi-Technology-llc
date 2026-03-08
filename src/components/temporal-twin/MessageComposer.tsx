'use client'

import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { getSuggestedDates, getRandomTemplate, formatDeliveryDate } from '@/lib/temporal-twin/service'
import { Send, Calendar, Sparkles, Quote } from 'lucide-react'

interface MessageComposerProps {
  onMessageSent: () => void
}

const CATEGORIES = [
  { id: 'reminder', label: 'Reminder', icon: '📌', color: 'cyan' },
  { id: 'encouragement', label: 'Encouragement', icon: '💪', color: 'emerald' },
  { id: 'goal', label: 'Goal', icon: '🎯', color: 'yellow' },
  { id: 'reflection', label: 'Reflection', icon: '🤔', color: 'purple' },
  { id: 'question', label: 'Question', icon: '❓', color: 'orange' },
] as const

export function MessageComposer({ onMessageSent }: MessageComposerProps) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<typeof CATEGORIES[number]['id']>('encouragement')
  const [scheduledFor, setScheduledFor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggestedDates = getSuggestedDates()

  const handleUseTemplate = () => {
    const template = getRandomTemplate(category)
    setContent(template)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !scheduledFor) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/temporal-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          scheduledFor,
          category,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setContent('')
      setScheduledFor('')
      onMessageSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="elevated">
      <form onSubmit={handleSubmit} className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-cyan/50 to-brand-yellow/50 flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Write to Your Future Self</h3>
            <p className="text-sm text-slate-400">Send a message to be delivered later</p>
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">Message Type</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  category === cat.id
                    ? `bg-${cat.color}-500/20 text-${cat.color}-400 border border-${cat.color}-500/30`
                    : 'bg-surface-700 text-slate-400 hover:bg-surface-600'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Content */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">Your Message</label>
            <button
              type="button"
              onClick={handleUseTemplate}
              className="text-xs text-brand-cyan hover:text-brand-cyan/30 flex items-center gap-1"
            >
              <Quote className="w-3 h-3" />
              Use Template
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something your future self will appreciate..."
            className="w-full h-32 px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-slate-500 mt-1 text-right">
            {content.length}/2000
          </p>
        </div>

        {/* Delivery Date */}
        <div className="mb-5">
          <label className="block text-sm text-slate-400 mb-2">Deliver On</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedDates.map((date) => (
              <button
                key={date.label}
                type="button"
                onClick={() => setScheduledFor(date.date)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  scheduledFor === date.date
                    ? 'bg-brand-cyan text-white'
                    : 'bg-surface-700 text-slate-400 hover:bg-surface-600'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>
          <Input
            type="datetime-local"
            value={scheduledFor ? new Date(scheduledFor).toISOString().slice(0, 16) : ''}
            onChange={(e) => setScheduledFor(new Date(e.target.value).toISOString())}
            min={new Date().toISOString().slice(0, 16)}
          />
          {scheduledFor && (
            <p className="text-sm text-brand-cyan mt-2 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Will be delivered {formatDeliveryDate(scheduledFor)}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-brand-crimson/10 border border-brand-crimson/30 rounded-lg mb-4">
            <p className="text-brand-crimson text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading || !content.trim() || !scheduledFor}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Sending to the future...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Send Message to Future Self
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
