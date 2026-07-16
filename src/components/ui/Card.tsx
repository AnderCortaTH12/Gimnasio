import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Añade realce al pulsar/hover (para tarjetas navegables). */
  interactive?: boolean
}

/** Contenedor base con superficie, borde redondeado generoso y sombra suave. */
export function Card({ interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface p-4 shadow-lg shadow-black/20',
        interactive &&
          'cursor-pointer transition-all duration-150 hover:border-lime/40 hover:shadow-black/40 active:scale-[0.98]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
