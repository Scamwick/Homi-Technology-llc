'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import Link from 'next/link';
import type { TemporalMessageRow } from '@/types/database';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TemporalTwinContent — Client Component
 *
 * Chat interface where users converse with their "future self." Displays
 * past messages from Supabase and sends new messages to /api/temporal-twin.
 * Uses dark navy glass-morphism design with cyan user bubbles and emerald
 * twin bubbles.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface TemporalTwinContentProps {
  initialMessages: TemporalMessageRow[];
  currentScore: number | null;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const messageFade = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TemporalTwinContent({
  initialMessages,
  currentScore,
}: TemporalTwinContentProps) {
  const [messages, setMessages] =
    useState<TemporalMessageRow[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  // Send a message to the API
  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    // Optimistic: add user message immediately
    const optimisticUserMsg: TemporalMessageRow = {
      id: `temp-${Date.now()}`,
      user_id: '',
      thread_id: '',
      role: 'user',
      content: trimmed,
      receipt_id: null,
      metadata: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInput('');
    setIsSending(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/temporal-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Replace optimistic user message with server version and add agent reply
      setMessages((prev) => {
        const withoutOptimistic = prev.filter(
          (m) => m.id !== optimisticUserMsg.id,
        );
        const serverMessages: TemporalMessageRow[] = Array.isArray(
          data.messages,
        )
          ? data.messages
          : data.message
            ? [data.message]
            : [];
        return [...withoutOptimistic, ...serverMessages];
      });
    } catch {
      // On error, add an error message from the system
      const errorMsg: TemporalMessageRow = {
        id: `error-${Date.now()}`,
        user_id: '',
        thread_id: '',
        role: 'system',
        content:
          'Something went wrong sending your message. Please try again.',
        receipt_id: null,
        metadata: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  }

  // Handle Enter key (Shift+Enter for newline)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Empty state: no assessment ──
  if (currentScore === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col items-center justify-center text-center py-20"
        >
          <div
            className="rounded-2xl border p-8 md:p-12 backdrop-blur-xl"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderColor: 'rgba(34, 211, 238, 0.1)',
            }}
          >
            <span
              className="text-5xl block mb-6"
              role="img"
              aria-label="hourglass"
            >
              &#x23F3;
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#e2e8f0] mb-4">
              Meet Your Temporal Twin
            </h1>
            <p className="text-[#94a3b8] text-base md:text-lg mb-8 max-w-md leading-relaxed">
              Take an assessment first to meet your Temporal Twin. Your future
              self has something to tell you — but they need to know where you
              stand today.
            </p>
            <Link
              href="/assess/new"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: '#22d3ee',
                color: '#0a1628',
              }}
            >
              Take Your First Assessment
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main chat interface ──
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 flex flex-col h-[calc(100vh-6rem)]">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-shrink-0 mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" role="img" aria-label="hourglass">
            &#x23F3;
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e2e8f0]">
            Temporal Twin
          </h1>
        </div>
        <p className="text-[#94a3b8] text-base md:text-lg">
          Converse with who you&apos;ll become. Your future self has something to
          tell you.
        </p>
      </motion.div>

      {/* ── Chat Messages ── */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl border p-4 md:p-6 mb-4 backdrop-blur-xl"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderColor: 'rgba(34, 211, 238, 0.1)',
        }}
      >
        {messages.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <span
              className="text-4xl block mb-4"
              role="img"
              aria-label="crystal ball"
            >
              &#x1F52E;
            </span>
            <p className="text-[#94a3b8] text-sm max-w-sm leading-relaxed">
              Your Temporal Twin is ready. Send a message to begin a
              conversation with your future self. Ask about your journey, your
              decisions, or what lies ahead.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial="hidden"
                  animate="visible"
                  variants={messageFade}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'rounded-br-md'
                        : msg.role === 'system'
                          ? 'rounded-bl-md'
                          : 'rounded-bl-md'
                    }`}
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'rgba(34, 211, 238, 0.15)',
                            borderWidth: '1px',
                            borderColor: 'rgba(34, 211, 238, 0.25)',
                          }
                        : msg.role === 'system'
                          ? {
                              background: 'rgba(239, 68, 68, 0.1)',
                              borderWidth: '1px',
                              borderColor: 'rgba(239, 68, 68, 0.2)',
                            }
                          : {
                              background: 'rgba(52, 211, 153, 0.1)',
                              borderWidth: '1px',
                              borderColor: 'rgba(52, 211, 153, 0.2)',
                            }
                    }
                  >
                    {/* Role label */}
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                      style={{
                        color:
                          msg.role === 'user'
                            ? '#22d3ee'
                            : msg.role === 'system'
                              ? '#ef4444'
                              : '#34d399',
                      }}
                    >
                      {msg.role === 'user'
                        ? 'You'
                        : msg.role === 'system'
                          ? 'System'
                          : 'Future You'}
                    </p>

                    {/* Message content */}
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: '#e2e8f0' }}
                    >
                      {msg.content}
                    </p>

                    {/* Timestamp */}
                    <p
                      className="text-[10px] mt-2 opacity-60"
                      style={{ color: '#94a3b8' }}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Area ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex-shrink-0"
      >
        <div
          className="flex items-end gap-3 rounded-2xl border p-3 backdrop-blur-xl"
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderColor: 'rgba(34, 211, 238, 0.1)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message your future self..."
            rows={1}
            disabled={isSending}
            className="flex-1 resize-none bg-transparent text-sm text-[#e2e8f0] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
            style={{
              background: 'rgba(34, 211, 238, 0.15)',
              color: '#22d3ee',
            }}
            aria-label="Send message"
          >
            {isSending ? (
              <div
                className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#64748b] mt-2 text-center">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </motion.div>
    </div>
  );
}
