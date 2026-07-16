import type { ReactNode } from 'react'

interface PageTitleProps {
  title: string
  subtitle?: string
  /** Acción a la derecha del título. */
  action?: ReactNode
}

/** Cabecera grande de una pantalla. */
export function PageTitle({ title, subtitle, action }: PageTitleProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text/50">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
