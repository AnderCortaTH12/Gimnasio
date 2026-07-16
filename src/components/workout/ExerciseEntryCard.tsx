import { useState } from 'react'
import { Plus, MoreVertical, Trash2, StickyNote } from 'lucide-react'
import type { ExerciseEntry, SetEntry } from '../../types'
import { obtenerEjercicio } from '../../data/catalogRegistry'
import { ExerciseGif } from '../ExerciseGif'
import { Card } from '../ui'
import { SetRow } from './SetRow'

interface Props {
  entry: ExerciseEntry
  onAddSet: () => void
  onUpdateSet: (setId: string, patch: Partial<SetEntry>) => void
  onToggleSet: (setId: string) => void
  onRemoveSet: (setId: string) => void
  onUpdateNotes: (notes: string) => void
  onRemove: () => void
}

/** Tarjeta de un ejercicio dentro de la sesión: cabecera + series + notas. */
export function ExerciseEntryCard({
  entry,
  onAddSet,
  onUpdateSet,
  onToggleSet,
  onRemoveSet,
  onUpdateNotes,
  onRemove,
}: Props) {
  const [menu, setMenu] = useState(false)
  const [notasAbiertas, setNotasAbiertas] = useState(!!entry.notes)
  const completadas = entry.sets.filter((s) => s.completed).length
  // Resolvemos el ejercicio del catálogo para mostrar su animación.
  const ejercicio = obtenerEjercicio(entry.exerciseId)

  return (
    <Card className="p-3">
      {/* Cabecera */}
      <div className="mb-2 flex items-center gap-2">
        <ExerciseGif
          gifUrl={ejercicio?.gifUrl}
          name={entry.exerciseName}
          variant="preview"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-text">{entry.exerciseName}</p>
          <p className="text-xs text-text/40">
            {completadas}/{entry.sets.length} series completadas
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text/50 active:scale-90"
            aria-label="Opciones del ejercicio"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menu && (
            <>
              <button
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenu(false)}
                aria-hidden
              />
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
                <button
                  onClick={() => {
                    setNotasAbiertas(true)
                    setMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-text active:bg-white/5"
                >
                  <StickyNote className="h-4 w-4 text-text/50" />
                  Añadir nota
                </button>
                <button
                  onClick={() => {
                    onRemove()
                    setMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-regress active:bg-white/5"
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar ejercicio
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cabecera de columnas */}
      <div className="mb-1 flex items-center gap-2 px-1.5 text-[10px] font-bold uppercase tracking-wide text-text/30">
        <span className="w-6 text-center">#</span>
        <div className="grid flex-1 grid-cols-3 gap-1.5 text-center">
          <span>Kg</span>
          <span>Reps</span>
          <span>RPE</span>
        </div>
        <span className="w-9" />
        <span className="w-8" />
      </div>

      {/* Series */}
      <div className="flex flex-col gap-1">
        {entry.sets.map((s) => (
          <SetRow
            key={s.id}
            set={s}
            onChange={(patch) => onUpdateSet(s.id, patch)}
            onToggle={() => onToggleSet(s.id)}
            onRemove={() => onRemoveSet(s.id)}
          />
        ))}
      </div>

      {/* Notas */}
      {notasAbiertas && (
        <input
          type="text"
          value={entry.notes ?? ''}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Nota del ejercicio…"
          className="mt-2 h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text placeholder:text-text/30 focus:border-lime/50 focus:outline-none"
        />
      )}

      {/* Añadir serie */}
      <button
        onClick={onAddSet}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-sm font-semibold text-text/60 transition-colors active:bg-white/5"
      >
        <Plus className="h-4 w-4" />
        Añadir serie
      </button>
    </Card>
  )
}
