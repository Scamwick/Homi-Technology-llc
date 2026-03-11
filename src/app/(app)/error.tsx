'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="w-12 h-12 text-brand-crimson mx-auto" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-text-3 text-sm">An unexpected error occurred. Please try again.</p>
        <Button onClick={reset} variant="primary">Try Again</Button>
      </div>
    </div>
  )
}
