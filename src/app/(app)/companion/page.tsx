'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowLeft,
  Send,
  Sparkles,
  Settings
} from 'lucide-react'

// Companion configurations
const COMPANIONS = {
  dog: {
    name: 'Steady',
    emoji: '🐕',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.15)',
    mood: 'calm',
    description: 'Emotional grounding. Calm, warm, never saccharine.',
    thinkingPhrases: ['Taking a breath...', 'Sitting with that...', 'Here with you...'],
  },
  dolphin: {
    name: 'Clarity',
    emoji: '🐬',
    color: '#22d3ee',
    bgColor: 'rgba(34, 211, 238, 0.15)',
    mood: 'focused',
    description: 'Pattern recognition. Data-driven, uses dashes for asides.',
    thinkingPhrases: ['Spotting patterns...', 'Connecting dots...', 'Analyzing...'],
  },
  owl: {
    name: 'Horizon',
    emoji: '🦉',
    color: '#facc15',
    bgColor: 'rgba(250, 204, 21, 0.15)',
    mood: 'deep',
    description: 'Values alignment. Philosophical, asks questions that sit.',
    thinkingPhrases: ['Considering...', 'Looking deeper...', 'Reflecting...'],
  },
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  companion?: string
}

export default function CompanionPage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [companion, setCompanion] = useState<keyof typeof COMPANIONS>('dog')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const [thinkingPhrase, setThinkingPhrase] = useState('')
  const [score, setScore] = useState(58)
  const [scoreBreakdown] = useState({
    financial: 50,
    emotional: 50,
    timing: 50
  })
  const [extractedDetails, setExtractedDetails] = useState<Record<string, string>>({})
  const [showCompanionSelect, setShowCompanionSelect] = useState(false)

  // Initialize session
  useEffect(() => {
    initSession()
  }, [])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingText])

  const initSession = async () => {
    try {
      setIsLoading(true)
      
      const res = await fetch('/api/companion')
      const data = await res.json()
      
      if (data.session) {
        setSessionId(data.session.id)
        setCompanion(data.session.companion)
        setMessages(data.session.messages || [])
        setScore(data.session.score || 58)
        setExtractedDetails(data.session.extracted_details || {})
      } else {
        await createSession('dog')
      }
    } catch (error) {
      console.error('Failed to init session:', error)
      setShowCompanionSelect(true)
    } finally {
      setIsLoading(false)
    }
  }

  const createSession = async (selectedCompanion: keyof typeof COMPANIONS) => {
    try {
      const res = await fetch('/api/companion/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companion: selectedCompanion,
          score,
          scoreBreakdown
        })
      })
      
      const data = await res.json()
      
      if (data.session) {
        setSessionId(data.session.id)
        setCompanion(selectedCompanion)
        setMessages(data.session.messages || [])
        setShowCompanionSelect(false)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping || !sessionId) return
    
    const text = inputText.trim()
    setInputText('')
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    
    setIsTyping(true)
    setThinkingPhrase(
      COMPANIONS[companion].thinkingPhrases[
        Math.floor(Math.random() * COMPANIONS[companion].thinkingPhrases.length)
      ]
    )
    
    try {
      const response = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          companion,
          score,
          scoreBreakdown,
          extractedDetails
        })
      })
      
      if (!response.ok) throw new Error('API error')
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      
      setStreamingText('')
      
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'chunk' && data.text) {
                fullText += data.text
                setStreamingText(fullText)
              } else if (data.type === 'done') {
                const assistantMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: fullText,
                  timestamp: new Date().toISOString(),
                  companion
                }
                setMessages(prev => [...prev, assistantMessage])
                setStreamingText('')
              }
            } catch (e) {}
          }
        }
      }
      
    } catch (error) {
      console.error('Send error:', error)
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I hear you. That's real.",
        timestamp: new Date().toISOString(),
        companion
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
      setStreamingText('')
    }
  }

  const switchCompanion = async (newCompanion: keyof typeof COMPANIONS) => {
    if (newCompanion === companion || !sessionId) return
    
    try {
      const res = await fetch('/api/companion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          newCompanion,
          score
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setCompanion(newCompanion)
        const systemMessage: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: `Switched from ${COMPANIONS[data.previousCompanion as keyof typeof COMPANIONS].name} to ${COMPANIONS[data.newCompanion as keyof typeof COMPANIONS].name}`,
          timestamp: new Date().toISOString()
        }
        const handoffMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.handoffMessage,
          timestamp: new Date().toISOString(),
          companion: newCompanion
        }
        setMessages(prev => [...prev, systemMessage, handoffMessage])
      }
      
      setShowCompanionSelect(false)
    } catch (error) {
      console.error('Switch error:', error)
    }
  }

  const getQuickReplies = () => {
    const range = score < 40 ? 'low' : score < 70 ? 'mid' : 'high'
    const replies: Record<string, Record<string, string[]>> = {
      dog: {
        low: ['I feel overwhelmed', 'What should I do first?', 'I need encouragement'],
        mid: ['Am I making progress?', "What's next?", 'I feel stuck'],
        high: ['Am I really ready?', "I'm nervous", 'What if I regret it?'],
      },
      dolphin: {
        low: ['Break down my score', "What's the math?", "Where's the gap?"],
        mid: ['Show me patterns', 'What am I missing?', 'Optimize my path'],
        high: ['Final analysis', 'Talk timing', "What's my edge?"],
      },
      owl: {
        low: ['What is home to me?', 'Am I chasing the right thing?', 'I need perspective'],
        mid: ["What's really blocking me?", 'Help me see clearly', 'Who do I want to become?'],
        high: ['Is this the right door?', 'What changes when I decide?', 'Am I truly ready?'],
      },
    }
    return replies[companion]?.[range] || replies.dog.mid
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  // Companion selection screen
  if (showCompanionSelect) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Choose Your Companion</h1>
        <p className="text-slate-400 mb-8">Each companion brings a different perspective to your journey.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(COMPANIONS) as Array<keyof typeof COMPANIONS>).map((key) => {
            const c = COMPANIONS[key]
            return (
              <Card 
                key={key}
                className="cursor-pointer hover:border-brand-cyan/50 transition-all"
                onClick={() => createSession(key)}
              >
                <div className="p-6 text-center">
                  <div 
                    className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl"
                    style={{ backgroundColor: c.bgColor }}
                  >
                    {c.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{c.name}</h3>
                  <p className="text-sm text-slate-400">{c.description}</p>
                  <Button variant="primary" className="mt-4 w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const companionData = COMPANIONS[companion]

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: companionData.bgColor }}
          >
            {companionData.emoji}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{companionData.name}</h1>
              <Badge 
                variant={companion === 'dog' ? 'emerald' : companion === 'dolphin' ? 'cyan' : 'yellow'}
              >
                {companionData.mood}
              </Badge>
            </div>
            <p className="text-sm text-slate-400">
              {isTyping ? thinkingPhrase : 'Your AI companion'}
            </p>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={() => setShowCompanionSelect(true)}>
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-hidden mb-4 bg-surface-800/50">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg, i) => (
            <div 
              key={i}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'system' ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                  <span>— {msg.content} —</span>
                </div>
              ) : (
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-brand-cyan text-navy-900 rounded-br-md' 
                      : 'bg-surface-700 text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
          
          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-2xl bg-surface-700 text-white rounded-bl-md">
                <p className="text-sm leading-relaxed">{streamingText}</p>
                <span className="inline-block w-2 h-4 bg-brand-cyan ml-1 animate-pulse" />
              </div>
            </div>
          )}
          
          {isTyping && !streamingText && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-surface-700 rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Replies */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
        {getQuickReplies().map((text, i) => (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            onClick={() => {
              setInputText(text)
              setTimeout(() => sendMessage(), 100)
            }}
            className="whitespace-nowrap text-xs"
          >
            {text}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isTyping}
          className="flex-1"
        />
        <Button 
          onClick={sendMessage} 
          disabled={!inputText.trim() || isTyping}
          variant="primary"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Companion Switcher Modal */}
      {showCompanionSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Switch Companion</h3>
              <div className="space-y-2">
                {(Object.keys(COMPANIONS) as Array<keyof typeof COMPANIONS>).map((key) => {
                  const c = COMPANIONS[key]
                  return (
                    <button
                      key={key}
                      onClick={() => switchCompanion(key)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        key === companion 
                          ? 'bg-brand-cyan/20 border border-brand-cyan' 
                          : 'bg-surface-700 hover:bg-surface-600'
                      }`}
                    >
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="text-left">
                        <p className="font-medium text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => setShowCompanionSelect(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
