'use client';

import { useState, useEffect, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { Wordmark } from '@/components/brand/Wordmark';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ResetPasswordPage — Set a new password after clicking the email reset link.
 *
 * Supabase redirects here with a session token in the URL fragment.
 * The client SDK picks it up automatically via onAuthStateChange.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  /* Wait for Supabase to pick up the recovery token from the URL hash */
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setSessionReady(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionReady(true);
        }
      },
    );

    /* Also check immediately in case the event already fired */
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    /* Timeout fallback so the form isn't stuck forever */
    const timeout = setTimeout(() => setSessionReady(true), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  function validate(): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password))
      return 'Password must contain at least 1 uppercase letter.';
    if (!/\d/.test(password))
      return 'Password must contain at least 1 number.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError(
          'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);

      /* Redirect to login after 2 seconds */
      setTimeout(() => {
        router.push('/auth/login?message=password_reset');
      }, 2000);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* Check for error passed via query params */
  const callbackError = searchParams.get('error');

  /* ── Success state ── */
  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
          <ThresholdCompass
            size={600}
            animate
            showKeyhole={false}
            className="opacity-[0.03]"
          />
        </div>

        <div className="relative z-10 w-full max-w-[400px]">
          <div className="card text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(52,211,153,0.1)]">
                <CheckCircle2
                  size={32}
                  className="text-[var(--emerald)]"
                />
              </div>
            </div>

            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              Password reset successful
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              Your password has been updated. Redirecting you to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form state ── */
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      {/* Background compass animation */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
        <ThresholdCompass
          size={600}
          animate
          showKeyhole={false}
          className="opacity-[0.03]"
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="card">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <ThresholdCompass size={48} animate={false} showKeyhole />
            <Wordmark size="lg" />
          </div>

          {/* Heading */}
          <h1 className="text-center text-xl font-semibold text-[var(--text-primary)]">
            Reset your password
          </h1>
          <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">
            Choose a new password for your account
          </p>

          {/* Error banner */}
          {(error || callbackError) && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--homi-crimson)] bg-[rgba(239,68,68,0.08)] px-3 py-2.5"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-[var(--homi-crimson)]"
              />
              <p className="text-sm text-[var(--homi-crimson)]">
                {error || 'The reset link is invalid or has expired. Please request a new one.'}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              autoComplete="new-password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leadingIcon={<Lock size={16} />}
              disabled={loading || !sessionReady}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leadingIcon={<Lock size={16} />}
              disabled={loading || !sessionReady}
            />

            {/* Password requirements hint */}
            <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside ml-1 space-y-0.5">
                <li className={password.length >= 8 ? 'text-[var(--emerald)]' : ''}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-[var(--emerald)]' : ''}>
                  At least 1 uppercase letter
                </li>
                <li className={/\d/.test(password) ? 'text-[var(--emerald)]' : ''}>
                  At least 1 number
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="cta"
              fullWidth
              loading={loading}
              size="lg"
              disabled={!sessionReady}
            >
              Reset Password
            </Button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[var(--cyan)] hover:text-[var(--emerald)]"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }} />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
