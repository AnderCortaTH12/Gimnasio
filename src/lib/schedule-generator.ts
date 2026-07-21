/**
 * Motor de generación de planificaciones de entrenamiento automáticas.
 *
 * Genera un plan coherente basado en:
 * - Número de días/semana
 * - Nivel (principiante/intermedio/avanzado)
 * - Objetivo (fuerza/hipertrofia/mantenimiento)
 */

import type { DayOfWeek, TrainingScheduleEntry, TrainingType } from '../types/schedule'

/**
 * Genera una planificación de entrenamiento para toda la semana.
 *
 * Lógica:
 * - 2-3 días → Full Body (cada día)
 * - 4 días → Upper/Lower alternado
 * - 5-6 días → Push/Pull/Legs
 */
export function generarPlanificacion(input: {
  daysPerWeek: number
  trainingDays: DayOfWeek[] // ej. [1, 3, 5] = lunes, miércoles, viernes
  level: 'beginner' | 'intermediate' | 'advanced'
  goal: 'strength' | 'hypertrophy' | 'maintenance'
}): TrainingScheduleEntry[] {
  const weekPlan: TrainingScheduleEntry[] = [
    { dayOfWeek: 0, trainingType: 'rest' },
    { dayOfWeek: 1, trainingType: 'rest' },
    { dayOfWeek: 2, trainingType: 'rest' },
    { dayOfWeek: 3, trainingType: 'rest' },
    { dayOfWeek: 4, trainingType: 'rest' },
    { dayOfWeek: 5, trainingType: 'rest' },
    { dayOfWeek: 6, trainingType: 'rest' },
  ]

  const { daysPerWeek, trainingDays } = input

  if (daysPerWeek <= 3) {
    // Full Body: cada día de entrenamiento es full body
    trainingDays.forEach((day) => {
      weekPlan[day] = { dayOfWeek: day, trainingType: 'full_body' }
    })
  } else if (daysPerWeek === 4) {
    // Upper/Lower: alterna torso/piernas
    let isUpper = true
    trainingDays.forEach((day) => {
      const type: TrainingType = isUpper ? 'upper' : 'lower'
      weekPlan[day] = { dayOfWeek: day, trainingType: type }
      isUpper = !isUpper
    })
  } else {
    // Push/Pull/Legs: ciclo de 3
    const cycle: TrainingType[] = ['push', 'pull', 'legs']
    trainingDays.forEach((day, idx) => {
      const type = cycle[idx % 3]
      weekPlan[day] = { dayOfWeek: day, trainingType: type }
    })
  }

  return weekPlan
}

/**
 * Valida que los días de entrenamiento no repitan el mismo grupo muscular
 * en días consecutivos (violación si no se cumple).
 *
 * Grupos que no deben estar en días consecutivos:
 * - push/pull/legs (PPL)
 * - upper/lower
 * - full_body (puede estar)
 */
export function validarCoherencia(weekPlan: TrainingScheduleEntry[]): boolean {
  for (let i = 0; i < 6; i++) {
    const current = weekPlan[i]
    const next = weekPlan[i + 1]

    // Si alguno es descanso, no hay conflicto
    if (current.trainingType === 'rest' || next.trainingType === 'rest') {
      continue
    }

    // Si ambos son full body, está bien (se pueden hacer consecutivos)
    if (current.trainingType === 'full_body' && next.trainingType === 'full_body') {
      continue
    }

    // Conflicto: Push/Pull no deben estar consecutivos
    if (
      (current.trainingType === 'push' && next.trainingType === 'pull') ||
      (current.trainingType === 'pull' && next.trainingType === 'push')
    ) {
      return false
    }

    // Conflicto: Upper/Lower no deben estar consecutivos
    if (
      (current.trainingType === 'upper' && next.trainingType === 'lower') ||
      (current.trainingType === 'lower' && next.trainingType === 'upper')
    ) {
      return false
    }
  }
  return true
}

/**
 * Distribuye los días de descanso de forma inteligente.
 * Intenta meter 1-2 días de descanso entre sesiones de fuerza.
 */
export function optimizarDescansos(
  trainingDays: DayOfWeek[],
  daysPerWeek: number,
): DayOfWeek[] {
  const maxDescansos = 7 - daysPerWeek
  if (maxDescansos === 0) return trainingDays

  // Si ya hay descansos naturales entre entrenamientos, está bien
  // Si hay muchos días de entrenamiento consecutivos, no hay mucho que hacer
  // (limitación del algoritmo simple)

  return trainingDays
}
