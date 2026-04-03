'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { Wordmark } from '@/components/brand/Wordmark';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ForgotPasswordPage — Request a password reset link via email.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError(
          'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
        );
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
              Check your email
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              We sent a password reset link to{' '}
              <span className="font-medium text-[var(--text-primary)]">
                {email}
              </span>
              . Click the link in the email to reset your password.
            </p>

            <div className="mt-8">
              <Link
                href="/auth/login"
                className="font-medium text-[var(--cyan)] hover:text-[var(--emerald)]"
              >
                Back to sign in
              </Link>
            </div>
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
            Forgot your password?
          </h1>
          <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">
            Enter your email and we&apos;ll send you a reset link
          </p>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--homi-crimson)] bg-[rgba(239,68,68,0.08)] px-3 py-2.5"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-[var(--homi-crimson)]"
              />
              <p className="text-sm text-[var(--homi-crimson)]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leadingIcon={<Mail size={16} />}
              disabled={loading}
            />

            <Button
              type="submit"
              variant="cta"
              fullWidth
              loading={loading}
              size="lg"
            >
              Send Reset Link
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
