/**
 * Tarjeta protagonista de la pantalla HOY.
 *
 * Muestra el entrenamiento que toca hoy:
 * - Tipo de entrenamiento (Empuje, Tracción, etc.)
 * - Ejercicios clave
 * - Duración estimada
 * - Botón "Empezar entrenamiento"
 */

import { Play, Zap } from 'lucide-react'
import { TRAINING_TYPE_COLORS, type TrainingScheduleEntry } from '../../types/schedule'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

interface Props {
  training: TrainingScheduleEntry
  isRest: boolean
  onStart?: () => void
  loading?: boolean
}

export function TodayWorkoutCard({ training, isRest, onStart, loading }: Props) {
  if (isRest) {
    return (
      <div className="bg-surface rounded-2xl p-6 mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <Zap className="w-6 h-6 text-text/30" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-text">Hoy descansas</h2>
            <p className="text-text/50 text-sm">Recuperación activa o descanso completo</p>
          </div>
        </div>
        <Button onClick={onStart} disabled={loading} variant="outline" className="w-full">
          Entrenar igualmente
        </Button>
      </div>
    )
  }

  const colors = TRAINING_TYPE_COLORS[training.trainingType] || TRAINING_TYPE_COLORS.full_body

  return (
    <div
      className="rounded-2xl p-6 mb-6 border-2 space-y-4"
      style={{ borderColor: colors.bg, backgroundColor: colors.bg + '15' }}
    >
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text/50 text-sm font-medium mb-1">Hoy te toca:</p>
          <h2
            className="text-2xl font-extrabold"
            style={{ color: colors.bg }}
          >
            {colors.label}
          </h2>
        </div>
        <div
          className="px-3 py-1 rounded-lg text-xs font-semibold"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          Hoy
        </div>
      </div>

      {/* Ejercicios placeholder (en futuro se pueden traer del plan) */}
      <div className="space-y-2">
        <p className="text-text/50 text-xs font-medium">EJERCICIOS TÍPICOS:</p>
        <div className="flex flex-wrap gap-1">
          {[
            training.trainingType === 'push' && 'Press',
            training.trainingType === 'pull' && 'Jalón',
            training.trainingType === 'legs' && 'Sentadilla',
            training.trainingType === 'upper' && 'Remo',
            training.trainingType === 'lower' && 'Peso muerto',
            training.trainingType === 'full_body' && 'Squat',
          ]
            .filter((x): x is string => typeof x === 'string')
            .map((ex) => (
              <span
                key={ex}
                className="px-2 py-1 rounded text-xs bg-white/10 text-text/70"
              >
                {ex}
              </span>
            ))}
        </div>
      </div>

      {/* Duración estimada */}
      <div className="flex items-center gap-2 text-sm text-text/70">
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: colors.bg }}
        />
        <span>~60 min</span>
      </div>

      {/* Botón CTA */}
      <Button
        onClick={onStart}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-2 font-extrabold py-3',
        )}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
        }}
      >
        <Play className="w-5 h-5" />
        {loading ? 'Iniciando...' : 'Empezar entrenamiento'}
      </Button>
    </div>
  )
}
