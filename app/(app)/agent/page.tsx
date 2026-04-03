'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Undo2,
  Inbox,
  CalendarClock,
  Search,
  Settings2,
  Shield,
  Eye,
  Zap,
} from 'lucide-react';
import { ThresholdCompass, BrandedName } from '@/components/brand';
import { Button, Input, Badge, Card } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Agent — Trust-first AI chat interface. The moat.
 *
 * - Left sidebar (280px desktop): status, skills, trust level, activity
 * - Main chat with receipt-enabled agent messages
 * - Onboarding flow for first-time users
 * - Mock responses with simulated typing delay
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TrustLevel = 'suggest' | 'supervised' | 'autonomous';

interface ReceiptData {
  action: string;
  reasoning: string;
  clarity: number;
  alignment: number;
  timing: number;
  confidence: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  receipt?: ReceiptData;
}

interface Skill {
  name: string;
  icon: typeof Inbox;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const DEFAULT_SKILLS: Skill[] = [
  { name: 'Inbox Manager', icon: Inbox, active: true },
  { name: 'Schedule Optimizer', icon: CalendarClock, active: true },
  { name: 'Deep Research', icon: Search, active: true },
];

const TRUST_DESCRIPTIONS: Record<TrustLevel, string> = {
  suggest: 'Agent recommends actions. You approve everything.',
  supervised: 'Agent acts with your pre-approval on routine tasks.',
  autonomous: 'Agent acts independently. Full receipts always provided.',
};

const MOCK_RESPONSES: { content: string; receipt: ReceiptData }[] = [
  {
    content:
      "Based on your financial dimension score of 82, you're in strong shape for a home purchase. Your debt-to-income ratio is healthy at 28%, and you have 4.2 months of emergency fund saved. I'd recommend pushing to 6 months before any major commitment \u2014 whether it's a home, a car, or starting a business. Want me to model the timeline for that?",
    receipt: {
      action: 'Financial analysis and recommendation',
      reasoning:
        'User has strong financial metrics but below the 6-month emergency fund threshold recommended for major financial decisions.',
      clarity: 88,
      alignment: 76,
      timing: 72,
      confidence: 91,
    },
  },
  {
    content:
      "I've analyzed your career change readiness. Your current savings runway of 8.4 months exceeds the recommended 6-month buffer for career transitions. However, your emotional readiness score of 61 suggests some unresolved concerns about the switch. Research shows that career changers who score below 70 on emotional readiness are 2.4x more likely to regret their timing. Want me to dig deeper into what's driving that?",
    receipt: {
      action: 'Career change readiness analysis',
      reasoning:
        'Financial metrics support a transition, but emotional readiness is a flag. Presenting data without pressure to act or stay.',
      clarity: 92,
      alignment: 84,
      timing: 81,
      confidence: 87,
    },
  },
  {
    content:
      "Looking at your business launch readiness, your startup capital covers approximately 7 months of projected burn rate \u2014 below the 12-month runway we recommend. On the emotional dimension (currently 61/100), the main area to address is partner alignment on risk tolerance. Would you like me to model different funding scenarios, or prepare a conversation guide for aligning with your partner?",
    receipt: {
      action: 'Business launch readiness analysis',
      reasoning:
        'Financial runway is below recommended threshold for new businesses. Emotional score flagged for partner alignment. Offering both financial modeling and relationship tools.',
      clarity: 79,
      alignment: 68,
      timing: 65,
      confidence: 82,
    },
  },
];

const QUICK_REPLIES = [
  'Analyze my home readiness',
  'Am I ready to start a business?',
  'Should I change careers now?',
  'Run a Monte Carlo simulation',
  'How does my score compare?',
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full"
          style={{ backgroundColor: 'var(--text-secondary, #94a3b8)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut' as const,
          }}
        />
      ))}
    </div>
  );
}

