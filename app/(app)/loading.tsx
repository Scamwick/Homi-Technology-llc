import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * App-wide Loading — Skeleton mimicking the AppShell layout.
 *
 * Shows sidebar placeholder + main content area while the (app) segment loads.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AppLoading() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0a1628' }}>
      {/* Sidebar skeleton */}
      <aside className="hidden w-64 shrink-0 border-r border-[rgba(34,211,238,0.1)] p-5 lg:block">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <Skeleton variant="rect" width={36} height={36} className="rounded-lg" />
          <Skeleton variant="text" width={80} />
        </div>

        {/* Nav items */}
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <Skeleton variant="rect" width={20} height={20} className="rounded" />
              <Skeleton variant="text" width={`${60 + (i % 3) * 15}%`} />
            </div>
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton variant="title" width={200} className="mb-2" />
          <Skeleton variant="text" width={300} />
        </div>

        {/* Content placeholder */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[rgba(34,211,238,0.1)] p-6"
              style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
            >
              <Skeleton variant="text" width="60%" className="mb-4" />
              <Skeleton variant="rect" height={100} className="mb-4 w-full" />
              <Skeleton variant="text" count={2} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
