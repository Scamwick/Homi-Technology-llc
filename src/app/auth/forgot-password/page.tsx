'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/brand/Logo'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    const result = await resetPassword(formData)
    
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" size="lg" />
          <p className="text-text-2 text-sm">Your decisions deserve intelligence.</p>
        </div>

        <Card variant="elevated" padding="lg">
          <h1 className="text-2xl font-semibold text-center mb-2">Reset your password</h1>
          <p className="text-text-2 text-center mb-6 text-sm">
            Enter your email and we&apos;ll send you a reset link
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-brand-sm text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-brand-sm text-emerald-400 text-sm">
              {success}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-text-2 text-sm">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-brand-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
