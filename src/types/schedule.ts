/**
 * Tipos para el calendario de entrenamientos y planificación semanal.
 */

export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced'
export type TrainingGoal = 'strength' | 'hypertrophy' | 'maintenance'
export type EquipmentType = 'full_gym' | 'basic' | 'home'
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 6 = Saturday
export type TrainingType =
  | 'full_body'
  | 'upper'
  | 'lower'
  | 'push'
  | 'pull'
  | 'legs'
  | 'rest'

export interface OnboardingData {
  level: TrainingLevel
  goal: TrainingGoal
  daysPerWeek: number // 2-6
  trainingDays: DayOfWeek[] // ej. [1, 3, 5] = lunes, miércoles, viernes
  sessionDurationMinutes: number
  equipment: EquipmentType
  completedAt: number // timestamp
}

export interface TrainingScheduleEntry {
  dayOfWeek: DayOfWeek
  trainingType: TrainingType
  planId?: string // referencia al plan de la Fase 7 (opcional)
  exerciseIds?: string[] // ejercicios específicos de este día
}

export interface TrainingSchedule {
  id: string
  createdAt: number
  updatedAt: number
  onboarding: OnboardingData
  weekPlan: TrainingScheduleEntry[] // 7 entradas, una por cada día
  isActive: boolean
}

export interface CompletedDay {
  id: string
  date: string // YYYY-MM-DD
  dayOfWeek: DayOfWeek
  trainingType: TrainingType
  sessionId: string // referencia a WorkoutSession en historial
  completedAt: number
  skipped: boolean // true si fue un día que se saltó
}

/**
 * Interpretación visual de cada tipo de entrenamiento.
 * Usado para colores en calendario y en HOY.
 */
export const TRAINING_TYPE_COLORS: Record<TrainingType, { bg: string; text: string; label: string }> = {
  full_body: { bg: '#4ADE80', text: '#0B0B0F', label: 'Full Body' },
  upper: { bg: '#60A5FA', text: '#F5F5F7', label: 'Torso' },
  lower: { bg: '#F97316', text: '#F5F5F7', label: 'Piernas' },
  push: { bg: '#A855F7', text: '#F5F5F7', label: 'Empuje' },
  pull: { bg: '#06B6D4', text: '#0B0B0F', label: 'Tracción' },
  legs: { bg: '#F97316', text: '#F5F5F7', label: 'Piernas' },
  rest: { bg: '#404040', text: '#A0A0A0', label: 'Descanso' },
}
