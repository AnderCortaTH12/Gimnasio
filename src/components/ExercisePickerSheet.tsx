import { X, Plus } from 'lucide-react'
import type { Exercise } from '../types'
import { traducirMusculo, traducirEquipo } from '../data/muscles'
import { useExerciseFilter } from '../hooks/useExerciseFilter'
import { ExerciseFilters } from './ExerciseFilters'
import { Badge } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  onPick: (ex: Exercise) => void
  /** Ids ya presentes en la sesión (para marcarlos como añadidos). */
  yaAnadidos?: string[]
}

/** Hoja inferior para elegir un ejercicio del catálogo dentro de la sesión. */
export function ExercisePickerSheet({
  open,
  onClose,
  onPick,
  yaAnadidos = [],
}: Props) {
  const f = useExerciseFilter()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Fondo oscuro */}
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/60"
      />

      {/* Panel */}
      <div className="relative mx-auto flex max-h-[88vh] w-full max-w-md flex-col rounded-t-3xl border border-border bg-bg pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2 className="text-lg font-black text-text">Añadir ejercicio</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text/60 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4">
          <ExerciseFilters {...f} />
        </div>

        <ul className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
          {f.filtered.map((ex) => {
            const added = yaAnadidos.includes(ex.id)
            return (
              <li key={ex.id}>
                <button
                  onClick={() => onPick(ex)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2.5 text-left transition-colors active:bg-white/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime/10 text-xs font-black text-lime">
                    {traducirMusculo(ex.muscleGroup).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text">{ex.name}</p>
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      <Badge tone="lime">{traducirMusculo(ex.muscleGroup)}</Badge>
                      <Badge>{traducirEquipo(ex.equipment)}</Badge>
                    </div>
                  </div>
                  <span
                    className={
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full ' +
                      (added ? 'bg-pr/15 text-pr' : 'bg-lime/15 text-lime')
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
              </li>
            )
          })}
          {f.filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-text/40">
              Sin resultados
            </p>
          )}
        </ul>
      </div>
    </div>
  )
}
