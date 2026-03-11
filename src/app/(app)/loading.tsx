export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="space-y-3 text-center">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-3">Loading...</p>
      </div>
    </div>
  )
}
