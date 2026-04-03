import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  Zap,
  Building2,
  ChevronDown,
  Shield,
  Star,
} from "lucide-react";
import { BrandedName } from "@/components/brand";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose your HōMI plan. From free assessments to unlimited AI coaching and API access for businesses.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const consumerTiers = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Get started with Decision Readiness for any major life choice.",
    cta: "Start Free",
    ctaStyle: "secondary" as const,
    popular: false,
    features: [
      "1 assessment per month (any decision type)",
      "3 basic financial tools",
      "Community support",
      "Basic H\u014DMI-Score report",
    ],
  },
  {
    name: "Plus",
    price: "$9.99",
    period: "/mo",
    description:
      "Deeper analysis and AI coaching across homes, cars, careers, investments, and more.",
    cta: "Get Plus",
    ctaStyle: "primary" as const,
    popular: true,
    features: [
      "5 assessments per month (all decision types)",
      "All financial + home buying tools",
      "AI Coach (limited sessions)",
      "Email support",
      "Detailed score breakdown by decision type",
      "Progress tracking across decisions",
    ],
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "/mo",
    description:
      "The full H\u014DMI platform \u2014 unlimited decisions, all verticals, plus the Agent.",
    cta: "Go Pro",
    ctaStyle: "primary" as const,
    popular: false,
    features: [
      "Unlimited assessments (all 26+ decision types)",
      "All tools across every category",
      "Unlimited AI Coach",
      "Full Agent platform (3 trust levels + skills)",
      "Couples mode for joint decisions",
      "Priority support",
      "Advanced behavioral genome",
      "Custom action plans per decision type",
    ],
  },
];

const comparisonFeatures: {
  category: string;
  features: { name: string; free: boolean | string; plus: boolean | string; pro: boolean | string }[];
}[] = [
  {
    category: "Assessments & Decision Types",
    features: [
      { name: "Monthly assessments", free: "1", plus: "5", pro: "Unlimited" },
      { name: "Decision types (home, car, career, business...)", free: "All", plus: "All", pro: "All 26+" },
      { name: "H\u014DMI-Score report", free: "Basic", plus: "Detailed", pro: "Advanced" },
      { name: "Decision verdict", free: true, plus: true, pro: true },
      { name: "Progress tracking across decisions", free: false, plus: true, pro: true },
      { name: "Behavioral genome analysis", free: false, plus: false, pro: true },
    ],
  },
  {
    category: "Decision Tools",
    features: [
      { name: "Financial planning tools", free: true, plus: true, pro: true },
      { name: "Home buying tools (PITI, closing costs, etc.)", free: false, plus: true, pro: true },
      { name: "Retirement tools (Roth, CoastFIRE, SS)", free: false, plus: true, pro: true },
      { name: "Business tools (runway, founder readiness)", free: false, plus: false, pro: true },
      { name: "Monte Carlo simulations", free: false, plus: false, pro: true },
      { name: "Custom scenarios", free: false, plus: false, pro: true },
    ],
  },
  {
    category: "AI Features",
    features: [
      { name: "AI Coach sessions", free: false, plus: "Limited", pro: "Unlimited" },
      { name: "Multi-decision Agent platform", free: false, plus: false, pro: true },
      { name: "Trust levels & skill unlocks", free: false, plus: false, pro: true },
      { name: "Custom action plans per decision type", free: false, plus: false, pro: true },
    ],
  },
  {
    category: "Support & Extras",
    features: [
      { name: "Community support", free: true, plus: true, pro: true },
      { name: "Email support", free: false, plus: true, pro: true },
      { name: "Priority support", free: false, plus: false, pro: true },
      { name: "Couples mode for joint decisions", free: false, plus: false, pro: true },
    ],
  },
];

const apiTiers = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    scores: "100",
    description: "For early-stage products validating decision readiness with real users.",
  },
  {
    name: "Growth",
    price: "$149",
    period: "/mo",
    scores: "1,000",
    description: "For fintech apps, lending platforms, HR tools, and dealership software.",
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/mo",
    scores: "10,000",
    description: "High-volume multi-vertical access with dedicated support and SLAs.",
  },
];

