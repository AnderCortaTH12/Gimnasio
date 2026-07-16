import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'neutral' | 'lime' | 'pr' | 'regress' | 'warn'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  className?: string
}

const TONES: Record<Tone, string> = {
  neutral: 'bg-white/5 text-text/70 border-border',
  lime: 'bg-lime/15 text-lime border-lime/30',
  pr: 'bg-pr/15 text-pr border-pr/30',
  regress: 'bg-regress/15 text-regress border-regress/30',
  warn: 'bg-warn/15 text-warn border-warn/30',
}

/** Etiqueta compacta para metadatos (grupo muscular, equipo, estados...). */
export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
