import { Spinner } from '@/components/ui/Spinner';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Marketing Loading — Minimal loading state.
 *
 * The marketing layout already provides Nav + Footer, so this just shows a
 * centered spinner while page content loads.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function MarketingLoading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      style={{ backgroundColor: '#0a1628' }}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
