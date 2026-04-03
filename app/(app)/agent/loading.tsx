import { Skeleton } from '@/components/ui/Skeleton';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Agent Chat Loading — Skeleton mimicking the agent interface.
 *
 * Left sidebar (status/skills) + main chat area with mock message bubbles.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AgentLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left sidebar */}
      <aside
        className="hidden w-72 shrink-0 border-r border-[rgba(34,211,238,0.1)] p-5 lg:block"
        style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}
      >
        {/* Agent status */}
        <div className="mb-6 flex items-center gap-3">
          <Skeleton variant="circle" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="text" width={100} className="mb-1" />
            <Skeleton variant="text" width={60} className="!h-3" />
          </div>
        </div>

        {/* Trust level */}
        <div className="mb-6 rounded-lg border border-[rgba(34,211,238,0.08)] p-4">
          <Skeleton variant="text" width={80} className="mb-3 !h-3" />
          <Skeleton variant="rect" height={8} className="mb-2 w-full rounded-full" />
          <Skeleton variant="text" width={120} className="!h-3" />
        </div>

        {/* Skills list */}
        <Skeleton variant="text" width={60} className="mb-3 !h-3" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2">
              <Skeleton variant="rect" width={18} height={18} className="rounded" />
              <Skeleton variant="text" width={`${50 + (i % 3) * 15}%`} />
            </div>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-[rgba(34,211,238,0.1)] px-6 py-4">
          <Skeleton variant="circle" width={32} height={32} />
          <Skeleton variant="text" width={140} />
        </div>

        {/* Messages area */}
        <div className="flex-1 space-y-6 overflow-hidden p-6">
          {/* Agent message */}
          <div className="flex gap-3">
            <Skeleton variant="circle" width={32} height={32} className="shrink-0" />
            <div className="max-w-[70%]">
              <Skeleton variant="rect" height={80} className="w-full rounded-xl" />
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end">
            <Skeleton variant="rect" width={240} height={48} className="rounded-xl" />
          </div>

          {/* Agent message */}
          <div className="flex gap-3">
            <Skeleton variant="circle" width={32} height={32} className="shrink-0" />
            <div className="max-w-[70%]">
              <Skeleton variant="rect" height={120} className="w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-[rgba(34,211,238,0.1)] px-6 py-4">
          <Skeleton variant="rect" height={48} className="w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
