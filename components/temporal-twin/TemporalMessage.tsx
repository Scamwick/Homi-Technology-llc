'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TemporalMessage as TemporalMessageData, Horizon } from '@/lib/temporal-twin/engine';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TemporalMessage — Displays a letter from the user's future self.
 *
 * Glass-morphism card with cyan glow border, hourglass icon header,
 * horizon tabs, and a fade-in letter animation.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface TemporalMessageProps {
  /** Messages for each horizon */
  messages: {
    fiveYear: TemporalMessageData;
    tenYear: TemporalMessageData;
    retirement: TemporalMessageData;
  };
  /** Default active tab */
  defaultHorizon?: Horizon;
}

const HORIZON_LABELS: Record<Horizon, string> = {
  '5yr': '5 Years',
  '10yr': '10 Years',
  retirement: 'Retirement',
};

const HORIZONS: Horizon[] = ['5yr', '10yr', 'retirement'];

function getMessageForHorizon(
  messages: TemporalMessageProps['messages'],
  horizon: Horizon,
): TemporalMessageData {
  switch (horizon) {
    case '5yr':
      return messages.fiveYear;
    case '10yr':
      return messages.tenYear;
    case 'retirement':
      return messages.retirement;
  }
}

export function TemporalMessage({
  messages,
  defaultHorizon = '5yr',
}: TemporalMessageProps) {
  const [activeHorizon, setActiveHorizon] = useState<Horizon>(defaultHorizon);
  const activeMessage = getMessageForHorizon(messages, activeHorizon);

  return (
    <div
      className="relative rounded-2xl p-[1px] overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(52, 211, 153, 0.2), rgba(34, 211, 238, 0.1))',
      }}
    >
      {/* Subtle glow effect */}
      <div
        className="absolute inset-0 blur-xl opacity-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(34, 211, 238, 0.4), transparent 70%)',
        }}
      />

      <div
        className="relative rounded-2xl p-6 md:p-8 backdrop-blur-xl"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl" role="img" aria-label="hourglass">
            &#x23F3;
          </span>
          <h2 className="text-lg md:text-xl font-semibold text-[#e2e8f0]">
            A Message From Your Future Self
          </h2>
        </div>

        {/* ── Horizon Tabs ── */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[rgba(30,41,59,0.6)]">
          {HORIZONS.map((horizon) => {
            const isActive = horizon === activeHorizon;
            return (
              <button
                key={horizon}
                onClick={() => setActiveHorizon(horizon)}
                className={[
                  'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium',
                  'transition-all duration-300 ease-out',
                  'focus-visible:outline-2 focus-visible:outline-[#22d3ee] focus-visible:outline-offset-2',
                  isActive
                    ? 'text-[#e2e8f0] shadow-lg'
                    : 'text-[#94a3b8] hover:text-[#e2e8f0]',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  isActive
                    ? {
                        background: 'rgba(34, 211, 238, 0.15)',
                        boxShadow: '0 0 20px rgba(34, 211, 238, 0.1)',
                      }
                    : undefined
                }
                aria-pressed={isActive}
              >
                {HORIZON_LABELS[horizon]}
              </button>
            );
          })}
        </div>

        {/* ── Message Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHorizon}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[120px]"
          >
            <p
              className="text-base md:text-lg leading-relaxed mb-6"
              style={{
                color: '#e2e8f0',
                fontStyle: 'italic',
                lineHeight: 1.8,
              }}
            >
              {activeMessage.content}
            </p>

            {/* ── Signature ── */}
            <p
              className="text-right text-base font-medium"
              style={{ color: '#22d3ee' }}
            >
              {activeMessage.signature}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
