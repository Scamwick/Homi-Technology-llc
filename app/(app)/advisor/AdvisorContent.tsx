'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

import type { AssessmentContext, AdvisorMessage } from '@/lib/advisor/service';

/* ━━━━━��━━━━━━��━━━━━━━━━��━━━━━���━━━━━━━━━━━━━━━��━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━
 * AI Advisor — Client Chat Component
 *
 * Receives real assessment data from the server component. Streams
 * advisor responses from /api/advisor/chat.
 * ━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━���━━━━��━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━ */

interface AssessmentRow {
  id: string;
  overall_score: number | null;
  financial_score: number | null;
  emotional_score: number | null;
  timing_score: number | null;
  verdict: string | null;
  created_at: string;
}

interface Props {
  assessments: AssessmentRow[];
}

// ---------------------------------------------------------------------------
// Suggested prompts
// ---------------------------------------------------------------------------

const SUGGESTED_PROMPTS = [
  'Explain my Financial Reality score',
  'Why did I get this verdict?',
  'What should I work on first?',
  'Compare my scores to last time',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function buildContext(assessment: AssessmentRow): AssessmentContext {
  return {
    scores: {
      overall: assessment.overall_score ?? 0,
      financial: assessment.financial_score ?? 0,
      emotional: assessment.emotional_score ?? 0,
      timing: assessment.timing_score ?? 0,
    },
    verdict: assessment.verdict ?? 'NOT_YET',
  };
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdvisorContent({ assessments }: Props) {
  const welcomeMessage: AdvisorMessage = {
    role: 'assistant',
    content: assessments.length > 0
      ? `Welcome to your H\u014dMI AI Advisor session. I can see your latest assessment scored ${assessments[0].overall_score ?? '—'} with a ${assessments[0].verdict ?? 'pending'} verdict.\n\nWhat would you like to explore? I can break down any of your dimension scores, explain what is holding your score back, or help you build a plan to reach READY.`
      : 'Welcome to your H\u014dMI AI Advisor. Take an assessment first to get personalized guidance, or ask me a general question about homebuying readiness.',
  };

  const [messages, setMessages] = useState<AdvisorMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<string>(
    assessments[0]?.id ?? '',
  );
  const [showContextSelector, setShowContextSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: AdvisorMessage = {
        role: 'user',
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsStreaming(true);

      try {
        const currentAssessment = assessments.find(a => a.id === selectedAssessment);
        const assessmentContext = currentAssessment ? buildContext(currentAssessment) : undefined;

        const response = await fetch('/api/advisor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            assessmentContext,
            history: messages.slice(-10),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error('Advisor request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullText += decoder.decode(value, { stream: true });
          const snapshot = fullText;

          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && last.content !== welcomeMessage.content) {
              return [...prev.slice(0, -1), { role: 'assistant', content: snapshot }];
            }
            return [...prev, { role: 'assistant', content: snapshot }];
          });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I was unable to respond. Please try again.' },
        ]);
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [isStreaming, messages, assessments, selectedAssessment, welcomeMessage.content],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const currentAssessment = assessments.find(
    (a) => a.id === selectedAssessment,
  );

  return (
    <motion.div
      className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-4xl flex-col"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {/* \u2500\u2500 Page Header \u2500\u2500 */}
      <motion.div variants={fadeUp} className="shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              AI Advisor
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              Your personal readiness coach
            </p>
          </div>

          {/* Assessment Context Selector */}
          {assessments.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowContextSelector((p) => !p)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer"
                style={{
                  color: 'var(--text-secondary, #94a3b8)',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                }}
              >
                <MessageCircle size={14} />
                <span>
                  {currentAssessment
                    ? `Score: ${currentAssessment.overall_score ?? '\u2014'}`
                    : 'Select Assessment'}
                </span>
                <ChevronDown size={12} />
              </button>

              <AnimatePresence>
                {showContextSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg py-1"
                    style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {assessments.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setSelectedAssessment(a.id);
                          setShowContextSelector(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-[rgba(34,211,238,0.05)] cursor-pointer"
                      >
                        <div>
                          <span
                            className="font-medium"
                            style={{ color: 'var(--text-primary, #e2e8f0)' }}
                          >
                            Score: {a.overall_score ?? '\u2014'}
                          </span>
                          <span
                            className="block text-[10px]"
                            style={{ color: 'var(--text-secondary, #94a3b8)' }}
                          >
                            {a.verdict} | {formatTimeAgo(a.created_at)}
                          </span>
                        </div>
                        {a.id === selectedAssessment && (
                          <span style={{ color: 'var(--cyan, #22d3ee)' }}>
                            &#10003;
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* \u2500\u2500 Chat Messages \u2500\u2500 */}
      <motion.div
        variants={fadeUp}
        className="flex-1 overflow-y-auto pr-2"
        style={{ scrollbarGutter: 'stable' }}
      >
        <div className="space-y-4 pb-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}

          {/* Typing indicator */}
          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <TypingIndicator />
          )}

          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* \u2500\u2500 Suggested Prompts \u2500\u2500 */}
      {messages.length <= 1 && (
        <motion.div
          variants={fadeUp}
          className="shrink-0 flex flex-wrap gap-2 pb-3"
        >
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={isStreaming}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              style={{
                color: 'var(--cyan, #22d3ee)',
                background: 'rgba(34, 211, 238, 0.08)',
                border: '1px solid rgba(34, 211, 238, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34, 211, 238, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(34, 211, 238, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.2)';
              }}
            >
              <Sparkles
                size={10}
                className="inline-block mr-1"
                style={{ verticalAlign: '-1px' }}
              />
              {prompt}
            </button>
          ))}
        </motion.div>
      )}

      {/* \u2500\u2500 Input \u2500\u2500 */}
      <motion.div variants={fadeUp} className="shrink-0 pb-4">
        <form onSubmit={handleSubmit}>
          <Card padding="sm">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your readiness..."
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-sm outline-none disabled:opacity-50"
                style={{
                  color: 'var(--text-primary, #e2e8f0)',
                  minHeight: '2rem',
                  maxHeight: '6rem',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: input.trim()
                    ? 'var(--gradient-primary, linear-gradient(135deg, #22d3ee, #34d399))'
                    : 'rgba(30, 41, 59, 0.5)',
                  color: input.trim()
                    ? 'var(--navy, #0a1628)'
                    : 'var(--text-secondary, #94a3b8)',
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </Card>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ChatBubble — Individual message
// ---------------------------------------------------------------------------

function ChatBubble({ message }: { message: AdvisorMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full mt-1"
        style={{
          backgroundColor: isUser
            ? 'rgba(34, 211, 238, 0.15)'
            : 'rgba(52, 211, 153, 0.15)',
        }}
      >
        {isUser ? (
          <User size={14} style={{ color: '#22d3ee' }} />
        ) : (
          <Bot size={14} style={{ color: '#34d399' }} />
        )}
      </div>

      {/* Bubble */}
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: 'rgba(34, 211, 238, 0.08)',
                border: '1px solid rgba(34, 211, 238, 0.2)',
                color: 'var(--text-primary, #e2e8f0)',
              }
            : {
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                color: 'var(--text-primary, #e2e8f0)',
              }
        }
      >
        {/* Render markdown-style bold */}
        {message.content.split('\n').map((line, i) => {
          if (line.trim() === '') return <br key={i} />;

          // Process **bold** markers
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={j} className="font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={j}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// TypingIndicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-3"
    >
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full mt-1"
        style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}
      >
        <Bot size={14} style={{ color: '#34d399' }} />
      </div>
      <div
        className="inline-flex items-center gap-1 rounded-2xl px-4 py-3"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full"
            style={{ backgroundColor: '#34d399' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut' as const,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
