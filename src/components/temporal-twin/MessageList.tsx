'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDeliveryDate } from '@/lib/temporal-twin/service'
import {
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Mail,
  Quote
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

interface MessageListProps {
  messages: Message[]
  onDelete: (id: string) => void
}

const categoryConfig: Record<Message['category'], { label: string; icon: string; color: string }> = {
  reminder: { label: 'Reminder', icon: '📌', color: 'cyan' },
  encouragement: { label: 'Encouragement', icon: '💪', color: 'emerald' },
  goal: { label: 'Goal', icon: '🎯', color: 'yellow' },
  reflection: { label: 'Reflection', icon: '🤔', color: 'purple' },
  question: { label: 'Question', icon: '❓', color: 'orange' },
}

export function MessageList({ messages, onDelete }: MessageListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const pendingMessages = messages.filter(m => !m.delivered)
  const deliveredMessages = messages.filter(m => m.delivered)

  const renderMessage = (message: Message, index: number) => {
    const config = categoryConfig[message.category]
    const isExpanded = expandedId === message.id
    const isDelivered = message.delivered

    return (
      <div
        key={message.id}
        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <Card 
          className={`transition-all ${
            isDelivered 
              ? 'bg-emerald-500/5 border-emerald-500/20' 
              : 'bg-surface-800 border-surface-700'
          }`}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg bg-${config.color}-500/10 flex items-center justify-center flex-shrink-0 text-lg`}>
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge
                    variant="emerald"
                    className="text-xs"
                  >
                    {isDelivered ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Delivered
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {config.label}
                  </span>
                </div>

                {/* Message Preview */}
                <p className={`text-sm ${isDelivered ? 'text-slate-300' : 'text-white'} line-clamp-2`}>
                  {message.content}
                </p>

                {/* Delivery Info */}
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  {isDelivered ? (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Delivered {new Date(message.delivered_at!).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Calendar className="w-3 h-3" />
                      {formatDeliveryDate(message.scheduled_for)}
                    </span>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-surface-700 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-surface-700/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Quote className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Written on {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : message.id)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  {isExpanded ? 'Less' : 'More'}
                </button>
                {!isDelivered && (
                  <button
                    onClick={() => onDelete(message.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Messages */}
      {pendingMessages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            On Their Way ({pendingMessages.length})
          </h3>
          <div className="space-y-3">
            {pendingMessages.map((message, index) => renderMessage(message, index))}
          </div>
        </div>
      )}

      {/* Delivered Messages */}
      {deliveredMessages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Delivered ({deliveredMessages.length})
          </h3>
          <div className="space-y-3 opacity-70">
            {deliveredMessages.map((message, index) => renderMessage(message, index))}
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400">No messages yet</p>
          <p className="text-slate-500 text-sm">Write your first message to your future self!</p>
        </Card>
      )}
    </div>
  )
}
