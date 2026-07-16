import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface StatNumberProps {
  /** Valor destacado (número en extrabold). */
  value: ReactNode
  /** Unidad opcional, más pequeña y atenuada (kg, reps, %...). */
  unit?: string
  /** Etiqueta descriptiva debajo. */
  label?: string
  /** Color del número. */
  tone?: 'default' | 'lime' | 'pr' | 'regress' | 'warn'
  className?: string
}

const TONES = {
  default: 'text-text',
  lime: 'text-lime',
  pr: 'text-pr',
  regress: 'text-regress',
  warn: 'text-warn',
}

/** Cifra destacada con unidad y etiqueta. Números en extrabold + tabulares. */
export function StatNumber({
  value,
  unit,
  label,
  tone = 'default',
  className,
}: StatNumberProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'text-2xl font-extrabold tabular-nums leading-none',
            TONES[tone],
          )}
        >
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-text/50">{unit}</span>}
      </div>
      {label && (
        <span className="mt-1 text-xs font-medium text-text/50">{label}</span>
      )}
    </div>
  )
}
