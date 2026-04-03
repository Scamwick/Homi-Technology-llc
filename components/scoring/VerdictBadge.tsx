'use client';

import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Verdict = 'READY' | 'ALMOST_THERE' | 'BUILD_FIRST' | 'NOT_YET';

export interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  showIcon?: boolean;
}

// ---------------------------------------------------------------------------
// Verdict config
// ---------------------------------------------------------------------------

interface VerdictConfig {
  label: string;
  icon: string;
  color: string;
  glowColor: string;
  bgColor: string;
  borderColor: string;
}

const VERDICT_MAP: Record<Verdict, VerdictConfig> = {
  READY: {
    label: "You're Ready",
    icon: '\u{1F511}', // 🔑
    color: 'var(--emerald, #34d399)',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    bgColor: 'rgba(52, 211, 153, 0.08)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  ALMOST_THERE: {
    label: 'Almost There',
    icon: '\u{1F513}', // 🔓
    color: 'var(--yellow, #facc15)',
    glowColor: 'rgba(250, 204, 21, 0.35)',
    bgColor: 'rgba(250, 204, 21, 0.08)',
    borderColor: 'rgba(250, 204, 21, 0.3)',
  },
  BUILD_FIRST: {
    label: 'Build First',
    icon: '\u{1F512}', // 🔒
    color: 'var(--homi-amber, #fb923c)',
    glowColor: 'rgba(251, 146, 60, 0.35)',
    bgColor: 'rgba(251, 146, 60, 0.08)',
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  NOT_YET: {
    label: 'Not Yet',
    icon: '\u{1F6AB}', // 🚫
    color: 'var(--homi-crimson, #ef4444)',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
} as const;

const SIZE_STYLES = {
  sm: { paddingX: 10, paddingY: 4, fontSize: 12, iconSize: 14, gap: 4 },
  md: { paddingX: 16, paddingY: 8, fontSize: 14, iconSize: 18, gap: 6 },
  lg: { paddingX: 20, paddingY: 10, fontSize: 16, iconSize: 22, gap: 8 },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VerdictBadge({
  verdict,
  size = 'md',
  pulse = false,
  showIcon = true,
}: VerdictBadgeProps) {
  const config = VERDICT_MAP[verdict];
  const s = SIZE_STYLES[size];

  return (
    <motion.div
      className="relative inline-flex items-center rounded-full font-semibold select-none"
      style={{
        paddingLeft: s.paddingX,
        paddingRight: s.paddingX,
        paddingTop: s.paddingY,
        paddingBottom: s.paddingY,
        fontSize: s.fontSize,
        gap: s.gap,
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1.5px solid ${config.borderColor}`,
        lineHeight: 1,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeInOut' as const }}
      role="status"
      aria-label={`Verdict: ${config.label}`}
    >
      {/* Pulse glow ring behind the badge */}
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 14px ${config.glowColor}`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      )}

      {showIcon && (
        <span
          className="flex-shrink-0 leading-none"
          style={{ fontSize: s.iconSize }}
          aria-hidden="true"
        >
          {config.icon}
        </span>
      )}

      <span className="whitespace-nowrap tracking-wide">{config.label}</span>
    </motion.div>
  );
}
