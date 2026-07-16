import { useState } from 'react'
import { Clock, MoreVertical, Pencil, Trash2, Play, User, Dumbbell } from 'lucide-react'
import type { WorkoutPlan } from '../../types'
import { musculosDelPlan } from '../../recommendations'
import { DIFICULTAD_ES } from '../../data/workoutPlans'
import { traducirMusculo } from '../../data/muscles'
import { Card, Badge, Button } from '../ui'

interface Props {
  plan: WorkoutPlan
  /** Motivo de la sugerencia (opcional). */
  porque?: string
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
  /** Si hay una sesión activa, no se puede seleccionar otro plan. */
  disabled?: boolean
}

/** Tarjeta de un plan: info + seleccionar + menú (solo planes de usuario). */
export function PlanCard({
  plan,
  porque,
  onSelect,
  onEdit,
  onDelete,
  disabled,
}: Props) {
  const [menu, setMenu] = useState(false)
  const esUsuario = plan.createdBy === 'user'
  const musculos = musculosDelPlan(plan).slice(0, 3)

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-bold text-text">{plan.name}</h3>
            {esUsuario && (
              <Badge tone="lime">
                <User className="mr-0.5 inline h-3 w-3" />
                Personal
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm leading-snug text-text/55">
            {porque ?? plan.description}
          </p>
        </div>

        {esUsuario && (onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setMenu((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text/50 active:scale-90"
              aria-label="Opciones del plan"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {menu && (
              <>
                {/* Capa para cerrar al tocar fuera */}
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  aria-hidden
                  onClick={() => setMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-surface shadow-xl shadow-black/40">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setMenu(false)
                        onEdit()
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-text active:bg-white/5"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setMenu(false)
                        onDelete()
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-regress active:bg-white/5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Metadatos */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">
          <Dumbbell className="mr-0.5 inline h-3 w-3" />
          {plan.exerciseIds.length} ejerc.
        </Badge>
        <Badge tone="neutral">
          <Clock className="mr-0.5 inline h-3 w-3" />
          {plan.estimatedMinutes} min
        </Badge>
        <Badge tone="warn">{DIFICULTAD_ES[plan.difficulty]}</Badge>
        {musculos.map((m) => (
          <Badge key={m} tone="lime">
            {traducirMusculo(m)}
          </Badge>
        ))}
      </div>

      <Button
        fullWidth
        leftIcon={<Play className="h-4 w-4" />}
        onClick={onSelect}
        disabled={disabled}
      >
        {disabled ? 'Termina tu sesión actual' : 'Seleccionar'}
      </Button>
    </Card>
  )
}
