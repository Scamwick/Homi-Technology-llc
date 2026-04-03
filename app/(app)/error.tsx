'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Error Boundary — catches runtime errors in (app) routes.
 *
 * Provides a "Try again" action (calls reset to re-render the segment) and a
 * fallback link back to the dashboard.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error('[HōMI] App error boundary caught:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#0a1628' }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
      >
        <AlertTriangle size={32} className="text-[#ef4444]" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-md text-center text-sm text-text-secondary">
        An unexpected error occurred. You can try again or return to the
        dashboard.
      </p>

      {error.digest && (
        <p className="mt-2 font-mono text-xs text-text-secondary">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button variant="primary" size="lg" onClick={reset}>
          Try again
        </Button>
        <Link href="/dashboard">
          <Button variant="ghost" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
