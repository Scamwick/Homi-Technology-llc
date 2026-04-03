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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AI Advisor — Chat Page
 *
 * A conversational interface for the HoMI AI Advisor. Displays message
 * history, suggested prompts, and an assessment context selector.
 * Uses mock data for the initial 3 exchange pairs.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock assessments for context selector
// ---------------------------------------------------------------------------

interface MockAssessment {
  id: string;
  label: string;
  date: string;
  context: AssessmentContext;
}

const MOCK_ASSESSMENTS: MockAssessment[] = [
  {
    id: 'a1',
    label: 'Latest Assessment',
    date: '2 hours ago',
    context: {
      scores: { overall: 73, financial: 82, emotional: 61, timing: 77 },
      verdict: 'ALMOST_THERE',
    },
  },
  {
    id: 'a2',
    label: 'Previous Assessment',
    date: '2 weeks ago',
    context: {
      scores: { overall: 58, financial: 65, emotional: 48, timing: 60 },
      verdict: 'BUILD_FIRST',
    },
  },
];

// ---------------------------------------------------------------------------
// Suggested prompts
// ---------------------------------------------------------------------------

const SUGGESTED_PROMPTS = [
  'Explain my Financial Reality score',
  'Why did I get NOT YET?',
  'What should I work on first?',
  'Compare my scores to last time',
];

// ---------------------------------------------------------------------------
// Mock conversation data (3 exchange pairs)
// ---------------------------------------------------------------------------

const INITIAL_MESSAGES: AdvisorMessage[] = [
  {
    role: 'assistant',
    content:
      'Welcome to your HoMI AI Advisor session. I can see your latest assessment scored 73 — an ALMOST THERE verdict. That means you are closer than you might think.\n\nWhat would you like to explore? I can break down any of your dimension scores, explain what is holding your score back, or help you build a plan to reach READY.',
  },
  {
    role: 'user',
    content: 'Explain my Financial Reality score',
  },
  {
    role: 'assistant',
    content:
      'Your Financial Reality score of 82 is actually your strongest dimension — well done. This reflects solid metrics across your credit score, emergency fund reserves, and down payment progress.\n\nThe area pulling this dimension down slightly is your debt-to-income ratio. While it is within acceptable limits, reducing monthly debt obligations would give you more breathing room once a mortgage payment enters the picture. Even a 2-3% improvement in DTI can meaningfully affect what rates lenders offer.\n\nWould you like me to calculate how much monthly debt reduction you would need to push this into the excellent range?',
  },
  {
    role: 'user',
    content: 'Why is my emotional score so much lower?',
  },
  {
    role: 'assistant',
    content:
      'Your Emotional Truth score of 61 is your weakest dimension right now, and it is worth understanding why — because this is often the dimension people overlook.\n\nThe score reflects three key signals: your confidence level in this decision is moderate rather than strong, there is some partner alignment work to do, and the FOMO pressure indicator suggests external forces may be influencing your timeline more than you realize.\n\nHere is the thing most people miss: emotional readiness is not about feeling perfectly calm. It is about making this decision from a position of clarity rather than pressure. I would suggest having a focused conversation with your partner about shared expectations and timeline. That single action often moves this score by 10-15 points.\n\nWant to explore what a realistic timeline looks like for improving this dimension?',
  },
  {
    role: 'user',
    content: 'What should I work on first?',
  },
  {
    role: 'assistant',
    content:
      'Based on your assessment, here is your priority stack:\n\n1. **Partner Alignment Conversation** — This is your highest-leverage action. A single honest conversation about shared expectations, timeline preferences, and financial comfort zones can dramatically improve your Emotional Truth score. Schedule it this week.\n\n2. **FOMO Audit** — Take 15 minutes to write down every external pressure pushing you to buy sooner: friends buying, family expectations, market anxiety. Seeing them on paper helps separate genuine readiness from pressure-driven urgency.\n\n3. **DTI Optimization** — You are close. Look for one monthly expense to eliminate or reduce. Even $200/month changes your debt-to-income picture meaningfully.\n\nYour Financial Reality is already strong and your Timing is solid. The path from ALMOST THERE to READY runs primarily through emotional readiness. Focus there first.',
  },
];

