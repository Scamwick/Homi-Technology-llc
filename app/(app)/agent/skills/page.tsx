'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Download,
  CheckCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Skills Marketplace — Extend your agent's capabilities
 * HōMI Agent Platform
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type Category =
  | 'all'
  | 'productivity'
  | 'finance'
  | 'lifestyle'
  | 'smart home'
  | 'developer';

type TrustLevel = 'suggest' | 'supervised' | 'autonomous';

interface Skill {
  id: string;
  name: string;
  emoji: string;
  category: Exclude<Category, 'all'>;
  description: string;
  installs: string;
  rating: number;
  verified: boolean;
}

const SKILLS: Skill[] = [
  {
    id: 'inbox-manager',
    name: 'Inbox Manager',
    emoji: '\u{1F4EC}',
    category: 'productivity',
    description: 'Triage, summarize, draft replies. Auto-archive noise.',
    installs: '12.4K',
    rating: 4.9,
    verified: true,
  },
  {
    id: 'schedule-optimizer',
    name: 'Schedule Optimizer',
    emoji: '\u{1F4C5}',
    category: 'productivity',
    description: 'Find conflicts, suggest blocks, protect deep work.',
    installs: '8.1K',
    rating: 4.7,
    verified: true,
  },
  {
    id: 'spending-analyst',
    name: 'Spending Analyst',
    emoji: '\u{1F4B3}',
    category: 'finance',
    description: 'Track patterns, flag anomalies, forecast cashflow.',
    installs: '15.2K',
    rating: 4.8,
    verified: true,
  },
  {
    id: 'travel-planner',
    name: 'Travel Planner',
    emoji: '\u{2708}\u{FE0F}',
    category: 'lifestyle',
    description: 'Research, compare, book. Knows your preferences.',
    installs: '6.7K',
    rating: 4.6,
    verified: true,
  },
  {
    id: 'deep-research',
    name: 'Deep Research',
    emoji: '\u{1F50D}',
    category: 'productivity',
    description: 'Multi-source research with citations and summaries.',
    installs: '21.3K',
    rating: 4.9,
    verified: true,
  },
  {
    id: 'home-control',
    name: 'Home Control',
    emoji: '\u{1F3E0}',
    category: 'smart home',
    description: 'Lights, climate, routines. Works with HomeKit & Hue.',
    installs: '4.2K',
    rating: 4.5,
    verified: true,
  },
  {
    id: 'wellness-check',
    name: 'Wellness Check',
    emoji: '\u{1F9D8}',
    category: 'lifestyle',
    description: 'Track habits, hydration, sleep patterns. Gentle nudges.',
    installs: '3.8K',
    rating: 4.4,
    verified: true,
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    emoji: '\u{26A1}',
    category: 'developer',
    description: 'Debug, refactor, explain. Runs sandboxed scripts.',
    installs: '18.9K',
    rating: 4.8,
    verified: true,
  },
];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Finance', value: 'finance' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Smart Home', value: 'smart home' },
  { label: 'Developer', value: 'developer' },
];

const TRUST_LEVELS: { label: string; value: TrustLevel; description: string }[] = [
  { label: 'Suggest', value: 'suggest', description: 'Recommends actions' },
  { label: 'Supervised', value: 'supervised', description: 'Acts with approval' },
  { label: 'Autonomous', value: 'autonomous', description: 'Acts independently' },
];

/* ── Animation variants ──────────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
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

/* ── Star rating ─────────────────────────────────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Star size={12} fill="var(--yellow)" stroke="var(--yellow)" />
      <span className="text-xs font-semibold text-[var(--text-primary)]">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

/* ── Trust level selector ────────────────────────────────────────────────── */

