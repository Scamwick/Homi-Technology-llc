import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <p className="text-6xl font-bold text-brand-cyan">404</p>
        <h2 className="text-2xl font-semibold text-text-1">Page not found</h2>
        <p className="text-text-3">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/"><Button variant="outline">Home</Button></Link>
          <Link href="/dashboard"><Button variant="primary">Dashboard</Button></Link>
        </div>
      </div>
    </div>
  )
}
