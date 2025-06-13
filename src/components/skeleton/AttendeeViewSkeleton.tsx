
export default function AttendeeViewSkeleton() {
  return (
    <div className="min-h-screen bg-[#121212] text-white animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-b from-purple-900/50 to-transparent px-4 py-12 animate-pulse">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="h-10 w-64 mx-auto bg-white/10 rounded-lg" />
          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/10" />
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-4 w-4 bg-white/10 rounded" />
          </div>
          <div className="h-3 w-72 bg-slate-700 rounded mx-auto animate-pulse" />
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6 animate-pulse">
        {/* Request Form Skeleton */}
        <div className="bg-white/5 rounded-lg p-4 space-y-4 animate-pulse">
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/20 rounded" />
            <div className="h-10 w-full bg-white/10 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/20 rounded" />
            <div className="h-10 w-full bg-white/10 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-32 bg-white/20 rounded" />
            <div className="h-10 w-full bg-white/10 rounded" />
          </div>
          <div className="h-10 w-full bg-white/10 rounded" />
        </div>

        {/* Song Requests Skeleton */}
        <div className="bg-white/5 rounded-lg p-4 space-y-4 animate-pulse">
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/20 rounded" />
                  <div className="h-3 w-24 bg-white/10 rounded" />
                  <div className="h-3 w-20 bg-white/10 rounded" />
                </div>
                <div className="h-8 w-16 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