// ---------------------------------------------------------------------------
// Mock response generator (client-side, simulates streaming)
// ---------------------------------------------------------------------------

function getMockAdvisorResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('compare') && lower.includes('last')) {
    return 'Comparing your two most recent assessments, I can see encouraging progress. Your overall score improved from 58 to 73 — a 15-point jump in two weeks.\n\nThe biggest gains came from Financial Reality (65 to 82, +17 points) and Timing (60 to 77, +17 points). Your Emotional Truth also improved, moving from 48 to 61 (+13 points), though this remains your growth area.\n\nThis trajectory is genuinely strong. If you maintain this rate of improvement, particularly in the emotional dimension, you could reach READY within the next assessment cycle. The key is to keep the momentum on the financial side while deliberately addressing the emotional factors we discussed.';
  }

  if (lower.includes('timeline') || lower.includes('how long')) {
    return 'Based on your current trajectory and the gap analysis across dimensions, here is a realistic timeline:\n\n**4-6 weeks:** Partner alignment conversation + FOMO audit should move Emotional Truth from 61 to ~72-75. This is achievable because these are behavioral actions, not financial ones — they do not require saving more money, just honest communication.\n\n**2-3 months:** DTI optimization and continued down payment savings should push Financial Reality from 82 to 88+. You are already close here.\n\n**Net timeline to READY:** Approximately 2-3 months if you execute on the emotional priorities first. The financial dimension will continue improving naturally with your current savings trajectory.\n\nWant me to break any of these milestones into specific weekly actions?';
  }

  return 'That is an important question. Based on your current scores, I can see the path forward clearly.\n\nYour strongest foundation is Financial Reality at 82, which means the concrete numbers are largely in your favor. The growth opportunity is in Emotional Truth at 61, where deliberate attention to partner alignment and reducing external pressure would have the biggest impact on your overall readiness.\n\nWould you like to explore a specific dimension in more detail, or shall we build a timeline for reaching READY?';
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

export default function AdvisorPage() {
  const [messages, setMessages] = useState<AdvisorMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<string>(
    MOCK_ASSESSMENTS[0].id,
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

      // Simulate streaming delay then add response
      await new Promise((resolve) => setTimeout(resolve, 800));

      const response = getMockAdvisorResponse(text);

      // Simulate word-by-word streaming
      let accumulated = '';
      const words = response.split(' ');

      for (let i = 0; i < words.length; i += 3) {
        const batch = words.slice(i, i + 3).join(' ');
        accumulated += (accumulated ? ' ' : '') + batch;
        const snapshot = accumulated;

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && isStreaming) {
            return [...prev.slice(0, -1), { role: 'assistant', content: snapshot }];
          }
          return [...prev, { role: 'assistant', content: snapshot }];
        });

        await new Promise((resolve) => setTimeout(resolve, 40));
      }

      setIsStreaming(false);
      inputRef.current?.focus();
    },
    [isStreaming],
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

  const currentAssessment = MOCK_ASSESSMENTS.find(
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
      {/* ── Page Header ── */}
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
              <span>{currentAssessment?.label ?? 'Select Assessment'}</span>
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
                  {MOCK_ASSESSMENTS.map((a) => (
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
                          {a.label}
                        </span>
                        <span
                          className="block text-[10px]"
                          style={{ color: 'var(--text-secondary, #94a3b8)' }}
                        >
                          Score: {a.context.scores.overall} | {a.date}
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
        </div>
      </motion.div>

      {/* ── Chat Messages ── */}
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

      {/* ── Suggested Prompts ── */}
      {messages.length <= INITIAL_MESSAGES.length && (
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

      {/* ── Input ── */}
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
