export function SkeletonLine({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
      <SkeletonLine className="h-5 w-3/4 mb-3" />
      <SkeletonLine className="h-3 w-full mb-2" />
      <SkeletonLine className="h-3 w-5/6 mb-4" />
      <div className="flex gap-2 mb-3">
        <SkeletonLine className="h-5 w-16 rounded-full" />
        <SkeletonLine className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonLine className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}