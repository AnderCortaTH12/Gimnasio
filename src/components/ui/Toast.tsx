import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export type ToastTone = 'success' | 'error' | 'loading'

export interface ToastData {
  tone: ToastTone
  message: string
}

interface Props {
  toast: ToastData | null
  onClose: () => void
}

const META = {
  success: { icon: CheckCircle2, color: 'text-pr', spin: false },
  error: { icon: AlertCircle, color: 'text-regress', spin: false },
  loading: { icon: Loader2, color: 'text-lime', spin: true },
}

/** Toast flotante inferior con auto-cierre (salvo en estado "loading"). */
export function Toast({ toast, onClose }: Props) {
  useEffect(() => {
    if (!toast || toast.tone === 'loading') return
    const id = window.setTimeout(onClose, 3000)
    return () => window.clearTimeout(id)
  }, [toast, onClose])

  if (!toast) return null
  const { icon: Icon, color, spin } = META[toast.tone]

  return (
    <div
      className="fixed inset-x-0 z-[70] mx-auto flex max-w-md justify-center px-4"
      style={{ bottom: 'calc(88px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex animate-fade-in-up items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xl shadow-black/40">
        <Icon className={cn('h-5 w-5 shrink-0', color, spin && 'animate-spin')} />
        <span className="text-sm font-medium text-text">{toast.message}</span>
      </div>
    </div>
  )
}
