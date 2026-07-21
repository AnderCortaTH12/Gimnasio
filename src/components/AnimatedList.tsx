/**
 * Envoltorio para listas que anima sus items con stagger.
 *
 * Cada item entra con un delay proporcional a su índice,
 * creando un efecto de cascada sutil.
 */

import type { ReactNode } from 'react'

interface Props {
  children: ReactNode[]
  /** Delay inicial en ms (default: 0) */
  initialDelay?: number
  /** Delay entre items en ms (default: 50) */
  staggerDelay?: number
  /** Clase CSS del contenedor */
  className?: string
}

export function AnimatedList({
  children,
  initialDelay = 0,
  staggerDelay = 50,
  className = '',
}: Props) {
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className={className}>
      {Array.isArray(children) &&
        children.map((child, idx) => (
          <div
            key={idx}
            style={
              !prefersReducedMotion
                ? {
                    animation: `slideInUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                    animationDelay: `${initialDelay + idx * staggerDelay}ms`,
                    opacity: 0,
                  }
                : undefined
            }
          >
            {child}
          </div>
        ))}
    </div>
  )
}
