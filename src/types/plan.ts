/**
 * Modelos de PLANES de entrenamiento (predefinidos y personalizados) y su
 * ejecución.
 *
 * Un WorkoutPlan es una plantilla: lista de ejercicios con series/reps objetivo.
 * Los del sistema (`createdBy: 'system'`) viven en código; los del usuario
 * (`createdBy: 'user'`) se guardan en IndexedDB. Al seleccionar un plan se crea
 * una WorkoutSession precargada y una WorkoutPlanExecution que enlaza plan y
 * sesión y guarda si se completó.
 */

/** Dificultad orientativa de un plan. */
export type PlanDifficulty = 'principiante' | 'intermedio' | 'avanzado'

/** Objetivo de series×reps para un ejercicio del plan. */
export interface PlanTarget {
  /** Nº de series objetivo. */
  sets: number
  /** Repeticiones objetivo por serie. */
  reps: number
}

export interface WorkoutPlan {
  /** Identificador único y estable del plan. */
  id: string
  /** Nombre visible (p. ej. "Día de Tracción"). */
  name: string
  /** Descripción breve de para qué sirve. */
  description: string
  /** Ejercicios del plan (referencias a Exercise.id del catálogo). */
  exerciseIds: string[]
  /** Objetivo series×reps por ejercicio, en paralelo a `exerciseIds`. */
  exerciseReps?: PlanTarget[]
  /** Dificultad orientativa. */
  difficulty: PlanDifficulty
  /** Duración estimada en minutos. */
  estimatedMinutes: number
  /** Origen del plan: del sistema o creado por el usuario. */
  createdBy: 'system' | 'user'
  /** Momento de creación (solo planes de usuario). */
  createdAt?: number
}

export interface WorkoutPlanExecution {
  /** Identificador único de la ejecución. */
  id: string
  /** Plan ejecutado (WorkoutPlan.id). */
  planId: string
  /** Nombre del plan cacheado (para listar sin depender del plan original). */
  planName: string
  /** Origen del plan ejecutado, cacheado para la etiqueta del historial. */
  planOrigin: 'system' | 'user'
  /** Sesión creada a partir del plan (WorkoutSession.id). */
  sessionId: string
  /** Inicio de la ejecución (timestamp epoch ms). */
  startTime: number
  /** Fin de la ejecución (timestamp epoch ms), si terminó. */
  endTime?: number
  /** true si el usuario marcó el plan como completado al finalizar. */
  completed: boolean
}
