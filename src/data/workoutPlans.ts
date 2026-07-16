/**
 * Planes de entrenamiento PREDEFINIDOS (del sistema).
 *
 * Cada plan es una plantilla con ejercicios recomendados y series×reps objetivo.
 * Los `exerciseIds` apuntan a ids del catálogo (usamos los del seed, siempre
 * presentes) para que al seleccionar un plan la sesión se precargue sin depender
 * del dataset. Los planes personalizados del usuario viven en IndexedDB.
 */

import type { WorkoutPlan, PlanTarget } from '../types'

/** Objetivo por defecto para un compuesto y para un accesorio. */
const COMP: PlanTarget = { sets: 4, reps: 6 }
const ACC: PlanTarget = { sets: 3, reps: 12 }

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'plan-traccion',
    name: 'Día de Tracción',
    description: 'Espalda y bíceps: todo lo que se tira.',
    exerciseIds: [
      'deadlift',
      'pull-up',
      'barbell-row',
      'seated-cable-row',
      'barbell-curl',
      'hammer-curl',
    ],
    exerciseReps: [COMP, COMP, COMP, ACC, ACC, ACC],
    difficulty: 'intermedio',
    estimatedMinutes: 60,
    createdBy: 'system',
  },
  {
    id: 'plan-empuje',
    name: 'Día de Empuje',
    description: 'Pecho, hombros y tríceps: todo lo que se empuja.',
    exerciseIds: [
      'bench-press',
      'overhead-press',
      'incline-bench-press',
      'dips',
      'lateral-raise',
      'triceps-pushdown',
    ],
    exerciseReps: [COMP, COMP, ACC, ACC, ACC, ACC],
    difficulty: 'intermedio',
    estimatedMinutes: 60,
    createdBy: 'system',
  },
  {
    id: 'plan-piernas',
    name: 'Piernas',
    description: 'Cuádriceps, isquios, glúteos y gemelos.',
    exerciseIds: [
      'back-squat',
      'leg-press',
      'romanian-deadlift',
      'leg-extension',
      'leg-curl',
      'standing-calf-raise',
    ],
    exerciseReps: [COMP, ACC, COMP, ACC, ACC, ACC],
    difficulty: 'avanzado',
    estimatedMinutes: 65,
    createdBy: 'system',
  },
  {
    id: 'plan-full-body',
    name: 'Full Body',
    description: 'Un compuesto por patrón + accesorios. Ideal para empezar.',
    exerciseIds: [
      'back-squat',
      'bench-press',
      'barbell-row',
      'overhead-press',
      'romanian-deadlift',
      'barbell-curl',
      'triceps-pushdown',
      'plank',
    ],
    exerciseReps: [COMP, COMP, COMP, ACC, ACC, ACC, ACC, { sets: 3, reps: 30 }],
    difficulty: 'principiante',
    estimatedMinutes: 70,
    createdBy: 'system',
  },
  {
    id: 'plan-brazos',
    name: 'Brazos',
    description: 'Bíceps y tríceps aislados para un día de brazos.',
    exerciseIds: [
      'barbell-curl',
      'dumbbell-curl',
      'hammer-curl',
      'skull-crusher',
      'triceps-pushdown',
      'overhead-triceps-extension',
    ],
    exerciseReps: [ACC, ACC, ACC, ACC, ACC, ACC],
    difficulty: 'principiante',
    estimatedMinutes: 45,
    createdBy: 'system',
  },
]

/** Texto en español de la dificultad. */
export const DIFICULTAD_ES: Record<WorkoutPlan['difficulty'], string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
}

/** Devuelve un plan del sistema por id. */
export function obtenerPlanSistema(id: string): WorkoutPlan | undefined {
  return WORKOUT_PLANS.find((p) => p.id === id)
}
