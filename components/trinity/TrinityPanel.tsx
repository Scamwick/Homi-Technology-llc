'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { TrinityCard } from './TrinityCard';

import type { TrinityAnalysis, TrinityRole } from '@/types/trinity';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TrinityPanel — Three-card display for Trinity Engine results
 * HōMI Design System
 *
 * Desktop: Three cards side-by-side
 * Mobile:  Accordion (expand/collapse) with stagger animation
 *
 * Stagger timing: Advocate 0ms, Skeptic 300ms, Arbiter 600ms
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TrinityPanelProps {
  /** The full Trinity analysis result. null when still loading. */
  analysis: TrinityAnalysis | null;
  /** Whether the engine is currently running. */
  isLoading?: boolean;
  /** Additional class names on the wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Stagger delays per role (ms)
// ---------------------------------------------------------------------------

const STAGGER_DELAYS: Record<TrinityRole, number> = {
  advocate: 0,
  skeptic: 0.3,
  arbiter: 0.6,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TrinityPanel({
  analysis,
  isLoading = false,
  className = '',
}: TrinityPanelProps) {
  const roles: TrinityRole[] = ['advocate', 'skeptic', 'arbiter'];

  // Track which cards have "appeared" for the stagger effect
  const [visible, setVisible] = useState<Set<TrinityRole>>(new Set());

  useEffect(() => {
    if (!isLoading && analysis) {
      // Stagger the reveal of each card
      roles.forEach((role) => {
        const timeout = setTimeout(() => {
          setVisible((prev) => new Set([...prev, role]));
        }, STAGGER_DELAYS[role] * 1000);
        return () => clearTimeout(timeout);
      });
    } else if (isLoading) {
      setVisible(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, analysis]);

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {/* Desktop layout: three cards in a row */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-5">
        {roles.map((role) => {
          const perspective = analysis?.[role];
          const isCardLoading =
            isLoading || !analysis || !visible.has(role);

          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 24 }}
              animate={{
                opacity: isCardLoading ? 0.6 : 1,
                y: isCardLoading ? 12 : 0,
              }}
              transition={{
                duration: 0.5,
                delay: STAGGER_DELAYS[role],
                ease: 'easeOut' as const,
              }}
            >
              <TrinityCard
                role={role}
                content={perspective?.perspective ?? ''}
                keyPoints={perspective?.keyPoints}
                confidence={perspective?.confidence}
                isLoading={isCardLoading}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Mobile layout: accordion */}
      <div className="md:hidden space-y-3">
        {roles.map((role) => {
          const perspective = analysis?.[role];
          const isCardLoading =
            isLoading || !analysis || !visible.has(role);

          return (
            <MobileAccordionCard
              key={role}
              role={role}
              content={perspective?.perspective ?? ''}
              keyPoints={perspective?.keyPoints}
              confidence={perspective?.confidence}
              isLoading={isCardLoading}
              delay={STAGGER_DELAYS[role]}
            />
          );
        })}
      </div>

      {/* Consensus indicator */}
      {analysis && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-4 text-center"
        >
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            Trinity Consensus:{' '}
            <span
              className="font-semibold"
              style={{ color: 'var(--cyan, #22d3ee)' }}
            >
              {analysis.consensus}%
            </span>
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile accordion card
// ---------------------------------------------------------------------------

interface MobileAccordionCardProps {
  role: TrinityRole;
  content: string;
  keyPoints?: string[];
  confidence?: number;
  isLoading: boolean;
  delay: number;
}

const ROLE_COLORS: Record<TrinityRole, string> = {
  advocate: '#34d399',
  skeptic: '#facc15',
  arbiter: '#22d3ee',
};

const ROLE_LABELS: Record<TrinityRole, string> = {
  advocate: 'Advocate',
  skeptic: 'Skeptic',
  arbiter: 'Arbiter',
};

function MobileAccordionCard({
  role,
  content,
  keyPoints,
  confidence,
  isLoading,
  delay,
}: MobileAccordionCardProps) {
  const [isOpen, setIsOpen] = useState(role === 'advocate');
  const itemId = useId();
  const headerId = `${itemId}-header`;
  const panelId = `${itemId}-panel`;

  const toggle = useCallback(() => {
    if (!isLoading) setIsOpen((prev) => !prev);
  }, [isLoading]);

  const color = ROLE_COLORS[role];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' as const }}
      className="rounded-[var(--radius-lg)] overflow-hidden"
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(34, 211, 238, 0.15)',
        borderTop: `3px solid ${color}`,
      }}
    >
      {/* Trigger */}
      <button
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left cursor-pointer"
      >
        <span className="text-sm font-semibold" style={{ color }}>
          {ROLE_LABELS[role]}
        </span>
        <div className="flex items-center gap-2">
          {confidence !== undefined && !isLoading && (
            <span
              className="text-xs tabular-nums"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              {confidence}%
            </span>
          )}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown
              size={16}
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            />
          </motion.span>
        </div>
      </button>

      {/* Panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' as const }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <TrinityCard
                role={role}
                content={content}
                keyPoints={keyPoints}
                confidence={confidence}
                isLoading={isLoading}
                className="!border-0 !bg-transparent !rounded-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
