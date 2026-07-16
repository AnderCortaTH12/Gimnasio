import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { Exercise, WorkoutPlan, PlanDifficulty } from '../../types'
import { crearPlan, editarPlan } from '../../db/db'
import { ExercisePickerSheet } from '../ExercisePickerSheet'
import { Sheet, Field, TextInput, SegmentedControl, Button } from '../ui'

interface ItemPlan {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: number
}

interface Props {
  open: boolean
  onClose: () => void
  /** Plan a editar; si se omite, se crea uno nuevo. */
  plan?: WorkoutPlan
  /** Se llama tras guardar con éxito (crear o editar). */
  onSaved: (accion: 'creado' | 'editado') => void
}

const DIFICULTADES: { value: PlanDifficulty; label: string }[] = [
  { value: 'principiante', label: 'Fácil' },
  { value: 'intermedio', label: 'Medio' },
  { value: 'avanzado', label: 'Difícil' },
]

/** Formulario (bottom sheet) para crear o editar un plan personalizado. */
export function PlanForm({ open, onClose, plan, onSaved }: Props) {
  const editando = !!plan
  const [name, setName] = useState(plan?.name ?? '')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [difficulty, setDifficulty] = useState<PlanDifficulty>(
    plan?.difficulty ?? 'intermedio',
  )
  const [minutos, setMinutos] = useState(String(plan?.estimatedMinutes ?? 45))
  const [items, setItems] = useState<ItemPlan[]>(
    plan
      ? plan.exerciseIds.map((id, i) => ({
          exerciseId: id,
          exerciseName: id,
          sets: plan.exerciseReps?.[i]?.sets ?? 3,
          reps: plan.exerciseReps?.[i]?.reps ?? 10,
        }))
      : [],
  )
  const [picker, setPicker] = useState(false)
  const [error, setError] = useState('')

  const anadir = (ex: Exercise) => {
    setItems((prev) =>
      prev.some((i) => i.exerciseId === ex.id)
        ? prev
        : [...prev, { exerciseId: ex.id, exerciseName: ex.name, sets: 3, reps: 10 }],
    )
    setPicker(false)
  }

  const cambiar = (id: string, patch: Partial<ItemPlan>) =>
    setItems((prev) =>
      prev.map((i) => (i.exerciseId === id ? { ...i, ...patch } : i)),
    )

  const quitar = (id: string) =>
    setItems((prev) => prev.filter((i) => i.exerciseId !== id))

  const guardar = async () => {
    if (!name.trim()) return setError('Ponle un nombre al plan.')
    if (items.length === 0) return setError('Añade al menos un ejercicio.')
    const data = {
      name: name.trim(),
      description: description.trim() || 'Plan personalizado.',
      exerciseIds: items.map((i) => i.exerciseId),
      exerciseReps: items.map((i) => ({
        sets: Math.max(1, i.sets),
        reps: Math.max(1, i.reps),
      })),
      difficulty,
      estimatedMinutes: Math.max(5, Number(minutos) || 45),
    }
    if (editando && plan) {
      await editarPlan(plan.id, data)
      onSaved('editado')
    } else {
      await crearPlan(data)
      onSaved('creado')
    }
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editando ? 'Editar plan' : 'Crear plan'}
    >
      <div className="flex flex-col gap-4">
        <Field label="Nombre">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi rutina de empuje"
            maxLength={40}
          />
        </Field>

        <Field label="Descripción">
          <TextInput
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Pecho y hombros, día pesado"
            maxLength={80}
          />
        </Field>

        <Field label="Dificultad">
          <SegmentedControl
            value={difficulty}
            options={DIFICULTADES}
            onChange={setDifficulty}
          />
        </Field>

        <Field label="Tiempo estimado (min)">
          <TextInput
            type="number"
            inputMode="numeric"
            value={minutos}
            onChange={(e) => setMinutos(e.target.value)}
            className="w-28"
          />
        </Field>

        {/* Ejercicios del plan */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-text/60">
              Ejercicios ({items.length})
            </span>
            <button
              onClick={() => setPicker(true)}
              className="inline-flex items-center gap-1 rounded-full bg-lime/15 px-3 py-1.5 text-xs font-bold text-lime active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir
            </button>
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-text/40">
              Sin ejercicios todavía.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((it) => (
                <li
                  key={it.exerciseId}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-text/25" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
                    {it.exerciseName}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-bold text-text">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={it.sets}
                      onChange={(e) =>
                        cambiar(it.exerciseId, { sets: Number(e.target.value) })
                      }
                      className="h-9 w-11 rounded-lg border border-border bg-bg text-center tabular-nums focus:border-lime/50 focus:outline-none"
                      aria-label="Series"
                    />
                    <span className="text-text/40">×</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={it.reps}
                      onChange={(e) =>
                        cambiar(it.exerciseId, { reps: Number(e.target.value) })
                      }
                      className="h-9 w-11 rounded-lg border border-border bg-bg text-center tabular-nums focus:border-lime/50 focus:outline-none"
                      aria-label="Repeticiones"
                    />
                  </div>
                  <button
                    onClick={() => quitar(it.exerciseId)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-regress active:scale-90"
                    aria-label="Quitar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm font-medium text-regress">{error}</p>}

        <Button fullWidth size="lg" onClick={guardar}>
          {editando ? 'Guardar cambios' : 'Crear plan'}
        </Button>
      </div>

      <ExercisePickerSheet
        open={picker}
        onClose={() => setPicker(false)}
        yaAnadidos={items.map((i) => i.exerciseId)}
        onPick={anadir}
      />
    </Sheet>
  )
}
