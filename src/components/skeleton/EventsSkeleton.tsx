interface LoadingEventsSkeletonProps {
    theme: 'light' | 'dark';
  }
  
  export default function EventsSkeleton({ theme }: LoadingEventsSkeletonProps) {
    const baseBg = theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-md';
    const textBg = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300/30';
  
    return (
      <div className="space-y-6 animate-pulse">
        {/* Page Header Skeleton */}
        <div className={`rounded-lg p-6 ${baseBg} w-full`}>
          <div className="h-10 w-72 rounded mb-2 bg-gray-300/30"></div>
          <div className={`h-4 w-52 rounded ${textBg}`}></div>
        </div>
       
        {/* Filter Bar Skeleton */}
        <div className={`rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 ${baseBg} w-full`}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="h-20 w-full rounded-lg bg-gray-300/30"></div>
          ))}
        </div>
        <div className={`rounded-lg p-4 flex gap-4 ${baseBg} w-full`}>
         
         <div  className="h-8 w-full rounded bg-gray-600/30"></div>
          
        </div>
  
        {/* Events Grid/List Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, ].map((_, idx) => (
            <div key={idx} className={`rounded-lg p-4 ${baseBg}`}>
              <div className="h-32 w-full mb-4 rounded-md bg-gray-300/20"></div>
              <div className="h-5 w-48 mb-2 rounded bg-gray-300/30"></div>
              <div className="h-4 w-32 mb-1 rounded bg-gray-300/20"></div>
              
            </div>
          ))}
        </div>
  
        {/* Load More / Pagination Skeleton */}
        <div className="flex justify-center pt-4">
          <div className="h-10 w-32 rounded bg-gray-300/30"></div>
        </div>
      </div>
    );
  }
  