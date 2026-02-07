/** Componentes Skeleton reutilizables para loading states */

export function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-7 w-32" />
          <SkeletonBox className="h-3 w-40" />
        </div>
        <SkeletonBox className="w-10 h-10 rounded-lg" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <SkeletonBox className="h-3 w-32 mb-6" />
      <div className="flex items-end gap-3 h-48">
        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
          <SkeletonBox key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
        <SkeletonBox className="h-3 w-40" />
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <SkeletonBox className="h-5 w-16 rounded-md" />
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-16 ml-auto" />
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-1.5 w-14 rounded-full" />
            <SkeletonBox className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="lg:col-span-3">
          <ChartSkeleton />
        </div>
      </div>
      <TableSkeleton rows={3} />
    </div>
  );
}
