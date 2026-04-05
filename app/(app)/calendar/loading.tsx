import { Skeleton } from '@/components/ui';

export default function CalendarLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-52 h-7" />
          <Skeleton variant="text" className="w-80 h-4" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="rect" className="w-36 h-9 rounded-lg" />
          <Skeleton variant="rect" className="w-28 h-9 rounded-lg" />
        </div>
      </div>

      {/* Month nav */}
      <div className="flex justify-center">
        <Skeleton variant="text" className="w-40 h-6" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="w-20 h-7 rounded-full" />
        ))}
      </div>

      {/* Cash flow bar */}
      <Skeleton variant="rect" className="w-full h-36 rounded-xl" />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton variant="rect" className="w-full h-[500px] rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton variant="rect" className="w-full h-64 rounded-xl" />
          <Skeleton variant="rect" className="w-full h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
