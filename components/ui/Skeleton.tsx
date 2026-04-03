'use client';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Skeleton — Shimmer placeholder for loading states
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type SkeletonVariant = 'text' | 'title' | 'circle' | 'rect' | 'custom';

export interface SkeletonProps {
  /** Shape preset */
  variant?: SkeletonVariant;
  /** Override width (CSS value) */
  width?: string | number;
  /** Override height (CSS value) */
  height?: string | number;
  /** Additional classes */
  className?: string;
  /** Repeat N skeleton items */
  count?: number;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded',
  title: 'h-6 w-3/4 rounded',
  circle: 'rounded-full',
  rect: 'rounded-lg',
  custom: '',
};

const defaultSizes: Partial<Record<SkeletonVariant, { w?: number; h?: number }>> = {
  circle: { w: 40, h: 40 },
  rect: { w: undefined, h: 80 },
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  const resolvedWidth = width ?? defaultSizes[variant]?.w;
  const resolvedHeight = height ?? defaultSizes[variant]?.h;

  const style: React.CSSProperties = {
    ...(resolvedWidth != null
      ? { width: typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth }
      : {}),
    ...(resolvedHeight != null
      ? { height: typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight }
      : {}),
  };

  return (
    <>
      {items.map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={[
            'block bg-[rgba(30,41,59,0.5)]',
            'homi-skeleton-shimmer',
            variantClasses[variant],
            count > 1 && i < count - 1 ? 'mb-2' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          style={style}
        />
      ))}

      <style>{`
        @keyframes homi-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .homi-skeleton-shimmer {
          background-image: linear-gradient(
            90deg,
            rgba(30, 41, 59, 0.5) 0%,
            rgba(51, 65, 85, 0.6) 40%,
            rgba(30, 41, 59, 0.5) 80%
          );
          background-size: 200% 100%;
          animation: homi-shimmer 1.5s ease infinite;
        }
      `}</style>
    </>
  );
}
