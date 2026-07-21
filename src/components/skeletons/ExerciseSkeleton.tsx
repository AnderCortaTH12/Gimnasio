/**
 * Skeletons para pantallas de ejercicios.
 */

import { Skeleton, SkeletonText } from '../ui/Skeleton'

export function ExerciseCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-3 space-y-3">
      <Skeleton className="h-20 w-full rounded-lg" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
    </div>
  )
}

export function ExerciseListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ExerciseDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Título */}
      <Skeleton className="h-8 w-3/4" />

      {/* GIF */}
      <Skeleton className="h-80 w-full rounded-2xl" />

      {/* Descripción */}
      <SkeletonText lines={4} />

      {/* Grupo muscular chips */}
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Instrucciones */}
      <div>
        <Skeleton className="h-6 w-32 mb-3" />
        <SkeletonText lines={5} />
      </div>
    </div>
  )
}
