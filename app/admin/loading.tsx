import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Admin Loading — Skeleton for the admin panel.
 *
 * The admin layout provides its own sidebar, so this skeleton only covers
 * the main content area (overview stats + table).
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <Skeleton variant="title" width={160} className="mb-2" />
        <Skeleton variant="text" width={260} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[rgba(34,211,238,0.1)] p-5"
            style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
          >
            <Skeleton variant="text" width={80} className="mb-3 !h-3" />
            <Skeleton variant="title" width={60} className="mb-1" />
            <Skeleton variant="text" width={100} className="!h-3" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div
        className="rounded-xl border border-[rgba(34,211,238,0.1)]"
        style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      >
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-[rgba(34,211,238,0.08)] px-6 py-4">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={60} />
        </div>

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[rgba(34,211,238,0.06)] px-6 py-4 last:border-0"
          >
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={120} />
            <Skeleton variant="rect" width={70} height={22} className="rounded-full" />
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={60} />
          </div>
        ))}
      </div>
    </div>
  );
}
