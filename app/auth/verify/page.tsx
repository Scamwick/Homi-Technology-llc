'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { Spinner } from '@/components/ui/Spinner';
import { BrandedName } from '@/components/brand/BrandedName';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VerifyPage — Email verification landing page.
 *
 * Supabase redirects here after the user clicks the verification link.
 * We listen for the auth state change, show a success animation, then
 * auto-redirect to /onboarding after 2 seconds.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type VerifyState = 'verifying' | 'success' | 'error';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerification = useCallback(() => {
    const supabase = createClient();

    /* If Supabase is not configured, simulate success for dev mode */
    if (!supabase) {
      setState('success');
      setTimeout(() => router.push('/onboarding'), 2000);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setState('success');
          setTimeout(() => router.push('/onboarding'), 2000);
        }
      },
    );

    /* Also check if the user is already verified (came via callback) */
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setState('error');
        setErrorMessage(error.message);
        return;
      }
      if (data.session) {
        setState('success');
        setTimeout(() => router.push('/onboarding'), 2000);
      }
    });

    /* Timeout fallback — if nothing happens in 10s, show error */
    const timeout = setTimeout(() => {
      if (state === 'verifying') {
        setState('error');
        setErrorMessage(
          'Verification timed out. The link may have expired.',
        );
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, state]);

  useEffect(() => {
    /* Check for error in URL params */
    const urlError = searchParams.get('error');
    if (urlError) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('error');
      setErrorMessage('The verification link is invalid or has expired.');
      return;
    }

    const cleanup = handleVerification();
    return cleanup;
  }, [handleVerification, searchParams]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {/* Background compass (very low opacity) */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
        <ThresholdCompass
          size={600}
          animate
          showKeyhole={false}
          className="opacity-[0.03]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* ── Verifying state ── */}
        {state === 'verifying' && (
          <>
            <ThresholdCompass size={120} animate showKeyhole />
            <div className="flex items-center gap-3">
              <Spinner size="md" />
              <p className="text-lg text-[var(--text-secondary)]">
                Verifying your email...
              </p>
            </div>
          </>
        )}

        {/* ── Success state ── */}
        {state === 'success' && (
          <>
            <ThresholdCompass size={120} animate showKeyhole />
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(52,211,153,0.1)]">
                <CheckCircle2
                  size={32}
                  className="text-[var(--emerald)]"
                />
              </div>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                Email verified!
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Redirecting to <BrandedName className="font-semibold" />...
              </p>
            </div>
          </>
        )}

        {/* ── Error state ── */}
        {state === 'error' && (
          <>
            <ThresholdCompass
              size={120}
              animate={false}
              showKeyhole
            />
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(239,68,68,0.1)]">
                <AlertCircle
                  size={32}
                  className="text-[var(--homi-crimson)]"
                />
              </div>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                Verification failed
              </p>
              <p className="text-center text-sm text-[var(--text-secondary)]">
                {errorMessage ||
                  'Something went wrong. Please try again.'}
              </p>
              <a
                href="/auth/login"
                className="mt-4 font-medium text-[var(--cyan)] hover:text-[var(--emerald)]"
              >
                Back to sign in
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }} />
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
