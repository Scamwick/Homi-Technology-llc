'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowDownUp,
  PiggyBank,
  Receipt,
  Home,
  BarChart3,
  FileText,
  Target,
  Search,
  ArrowLeftRight,
  GraduationCap,
  Compass,
  Briefcase,
  Clock,
  Lock,
  type LucideIcon,
} from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Tools — Financial tools hub.
 *
 * Grid of 12 tool cards. Glass-morphism cards with hover glow per tool color.
 * Each links to /tools/[slug].
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

type ToolColor = 'cyan' | 'emerald' | 'yellow';

interface Tool {
  slug: string;
  name: string;
  description: string;
  Icon: LucideIcon;
  color: ToolColor;
  placeholder?: boolean;
}

interface ToolCategory {
  name: string;
  description: string;
  color: ToolColor;
  tools: Tool[];
}

const COLOR_MAP: Record<
  ToolColor,
  {
    text: string;
    bg: string;
    border: string;
    glow: string;
    iconBg: string;
  }
> = {
  cyan: {
    text: 'var(--cyan, #22d3ee)',
    bg: 'rgba(34, 211, 238, 0.04)',
    border: 'rgba(34, 211, 238, 0.12)',
    glow: '0 0 24px rgba(34, 211, 238, 0.15)',
    iconBg: 'rgba(34, 211, 238, 0.1)',
  },
  emerald: {
    text: 'var(--emerald, #34d399)',
    bg: 'rgba(52, 211, 153, 0.04)',
    border: 'rgba(52, 211, 153, 0.12)',
    glow: '0 0 24px rgba(52, 211, 153, 0.15)',
    iconBg: 'rgba(52, 211, 153, 0.1)',
  },
  yellow: {
    text: 'var(--yellow, #facc15)',
    bg: 'rgba(250, 204, 21, 0.04)',
    border: 'rgba(250, 204, 21, 0.10)',
    glow: '0 0 24px rgba(250, 204, 21, 0.12)',
    iconBg: 'rgba(250, 204, 21, 0.1)',
  },
};

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    name: 'Financial Planning',
    description: 'Core tools for any major financial decision',
    color: 'cyan',
    tools: [
      {
        slug: 'monte-carlo',
        name: 'Monte Carlo Simulator',
        description: '10,000 scenarios stress-testing your decision',
        Icon: TrendingUp,
        color: 'cyan',
      },
      {
        slug: 'net-worth',
        name: 'Net Worth Tracker',
        description: 'Assets minus liabilities, tracked over time',
        Icon: PiggyBank,
        color: 'cyan',
        placeholder: true,
      },
      {
        slug: 'debt-payoff',
        name: 'Debt Payoff Planner',
        description: 'Avalanche vs snowball \u2014 find your fastest path',
        Icon: ArrowDownUp,
        color: 'cyan',
      },
      {
        slug: 'tax-bracket',
        name: 'Tax Bracket Analyzer',
        description: 'Marginal vs effective \u2014 know your real rate',
        Icon: Receipt,
        color: 'cyan',
        placeholder: true,
      },
    ],
  },
  {
    name: 'Home Buying',
    description: 'Purpose-built for the home purchase journey',
    color: 'emerald',
    tools: [
      {
        slug: 'piti',
        name: 'PITI Calculator',
        description: 'Principal, interest, taxes, insurance breakdown',
        Icon: Home,
        color: 'emerald',
      },
      {
        slug: 'closing-costs',
        name: 'Closing Cost Estimator',
        description: 'Know the full cost before you sign',
        Icon: FileText,
        color: 'emerald',
        placeholder: true,
      },
      {
        slug: 'rate-tracker',
        name: 'Rate Tracker',
        description: 'Current mortgage rates and your monthly impact',
        Icon: BarChart3,
        color: 'emerald',
        placeholder: true,
      },
      {
        slug: 'offer-strategy',
        name: 'Offer Strategy',
        description: 'Competitive analysis for your market',
        Icon: Target,
        color: 'emerald',
        placeholder: true,
      },
    ],
  },
  {
    name: 'Retirement',
    description: 'Planning for the long game',
    color: 'yellow',
    tools: [
      {
        slug: 'roth-conversion',
        name: 'Roth Conversion',
        description: 'Should you convert? Run the math',
        Icon: ArrowLeftRight,
        color: 'yellow',
        placeholder: true,
      },
      {
        slug: 'coastfire',
        name: 'CoastFIRE Calculator',
        description: 'When can you stop saving and coast?',
        Icon: Compass,
        color: 'yellow',
        placeholder: true,
      },
      {
        slug: '529-planner',
        name: 'College 529 Planner',
        description: 'Education savings optimization',
        Icon: GraduationCap,
        color: 'yellow',
        placeholder: true,
      },
      {
        slug: 'social-security',
        name: 'Social Security Optimizer',
        description: 'When to claim for maximum benefit',
        Icon: Clock,
        color: 'yellow',
        placeholder: true,
      },
    ],
  },
  {
    name: 'Business',
    description: 'Tools for founders and entrepreneurs',
    color: 'cyan',
    tools: [
      {
        slug: 'runway-calculator',
        name: 'Runway Calculator',
        description: 'How long until you need funding or revenue?',
        Icon: TrendingUp,
        color: 'cyan',
        placeholder: true,
      },
      {
        slug: 'founder-readiness',
        name: 'Founder Readiness Score',
        description: 'Financial and emotional preparedness to launch',
        Icon: Briefcase,
        color: 'cyan',
        placeholder: true,
      },
      {
        slug: 'burn-rate',
        name: 'Burn Rate Analyzer',
        description: 'Track spend against milestones',
        Icon: BarChart3,
        color: 'cyan',
        placeholder: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeInOut' as const },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          Decision Tools
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Calculators, simulators, and planners organized by decision type
        </p>
      </motion.div>

      {/* Categories */}
      {TOOL_CATEGORIES.map((category) => {
        const catPalette = COLOR_MAP[category.color];

        return (
          <div key={category.name} className="space-y-4">
            {/* Category header */}
            <div className="flex items-center gap-3">
              <div
                className="h-px flex-1"
                style={{ background: catPalette.border }}
              />
              <h2
                className="text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: catPalette.text }}
              >
                {category.name}
              </h2>
              <div
                className="h-px flex-1"
                style={{ background: catPalette.border }}
              />
            </div>
            <p
              className="text-xs text-center mb-2"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              {category.description}
            </p>

            {/* Tool grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {category.tools.map((tool) => {
                const palette = COLOR_MAP[tool.color];
                const isPlaceholder = tool.placeholder;

                return (
                  <motion.div key={tool.slug} variants={cardVariants}>
                    {isPlaceholder ? (
                      <div
                        className="relative h-full flex flex-col gap-4 rounded-xl p-5 backdrop-blur-[10px] opacity-60"
                        style={{
                          background: 'rgba(30, 41, 59, 0.5)',
                          border: `1px dashed ${palette.border}`,
                        }}
                      >
                        <div
                          className="flex size-11 items-center justify-center rounded-lg"
                          style={{ backgroundColor: palette.iconBg }}
                        >
                          <Lock
                            size={18}
                            style={{ color: palette.text, opacity: 0.5 }}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: 'var(--text-secondary, #94a3b8)' }}
                          >
                            {tool.name}
                          </p>
                          <p
                            className="text-xs mt-1 leading-relaxed"
                            style={{ color: 'var(--text-secondary, #94a3b8)', opacity: 0.7 }}
                          >
                            {tool.description}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-semibold tracking-wider uppercase"
                          style={{ color: palette.text, opacity: 0.5 }}
                        >
                          Coming Soon
                        </span>
                      </div>
                    ) : (
                      <Link href={`/tools/${tool.slug}`} className="block group h-full">
                        <div
                          className="relative h-full flex flex-col gap-4 rounded-xl p-5 transition-all duration-200 backdrop-blur-[10px]"
                          style={{
                            background: 'rgba(30, 41, 59, 0.8)',
                            border: `1px solid ${palette.border}`,
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.boxShadow = palette.glow;
                            el.style.borderColor = palette.text;
                            el.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.boxShadow = 'none';
                            el.style.borderColor = palette.border;
                            el.style.transform = 'translateY(0)';
                          }}
                        >
                          <div
                            className="flex size-11 items-center justify-center rounded-lg"
                            style={{ backgroundColor: palette.iconBg }}
                          >
                            <tool.Icon
                              size={22}
                              style={{ color: palette.text }}
                            />
                          </div>
                          <div className="flex-1">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: 'var(--text-primary, #e2e8f0)' }}
                            >
                              {tool.name}
                            </p>
                            <p
                              className="text-xs mt-1 leading-relaxed"
                              style={{ color: 'var(--text-secondary, #94a3b8)' }}
                            >
                              {tool.description}
                            </p>
                          </div>
                          <span
                            className="text-xs font-semibold tracking-wide uppercase transition-opacity group-hover:opacity-100 opacity-60"
                            style={{ color: palette.text }}
                          >
                            Open &rarr;
                          </span>
                        </div>
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
