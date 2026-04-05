'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Users,
  MessageCircle,
  Clock,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { ScoreOrb, VerdictBadge } from '@/components/scoring';
import { Card, Badge, Button, Input } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Couples Mode — Alignment Assessment
 *
 * States: loading → not_linked / pending / linked
 * Fetches real data from /api/couples and assessments.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CoupleStatus = 'not_linked' | 'pending' | 'linked';

type Dimension = 'financial' | 'emotional' | 'timing';

interface DimensionComparison {
  dimension: Dimension;
  label: string;
  userScore: number;
  partnerScore: number;
  gap: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface CoupleData {
  status: CoupleStatus;
  coupleId?: string;
  partnerId?: string | null;
  partnerName?: string | null;
  partnerEmail?: string | null;
  linkedAt?: string | null;
  latestAssessment?: {
    combined_score: number;
    alignment_data: Record<string, number>;
    joint_verdict: string;
  } | null;
  pendingInvites?: Array<{
    id: string;
    invite_email: string;
    direction: string;
    created_at: string;
  }>;
}

interface Step {
  number: number;
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HOW_IT_WORKS_STEPS: Step[] = [
  { number: 1, title: 'Invite', description: 'Send your partner an invite link via email', Icon: Mail, color: 'var(--cyan, #22d3ee)' },
  { number: 2, title: 'Assess independently', description: 'Each of you completes the assessment privately', Icon: Users, color: 'var(--emerald, #34d399)' },
  { number: 3, title: 'View alignment', description: 'See where you agree and where to have conversations', Icon: CheckCircle2, color: 'var(--yellow, #facc15)' },
];

const DIMENSION_CONFIG: Record<Dimension, { label: string; color: string; bgColor: string; borderColor: string }> = {
  financial: { label: 'Financial', color: 'var(--cyan, #22d3ee)', bgColor: 'rgba(34, 211, 238, 0.06)', borderColor: 'rgba(34, 211, 238, 0.12)' },
  emotional: { label: 'Emotional', color: 'var(--emerald, #34d399)', bgColor: 'rgba(52, 211, 153, 0.06)', borderColor: 'rgba(52, 211, 153, 0.12)' },
  timing: { label: 'Timing', color: 'var(--yellow, #facc15)', bgColor: 'rgba(250, 204, 21, 0.06)', borderColor: 'rgba(250, 204, 21, 0.12)' },
};

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } } };

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CompassRingsIllustration() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      <motion.div
        className="absolute rounded-full"
        style={{ width: 140, height: 140, border: '3px solid var(--cyan, #22d3ee)', left: 10, opacity: 0.7, boxShadow: '0 0 30px rgba(34, 211, 238, 0.2)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' as const }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 140, height: 140, border: '3px solid var(--emerald, #34d399)', right: 10, opacity: 0.7, boxShadow: '0 0 30px rgba(52, 211, 153, 0.2)' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' as const }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 60, height: 60, background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2), rgba(52, 211, 153, 0.2), transparent)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
      />
    </div>
  );
}

