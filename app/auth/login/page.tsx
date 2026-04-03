'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { Wordmark } from '@/components/brand/Wordmark';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * LoginPage — Email + password sign-in with full error/loading states.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
        return;
      }
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      {/* Background compass animation (low opacity) */}
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
            Welcome back
          </h1>
          <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">
            Sign in to your account
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

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leadingIcon={<Lock size={16} />}
              disabled={loading}
            />

            <Button
              type="submit"
              variant="cta"
              fullWidth
              loading={loading}
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Forgot password */}
          <div className="mt-4 text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--cyan)]"
            >
              Forgot password?
            </Link>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--slate)]" />
            <span className="text-xs text-[var(--text-secondary)]">or</span>
            <div className="h-px flex-1 bg-[var(--slate)]" />
          </div>

          {/* Create account */}
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-[var(--cyan)] hover:text-[var(--emerald)]"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#0a1628' }} />}>
      <LoginForm />
    </Suspense>
  );
}
