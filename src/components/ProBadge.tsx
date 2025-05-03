import { SparklesIcon } from 'lucide-react';

export function ProBadge() {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-medium">
      <SparklesIcon className="h-3 w-3" />
      Pro
    </div>
  );
}