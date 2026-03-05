'use client'

import { useState, useEffect } from 'react'

import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { MessageComposer } from '@/components/temporal-twin/MessageComposer'
import { MessageList } from '@/components/temporal-twin/MessageList'
import { 
  Send, 
  Clock, 
  Sparkles,
  Heart,
  Lightbulb
} from 'lucide-react'

interface Message {
  id: string
  content: string
  scheduled_for: string
  delivered: boolean
  delivered_at: string | null
  category: 'reminder' | 'encouragement' | 'goal' | 'reflection' | 'question'
  created_at: string
}

export default function TemporalTwinPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/temporal-twin')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageSent = () => {
    fetchMessages()
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/temporal-twin/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== id))
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const pendingCount = messages.filter(m => !m.delivered).length
  const deliveredCount = messages.filter(m => m.delivered).length

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-cyan/50 to-brand-yellow/50 flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Temporal Twin</h1>
        </div>
        <p className="text-slate-400">
          Write messages to your future self. They&apos;ll be delivered when the time is right.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4 text-center">
            <Clock className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
        </Card>
        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4 text-center">
            <Sparkles className="w-6 h-6 text-brand-emerald mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{deliveredCount}</p>
            <p className="text-xs text-slate-400">Delivered</p>
          </div>
        </Card>
        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4 text-center">
            <Heart className="w-6 h-6 text-brand-crimson mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {messages.filter(m => m.category === 'encouragement').length}
            </p>
            <p className="text-xs text-slate-400">Encouragement</p>
          </div>
        </Card>
        <Card className="bg-surface-800/50 border-surface-700">
          <div className="p-4 text-center">
            <Lightbulb className="w-6 h-6 text-brand-yellow mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {messages.filter(m => m.category === 'goal').length}
            </p>
            <p className="text-xs text-slate-400">Goals Set</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Composer */}
        <div>
          <MessageComposer onMessageSent={handleMessageSent} />

          {/* Tips Card */}
          <Card className="mt-4 bg-gradient-to-br from-brand-cyan/10 to-brand-yellow/10 border-brand-cyan/30">
            <div className="p-4">
              <h4 className="text-sm font-medium text-white mb-3">💡 Tips for Writing</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-brand-cyan">•</span>
                  Be specific about your current situation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-cyan">•</span>
                  Ask questions you want answered later
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-cyan">•</span>
                  Include encouragement for tough times
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-cyan">•</span>
                  Set goals and check in on progress
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Right Column - Message List */}
        <div>
          <div
            className="animate-in fade-in duration-300"
          >
            <MessageList messages={messages} onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </div>
  )
}
