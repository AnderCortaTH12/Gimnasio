/**
 * Tira horizontal de los 7 días de la semana.
 *
 * Muestra:
 * - Cada día con su color según el tipo de entrenamiento
 * - El día actual destacado
 * - Check en días completados
 * - Al pulsar: abre el calendario completo
 */

import { Check } from 'lucide-react'
import { TRAINING_TYPE_COLORS, type TrainingScheduleEntry } from '../../types/schedule'
import { cn } from '../../lib/cn'

interface Props {
  weekPlan: TrainingScheduleEntry[]
  completedDays: Record<string, { completed: boolean; skipped: boolean }>
  onViewCalendar?: () => void
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab']

export function WeekStrip({ weekPlan, completedDays, onViewCalendar }: Props) {
  const today = new Date()
  const todayDay = today.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6

  return (
    <button
      onClick={onViewCalendar}
      className={cn(
        'w-full bg-surface rounded-2xl p-4 mb-6 transition-all hover:shadow-lg',
        'active:scale-98',
      )}
    >
      <p className="text-text/50 text-xs font-medium mb-3">Esta semana</p>

      <div className="flex gap-2">
        {weekPlan.map((training, dayIdx) => {
          const colors = TRAINING_TYPE_COLORS[training.trainingType]
          const isToday = dayIdx === todayDay
          const dateStr = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (dayIdx - todayDay))
            .toISOString()
            .split('T')[0]
          const status = completedDays[dateStr]
          const isCompleted = status?.completed

          return (
            <div
              key={dayIdx}
              className={cn(
                'flex-1 aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all relative',
                training.trainingType === 'rest'
                  ? 'bg-white/5 text-text/30'
                  : isCompleted
                    ? 'bg-lime/20 text-lime'
                    : isToday
                      ? 'ring-2 ring-lime ring-offset-2 ring-offset-bg'
                      : '',
              )}
              style={
                training.trainingType !== 'rest' && !isCompleted && !isToday
                  ? { backgroundColor: colors.bg + '30', color: colors.bg }
                  : undefined
              }
            >
              <span>{DAY_NAMES[dayIdx].slice(0, 1)}</span>
              {isCompleted && (
                <Check className="w-2 h-2 absolute bottom-1 right-1" />
              )}
            </div>
          )
        })}
      </div>

      <p className="text-text/30 text-xs mt-3 text-center">Toca para ver el calendario completo</p>
    </button>
  )
}
