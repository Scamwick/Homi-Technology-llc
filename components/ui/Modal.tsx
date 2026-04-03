'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Modal — Overlay dialog with AnimatePresence
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the user requests close (Escape, backdrop click, X button) */
  onClose: () => void;
  /** Header title */
  title?: string;
  /** Optional description below title */
  description?: string;
  /** Body content */
  children: ReactNode;
  /** Footer actions (buttons) */
  footer?: ReactNode;
  /** Width preset */
  size?: ModalSize;
  /** Prevent closing via backdrop click */
  persistent?: boolean;
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/* ── Animation variants ─────────────────────────────────────────────────── */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.15 },
  },
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  persistent = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /* ── Focus management ──────────────────────────────────────────────── */

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Allow animation frame to render, then focus the panel
      requestAnimationFrame(() => {
        panelRef.current?.focus();
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  /* ── Escape key ────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  /* ── Body scroll lock ──────────────────────────────────────────────── */

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ── Backdrop click ────────────────────────────────────────────────── */

  const handleBackdropClick = useCallback(
    (e: MouseEvent) => {
      if (persistent) return;
      if (e.target === e.currentTarget) onClose();
    },
    [persistent, onClose],
  );

  /* ── Focus trap (Tab) ──────────────────────────────────────────────── */

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(10, 22, 40, 0.9)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-label={title}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onKeyDown={handleKeyDown}
            className={[
              'relative w-full outline-none',
              sizeMap[size],
              'rounded-xl border border-[var(--slate)]',
              'bg-[var(--navy-light)]',
              'shadow-2xl',
              'flex flex-col max-h-[85vh]',
            ].join(' ')}
          >
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className={[
                    'shrink-0 flex items-center justify-center',
                    'size-8 rounded-lg',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    'hover:bg-[var(--slate)]',
                    'transition-colors duration-[var(--duration-fast)]',
                    'cursor-pointer',
                  ].join(' ')}
                >
                  <X size={18} />
                </button>
              </div>

            {/* ── Body ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {/* ── Footer ──────────────────────────────────────────── */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--slate)]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
