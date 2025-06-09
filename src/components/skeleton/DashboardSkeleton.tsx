

interface DashboardSkeletonProps {
  theme: 'light' | 'dark';
}

export default function DashboardSkeleton({ theme }: DashboardSkeletonProps) {
  const baseBg = theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-lg';
  const textBg = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300/30';

  return (
    <div className="space-y-8 animate-pulse">
     
      {/* Welcome Skeleton */}
      <div
        className={`relative rounded-lg p-8 overflow-hidden onboarding-welcome ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-purple-600/20 to-blue-500/20 shadow-black shadow-sm '
            : 'bg-white shadow-lg'
        } `}
          ><div className="flex">
          <div className="h-12 w-48 sm:w-60 mb-4 rounded animate-pulse bg-gray-300/30"></div>        
          <div className="h-8 w-28 ml-3 mt-3 mb-4 rounded animate-pulse bg-yellow-700 blur-sm"></div>        
      </div>
        
        
        <div className={`h-5 w-56 sm:w-96 rounded italic animate-pulse ${textBg}`}></div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((_, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-6 flex justify-between items-center onboarding-create-event cursor-pointer ${
              theme === 'dark' ? 'bg-white/5 shadow-black shadow-md' : 'bg-white shadow-lg'
            } `}
          >
            <div>
              <div className="h-6 w-6 mb-2 rounded bg-purple-500/50 animate-pulse"></div>
              <div className="h-10 w-20 rounded bg-gray-300/30 animate-pulse mb-1"></div>
              <div className={`h-4 w-32 rounded ${textBg} animate-pulse`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Events Skeleton */}
      <div className={`rounded-lg p-6 onboarding-recent-events ${baseBg} `}>
        <div className="flex justify-between items-center mb-4 w-full">
          <div className="h-6 w-32 sm:w-40 rounded bg-gray-300/30 animate-pulse"></div>
          <div className="h-6 w-20 rounded bg-gray-300/30 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((_, idx) => (
            <div
              key={idx}
              className={`flex justify-between items-center p-4 rounded-lg ${
                theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
              } w-full`}
            >
              <div>
                <div className={`h-5 w-32 sm:w-40 mb-1 rounded ${textBg} animate-pulse`}></div>
                <div className="h-4 w-24 rounded bg-gray-300/20 animate-pulse"></div>
              </div>
              <div className="h-6 w-20 rounded-full bg-gray-300/30 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Requests Skeletons */}
      {[true, false].map((_, idx) => (
        <div
          key={idx}
          className={`rounded-lg p-6 ${baseBg} `}
        >
          <div className="h-6 w-52 sm:w-64 mb-4 rounded bg-gray-300/30 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((__, i) => (
              <div
                key={i}
                className={`flex justify-between items-center p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                } w-full`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-primary/40 animate-pulse"></div>
                  <div>
                    <div className={`h-5 w-48 rounded ${textBg} animate-pulse mb-1`}></div>
                    <div className="h-4 w-36 rounded bg-gray-300/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-5 w-12 rounded bg-gray-300/20 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
