import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="bg-[#0a1628] min-h-[calc(100vh-80px)] flex items-center justify-center py-20">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-[#94a3b8]">Sign in to check your readiness</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-[#64748b] focus:outline-none focus:border-[#22d3ee] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-[#64748b] focus:outline-none focus:border-[#22d3ee] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#22d3ee] text-[#0a1628] font-semibold hover:bg-[#06b6d4] transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-[#94a3b8]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#22d3ee] hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  )
}