function ReceiptPanel({ receipt }: { receipt: ReceiptData }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div
        className="mt-3 rounded-lg p-4 space-y-3"
        style={{
          backgroundColor: 'rgba(10, 22, 40, 0.6)',
          border: '1px solid rgba(34, 211, 238, 0.1)',
        }}
      >
        <div className="space-y-1">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--cyan, #22d3ee)' }}
          >
            Action Receipt
          </p>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            {receipt.action}
          </p>
        </div>

        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          {receipt.reasoning}
        </p>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Clarity', value: receipt.clarity },
            { label: 'Alignment', value: receipt.alignment },
            { label: 'Timing', value: receipt.timing },
            { label: 'Confidence', value: receipt.confidence },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p
                className="text-lg font-bold tabular-nums"
                style={{
                  color:
                    s.value >= 80
                      ? 'var(--emerald, #34d399)'
                      : s.value >= 65
                        ? 'var(--yellow, #facc15)'
                        : 'var(--homi-amber, #fb923c)',
                }}
              >
                {s.value}%
              </p>
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity hover:opacity-80"
          style={{ color: 'var(--homi-crimson, #ef4444)' }}
        >
          <Undo2 size={12} />
          Undo this action
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AgentPage() {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [trustLevel, setTrustLevel] = useState<TrustLevel>('supervised');
  const [expandedReceipts, setExpandedReceipts] = useState<Set<string>>(
    new Set(),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<0 | 1 | 2 | 3>(0);
  const [userName, setUserName] = useState('');
  const isOnboarding = messages.length === 0 && onboardingStep < 3;

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Toggle receipt
  function toggleReceipt(id: string) {
    setExpandedReceipts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Send message
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsTyping(true);

      // Simulate delay then respond with mock
      const delay = 1200 + Math.random() * 800;
      setTimeout(() => {
        const mock = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
        const agentMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'agent',
          content: mock.content,
          timestamp: new Date(),
          receipt: mock.receipt,
        };
        setMessages((prev) => [...prev, agentMsg]);
        setMockIndex((i) => i + 1);
        setIsTyping(false);
      }, delay);
    },
    [isTyping, mockIndex],
  );

  // Complete onboarding
  function finishOnboarding() {
    setOnboardingStep(3);
    const agentMsg: ChatMessage = {
      id: `a-welcome`,
      role: 'agent',
      content: `Welcome${userName ? `, ${userName}` : ''}! I'm your H\u014DMI Agent. I can help you evaluate readiness for any major life decision \u2014 buying a home, starting a business, changing careers, planning retirement, and more. I operate in ${trustLevel} mode \u2014 every action comes with a full receipt you can review and undo. What decision are you thinking about?`,
      timestamp: new Date(),
      receipt: {
        action: 'Session initialization',
        reasoning: `Trust level set to ${trustLevel}. Introducing capabilities and inviting first interaction.`,
        clarity: 95,
        alignment: 90,
        timing: 88,
        confidence: 97,
      },
    };
    setMessages([agentMsg]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(inputValue);
  }

  // Trust level options
  const trustOptions: { value: TrustLevel; label: string; Icon: typeof Shield }[] = [
    { value: 'suggest', label: 'Suggest', Icon: Shield },
    { value: 'supervised', label: 'Supervised', Icon: Eye },
    { value: 'autonomous', label: 'Autonomous', Icon: Zap },
  ];

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden -m-6">
      {/* ════════════════════════════════════════════════════════════════════
         LEFT SIDEBAR (280px, hidden on mobile)
         ════════════════════════════════════════════════════════════════════ */}
      <aside
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:relative z-30 lg:z-auto
          w-[280px] shrink-0 h-full
          flex flex-col gap-6 p-5 overflow-y-auto
          transition-transform duration-200
        `}
        style={{
          backgroundColor: 'rgba(10, 22, 40, 0.95)',
          borderRight: '1px solid rgba(34, 211, 238, 0.08)',
        }}
      >
        {/* Agent status */}
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
          >
            <Bot
              size={20}
              style={{ color: 'var(--emerald, #34d399)' }}
            />
          </div>
          <div>
            <p
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              <BrandedName /> Agent
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: 'var(--emerald, #34d399)' }}
              />
            </p>
            <Badge variant="success" dot>
              {trustLevel.charAt(0).toUpperCase() + trustLevel.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Installed skills */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            Installed Skills
          </p>
          <ul className="space-y-2">
            {DEFAULT_SKILLS.map((skill) => (
              <li
                key={skill.name}
                className="flex items-center gap-2.5 text-sm"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              >
                <skill.icon
                  size={16}
                  style={{ color: 'var(--cyan, #22d3ee)' }}
                />
                {skill.name}
              </li>
            ))}
          </ul>
          <a
            href="/agent/skills"
            className="inline-block mt-2 text-xs transition-opacity hover:opacity-80"
            style={{ color: 'var(--cyan, #22d3ee)' }}
          >
            Manage Skills
          </a>
        </div>

        {/* Trust level selector */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            Trust Level
          </p>
          <div className="space-y-2">
            {trustOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="trust-level"
                  value={opt.value}
                  checked={trustLevel === opt.value}
                  onChange={() => setTrustLevel(opt.value)}
                  className="sr-only"
                />
                <span
                  className="flex size-4 items-center justify-center rounded-full border-2 transition-colors"
                  style={{
                    borderColor:
                      trustLevel === opt.value
                        ? 'var(--emerald, #34d399)'
                        : 'var(--text-secondary, #94a3b8)',
                  }}
                >
                  {trustLevel === opt.value && (
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: 'var(--emerald, #34d399)',
                      }}
                    />
                  )}
                </span>
                <opt.Icon
                  size={14}
                  style={{
                    color:
                      trustLevel === opt.value
                        ? 'var(--emerald, #34d399)'
                        : 'var(--text-secondary, #94a3b8)',
                  }}
                />
                <span
                  className="text-sm"
                  style={{
                    color:
                      trustLevel === opt.value
                        ? 'var(--text-primary, #e2e8f0)'
                        : 'var(--text-secondary, #94a3b8)',
                  }}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
          <p
            className="mt-2 text-xs leading-relaxed"
            style={{ color: 'rgba(148, 163, 184, 0.7)' }}
          >
            {TRUST_DESCRIPTIONS[trustLevel]}
          </p>
        </div>

        {/* Activity summary */}
        <div
          className="mt-auto rounded-lg p-3"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(34, 211, 238, 0.08)',
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            Today
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            12 actions taken
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--emerald, #34d399)' }}
          >
            100% receipted
          </p>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
         MAIN CHAT AREA
         ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div
          className="flex items-center gap-3 px-4 py-3 lg:hidden"
          style={{
            borderBottom: '1px solid rgba(34, 211, 238, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer"
          >
            <Settings2
              size={20}
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            />
          </button>
          <Bot
            size={20}
            style={{ color: 'var(--emerald, #34d399)' }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            <BrandedName /> Agent
          </span>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* ── Onboarding ── */}
          {isOnboarding && (
            <div className="flex items-center justify-center h-full">
              <Card padding="lg" className="max-w-md w-full">
                <div className="flex flex-col items-center gap-6 text-center">
                  <ThresholdCompass
                    size={80}
                    financial={82}
                    emotional={61}
                    timing={77}
                    animate
                    showKeyhole={false}
                  />

                  <AnimatePresence mode="wait">
                    {onboardingStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4 w-full"
                      >
                        <h2
                          className="text-lg font-bold"
                          style={{ color: 'var(--text-primary, #e2e8f0)' }}
                        >
                          Welcome to your <BrandedName /> Agent
                        </h2>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--text-secondary, #94a3b8)' }}
                        >
                          A trust-first AI for every major life decision. Shows its work on every action.
                        </p>
                        <Button
                          variant="cta"
                          fullWidth
                          onClick={() => setOnboardingStep(1)}
                        >
                          Get Started
                        </Button>
                      </motion.div>
                    )}

                    {onboardingStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4 w-full"
                      >
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-primary, #e2e8f0)' }}
                        >
                          What should I call you?
                        </p>
                        <Input
                          placeholder="Your first name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          fullWidth
                        />
                        <Button
                          variant="cta"
                          fullWidth
                          onClick={() => setOnboardingStep(2)}
                        >
                          Continue
                        </Button>
                      </motion.div>
                    )}

                    {onboardingStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4 w-full"
                      >
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-primary, #e2e8f0)' }}
                        >
                          How much autonomy?
                        </p>
                        <div className="space-y-3 text-left">
                          {trustOptions.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-start gap-3 cursor-pointer rounded-lg p-3 transition-colors"
                              style={{
                                backgroundColor:
                                  trustLevel === opt.value
                                    ? 'rgba(52, 211, 153, 0.08)'
                                    : 'transparent',
                                border: `1px solid ${
                                  trustLevel === opt.value
                                    ? 'rgba(52, 211, 153, 0.3)'
                                    : 'rgba(148, 163, 184, 0.1)'
                                }`,
                              }}
                            >
                              <input
                                type="radio"
                                name="onboard-trust"
                                value={opt.value}
                                checked={trustLevel === opt.value}
                                onChange={() => setTrustLevel(opt.value)}
                                className="sr-only"
                              />
                              <opt.Icon
                                size={18}
                                className="mt-0.5 shrink-0"
                                style={{
                                  color:
                                    trustLevel === opt.value
                                      ? 'var(--emerald, #34d399)'
                                      : 'var(--text-secondary, #94a3b8)',
                                }}
                              />
                              <div>
                                <p
                                  className="text-sm font-semibold"
                                  style={{
                                    color: 'var(--text-primary, #e2e8f0)',
                                  }}
                                >
                                  {opt.label}
                                </p>
                                <p
                                  className="text-xs mt-0.5"
                                  style={{
                                    color: 'var(--text-secondary, #94a3b8)',
                                  }}
                                >
                                  {TRUST_DESCRIPTIONS[opt.value]}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <Button
                          variant="cta"
                          fullWidth
                          onClick={finishOnboarding}
                        >
                          Let&apos;s go
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </div>
          )}

          {/* ── Chat Messages ── */}
          {!isOnboarding &&
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] lg:max-w-[65%] ${
                    msg.role === 'user' ? '' : 'flex gap-3'
                  }`}
                >
                  {/* Agent avatar + compass */}
                  {msg.role === 'agent' && (
                    <div className="shrink-0 mt-1">
                      <ThresholdCompass
                        size={36}
                        financial={msg.receipt?.clarity}
                        emotional={msg.receipt?.alignment}
                        timing={msg.receipt?.timing}
                        animate={false}
                        showKeyhole={false}
                      />
                    </div>
                  )}

                  <div>
                    {/* Message bubble */}
                    <div
                      className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                      style={
                        msg.role === 'user'
                          ? {
                              backgroundColor: 'rgba(30, 41, 59, 0.8)',
                              border: '1px solid rgba(34, 211, 238, 0.2)',
                              color: 'var(--text-primary, #e2e8f0)',
                            }
                          : {
                              backgroundColor: 'rgba(30, 41, 59, 0.5)',
                              border: '1px solid rgba(148, 163, 184, 0.08)',
                              color: 'var(--text-primary, #e2e8f0)',
                            }
                      }
                    >
                      {msg.content}

                      {/* View Receipt button */}
                      {msg.receipt && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleReceipt(msg.id)}
                            className="flex items-center gap-1 mt-3 text-xs cursor-pointer transition-opacity hover:opacity-80"
                            style={{ color: 'var(--cyan, #22d3ee)' }}
                          >
                            {expandedReceipts.has(msg.id) ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                            {expandedReceipts.has(msg.id)
                              ? 'Hide Receipt'
                              : 'View Receipt'}
                          </button>

                          <AnimatePresence>
                            {expandedReceipts.has(msg.id) && (
                              <ReceiptPanel receipt={msg.receipt} />
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.role === 'user' ? 'text-right' : ''
                      }`}
                      style={{ color: 'rgba(148, 163, 184, 0.5)' }}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[65%]">
                <div className="shrink-0 mt-1">
                  <ThresholdCompass
                    size={36}
                    animate
                    showKeyhole={false}
                  />
                </div>
                <div
                  className="rounded-xl"
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.08)',
                  }}
                >
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}

          {/* Quick replies */}
          {!isOnboarding && !isTyping && messages.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => sendMessage(qr)}
                  className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'rgba(34, 211, 238, 0.06)',
                    border: '1px solid rgba(34, 211, 238, 0.15)',
                    color: 'var(--cyan, #22d3ee)',
                  }}
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ── */}
        {!isOnboarding && (
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-4 py-4"
            style={{
              borderTop: '1px solid rgba(34, 211, 238, 0.08)',
              backgroundColor: 'rgba(10, 22, 40, 0.6)',
            }}
          >
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              <button
                type="button"
                className="shrink-0 cursor-pointer transition-opacity hover:opacity-80"
                aria-label="Attach file"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                <Paperclip size={20} />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message HōMI..."
                disabled={isTyping}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-secondary)] disabled:opacity-50"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              />

              <Button
                type="submit"
                variant="cta"
                size="sm"
                disabled={!inputValue.trim() || isTyping}
                icon={<Send size={16} />}
                aria-label="Send message"
              >
                Send
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
