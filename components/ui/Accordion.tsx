'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Accordion — Expandable section list
 * HōMI Design System
 *
 * Usage:
 *   <Accordion>
 *     <AccordionItem title="Question">Answer</AccordionItem>
 *     <AccordionItem title="Another">Content</AccordionItem>
 *   </Accordion>
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── Root context ───────────────────────────────────────────────────────── */

interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

/* ── Accordion (root) ───────────────────────────────────────────────────── */

export type AccordionType = 'single' | 'multiple';

export interface AccordionProps {
  /** Allow one or multiple open items */
  type?: AccordionType;
  /** Initially open item IDs */
  defaultOpen?: string[];
  children: ReactNode;
  className?: string;
}

export function Accordion({
  type = 'single',
  defaultOpen = [],
  children,
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    () => new Set(defaultOpen),
  );

  const toggle = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (type === 'single') next.clear();
          next.add(id);
        }
        return next;
      });
    },
    [type],
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div
        className={['flex flex-col divide-y divide-[var(--slate)]', className]
          .filter(Boolean)
          .join(' ')}
        role="region"
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

/* ── AccordionItem ──────────────────────────────────────────────────────── */

export interface AccordionItemProps {
  /** Unique ID for this item (auto-generated if omitted) */
  id?: string;
  /** Trigger title text */
  title: string;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Body content */
  children: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

export function AccordionItem({
  id: externalId,
  title,
  icon,
  children,
  disabled = false,
}: AccordionItemProps) {
  const generatedId = useId();
  const itemId = externalId ?? generatedId;
  const ctx = useContext(AccordionContext);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!ctx) {
    throw new Error('AccordionItem must be used within <Accordion>');
  }

  const isOpen = ctx.openItems.has(itemId);
  const headerId = `${itemId}-header`;
  const panelId = `${itemId}-panel`;

  return (
    <div
      className={disabled ? 'opacity-50 pointer-events-none' : ''}
    >
      {/* Trigger */}
      <button
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => ctx.toggle(itemId)}
        className={[
          'flex w-full items-center gap-3 py-4 text-left',
          'text-sm font-medium text-[var(--text-primary)]',
          'hover:text-[var(--cyan)]',
          'transition-colors duration-[var(--duration-fast)]',
          'cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:rounded-md',
        ].join(' ')}
      >
        {icon && (
          <span className="shrink-0 text-[var(--text-secondary)]" aria-hidden="true">
            {icon}
          </span>
        )}

        <span className="flex-1">{title}</span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' as const }}
          className="shrink-0 text-[var(--text-secondary)]"
          aria-hidden="true"
        >
          <ChevronDown size={16} />
        </motion.span>
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
            <div
              ref={contentRef}
              className="pb-4 text-sm text-[var(--text-secondary)] leading-relaxed"
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
