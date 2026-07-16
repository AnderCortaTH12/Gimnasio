/**
 * Modelos del registro de entrenamiento.
 *
 * Jerarquía: una WorkoutSession contiene varios ExerciseEntry, y cada
 * ExerciseEntry contiene varias SetEntry (series).
 */

/** Tipo de serie, para distinguir series efectivas de calentamiento, etc. */
export type SetType = 'normal' | 'calentamiento' | 'fallo' | 'dropset'

export interface SetEntry {
  /** Identificador único de la serie. */
  id: string
  /** Número de orden dentro del ejercicio (1, 2, 3...). */
  order: number
  /** Repeticiones realizadas. */
  reps: number
  /** Peso levantado, en la unidad del perfil (kg o lb). */
  weight: number
  /** Esfuerzo percibido (RPE 1-10), opcional. */
  rpe?: number
  /** Tipo de serie. */
  type: SetType
  /** Indica si esta serie completó un récord personal. */
  isPR?: boolean
  /** Marca de serie ya realizada (útil durante la sesión en vivo). */
  completed?: boolean
  /** Notas breves de la serie. */
  notes?: string
}

export interface ExerciseEntry {
  /** Identificador único del ejercicio dentro de la sesión. */
  id: string
  /** Referencia al ejercicio del catálogo (Exercise.id). */
  exerciseId: string
  /** Nombre cacheado del ejercicio (para no depender del catálogo al leer). */
  exerciseName: string
  /** Orden del ejercicio dentro de la sesión. */
  order: number
  /** Series registradas. */
  sets: SetEntry[]
  /** Descanso objetivo entre series, en segundos. */
  restSeconds?: number
  /** Notas del ejercicio. */
  notes?: string
}

/** Estado de una sesión de entrenamiento. */
export type SessionStatus = 'en-progreso' | 'completada' | 'cancelada'

export interface WorkoutSession {
  /** Identificador único de la sesión. */
  id: string
  /** Fecha de la sesión en formato ISO 8601. */
  date: string
  /** Momento de inicio (timestamp epoch ms). */
  startedAt: number
  /** Momento de finalización (timestamp epoch ms), si ha terminado. */
  finishedAt?: number
  /** Nombre o título de la sesión (p. ej. "Empuje A"). */
  name?: string
  /** Ejercicios realizados. */
  exercises: ExerciseEntry[]
  /** Estado de la sesión. */
  status: SessionStatus
  /** Notas generales de la sesión. */
  notes?: string
  /** Volumen total calculado (peso × reps), cacheado para listados. */
  totalVolume?: number
  /** Si la sesión nació de un plan, su id (WorkoutPlan.id). */
  planId?: string
  /** Nombre del plan de origen, cacheado para mostrarlo en la sesión. */
  planName?: string
  /** Ejecución de plan asociada (WorkoutPlanExecution.id). */
  planExecutionId?: string
}
