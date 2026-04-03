'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, ChevronRight } from 'lucide-react';
import { useAssessmentStore } from '@/stores/assessmentStore';
import { Button } from '@/components/ui';
import { ScoreOrb, VerdictBadge } from '@/components/scoring';
import { ThresholdCompass } from '@/components/brand';
import type { AssessmentSummary, Verdict } from '@/types/assessment';

// ---------------------------------------------------------------------------
// Empty state shown when user has no assessments
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ThresholdCompass size={140} animate className="mb-8 opacity-60" />

      <h2
        className="text-2xl font-bold mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        No Assessments Yet
      </h2>
      <p
        className="max-w-md mb-8 leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Take your first assessment to discover your HōMI-Score across three
        dimensions: financial readiness, emotional truth, and perfect timing.
      </p>

      <Link href="/assess/new">
        <Button variant="cta" size="lg" icon={<Plus size={20} />}>
          Take Your First Assessment
        </Button>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Assessment row for history list
// ---------------------------------------------------------------------------

function AssessmentRow({
  summary,
  index,
}: {
  summary: AssessmentSummary;
  index: number;
}) {
  const date = new Date(summary.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <Link href={`/assess/${summary.id}`}>
        <div
          className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200"
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderColor: 'rgba(34, 211, 238, 0.12)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.35)';
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.12)';
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
          }}
        >
          {/* Score orb */}
          <ScoreOrb score={summary.overall} size="sm" animate={false} />

          {/* Date + verdict */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {formattedDate}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {formattedTime}
              </span>
            </div>
            <VerdictBadge
              verdict={summary.verdict as Verdict}
              size="sm"
              showIcon={false}
            />
          </div>

          {/* Arrow */}
          <ChevronRight
            size={20}
            style={{ color: 'var(--text-secondary)' }}
            className="flex-shrink-0"
          />
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AssessPage() {
  const history = useAssessmentStore((s) => s.history);
  const reset = useAssessmentStore((s) => s.reset);

  // Reset assessment state when arriving at the hub
  useEffect(() => {
    reset();
  }, [reset]);

  const hasHistory = history.length > 0;

  return (
    <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <ClipboardList
            size={24}
            style={{ color: 'var(--cyan)' }}
            strokeWidth={2}
          />
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Assessments
          </h1>
        </div>

        {hasHistory && (
          <Link href="/assess/new">
            <Button variant="cta" size="md" icon={<Plus size={16} />}>
              New Assessment
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Content */}
      {hasHistory ? (
        <div className="flex flex-col gap-3">
          {history.map((summary, i) => (
            <AssessmentRow key={summary.id} summary={summary} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
