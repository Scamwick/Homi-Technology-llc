'use client';

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { TIER_LIMITS } from '@/lib/utils/constants';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PaywallModal — Subscription gate for gated features
 *
 * Slides up from the bottom when a free user tries to access a paid feature.
 * Shows tier benefits + pricing with emerald CTA.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type RequiredTier = 'plus' | 'pro';

export interface PaywallModalProps {
  /** What the user is trying to access */
  feature: string;
  /** Minimum tier required */
  requiredTier: RequiredTier;
  /** Called when the user dismisses the modal */
  onClose: () => void;
  /** Called when the user clicks upgrade — receives the target tier */
  onUpgrade?: (tier: RequiredTier) => void;
}

/* ── Tier metadata ─────────────────────────────────────────────────────── */

const TIER_META: Record<RequiredTier, {
  label: string;
  price: string;
  color: string;
  benefits: string[];
}> = {
  plus: {
    label: 'Plus',
    price: '$9.99',
    color: 'var(--cyan)',
    benefits: [
      'Unlimited assessments per month',
      '50 advisor messages per day',
      'Transformation paths',
      'PDF reports',
    ],
  },
  pro: {
    label: 'Pro',
    price: '$24.99',
    color: 'var(--emerald)',
    benefits: [
      'Everything in Plus',
      'Unlimited advisor messages',
      'Couples mode',
      'Advanced behavioral genome',
      'Priority AI responses',
    ],
  },
};

/* ── Animation variants ────────────────────────────────────────────────── */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 32 },
  },
  exit: {
    opacity: 0,
    y: 60,
    transition: { duration: 0.18 },
  },
};

/* ── Component ─────────────────────────────────────────────────────────── */

export function PaywallModal({
  feature,
  requiredTier,
  onClose,
  onUpgrade,
}: PaywallModalProps) {
  const meta = TIER_META[requiredTier];

  const handleUpgrade = useCallback(() => {
    onUpgrade?.(requiredTier);
  }, [onUpgrade, requiredTier]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{
          backgroundColor: 'rgba(10, 22, 40, 0.85)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
        aria-label={`Upgrade to ${meta.label}`}
      >
        {/* Panel — slides up from bottom */}
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md outline-none rounded-t-2xl sm:rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
            boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 flex items-center justify-center size-8 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(51,65,85,0.5)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Content */}
          <div className="p-6 pt-8 pb-8 space-y-6">
            {/* Icon + locked feature */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="flex size-14 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(52, 211, 153, 0.12))`,
                }}
              >
                <Lock size={28} style={{ color: meta.color }} />
              </div>

              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Unlock {feature}
                </h2>
                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  This feature requires a{' '}
                  <span className="font-semibold" style={{ color: meta.color }}>
                    H\u014dMI {meta.label}
                  </span>{' '}
                  subscription.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2.5">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                What you get
              </p>
              <ul className="space-y-2">
                {meta.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Check
                      size={16}
                      className="shrink-0 mt-0.5"
                      style={{ color: 'var(--emerald)' }}
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing + CTA */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="text-3xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {meta.price}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  /month
                </span>
              </div>

              <Button
                variant="cta"
                size="lg"
                fullWidth
                onClick={handleUpgrade}
                icon={<Sparkles size={18} />}
              >
                Upgrade to {meta.label}
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-sm font-medium text-center transition-colors cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--text-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--text-secondary)')
                }
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
