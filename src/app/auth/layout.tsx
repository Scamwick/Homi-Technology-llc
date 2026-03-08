import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication | HōMI',
  description: 'Sign in or create an account to start your decision readiness journey.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface-1">
      {children}
    </div>
  )
}
