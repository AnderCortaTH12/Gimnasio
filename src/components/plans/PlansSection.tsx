import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ClipboardList, Plus } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession } from '../../types'
import { leerPlanesUsuario, eliminarPlan } from '../../db/db'
import { WORKOUT_PLANS } from '../../data/workoutPlans'
import { sugerirPlanes } from '../../recommendations'
import { useSessionStore } from '../../store/sessionStore'
import { SectionHeader, Toast, type ToastData } from '../ui'
import { PlanCard } from './PlanCard'
import { PlanForm } from './PlanForm'

interface Props {
  /** Sesiones completadas (historial), para ordenar sugerencias. */
  sessions: WorkoutSession[]
}

/** Sección "Planes disponibles": sistema + personales, con crear/editar. */
export function PlansSection({ sessions }: Props) {
  const navigate = useNavigate()
  const active = useSessionStore((s) => s.active)
  const iniciarPlan = useSessionStore((s) => s.iniciarPlan)

  const personales = useLiveQuery(() => leerPlanesUsuario(), [], [])
  const [form, setForm] = useState(false)
  const [editando, setEditando] = useState<WorkoutPlan | undefined>()
  const [toast, setToast] = useState<ToastData | null>(null)

  // Sistema + personales, ordenados por relevancia (personales primero).
  const sugerencias = useMemo(
    () => sugerirPlanes(sessions, [...personales, ...WORKOUT_PLANS]),
    [sessions, personales],
  )

  const abrirCrear = () => {
    setEditando(undefined)
    setForm(true)
  }

  const seleccionar = async (plan: WorkoutPlan) => {
    if (active) return
    await iniciarPlan(plan)
    navigate('/entrenar')
  }

  const borrar = async (plan: WorkoutPlan) => {
    if (
      window.confirm(
        `¿Eliminar el plan "${plan.name}"? No afecta a sesiones ya realizadas.`,
      )
    ) {
      await eliminarPlan(plan.id)
      setToast({ tone: 'success', message: 'Plan eliminado' })
    }
  }

  return (
    <div className="mb-6">
      <SectionHeader
        title="Planes disponibles"
        subtitle="Sugeridos según tu historial"
        action={
          <button
            onClick={abrirCrear}
            className="inline-flex items-center gap-1 rounded-full bg-lime/15 px-3 py-1.5 text-xs font-bold text-lime active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear plan
          </button>
        }
      />

      <div className="flex flex-col gap-2.5">
        {sugerencias.map(({ plan, porque }) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            porque={porque}
            disabled={!!active}
            onSelect={() => seleccionar(plan)}
            onEdit={
              plan.createdBy === 'user'
                ? () => {
                    setEditando(plan)
                    setForm(true)
                  }
                : undefined
            }
            onDelete={plan.createdBy === 'user' ? () => borrar(plan) : undefined}
          />
        ))}

        {sugerencias.length === 0 && (
          <button
            onClick={abrirCrear}
            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-8 text-sm text-text/40"
          >
            <ClipboardList className="h-6 w-6" />
            Crea tu primer plan personalizado
          </button>
        )}
      </div>

      <PlanForm
        // key fuerza re-montar el formulario al cambiar de plan a editar.
        key={editando?.id ?? 'nuevo'}
        open={form}
        plan={editando}
        onClose={() => setForm(false)}
        onSaved={(accion) =>
          setToast({
            tone: 'success',
            message: accion === 'creado' ? 'Plan creado' : 'Plan actualizado',
          })
        }
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
