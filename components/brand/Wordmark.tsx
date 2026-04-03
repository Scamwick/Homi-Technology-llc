'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * Wordmark — The HōMI logotype with per-letter coloring.
 *
 * Typography: Inter Black (900) — the only weight used at the wordmark level.
 * Letter map:  H → cyan   ō → emerald   M → yellow   I → cyan
 * The macron-o (U+014D) is mandatory; never render a plain 'o'.
 * ────────────────────────────────────────────────────────────────────────── */

export interface WordmarkProps {
  /** Typographic scale. Default: 'md'. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS class names. */
  className?: string;
}

const SIZE_MAP = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
} as const;

/** At larger sizes, tighten letter spacing for optical balance. */
const TRACKING_MAP: Record<string, string> = {
  sm: '-0.01em',
  md: '-0.015em',
  lg: '-0.02em',
  xl: '-0.02em',
};

/**
 * Canonical letter → color mapping. Uses CSS custom properties from tokens.css
 * with hardcoded fallbacks so the component works in isolation.
 */
const LETTERS = [
  { char: 'H', color: 'var(--cyan, #22d3ee)' },
  { char: '\u014D', color: 'var(--emerald, #34d399)' },   // ō (macron)
  { char: 'M', color: 'var(--yellow, #facc15)' },
  { char: 'I', color: 'var(--cyan, #22d3ee)' },
] as const;

export function Wordmark({ size = 'md', className }: WordmarkProps) {
  const textClass = SIZE_MAP[size];
  const tracking = TRACKING_MAP[size];

  return (
    <span
      aria-label="HōMI"
      role="img"
      className={`${textClass} ${className ?? ''}`.trim()}
      style={{
        fontFamily: 'var(--font-inter, Inter), system-ui, sans-serif',
        fontWeight: 900,
        letterSpacing: tracking,
        lineHeight: 1,
        display: 'inline-flex',
        userSelect: 'none',
      }}
    >
      {LETTERS.map(({ char, color }, i) => (
        <span key={i} style={{ color }} aria-hidden="true">
          {char}
        </span>
      ))}
    </span>
  );
}

export default Wordmark;