function TrustSelector({
  skillId,
  value,
  onChange,
}: {
  skillId: string;
  value: TrustLevel;
  onChange: (level: TrustLevel) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' as const }}
      className="overflow-hidden"
    >
      <div className="pt-3 mt-3 border-t border-[rgba(34,211,238,0.1)]">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-semibold">
          Trust Level
        </p>
        <div className="flex gap-1.5">
          {TRUST_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange(level.value)}
              title={level.description}
              className={[
                'flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md',
                'transition-all duration-150 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]',
                value === level.value
                  ? 'bg-[rgba(34,211,238,0.15)] text-[var(--cyan)] border border-[rgba(34,211,238,0.4)]'
                  : 'bg-[rgba(30,41,59,0.5)] text-[var(--text-secondary)] border border-transparent hover:text-[var(--text-primary)] hover:bg-[rgba(30,41,59,0.8)]',
              ].join(' ')}
              aria-label={`Set trust level to ${level.label}: ${level.description}`}
              aria-pressed={value === level.value}
              role="radio"
              aria-checked={value === level.value}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Skill card ──────────────────────────────────────────────────────────── */

function SkillCard({
  skill,
  installed,
  trustLevel,
  onInstallToggle,
  onTrustChange,
}: {
  skill: Skill;
  installed: boolean;
  trustLevel: TrustLevel;
  onInstallToggle: () => void;
  onTrustChange: (level: TrustLevel) => void;
}) {
  return (
    <Card padding="md" className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-2xl shrink-0 flex items-center justify-center size-10 rounded-xl"
            style={{ background: 'rgba(34, 211, 238, 0.08)' }}
            aria-hidden="true"
          >
            {skill.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {skill.name}
              </h3>
              {skill.verified && (
                <ShieldCheck
                  size={14}
                  className="shrink-0 text-[var(--emerald)]"
                  aria-label="Verified skill"
                />
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] capitalize">
              {skill.category}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {skill.description}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          <Download size={12} />
          {skill.installs}
        </span>
        <StarRating rating={skill.rating} />
        {skill.verified && (
          <Badge variant="success" dot>
            Verified
          </Badge>
        )}
      </div>

      {/* Install button */}
      <button
        type="button"
        onClick={onInstallToggle}
        className={[
          'mt-auto w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
          'text-sm font-semibold transition-all duration-200 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]',
          installed
            ? 'bg-[var(--emerald)] text-white hover:bg-[#2bc48a] focus-visible:ring-[var(--emerald)]'
            : 'border border-[var(--slate-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] focus-visible:ring-[var(--slate-light)]',
        ].join(' ')}
        aria-label={installed ? `Uninstall ${skill.name}` : `Install ${skill.name}`}
      >
        {installed ? (
          <>
            <CheckCircle size={14} />
            Installed
          </>
        ) : (
          'Install'
        )}
      </button>

      {/* Trust selector (visible when installed) */}
      <AnimatePresence>
        {installed && (
          <TrustSelector
            skillId={skill.id}
            value={trustLevel}
            onChange={onTrustChange}
          />
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function SkillsMarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [installedSkills, setInstalledSkills] = useState<Set<string>>(
    () => new Set(['inbox-manager', 'deep-research', 'code-assistant']),
  );
  const [trustLevels, setTrustLevels] = useState<Record<string, TrustLevel>>(
    () => ({
      'inbox-manager': 'supervised',
      'deep-research': 'autonomous',
      'code-assistant': 'supervised',
    }),
  );

  const toggleInstall = useCallback((skillId: string) => {
    setInstalledSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
        setTrustLevels((t) => ({ ...t, [skillId]: 'suggest' }));
      }
      return next;
    });
  }, []);

  const changeTrust = useCallback((skillId: string, level: TrustLevel) => {
    setTrustLevels((prev) => ({ ...prev, [skillId]: level }));
  }, []);

  const filteredSkills = SKILLS.filter((skill) => {
    const matchesCategory =
      activeCategory === 'all' || skill.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' as const }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Skills Marketplace
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Extend your agent&apos;s capabilities
          </p>
        </motion.div>

        {/* ── Search ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              aria-label="Search skills"
              className={[
                'w-full pl-9 pr-4 py-2.5 text-sm rounded-xl',
                'bg-[rgba(30,41,59,0.8)] border border-[rgba(34,211,238,0.15)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]',
                'focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)]',
                'transition-all duration-200',
              ].join(' ')}
            />
          </div>
        </motion.div>

        {/* ── Category tabs ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8"
        >
          <nav
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Skill categories"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={[
                  'px-4 py-2 text-sm font-medium rounded-full cursor-pointer',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]',
                  activeCategory === cat.value
                    ? 'bg-[rgba(34,211,238,0.15)] text-[var(--cyan)] border border-[rgba(34,211,238,0.3)]'
                    : 'text-[var(--text-secondary)] border border-[var(--slate-light)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]',
                ].join(' ')}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* ── Skills grid ───────────────────────────────────────────────── */}
        <motion.div
          key={activeCategory + searchQuery}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          role="tabpanel"
        >
          {filteredSkills.map((skill) => (
            <motion.div key={skill.id} variants={cardVariants}>
              <SkillCard
                skill={skill}
                installed={installedSkills.has(skill.id)}
                trustLevel={trustLevels[skill.id] ?? 'suggest'}
                onInstallToggle={() => toggleInstall(skill.id)}
                onTrustChange={(level) => changeTrust(skill.id, level)}
              />
            </motion.div>
          ))}

          {filteredSkills.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-16 text-center"
            >
              <p className="text-[var(--text-secondary)] text-sm">
                No skills found matching your criteria.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* ── Trust banner ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10"
        >
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm"
            style={{
              background: 'rgba(52, 211, 153, 0.06)',
              border: '1px solid rgba(52, 211, 153, 0.15)',
            }}
          >
            <ShieldCheck
              size={18}
              className="shrink-0 text-[var(--emerald)]"
            />
            <p className="text-[var(--text-secondary)]">
              All skills inherit the{' '}
              <span className="text-[var(--emerald)] font-medium">
                H\u014DMI trust framework
              </span>{' '}
              &mdash; no skill can bypass readiness checks.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
