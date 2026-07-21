/**
 * Skeletons para la pantalla de Progreso.
 */

import { Skeleton, SkeletonText } from '../ui/Skeleton'

export function ChartSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4">
      <SkeletonText lines={1} className="mb-4 w-1/3" />
      <Skeleton className="h-60 w-full rounded" />
    </div>
  )
}

export function PRCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4 space-y-2">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export function ProgressDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-lg p-3 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <ChartSkeleton />
      <ChartSkeleton />

      {/* PRs */}
      <div>
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <PRCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
