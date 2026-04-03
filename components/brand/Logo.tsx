import Link from 'next/link';
import { ThresholdCompass } from './ThresholdCompass';
import { Wordmark } from './Wordmark';

/* ─────────────────────────────────────────────────────────────────────────────
 * Logo — Compass + Wordmark lockup.
 *
 * Horizontal layout: compass on the left, wordmark on the right, 10px gap.
 * Always links to the root route ("/").
 * ────────────────────────────────────────────────────────────────────────── */

export interface LogoProps {
  /** Scales both compass and wordmark together. Default: 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Render the wordmark beside the compass. Default: true. */
  showWordmark?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

const COMPASS_SIZE: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 24,
  md: 32,
  lg: 48,
};

const WORDMARK_SIZE: Record<NonNullable<LogoProps['size']>, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export function Logo({
  size = 'md',
  showWordmark = true,
  className,
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="HōMI — go to homepage"
      className={`inline-flex items-center gap-[10px] no-underline hover:opacity-90 transition-opacity ${className ?? ''}`.trim()}
      style={{ textDecoration: 'none' }}
    >
      <ThresholdCompass
        size={COMPASS_SIZE[size]}
        animate={false}
        showKeyhole={size !== 'sm'}
      />
      {showWordmark && <Wordmark size={WORDMARK_SIZE[size]} />}
    </Link>
  );
}

export default Logo;
