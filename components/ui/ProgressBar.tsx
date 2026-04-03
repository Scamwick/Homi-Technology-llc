'use client';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ProgressBar — Determinate progress indicator
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type ProgressBarColor = 'cyan' | 'emerald' | 'yellow' | 'gradient';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  /** Progress value 0–100 */
  value: number;
  /** Fill color */
  color?: ProgressBarColor;
  /** Track height: sm=4px, md=8px, lg=12px */
  size?: ProgressBarSize;
  /** Show percentage label above the bar */
  showLabel?: boolean;
  /** Animate fill width on change */
  animated?: boolean;
  /** Additional classes on the wrapper */
  className?: string;
}

const sizeHeights: Record<ProgressBarSize, string> = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

const colorFills: Record<ProgressBarColor, string> = {
  cyan: 'linear-gradient(90deg, var(--cyan), var(--cyan))',
  emerald: 'linear-gradient(90deg, var(--emerald), var(--emerald))',
  yellow: 'linear-gradient(90deg, var(--yellow), var(--yellow))',
  gradient: 'linear-gradient(90deg, var(--cyan), var(--emerald))',
};

export function ProgressBar({
  value,
  color = 'cyan',
  size = 'md',
  showLabel = false,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={className}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {Math.round(clamped)}%
          </span>
        </div>
      )}

      {/* Track */}
      <div
        className="w-full overflow-hidden rounded-[9999px] bg-[var(--slate)]"
        style={{ height: sizeHeights[size] }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Fill */}
        <div
          className="h-full rounded-[9999px]"
          style={{
            width: `${clamped}%`,
            background: colorFills[color],
            transition: animated
              ? 'width 300ms cubic-bezier(0.25, 0.1, 0.25, 1)'
              : 'none',
          }}
        />
      </div>
    </div>
  );
}