const faqItems = [
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes. You can cancel anytime from your account settings. Your access continues until the end of your current billing period. No cancellation fees, ever.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) processed securely through Stripe. We do not store your card details on our servers.",
  },
  {
    question: "Is the HōMI-Score financial advice?",
    answer:
      "No. HōMI is an educational Decision Readiness tool. We do not provide financial, investment, or lending advice. The HōMI-Score reflects readiness patterns, not recommendations. Always consult a licensed professional before making financial decisions.",
  },
  {
    question: "What happens when I hit my assessment limit?",
    answer:
      "On the Free and Plus plans, your assessment count resets at the start of each billing cycle. If you need more assessments before the reset, you can upgrade your plan at any time and the change takes effect immediately.",
  },
  {
    question: "What is the Agent platform?",
    answer:
      "The Agent platform is HōMI's AI coaching system available on the Pro plan. It uses a trust-level framework (Observer, Advisor, Executor) with unlockable skills that provide increasingly personalized guidance as you engage with the platform.",
  },
  {
    question: "How does Couples Mode work?",
    answer:
      "Couples Mode lets two users link their HōMI accounts to receive joint Decision Readiness assessments. Both partners complete individual assessments, and HōMI generates a combined score that accounts for shared finances, goals, and readiness factors.",
  },
  {
    question: "Can I switch plans mid-billing cycle?",
    answer:
      "Yes. Upgrades take effect immediately and you'll be charged a prorated amount for the remainder of the billing period. Downgrades take effect at the start of your next billing cycle.",
  },
  {
    question: "What's included in the API plans?",
    answer:
      "API plans give businesses programmatic access to the HōMI-Score engine. You send user financial and behavioral data, and receive a scored Decision Readiness assessment in return. Enterprise plans include dedicated support, custom SLAs, and higher rate limits.",
  },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function FeatureCheck({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="text-sm font-medium text-text-primary">{value}</span>
    );
  }
  return value ? (
    <Check className="mx-auto h-5 w-5 text-emerald" />
  ) : (
    <X className="mx-auto h-5 w-5 text-text-secondary/40" />
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details
      className="group border-b border-slate-dark/60 last:border-b-0"
      name="faq"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-medium text-text-primary transition-colors hover:text-cyan [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-text-secondary transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-text-secondary">
        {answer}
      </div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-navy">
      {/* Hero */}
      <section className="px-6 pt-28 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Plans that grow{" "}
            <span className="text-gradient">with your readiness</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Start free with any decision type. Upgrade for deeper analysis, AI coaching across all 26+ decisions, or API access for your business.
          </p>
        </div>
      </section>

      {/* Consumer Tier Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {consumerTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                tier.popular
                  ? "card-glass border-emerald/30 shadow-[0_0_40px_rgba(52,211,153,0.12)]"
                  : "card-glass"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald ring-1 ring-emerald/30">
                    <Star className="h-3.5 w-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-text-primary">
                    {tier.price}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {tier.period}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {tier.description}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-text-secondary"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition-all duration-200 ${
                  tier.ctaStyle === "primary"
                    ? "bg-gradient-to-r from-cyan to-emerald text-[#0a1628] hover:opacity-90 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                    : "border border-slate-mid text-text-primary hover:border-cyan hover:bg-cyan/5"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-text-primary sm:text-3xl">
          Compare every feature
        </h2>

        <div className="card-glass overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-dark/60">
                  <th className="px-6 py-4 text-left font-medium text-text-secondary">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-text-secondary">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-emerald">
                    Plus
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-text-secondary">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((group) => (
                  <Fragment key={group.category}>
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-navy/40 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-cyan"
                      >
                        {group.category}
                      </td>
                    </tr>
                    {group.features.map((feature) => (
                      <tr
                        key={feature.name}
                        className="border-b border-slate-dark/30 last:border-b-0"
                      >
                        <td className="px-6 py-3.5 text-text-secondary">
                          {feature.name}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <FeatureCheck value={feature.free} />
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <FeatureCheck value={feature.plus} />
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <FeatureCheck value={feature.pro} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* API Tiers */}
      <section className="border-t border-slate-dark/60 bg-navy-light/40 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan">
              <Building2 className="h-4 w-4" />
              For Businesses
            </div>
            <h2 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
              <BrandedName />-Score API
            </h2>
            <p className="mt-3 text-text-secondary">
              Embed Decision Readiness scoring into any product &mdash; lending, automotive, HR, education, and beyond.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {apiTiers.map((tier) => (
              <div
                key={tier.name}
                className="card-glass flex flex-col rounded-2xl p-8"
              >
                <h3 className="text-lg font-semibold text-text-primary">
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-text-primary">
                    {tier.price}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {tier.period}
                  </span>
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                  {tier.description}
                </p>

                <div className="mt-6 flex items-center gap-3 rounded-xl bg-navy/50 px-4 py-3">
                  <Zap className="h-5 w-5 text-cyan" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {tier.scores} scores
                    </p>
                    <p className="text-xs text-text-secondary">per month</p>
                  </div>
                </div>

                <Link
                  href="mailto:sales@homitechnology.com"
                  className="mt-8 block w-full rounded-full border border-slate-mid py-3 text-center text-sm font-semibold text-text-primary transition-all duration-200 hover:border-cyan hover:bg-cyan/5"
                >
                  Contact Sales
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-text-primary sm:text-3xl">
          Frequently asked questions
        </h2>

        <div className="card-glass rounded-2xl px-8 py-2">
          {faqItems.map((item, i) => (
            <FAQItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-dark/60 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <Shield className="mx-auto mb-4 h-10 w-10 text-emerald" />
          <h2 className="font-display text-2xl font-bold text-text-primary">
            Ready to know if you&apos;re ready?
          </h2>
          <p className="mt-3 text-text-secondary">
            Start with a free assessment. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-emerald px-8 py-3.5 text-sm font-semibold text-[#0a1628] transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
