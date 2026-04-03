import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Marketplace Loading — Skeleton for the advisor marketplace.
 *
 * Filter bar + 2-column advisor card grid.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function MarketplaceLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Skeleton variant="title" width={220} className="mb-2" />
        <Skeleton variant="text" width={340} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rect"
            width={90 + (i % 3) * 20}
            height={36}
            className="rounded-full"
          />
        ))}
      </div>

      {/* 2-column cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[rgba(34,211,238,0.1)] p-6"
            style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
          >
            {/* Advisor header */}
            <div className="mb-4 flex items-center gap-4">
              <Skeleton variant="circle" width={48} height={48} />
              <div className="flex-1">
                <Skeleton variant="text" width={140} className="mb-1" />
                <Skeleton variant="text" width={100} className="!h-3" />
              </div>
              <Skeleton variant="rect" width={60} height={24} className="rounded-full" />
            </div>

            {/* Specialties */}
            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton
                  key={j}
                  variant="rect"
                  width={80 + (j % 2) * 20}
                  height={24}
                  className="rounded-full"
                />
              ))}
            </div>

            {/* Description lines */}
            <Skeleton variant="text" count={2} className="mb-4" />

            {/* Footer: stats */}
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width={100} className="!h-3" />
              <Skeleton variant="rect" width={100} height={36} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
