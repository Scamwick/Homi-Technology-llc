import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Loading — Skeleton for the partner portal.
 *
 * Header + KPI stats row + client list / activity skeleton.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function PartnerLoading() {
  return (
    <div
      className="min-h-screen p-6 lg:p-8"
      style={{ backgroundColor: '#0a1628' }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton variant="title" width={200} className="mb-2" />
            <Skeleton variant="text" width={280} />
          </div>
          <Skeleton variant="circle" width={40} height={40} />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[rgba(34,211,238,0.1)] p-5"
              style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
            >
              <Skeleton variant="text" width={90} className="mb-3 !h-3" />
              <Skeleton variant="title" width={50} className="mb-1" />
              <Skeleton variant="text" width={80} className="!h-3" />
            </div>
          ))}
        </div>

        {/* Two-column layout: clients + activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Clients list */}
          <div
            className="rounded-xl border border-[rgba(34,211,238,0.1)] p-6"
            style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
          >
            <Skeleton variant="text" width={100} className="mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-[rgba(34,211,238,0.06)] py-3 last:border-0"
              >
                <Skeleton variant="circle" width={36} height={36} />
                <div className="flex-1">
                  <Skeleton variant="text" width={120} className="mb-1" />
                  <Skeleton variant="text" width={80} className="!h-3" />
                </div>
                <Skeleton variant="rect" width={50} height={22} className="rounded-full" />
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div
            className="rounded-xl border border-[rgba(34,211,238,0.1)] p-6"
            style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
          >
            <Skeleton variant="text" width={120} className="mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b border-[rgba(34,211,238,0.06)] py-3 last:border-0"
              >
                <Skeleton variant="rect" width={8} height={8} className="mt-1.5 rounded-full" />
                <div className="flex-1">
                  <Skeleton variant="text" width={`${65 + (i % 3) * 10}%`} className="mb-1" />
                  <Skeleton variant="text" width={60} className="!h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
