'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/brand/Logo'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await updatePassword(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" size="lg" />
          <p className="text-text-2 text-sm">Your decisions deserve intelligence.</p>
        </div>

        <Card variant="elevated" padding="lg">
          <h1 className="text-2xl font-semibold text-center mb-2">Create new password</h1>
          <p className="text-text-2 text-center mb-6 text-sm">
            Enter your new password below
          </p>

          {error && (
            <div className="mb-4 p-3 bg-brand-crimson/10 border border-brand-crimson/30 rounded-brand-sm text-brand-crimson text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              helperText="At least 8 characters with uppercase and number"
            />

            <Input
              label="Confirm Password"
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
