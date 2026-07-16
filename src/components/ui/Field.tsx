import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Etiqueta + control de formulario. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-text/60">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text/40">{hint}</span>}
    </label>
  )
}

/** Input de texto/número con estilo consistente. */
export function TextInput({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text placeholder:text-text/30 focus:border-lime/50 focus:outline-none',
        className,
      )}
      {...rest}
    />
  )
}

/** Grupo de botones tipo segmento para elegir una opción. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all active:scale-95',
            value === o.value
              ? 'border-lime bg-lime text-bg'
              : 'border-border bg-surface text-text/70',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
