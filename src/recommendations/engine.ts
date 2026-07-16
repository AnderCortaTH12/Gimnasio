/**
 * Motor de recomendaciones basado en reglas EXPLICABLES.
 *
 * No hay caja negra: cada recomendación se genera con una regla clara y lleva
 * SU PORQUÉ en una frase. Los umbrales están en `rules.ts`. La entrada es el
 * historial de sesiones (completadas) y el perfil; la salida, una lista de
 * recomendaciones ordenadas por prioridad.
 */

import type { WorkoutSession, UserProfile, MuscleKey } from '../types'
import { EXERCISES_SEED } from '../data/exercisesSeed'
import { traducirMusculo } from '../data/muscles'
import { musculoDeEjercicio, seriesEfectivas, ejerciciosEntrenados } from '../lib/stats'
import {
  DIAS_DESCUIDADO,
  HORAS_DESCANSO_MIN,
  REPS_PROGRESION,
  INCREMENTO_KG,
  SESIONES_PARA_VARIAR,
  GRUPOS_RUTINA,
  GRUPOS_PRINCIPALES,
  MAX_RECOMENDACIONES,
  MAX_GRUPOS_EQUILIBRIO,
} from './rules'

export type RecType =
  | 'descanso'
  | 'equilibrio'
  | 'progresion'
  | 'variacion'
  | 'rutina'

export interface Recommendation {
  id: string
  type: RecType
  /** Título corto y accionable. */
  titulo: string
  /** El PORQUÉ de la recomendación, en una frase. */
  porque: string
  /** Tono de color para la tarjeta. */
  tono: 'lime' | 'pr' | 'warn' | 'neutral'
}

const HORA = 3600 * 1000
const DIA = 24 * HORA

/** Prioridad de aparición (menor = antes). */
const PRIORIDAD: Record<RecType, number> = {
  descanso: 0,
  progresion: 1,
  equilibrio: 2,
  rutina: 3,
  variacion: 4,
}

/** Marcas de tiempo (desc) en que se entrenó cada grupo muscular. */
function timestampsPorMusculo(
  sessions: WorkoutSession[],
): Map<MuscleKey, number[]> {
  const map = new Map<MuscleKey, number[]>()
  for (const s of sessions) {
    for (const e of s.exercises) {
      if (seriesEfectivas(e).length === 0) continue
      const m = musculoDeEjercicio(e.exerciseId)
      if (!m) continue
      const arr = map.get(m) ?? []
      arr.push(s.startedAt)
      map.set(m, arr)
    }
  }
  for (const arr of map.values()) arr.sort((a, b) => b - a)
  return map
}

// ---------------------------------------------------------------------------
// Regla 1 — Descanso insuficiente (<48h para un mismo grupo)
// ---------------------------------------------------------------------------
function reglaDescanso(porMusculo: Map<MuscleKey, number[]>): Recommendation[] {
  const recs: Recommendation[] = []
  for (const [m, ts] of porMusculo) {
    if (ts.length < 2) continue
    const horasEntreUltimas = (ts[0] - ts[1]) / HORA
    const horasDesdeUltima = (Date.now() - ts[0]) / HORA
    // Dos sesiones seguidas muy juntas y la última reciente → aún recuperando.
    if (
      horasEntreUltimas < HORAS_DESCANSO_MIN &&
      horasDesdeUltima < HORAS_DESCANSO_MIN
    ) {
      const nombre = traducirMusculo(m)
      recs.push({
        id: `descanso-${m}`,
        type: 'descanso',
        titulo: `Deja descansar ${nombre.toLowerCase()}`,
        porque: `Entrenaste ${nombre.toLowerCase()} hace menos de ${HORAS_DESCANSO_MIN}h; el músculo aún se está recuperando.`,
        tono: 'warn',
      })
    }
  }
  return recs
}

// ---------------------------------------------------------------------------
// Regla 2 — Equilibrio muscular (grupos descuidados)
// ---------------------------------------------------------------------------
function reglaEquilibrio(
  porMusculo: Map<MuscleKey, number[]>,
): Recommendation[] {
  // Días sin entrenar cada grupo principal (Infinity = nunca).
  const candidatos = GRUPOS_PRINCIPALES.map((m) => {
    const ts = porMusculo.get(m)
    const dias = ts && ts.length > 0 ? Math.floor((Date.now() - ts[0]) / DIA) : Infinity
    return { m, dias }
  })
    // Solo los descuidados, del más olvidado al menos.
    .filter((x) => x.dias >= DIAS_DESCUIDADO)
    .sort((a, b) => b.dias - a.dias)
    // Cap: no inundar la lista; deja hueco a otras reglas.
    .slice(0, MAX_GRUPOS_EQUILIBRIO)

  return candidatos.map(({ m, dias }) => {
    const nombre = traducirMusculo(m).toLowerCase()
    return dias === Infinity
      ? {
          id: `equilibrio-${m}`,
          type: 'equilibrio' as const,
          titulo: `Aún no has entrenado ${nombre}`,
          porque: `No hay ninguna sesión de ${nombre}; conviene incluirlo para un desarrollo equilibrado.`,
          tono: 'neutral' as const,
        }
      : {
          id: `equilibrio-${m}`,
          type: 'equilibrio' as const,
          titulo: `Toca ${nombre}`,
          porque: `Llevas ${dias} días sin entrenar ${nombre}; no lo descuides.`,
          tono: 'warn' as const,
        }
  })
}

