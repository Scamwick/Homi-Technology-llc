'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Bot, Send, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Message {
  role: 'ai' | 'user'
  text: string
}

const QUICK_REPLIES = [
  { label: "What's my score?",  keyword: 'score'  },
  { label: 'Am I ready?',       keyword: 'ready'  },
  { label: 'Budget tips',       keyword: 'budget' },
  { label: 'Market update',     keyword: 'market' },
]

function getAiResponse(message: string, scores: { overall: number; emotional: number; financial: number; timing: number }): string {
  const lower = message.toLowerCase()
  if (lower.includes('score'))
    return `Your HōMI Score is ${scores.overall}/100. Emotional: ${scores.emotional}, Financial: ${scores.financial}, Timing: ${scores.timing}. ${scores.overall >= 75 ? "You're performing above average — strong position to proceed." : scores.overall >= 60 ? 'You have solid foundations with a few areas to strengthen.' : 'There are key dimensions to build before committing.'}`
  if (lower.includes('market'))
    return 'Current market conditions are being factored into your timing score. Higher timing scores reflect favorable entry windows. Check your Strategy panel for the full Monte Carlo analysis.'
  if (lower.includes('ready'))
    return scores.overall >= 65
      ? `Based on your profile (${scores.overall}/100), your readiness indicators are strong. Your main opportunity: check your lowest-scoring dimension in the Strategy panel.`
      : `Your current score is ${scores.overall}/100 — just below the 65-point readiness threshold. Focus on improving your ${scores.financial < scores.emotional ? 'financial' : 'emotional'} dimension first.`
  if (lower.includes('budget'))
    return 'Stay 10–15% below your maximum approval to maintain financial flexibility. Factor monthly costs: mortgage, HOA, property taxes, insurance, and a 1% annual maintenance reserve.'
  return "Great question. Based on your HōMI profile, you're making thoughtful progress. Keep engaging with the assessment tools — each one sharpens your decision clarity."
}

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [scores, setScores] = useState({ overall: 76, emotional: 82, financial: 74, timing: 71 })
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadLatestScores()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadLatestScores = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('assessments')
      .select('overall_score, emotional_score, financial_score, timing_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) {
      setScores({ overall: data.overall_score ?? 76, emotional: data.emotional_score ?? 82, financial: data.financial_score ?? 74, timing: data.timing_score ?? 71 })
      setMessages([
        { role: 'ai', text: "Hi! I'm your HōMI AI Coach. I've analyzed your readiness profile and I'm here to help you make the best decision. What would you like to explore today?" },
        { role: 'ai', text: `Your current composite score is ${data.overall_score ?? 76}/100. ${data.emotional_score >= 70 ? 'Strong emotional alignment.' : 'Emotional alignment needs attention.'} Ask me anything.` },
      ])
    } else {
      setMessages([
        { role: 'ai', text: "Hi! I'm your HōMI AI Coach. Complete an assessment to unlock personalized coaching. Ask me anything in the meantime." },
      ])
    }
  }

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    const aiMsg: Message = { role: 'ai', text: getAiResponse(text, scores) }
    setMessages((m) => [...m, userMsg, aiMsg])
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-brand-cyan" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-1">HōMI AI Coach</h1>
          <p className="text-xs text-text-3">Personalized decision coaching</p>
        </div>
        <Badge variant="emerald" size="sm" className="ml-auto">Online</Badge>
      </div>

      {/* Chat window */}
      <Card variant="elevated" className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-brand-cyan" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] rounded-brand-sm px-3 py-2 text-sm',
              m.role === 'ai'
                ? 'bg-surface-2 border border-surface-3 text-text-2'
                : 'bg-brand-cyan/10 border border-brand-cyan/20 text-text-1'
            )}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-text-3" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </Card>

      {/* Quick replies */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q.keyword}
            onClick={() => sendMessage(q.label)}
            className="px-3 py-1.5 text-xs rounded-brand-sm border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/5 transition-colors"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask your AI Coach anything…"
          className="flex-1"
        />
        <Button variant="primary" size="sm" onClick={() => sendMessage(input)} disabled={!input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
