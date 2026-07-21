/**
 * Skeleton screen con shimmer sutil.
 *
 * Imita la forma del contenido que va a aparecer.
 * Usa CSS animations con respeto a prefers-reduced-motion.
 */

import { cn } from '../../lib/cn'

interface Props {
  className?: string
  /** Si false, desactiva el shimmer (para user que prefieren no-motion). */
  animated?: boolean
}

export function Skeleton({ className, animated = true }: Props) {
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      className={cn(
        'bg-white/5 rounded-lg',
        !prefersReducedMotion && animated && 'animate-shimmer',
        className,
      )}
      style={
        !prefersReducedMotion && animated
          ? {
              backgroundImage:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }
          : undefined
      }
    />
  )
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && 'w-4/5', // última línea más corta
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={cn('bg-surface rounded-lg p-4 space-y-4', className)}>
      <Skeleton className="h-32 w-full rounded-lg" />
      <SkeletonText lines={3} />
    </div>
  )
}

export function SkeletonGrid({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
