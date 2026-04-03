import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Assessment List Loading — Skeleton for the assessments page.
 *
 * Shows header + CTA button skeleton + list of assessment card skeletons.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AssessLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
      {/* Header with CTA */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton variant="title" width={200} className="mb-2" />
          <Skeleton variant="text" width={320} />
        </div>
        <Skeleton variant="rect" width={160} height={44} className="rounded-lg" />
      </div>

      {/* Assessment cards list */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[rgba(34,211,238,0.1)] p-6"
            style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
          >
            <div className="flex items-center gap-5">
              {/* Score circle */}
              <Skeleton variant="circle" width={56} height={56} />

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton variant="text" width={140} />
                  <Skeleton variant="rect" width={80} height={22} className="rounded-full" />
                </div>
                <Skeleton variant="text" width="90%" />
              </div>

              {/* Arrow / action */}
              <Skeleton variant="rect" width={32} height={32} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
