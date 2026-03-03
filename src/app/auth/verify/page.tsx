'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resendVerificationEmail } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/brand/Logo'
import { Mail, CheckCircle } from 'lucide-react'

export default function VerifyPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  async function handleResend() {
    setIsResending(true)
    // In a real implementation, you'd get the email from the session or query params
    const email = new URLSearchParams(window.location.search).get('email') || ''
    
    if (email) {
      await resendVerificationEmail(email)
      setResendSuccess(true)
    }
    
    setIsResending(false)
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" size="lg" />
          <p className="text-text-2 text-sm">Your decisions deserve intelligence.</p>
        </div>

        <Card variant="elevated" padding="lg" className="text-center">
          <div className="w-16 h-16 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-brand-cyan" />
          </div>

          <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
          <p className="text-text-2 mb-6">
            We&apos;ve sent you a verification link. Please check your email and click the link to verify your account.
          </p>

          <div className="bg-surface-2 rounded-brand-sm p-4 mb-6">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-brand-emerald flex-shrink-0" />
              <span className="text-sm text-text-2">
                Verification emails may take a few minutes to arrive
              </span>
            </div>
          </div>

          {resendSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-brand-sm text-emerald-400 text-sm">
              Verification email resent successfully!
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleResend}
              loading={isResending}
            >
              Resend Email
            </Button>

            <Link href="/auth/login">
              <Button variant="ghost" fullWidth>
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
