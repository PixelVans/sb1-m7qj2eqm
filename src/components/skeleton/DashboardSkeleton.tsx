

interface DashboardSkeletonProps {
  theme: 'light' | 'dark';
}

export default function DashboardSkeleton({ theme }: DashboardSkeletonProps) {
  const baseBg = theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-lg';
  const textBg = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300/30';

  return (
    <div>
      loading..
    </div>
  );
}


