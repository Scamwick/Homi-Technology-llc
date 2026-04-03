'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Shield, Heart } from 'lucide-react';
import type { ActionItem } from '@/lib/transformation/generator';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ActionItemCard — Checkable action card for the Transformation Path.
 *
 * Features:
 * - Custom emerald checkbox
 * - Difficulty badge (easy=emerald, medium=yellow, hard=amber)
 * - Duration estimate
 * - Dimension-colored left border accent
 * - Strikethrough + fade when completed
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Dimension config
// ---------------------------------------------------------------------------

const DIMENSION_CONFIG: Record<
  ActionItem['dimension'],
  { color: string; borderColor: string; Icon: typeof Shield }
> = {
  financial: {
    color: 'var(--cyan, #22d3ee)',
    borderColor: '#22d3ee',
    Icon: Shield,
  },
  emotional: {
    color: 'var(--emerald, #34d399)',
    borderColor: '#34d399',
    Icon: Heart,
  },
  timing: {
    color: 'var(--yellow, #facc15)',
    borderColor: '#facc15',
    Icon: Clock,
  },
};

// ---------------------------------------------------------------------------
// Difficulty config
// ---------------------------------------------------------------------------

const DIFFICULTY_CONFIG: Record<
  ActionItem['difficulty'],
  { label: string; bg: string; text: string }
> = {
  easy: {
    label: 'Easy',
    bg: 'rgba(52, 211, 153, 0.1)',
    text: 'var(--emerald, #34d399)',
  },
  medium: {
    label: 'Medium',
    bg: 'rgba(250, 204, 21, 0.1)',
    text: 'var(--yellow, #facc15)',
  },
  hard: {
    label: 'Hard',
    bg: 'rgba(251, 146, 60, 0.1)',
    text: 'var(--homi-amber, #fb923c)',
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ActionItemCardProps {
  item: ActionItem;
  onToggle: (id: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActionItemCard({
  item,
  onToggle,
  className = '',
}: ActionItemCardProps) {
  const dim = DIMENSION_CONFIG[item.dimension];
  const diff = DIFFICULTY_CONFIG[item.difficulty];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={[
        'group relative flex gap-4 rounded-xl border p-4',
        'backdrop-blur-[10px] transition-all duration-200',
        item.completed ? 'opacity-60' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(34, 211, 238, 0.15)',
        borderLeft: `4px solid ${dim.borderColor}`,
      }}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="mt-0.5 shrink-0 cursor-pointer transition-transform hover:scale-110"
        aria-label={
          item.completed
            ? `Mark "${item.title}" incomplete`
            : `Mark "${item.title}" complete`
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {item.completed ? (
            <motion.div
              key="checked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CheckCircle2
                size={22}
                style={{ color: 'var(--emerald, #34d399)' }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Circle
                size={22}
                className="transition-colors group-hover:text-[var(--cyan)]"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p
          className={[
            'text-sm font-semibold leading-tight transition-all duration-200',
            item.completed ? 'line-through' : '',
          ].join(' ')}
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          {item.title}
        </p>

        {/* Description */}
        <p
          className={[
            'mt-1 text-xs leading-relaxed transition-all duration-200',
            item.completed ? 'line-through' : '',
          ].join(' ')}
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          {item.description}
        </p>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Difficulty badge */}
          <span
            className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full"
            style={{ backgroundColor: diff.bg, color: diff.text }}
          >
            {diff.label}
          </span>

          {/* Duration */}
          <span
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            <Clock size={12} aria-hidden="true" />
            {item.estimatedDuration}
          </span>

          {/* Category */}
          <span
            className="text-xs"
            style={{ color: dim.color }}
          >
            {item.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
