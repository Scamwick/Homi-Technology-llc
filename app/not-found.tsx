import Link from 'next/link';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { Button } from '@/components/ui/Button';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 404 — Page Not Found
 *
 * ThresholdCompass with all rings at 0% (no scores), plus CTA to return
 * home or start an assessment.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#0a1628' }}
    >
      <ThresholdCompass
        size={120}
        financial={0}
        emotional={0}
        timing={0}
        animate
        showKeyhole
      />

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Page Not Found
      </h1>

      <p className="mt-3 max-w-md text-center text-base text-text-secondary">
        This page doesn&apos;t exist, but your readiness score does.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link href="/">
          <Button variant="primary" size="lg">
            Go Home
          </Button>
        </Link>
        <Link href="/assess/new">
          <Button variant="cta" size="lg">
            Take Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}
