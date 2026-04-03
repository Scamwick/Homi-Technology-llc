'use client';

import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

import type { TrinityRole } from '@/types/trinity';
import type { LucideIcon } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TrinityCard — Individual perspective card
 * HoMI Design System
 *
 * Displays a single Trinity Engine perspective (Advocate, Skeptic, or Arbiter)
 * with a colored accent border, icon header, and content area.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Role configuration
// ---------------------------------------------------------------------------

interface RoleConfig {
  label: string;
  Icon: LucideIcon;
  color: string;
  borderColor: string;
  glowBg: string;
  iconBg: string;
}

const ROLE_CONFIG: Record<TrinityRole, RoleConfig> = {
  advocate: {
    label: 'Advocate',
    Icon: Sparkles,
    color: '#34d399',
    borderColor: '#34d399',
    glowBg: 'rgba(52, 211, 153, 0.1)',
    iconBg: 'rgba(52, 211, 153, 0.15)',
  },
  skeptic: {
    label: 'Skeptic',
    Icon: AlertTriangle,
    color: '#facc15',
    borderColor: '#facc15',
    glowBg: 'rgba(250, 204, 21, 0.08)',
    iconBg: 'rgba(250, 204, 21, 0.15)',
  },
  arbiter: {
    label: 'Arbiter',
    Icon: Scale,
    color: '#22d3ee',
    borderColor: '#22d3ee',
    glowBg: 'rgba(34, 211, 238, 0.08)',
    iconBg: 'rgba(34, 211, 238, 0.15)',
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TrinityCardProps {
  /** Which Trinity role this card represents. */
  role: TrinityRole;
  /** The perspective content text. */
  content: string;
  /** Key supporting points. */
  keyPoints?: string[];
  /** Confidence score (0-100). */
  confidence?: number;
  /** Whether this card is still loading. */
  isLoading?: boolean;
  /** Additional class names. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TrinityCard({
  role,
  content,
  keyPoints,
  confidence,
  isLoading = false,
  className = '',
}: TrinityCardProps) {
  const config = ROLE_CONFIG[role];
  const { Icon } = config;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className={[
        'relative flex flex-col rounded-[var(--radius-lg)] overflow-hidden',
        'backdrop-blur-[10px]',
        'transition-all duration-[var(--duration-base)] ease-[var(--ease)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(34, 211, 238, 0.15)',
        borderTop: `3px solid ${config.borderColor}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-5 pb-3"
        style={{ background: config.glowBg }}
      >
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: config.iconBg }}
        >
          <Icon size={18} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold tracking-wide"
            style={{ color: config.color }}
          >
            {config.label}
          </h3>
        </div>
        {confidence !== undefined && !isLoading && (
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            {confidence}% confidence
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <TypingDots color={config.color} />
              <span
                className="text-xs"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                Generating {config.label.toLowerCase()} perspective...
              </span>
            </div>
            <Skeleton variant="text" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="75%" />
            <div className="mt-4" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="85%" />
          </div>
        ) : (
          <>
            {/* Perspective text — preserve paragraph breaks */}
            <div className="space-y-3">
              {content.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Key points */}
            {keyPoints && keyPoints.length > 0 && (
              <ul className="mt-4 space-y-2">
                {keyPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs leading-relaxed"
                    style={{ color: 'var(--text-secondary, #94a3b8)' }}
                  >
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Typing dots animation — shown during loading
// ---------------------------------------------------------------------------

function TypingDots({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut' as const,
          }}
        />
      ))}
    </span>
  );
}