// ---------------------------------------------------------------------------
// Regla 3 — Progresión de carga
// ---------------------------------------------------------------------------
function reglaProgresion(sessions: WorkoutSession[]): Recommendation[] {
  // Se mira la sesión más reciente.
  const ultima = sessions[0]
  if (!ultima) return []
  const recs: Recommendation[] = []
  for (const e of ultima.exercises) {
    const ef = seriesEfectivas(e)
    if (ef.length === 0) continue
    // Todas las series completadas y con reps altas → subir peso.
    const todasFuertes = ef.every((s) => s.reps >= REPS_PROGRESION)
    if (todasFuertes) {
      const pesoMax = Math.max(...ef.map((s) => s.weight))
      recs.push({
        id: `progresion-${e.exerciseId}`,
        type: 'progresion',
        titulo: `Sube peso en ${e.exerciseName}`,
        porque: `Completaste todas las series a ${REPS_PROGRESION}+ reps; prueba ${pesoMax + INCREMENTO_KG} kg la próxima vez.`,
        tono: 'pr',
      })
    }
  }
  return recs
}

// ---------------------------------------------------------------------------
// Regla 4 — Variación de ejercicios
// ---------------------------------------------------------------------------
function reglaVariacion(sessions: WorkoutSession[]): Recommendation[] {
  const entrenados = ejerciciosEntrenados(sessions)
  const top = entrenados[0]
  if (!top || top.sesiones < SESIONES_PARA_VARIAR) return []

  const musculo = musculoDeEjercicio(top.id)
  if (!musculo) return []

  // Alternativa: mismo grupo muscular, distinto ejercicio, no muy repetido.
  const yaHechos = new Set(entrenados.map((e) => e.id))
  const alternativa =
    EXERCISES_SEED.find(
      (ex) => ex.muscleGroup === musculo && ex.id !== top.id && !yaHechos.has(ex.id),
    ) ?? EXERCISES_SEED.find((ex) => ex.muscleGroup === musculo && ex.id !== top.id)

  if (!alternativa) return []
  const nombreMusculo = traducirMusculo(musculo).toLowerCase()
  return [
    {
      id: `variacion-${top.id}`,
      type: 'variacion',
      titulo: `Varía: prueba ${alternativa.name}`,
      porque: `Llevas ${top.sesiones} sesiones con ${top.name}; alternarlo con ${alternativa.name} varía el estímulo en ${nombreMusculo}.`,
      tono: 'neutral',
    },
  ]
}

// ---------------------------------------------------------------------------
// Regla 5 — Rutina del día
// ---------------------------------------------------------------------------
const OBJETIVO_TEXTO: Record<string, string> = {
  fuerza: 'fuerza',
  hipertrofia: 'hipertrofia',
  mantenimiento: 'mantenimiento',
}

function reglaRutinaDelDia(
  porMusculo: Map<MuscleKey, number[]>,
  profile?: UserProfile,
): Recommendation[] {
  // Elige los grupos principales más descansados (o nunca entrenados).
  const ranking = GRUPOS_PRINCIPALES.map((m) => {
    const ts = porMusculo.get(m)
    const dias = ts && ts.length > 0 ? (Date.now() - ts[0]) / DIA : Infinity
    return { m, dias }
  }).sort((a, b) => b.dias - a.dias)

  const elegidos = ranking.slice(0, GRUPOS_RUTINA).map((x) => x.m)
  if (elegidos.length === 0) return []

  const nombres = elegidos.map((m) => traducirMusculo(m))
  // Un ejercicio representativo (compuesto si es posible) por grupo.
  const ejercicios = elegidos
    .map((m) => {
      const ex =
        EXERCISES_SEED.find(
          (e) => e.muscleGroup === m && e.category === 'strength',
        ) ?? EXERCISES_SEED.find((e) => e.muscleGroup === m)
      return ex?.name
    })
    .filter(Boolean)

  const objetivo = profile?.trainingGoal
    ? ` Enfócalo a ${OBJETIVO_TEXTO[profile.trainingGoal]}.`
    : ''

  return [
    {
      id: 'rutina-del-dia',
      type: 'rutina',
      titulo: `Hoy: ${nombres.join(' y ')}`,
      porque: `Son los grupos más descansados${
        ejercicios.length ? ` (p. ej. ${ejercicios.join(', ')})` : ''
      }.${objetivo}`,
      tono: 'lime',
    },
  ]
}

// ---------------------------------------------------------------------------
// Orquestador
// ---------------------------------------------------------------------------

/**
 * Genera las recomendaciones a partir del historial y el perfil.
 * `sessions` debe venir con las sesiones completadas, más recientes primero.
 */
export function generarRecomendaciones(
  sessions: WorkoutSession[],
  profile?: UserProfile,
): Recommendation[] {
  const porMusculo = timestampsPorMusculo(sessions)

  const todas = [
    ...reglaDescanso(porMusculo),
    ...reglaProgresion(sessions),
    ...reglaEquilibrio(porMusculo),
    ...reglaRutinaDelDia(porMusculo, profile),
    ...reglaVariacion(sessions),
  ]

  return todas
    .sort((a, b) => PRIORIDAD[a.type] - PRIORIDAD[b.type])
    .slice(0, MAX_RECOMENDACIONES)
}
