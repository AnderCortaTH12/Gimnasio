/**
 * Skeletons para calendario y pantalla HOY.
 */

import { Skeleton } from '../ui/Skeleton'

export function CalendarSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-sm" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Grid de días (7x6) */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, col) => (
              <Skeleton key={col} className="aspect-square rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function TodayCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 space-y-4">
      {/* Encabezado */}
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-6 w-2/3" />

      {/* Ejercicios */}
      <div>
        <Skeleton className="h-4 w-1/3 mb-2" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded" />
          ))}
        </div>
      </div>

      {/* Botón */}
      <Skeleton className="h-12 w-full rounded-lg mt-4" />
    </div>
  )
}

export function WeekStripSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-4 space-y-3">
      <Skeleton className="h-4 w-1/4" />
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 aspect-square rounded" />
        ))}
      </div>
    </div>
  )
}
