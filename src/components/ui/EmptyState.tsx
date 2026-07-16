import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  /** Acción principal opcional (CTA). */
  action?: ReactNode
}

/** Estado vacío elegante: icono en círculo, título, descripción y CTA. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
        <Icon className="h-7 w-7 text-lime" strokeWidth={2} aria-hidden />
      </div>
      <h3 className="text-base font-bold text-text">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-text/50">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
