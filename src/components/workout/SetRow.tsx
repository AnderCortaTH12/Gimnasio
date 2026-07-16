import { Check, Trash2 } from 'lucide-react'
import type { SetEntry } from '../../types'
import { cn } from '../../lib/cn'

interface Props {
  set: SetEntry
  onChange: (patch: Partial<SetEntry>) => void
  onToggle: () => void
  onRemove: () => void
}

/** Campo numérico compacto para peso/reps/RPE. */
function NumField({
  value,
  onChange,
  step = 1,
  placeholder,
}: {
  value: number
  onChange: (v: number) => void
  step?: number
  placeholder?: string
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      value={value === 0 ? '' : value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      className="h-10 w-full rounded-lg border border-border bg-bg text-center text-sm font-bold tabular-nums text-text placeholder:font-normal placeholder:text-text/30 focus:border-lime/50 focus:outline-none"
    />
  )
}

/** Fila editable de una serie: nº, peso, reps, RPE, completar y eliminar. */
export function SetRow({ set, onChange, onToggle, onRemove }: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition-colors',
        set.completed && 'bg-pr/10',
      )}
    >
      <span className="w-6 shrink-0 text-center text-sm font-extrabold text-text/40">
        {set.order}
      </span>

      <div className="grid flex-1 grid-cols-3 gap-1.5">
        <NumField
          value={set.weight}
          step={2.5}
          placeholder="kg"
          onChange={(v) => onChange({ weight: v })}
        />
        <NumField
          value={set.reps}
          placeholder="reps"
          onChange={(v) => onChange({ reps: v })}
        />
        <NumField
          value={set.rpe ?? 0}
          placeholder="RPE"
          onChange={(v) => onChange({ rpe: v === 0 ? undefined : Math.min(10, v) })}
        />
      </div>

      <button
        onClick={onToggle}
        aria-label="Completar serie"
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-90',
          set.completed
            ? 'border-pr bg-pr text-bg'
            : 'border-border bg-bg text-text/30',
        )}
      >
        <Check className="h-5 w-5" strokeWidth={3} />
      </button>

      <button
        onClick={onRemove}
        aria-label="Eliminar serie"
        className="flex h-9 w-8 shrink-0 items-center justify-center text-text/25 active:scale-90 active:text-regress"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
