import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Hoja inferior modal reutilizable (bottom sheet). */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/60"
      />
      <div className="relative mx-auto flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl border border-border bg-bg pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-bg px-4 py-4">
          <h2 className="text-lg font-black text-text">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text/60 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 pt-4">{children}</div>
      </div>
    </div>
  )
}
