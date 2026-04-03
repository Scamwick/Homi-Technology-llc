import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Dashboard Loading — Skeleton matching the dashboard layout.
 *
 * ScoreOrb placeholder + 3 dimension bars + action items list.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Skeleton variant="title" width={180} className="mb-2" />
        <Skeleton variant="text" width={280} />
      </div>

      {/* Score overview row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ScoreOrb placeholder */}
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-[rgba(34,211,238,0.1)] p-8"
          style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
        >
          <Skeleton variant="circle" width={140} height={140} className="mb-4" />
          <Skeleton variant="text" width={100} className="mb-2" />
          <Skeleton variant="text" width={80} />
        </div>

        {/* 3 dimension bars */}
        <div
          className="col-span-1 space-y-4 rounded-xl border border-[rgba(34,211,238,0.1)] p-6 lg:col-span-2"
          style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
        >
          <Skeleton variant="text" width={160} className="mb-4" />
          {['60%', '75%', '50%'].map((w, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" width={120} />
                <Skeleton variant="text" width={40} />
              </div>
              <Skeleton variant="rect" height={8} width={w} className="rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Action items + Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Action items */}
        <div
          className="rounded-xl border border-[rgba(34,211,238,0.1)] p-6"
          style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
        >
          <Skeleton variant="text" width={140} className="mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-[rgba(34,211,238,0.06)] py-3 last:border-0"
            >
              <Skeleton variant="circle" width={20} height={20} />
              <Skeleton variant="text" width={`${70 + (i % 3) * 10}%`} />
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div
          className="rounded-xl border border-[rgba(34,211,238,0.1)] p-6"
          style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
        >
          <Skeleton variant="text" width={120} className="mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-[rgba(34,211,238,0.08)] p-4"
                style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}
              >
                <Skeleton variant="rect" width={32} height={32} className="mb-3 rounded-lg" />
                <Skeleton variant="text" width="70%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
