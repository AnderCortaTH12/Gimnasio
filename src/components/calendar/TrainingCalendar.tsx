/**
 * Calendario mensual de entrenamientos.
 *
 * Muestra:
 * - Días planificados (coloreados por tipo)
 * - Días completados (check)
 * - Días saltados (tenue)
 * - Descanso (neutro)
 *
 * Al pulsar un día: abre detalle con la sesión/entrenamiento del día.
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { TRAINING_TYPE_COLORS, type TrainingType, type TrainingScheduleEntry } from '../../types/schedule'

interface Props {
  weekPlan: TrainingScheduleEntry[]
  completedDays: Record<string, { completed: boolean; skipped: boolean }>
  onSelectDay?: (date: string, training: TrainingScheduleEntry) => void
}

export function TrainingCalendar({ weekPlan, completedDays, onSelectDay }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDay.getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(i)
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDayClick = (dayNum: number) => {
    const date = new Date(year, month, dayNum)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const training = weekPlan[dayOfWeek]

    onSelectDay?.(dateStr, training)
  }

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    currentDate,
  )

  return (
    <div className="bg-surface rounded-2xl p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-text capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5 text-text" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Próximo mes"
          >
            <ChevronRight className="w-5 h-5 text-text" />
          </button>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-border">
        {Object.entries(TRAINING_TYPE_COLORS)
          .filter(([type]) => type !== 'rest')
          .map(([type, { bg, label }]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: bg }}
              />
              <span className="text-text/50 text-xs">{label}</span>
            </div>
          ))}
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map((day) => (
          <div
            key={day}
            className="text-center text-text/50 text-xs font-semibold py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const date = new Date(year, month, dayNum)
          const dateStr = date.toISOString().split('T')[0]
          const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
          const training = weekPlan[dayOfWeek]
          const status = completedDays[dateStr]
          const colors = TRAINING_TYPE_COLORS[training.trainingType as TrainingType]

          const isToday = new Date().toISOString().split('T')[0] === dateStr
          const isCompleted = status?.completed
          const isSkipped = status?.skipped

          return (
            <button
              key={dayNum}
              onClick={() => handleDayClick(dayNum)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all relative',
                isCompleted || training.trainingType === 'rest'
                  ? 'bg-white/5 border border-border'
                  : 'border-2',
                isCompleted
                  ? 'bg-lime/20 border-lime text-lime'
                  : isSkipped
                    ? 'bg-white/5 border-warn text-text/30'
                    : training.trainingType === 'rest'
                      ? 'text-text/30'
                      : 'border-[' + colors.bg + '] text-text hover:shadow-lg',
                isToday && 'ring-2 ring-lime ring-offset-2 ring-offset-bg',
              )}
              style={
                !isCompleted && !isSkipped && training.trainingType !== 'rest'
                  ? { borderColor: colors.bg }
                  : undefined
              }
            >
              <span>{dayNum}</span>
              {isCompleted && (
                <Check className="w-3 h-3 absolute bottom-1 right-1" />
              )}
              {isSkipped && (
                <AlertCircle className="w-3 h-3 absolute bottom-1 right-1" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
