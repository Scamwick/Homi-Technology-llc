'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Mail } from 'lucide-react';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { BrandedName } from '@/components/brand/BrandedName';
import Link from 'next/link';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-24"
      style={{ backgroundColor: '#0a1628' }}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.05)_0%,transparent_70%)]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.04)_0%,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg text-center"
      >
        {/* Compass */}
        <div className="mb-8 flex justify-center">
          <ThresholdCompass size={160} animate showKeyhole />
        </div>

        {submitted ? (
          /* ── Success State ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
            >
              <CheckCircle size={32} style={{ color: '#34d399' }} />
            </div>

            <h1
              className="mb-4 text-3xl font-bold"
              style={{ color: '#e2e8f0' }}
            >
              You&rsquo;re on the list!
            </h1>

            <p
              className="mb-8 text-lg leading-relaxed"
              style={{ color: '#94a3b8' }}
            >
              We&rsquo;ll let you know when <BrandedName /> is ready.
              In the meantime, you can explore what we&rsquo;re building.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/homi-score"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
                style={{ backgroundColor: '#34d399', color: '#0a1628' }}
              >
                Learn About the <BrandedName />-Score
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:border-[rgba(34,211,238,0.4)]"
                style={{
                  borderColor: 'rgba(51,65,85,0.6)',
                  color: '#94a3b8',
                }}
              >
                About <BrandedName />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── Form State ── */
          <>
            <h1
              className="mb-4 text-3xl font-bold sm:text-4xl"
              style={{ color: '#e2e8f0' }}
            >
              Join the <BrandedName /> Waitlist
            </h1>

            <p
              className="mb-8 text-lg leading-relaxed"
              style={{ color: '#94a3b8' }}
            >
              Be the first to know when Decision Readiness Intelligence&trade;
              is available. No spam, just clarity.
            </p>

            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#94a3b8' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="you@example.com"
                    className="w-full rounded-lg py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#22d3ee]"
                    style={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#e2e8f0',
                    }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: '#34d399', color: '#0a1628' }}
                >
                  {loading ? 'Joining...' : 'Join Waitlist'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </div>

              {error && (
                <p
                  className="mt-3 text-sm"
                  style={{ color: '#ef4444' }}
                >
                  {error}
                </p>
              )}
            </form>

            <p
              className="mt-6 text-xs"
              style={{ color: '#94a3b8' }}
            >
              Zero commissions. Zero conflicts. Just clarity.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
