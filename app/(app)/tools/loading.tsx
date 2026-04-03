import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Tools Loading — Skeleton for the 4x3 financial tools grid.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function ToolsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Skeleton variant="title" width={180} className="mb-2" />
        <Skeleton variant="text" width={300} />
      </div>

      {/* 4x3 grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[rgba(34,211,238,0.1)] p-5"
            style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
          >
            <Skeleton variant="rect" width={40} height={40} className="mb-4 rounded-lg" />
            <Skeleton variant="text" width="65%" className="mb-2" />
            <Skeleton variant="text" count={2} className="!h-3" />
            <div className="mt-4 flex items-center justify-between">
              <Skeleton variant="rect" width={56} height={22} className="rounded-full" />
              <Skeleton variant="rect" width={20} height={20} className="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
