/**
 * Sugerencia de PLANES según lo entrenado recientemente (regla explicable).
 *
 * Idea: cuanto más tiempo llevas sin trabajar los músculos de un plan, más
 * relevante es sugerirlo. Los músculos de cada plan se derivan de sus ejercicios
 * (catálogo). Los planes personalizados del usuario se muestran primero.
 * Si no hay historial, se prioriza el Full Body.
 */

import type { WorkoutPlan, WorkoutSession, MuscleKey } from '../types'
import { diasDesdeMusculo, musculoDeEjercicio } from '../lib/stats'
import { traducirMusculo } from '../data/muscles'

export interface PlanSuggestion {
  plan: WorkoutPlan
  /** El PORQUÉ de la sugerencia, en una frase. */
  porque: string
  /** Relevancia (mayor = más descuidado / más recomendable). */
  score: number
}

/** Días que se usan cuando un grupo no se ha entrenado nunca. */
const DIAS_NUNCA = 30

/** Grupos musculares que trabaja un plan (derivados de sus ejercicios). */
export function musculosDelPlan(plan: WorkoutPlan): MuscleKey[] {
  const set = new Set<MuscleKey>()
  for (const id of plan.exerciseIds) {
    const m = musculoDeEjercicio(id)
    if (m) set.add(m)
  }
  return [...set]
}

/**
 * Ordena los planes por relevancia. Los personalizados van primero; dentro de
 * cada grupo, del más descuidado al menos. `sessions` = sesiones completadas.
 */
export function sugerirPlanes(
  sessions: WorkoutSession[],
  plans: WorkoutPlan[],
): PlanSuggestion[] {
  const dias = sessions.length > 0 ? diasDesdeMusculo(sessions) : null

  const sugerencias = plans.map((plan): PlanSuggestion => {
    const grupos = musculosDelPlan(plan)

    // Sin historial: Full Body arriba del resto.
    if (!dias) {
      return {
        plan,
        porque:
          plan.id === 'plan-full-body'
            ? 'Es tu primer entrenamiento: empieza trabajando todo el cuerpo.'
            : 'Aún no tienes historial; cualquier plan es un buen comienzo.',
        score: plan.id === 'plan-full-body' ? 1000 : 10,
      }
    }

    if (grupos.length === 0) {
      return { plan, porque: plan.description, score: 0 }
    }

    // Días descuidados por grupo (nunca → DIAS_NUNCA).
    const porGrupo = grupos.map((m) => ({ m, d: dias.get(m) ?? DIAS_NUNCA }))
    const score = porGrupo.reduce((n, x) => n + x.d, 0) / porGrupo.length
    const peor = porGrupo.reduce((a, b) => (b.d > a.d ? b : a))
    const nombre = traducirMusculo(peor.m).toLowerCase()
    const porque =
      (dias.get(peor.m) ?? null) === null
        ? `No has entrenado ${nombre} todavía; este plan lo cubre.`
        : `Llevas ${peor.d} día${peor.d === 1 ? '' : 's'} sin entrenar ${nombre}.`
    return { plan, porque, score }
  })

  // Personalizados primero; dentro de cada grupo, por relevancia.
  return sugerencias.sort((a, b) => {
    const au = a.plan.createdBy === 'user' ? 1 : 0
    const bu = b.plan.createdBy === 'user' ? 1 : 0
    if (au !== bu) return bu - au
    return b.score - a.score
  })
}