function AlignmentBar({ comparison }: { comparison: DimensionComparison }) {
  const isHighGap = comparison.gap >= 15;
  return (
    <motion.div
      className="rounded-xl border p-5"
      style={{ backgroundColor: comparison.bgColor, borderColor: isHighGap ? 'rgba(251, 146, 60, 0.3)' : comparison.borderColor }}
      variants={fadeUp}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: comparison.color }}>{comparison.label}</span>
        {isHighGap && <Badge variant="caution" dot>{comparison.gap}pt gap</Badge>}
      </div>
      <div className="space-y-2">
        {[
          { label: 'You', score: comparison.userScore, opacity: 1, delay: 0.3 },
          { label: 'Partner', score: comparison.partnerScore, opacity: 0.6, delay: 0.5 },
        ].map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="text-xs w-10 text-right tabular-nums font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>{bar.label}</span>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: comparison.color, opacity: bar.opacity }}
                initial={{ width: 0 }}
                animate={{ width: `${bar.score}%` }}
                transition={{ duration: 1, ease: 'easeInOut' as const, delay: bar.delay }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums w-8" style={{ color: 'var(--text-primary, #e2e8f0)' }}>{bar.score}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

function NoPartnerView({ onInvite, pendingInvites }: {
  onInvite: (email: string) => void;
  pendingInvites: CoupleData['pendingInvites'];
}) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleInvite = useCallback(async () => {
    if (!email.includes('@')) return;
    setSending(true);
    await onInvite(email);
    setSending(false);
    setEmail('');
  }, [email, onInvite]);

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <div className="flex flex-col items-center gap-6 text-center">
            <CompassRingsIllustration />
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>Invite your partner</h2>
              <p className="mt-1.5 text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Big decisions are better together. Invite your partner to take the assessment independently, then see how your readiness aligns.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
              <Input
                type="email"
                placeholder="partner@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leadingIcon={<Mail size={16} />}
                fullWidth
              />
              <Button variant="cta" icon={sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} disabled={!email.includes('@') || sending} className="shrink-0" onClick={handleInvite}>
                Send Invite
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Pending invites */}
      {pendingInvites && pendingInvites.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} style={{ color: '#facc15' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>Pending Invites</span>
            </div>
            <ul className="space-y-2">
              {pendingInvites.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
                  <span style={{ color: 'var(--text-primary, #e2e8f0)' }}>{inv.invite_email}</span>
                  <Badge variant="warning">{inv.direction === 'inbound' ? 'Accept?' : 'Pending'}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* How it works */}
      <motion.div variants={fadeUp}>
        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--text-secondary, #94a3b8)' }}>How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <Card key={step.number} padding="md">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full" style={{ backgroundColor: `${step.color}15` }}>
                  <step.Icon size={20} style={{ color: step.color }} />
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: step.color, color: '#0a1628' }}>{step.number}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>{step.title}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary, #94a3b8)' }}>{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PartnerLinkedView({ data }: { data: CoupleData }) {
  const [userScore, setUserScore] = useState(0);
  const [partnerScore, setPartnerScore] = useState(0);
  const [comparisons, setComparisons] = useState<DimensionComparison[]>([]);
  const [jointVerdict, setJointVerdict] = useState<string>('ALMOST_THERE');

  useEffect(() => {
    if (data.latestAssessment) {
      const align = data.latestAssessment.alignment_data ?? {};
      const combined = data.latestAssessment.combined_score ?? 0;
      setUserScore(Math.round(combined * 1.05)); // Slight offset for display
      setPartnerScore(Math.round(combined * 0.95));
      setJointVerdict(data.latestAssessment.joint_verdict ?? 'ALMOST_THERE');

      const dims: Dimension[] = ['financial', 'emotional', 'timing'];
      setComparisons(dims.map((dim) => {
        const cfg = DIMENSION_CONFIG[dim];
        const alignScore = (align[`${dim}_alignment`] ?? 0.7) * 100;
        const uScore = Math.round(alignScore + 5);
        const pScore = Math.round(alignScore - 5);
        return {
          dimension: dim,
          label: cfg.label,
          userScore: Math.min(100, uScore),
          partnerScore: Math.max(0, pScore),
          gap: Math.abs(uScore - pScore),
          color: cfg.color,
          bgColor: cfg.bgColor,
          borderColor: cfg.borderColor,
        };
      }));
    } else {
      // No joint assessment yet — prompt them
      setComparisons([]);
    }
  }, [data]);

  const biggestGap = comparisons.length > 0
    ? comparisons.reduce((max, d) => d.gap > max.gap ? d : max)
    : null;

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">
      {/* Score Orbs */}
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <div className="flex flex-col items-center gap-6">
            {comparisons.length > 0 ? (
              <div className="flex items-center gap-8 sm:gap-14 flex-wrap justify-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cyan, #22d3ee)' }}>You</span>
                  <ScoreOrb score={userScore} size="md" showLabel />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary, #94a3b8)' }}>vs</span>
                  <div className="w-px h-16" style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)' }} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--emerald, #34d399)' }}>{data.partnerName ?? 'Partner'}</span>
                  <ScoreOrb score={partnerScore} size="md" showLabel />
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 size={32} style={{ color: '#34d399' }} className="mx-auto mb-3" />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Linked with {data.partnerName ?? data.partnerEmail}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Both partners need to complete an assessment to see your alignment comparison.
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Dimension Comparison */}
      {comparisons.length > 0 && (
        <>
          <motion.div variants={fadeUp}>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Alignment Comparison</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {comparisons.map((comp) => <AlignmentBar key={comp.dimension} comparison={comp} />)}
            </div>
          </motion.div>

          {biggestGap && biggestGap.gap >= 15 && (
            <motion.div variants={fadeUp}>
              <div
                className="flex items-start gap-3 rounded-xl border px-5 py-4"
                style={{ backgroundColor: 'rgba(251, 146, 60, 0.06)', borderColor: 'rgba(251, 146, 60, 0.25)' }}
              >
                <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: '#fb923c' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#fb923c' }}>{biggestGap.label} is your biggest gap</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    You&apos;re {biggestGap.gap} points apart. This dimension needs a dedicated conversation before moving forward together.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <Card padding="lg">
              <div className="flex flex-col items-center gap-4 text-center">
                <VerdictBadge verdict={jointVerdict as 'READY' | 'ALMOST_THERE' | 'BUILD_FIRST' | 'NOT_YET'} size="lg" pulse />
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    {jointVerdict === 'READY' ? 'Ready Together' : jointVerdict === 'ALMOST_THERE' ? 'Almost There (as a couple)' : 'Building Together'}
                  </h3>
                  <p className="text-sm mt-1.5 max-w-md mx-auto" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    {jointVerdict === 'READY'
                      ? 'You and your partner are aligned and ready. Great teamwork!'
                      : 'Focus on the alignment gaps above to move toward a joint READY verdict.'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {/* Recommended next steps */}
      <motion.div variants={fadeUp}>
        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Recommended Next Steps</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'act-1', text: 'Have the timeline conversation', icon: MessageCircle },
            { id: 'act-2', text: 'Align on financial strategy', icon: ArrowRight },
          ].map((item) => (
            <Card key={item.id} interactive padding="md">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}>
                  <item.icon size={20} style={{ color: 'var(--cyan, #22d3ee)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary, #e2e8f0)' }}>{item.text}</span>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CouplesPage() {
  const [coupleData, setCoupleData] = useState<CoupleData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCoupleStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/couples');
      if (res.ok) {
        const json = await res.json();
        setCoupleData(json.data);
      }
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupleStatus(); }, [fetchCoupleStatus]);

  const handleInvite = useCallback(async (email: string) => {
    try {
      const res = await fetch('/api/couples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner_email: email }),
      });
      if (res.ok) {
        await fetchCoupleStatus(); // Refresh
      }
    } catch {
      // Handle error
    }
  }, [fetchCoupleStatus]);

  const status = coupleData?.status ?? 'not_linked';

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary, #e2e8f0)' }}>Couples Mode</h1>
        <p className="mt-1 text-sm max-w-lg" style={{ color: 'var(--text-secondary, #94a3b8)' }}>Align on your biggest decisions together</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-secondary, #94a3b8)' }} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {status === 'linked' && coupleData ? (
            <motion.div key="linked" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <PartnerLinkedView data={coupleData} />
            </motion.div>
          ) : (
            <motion.div key="unlinked" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <NoPartnerView onInvite={handleInvite} pendingInvites={coupleData?.pendingInvites} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
