// =============================================================================
// types/payment.ts — Payment & Subscription Types
// =============================================================================

import type { SubscriptionTier } from './user';

// ---------------------------------------------------------------------------
// Subscription Status
// ---------------------------------------------------------------------------

/**
 * Stripe subscription lifecycle states.
 * Maps directly to Stripe's subscription.status values.
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid'
  | 'paused';

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export interface Subscription {
  /** Internal subscription record ID (UUID). */
  id: string;

  /** User who owns this subscription. */
  userId: string;

  /** Current product tier. */
  tier: SubscriptionTier;

  /** Stripe Customer ID (cus_xxx). */
  stripeCustomerId: string;

  /** Stripe Subscription ID (sub_xxx). Null for free tier users. */
  stripeSubscriptionId: string | null;

  /** Current subscription status. */
  status: SubscriptionStatus;

  /** ISO 8601 timestamp of when the current billing period ends. */
  currentPeriodEnd: string;

  /** ISO 8601 timestamp of when the subscription was created. */
  createdAt: string;

  /** Whether the subscription will cancel at period end. */
  cancelAtPeriodEnd: boolean;
}

// ---------------------------------------------------------------------------
// Price Configuration
// ---------------------------------------------------------------------------

/** Pricing details for a single tier. */
export interface TierPrice {
  /** Stripe Price ID (price_xxx). Null for free tier. */
  priceId: string | null;

  /** Monthly amount in cents (USD). */
  monthlyAmountCents: number;
}

/** Complete price configuration for all tiers. */
export interface PriceConfig {
  free: TierPrice;
  plus: TierPrice;
  pro: TierPrice;
  family: TierPrice;
}

// ---------------------------------------------------------------------------
// Checkout & Billing
// ---------------------------------------------------------------------------

/** Request to create a Stripe Checkout session. */
export interface CheckoutRequest {
  tier: Exclude<SubscriptionTier, 'free'>;
  successUrl: string;
  cancelUrl: string;
}

/** Response from creating a Stripe Checkout session. */
export interface CheckoutResponse {
  /** Stripe Checkout Session URL to redirect the user to. */
  url: string;

  /** Stripe Checkout Session ID for tracking. */
  sessionId: string;
}

/** Request to create a Stripe Customer Portal session. */
export interface PortalRequest {
  returnUrl: string;
}

/** Response from creating a Stripe Customer Portal session. */
export interface PortalResponse {
  /** Stripe Portal URL to redirect the user to. */
  url: string;
}

// ---------------------------------------------------------------------------
// Webhook Events
// ---------------------------------------------------------------------------

/**
 * Stripe webhook event types we handle.
 * Subset of all Stripe events — only the ones relevant to our subscription logic.
 */
export type StripeWebhookEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed';
