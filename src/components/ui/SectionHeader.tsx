import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SectionHeaderProps {
  title: string
  /** Subtítulo o descripción opcional. */
  subtitle?: string
  /** Acción a la derecha (botón "ver todo", etc.). */
  action?: ReactNode
  className?: string
}

/** Cabecera de sección con título, subtítulo opcional y acción a la derecha. */
export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div>
        <h2 className="text-base font-bold tracking-tight text-text">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-text/50">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
