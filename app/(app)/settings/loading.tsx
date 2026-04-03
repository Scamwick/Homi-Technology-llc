import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Settings Loading — Skeleton matching the settings hub layout.
 *
 * Left sidebar nav tabs + right content area with form fields.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <Skeleton variant="title" width={120} className="mb-8" />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar nav */}
        <div className="w-full shrink-0 lg:w-56">
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-3"
              >
                <Skeleton variant="rect" width={20} height={20} className="rounded" />
                <div className="flex-1">
                  <Skeleton variant="text" width={`${60 + (i % 2) * 20}%`} className="mb-1" />
                  <Skeleton variant="text" width="90%" className="!h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div
          className="flex-1 rounded-xl border border-[rgba(34,211,238,0.1)] p-6"
          style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
        >
          <Skeleton variant="title" width={160} className="mb-6" />

          {/* Form field rows */}
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton variant="text" width={100} className="mb-2 !h-3" />
                <Skeleton variant="rect" height={44} className="w-full rounded-lg" />
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex gap-3">
            <Skeleton variant="rect" width={120} height={44} className="rounded-lg" />
            <Skeleton variant="rect" width={100} height={44} className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
