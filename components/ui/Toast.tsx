'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Toast — Notification system with provider & hook
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  variant?: ToastVariant;
  title: string;
  description?: string;
  /** Auto-dismiss duration in ms (default: 5000, 0 = persistent) */
  duration?: number;
}

/* ── Color & icon mapping ───────────────────────────────────────────────── */

const variantConfig: Record<
  ToastVariant,
  { bg: string; border: string; icon: typeof CheckCircle; color: string }
> = {
  success: {
    bg: 'rgba(52, 211, 153, 0.1)',
    border: 'rgba(52, 211, 153, 0.3)',
    icon: CheckCircle,
    color: 'var(--emerald)',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: AlertCircle,
    color: 'var(--homi-crimson)',
  },
  warning: {
    bg: 'rgba(250, 204, 21, 0.1)',
    border: 'rgba(250, 204, 21, 0.3)',
    icon: AlertTriangle,
    color: 'var(--yellow)',
  },
  info: {
    bg: 'rgba(34, 211, 238, 0.1)',
    border: 'rgba(34, 211, 238, 0.3)',
    icon: Info,
    color: 'var(--cyan)',
  },
};

/* ── Context ────────────────────────────────────────────────────────────── */

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

/* ── Provider ───────────────────────────────────────────────────────────── */

export interface ToastProviderProps {
  children: ReactNode;
  /** Max visible toasts (default: 5) */
  limit?: number;
}

export function ToastProvider({ children, limit = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const counterRef = useRef(0);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${++counterRef.current}`;
      const duration = options.duration ?? 5000;

      const data: ToastData = {
        id,
        variant: options.variant ?? 'info',
        title: options.title,
        description: options.description,
        duration,
      };

      setToasts((prev) => [...prev.slice(-(limit - 1)), data]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss, limit],
  );

  const contextValue = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast viewport */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 420 }}
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} data={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ── Individual toast ───────────────────────────────────────────────────── */

interface ToastItemProps {
  data: ToastData;
  onDismiss: (id: string) => void;
}

function ToastItem({ data, onDismiss }: ToastItemProps) {
  const config = variantConfig[data.variant];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      role="status"
      className="pointer-events-auto"
    >
      <div
        className="flex items-start gap-3 p-4 rounded-xl shadow-lg"
        style={{
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <Icon
          size={20}
          className="shrink-0 mt-0.5"
          style={{ color: config.color }}
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            {data.title}
          </p>
          {data.description && (
            <p className="mt-0.5 text-xs text-[var(--text-secondary)] leading-relaxed">
              {data.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(data.id)}
          aria-label="Dismiss notification"
          className={[
            'shrink-0 flex items-center justify-center',
            'size-6 rounded-md',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            'hover:bg-[rgba(255,255,255,0.05)]',
            'transition-colors duration-[var(--duration-fast)]',
            'cursor-pointer',
          ].join(' ')}
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}
