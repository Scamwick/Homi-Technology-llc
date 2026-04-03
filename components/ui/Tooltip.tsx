'use client';

import {
  useState,
  useRef,
  useCallback,
  useId,
  useEffect,
  type ReactNode,
} from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Tooltip — Hover/tap tooltip with arrow
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  /** Text content of the tooltip */
  content: string;
  /** Which side the tooltip appears on */
  side?: TooltipSide;
  /** Delay in ms before showing (default 300) */
  delayMs?: number;
  /** Trigger element */
  children: ReactNode;
}

const positionStyles: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<TooltipSide, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--slate)] border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--slate)] border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--slate)] border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--slate)] border-y-transparent border-l-transparent',
};

export function Tooltip({
  content,
  side = 'top',
  delayMs = 300,
  children,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), delayMs);
  }, [delayMs]);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  /* Tap-to-toggle for mobile */
  const toggle = useCallback(() => {
    if (visible) {
      hide();
    } else {
      setVisible(true);
    }
  }, [visible, hide]);

  /* Clean up timeout on unmount */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onTouchStart={toggle}
    >
      <span aria-describedby={visible ? tooltipId : undefined}>
        {children}
      </span>

      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            'absolute z-50 pointer-events-none',
            'px-3 py-1.5 text-xs font-medium',
            'whitespace-nowrap rounded-[8px]',
            'bg-[var(--slate)] text-[var(--text-primary)]',
            'shadow-lg',
            'animate-[homi-tooltip-in_150ms_ease]',
            positionStyles[side],
          ].join(' ')}
        >
          {content}
          {/* Arrow */}
          <span
            aria-hidden="true"
            className={[
              'absolute w-0 h-0 border-[5px]',
              arrowStyles[side],
            ].join(' ')}
          />
        </span>
      )}

      <style>{`
        @keyframes homi-tooltip-in {
          from { opacity: 0; transform: translateX(-50%) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </span>
  );
}
