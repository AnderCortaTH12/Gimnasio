/**
 * Analítica de entrenamiento (funciones puras).
 *
 * Todo el cálculo de progreso, volumen, récords y grupos musculares vive aquí,
 * separado de la UI y de la persistencia. Trabaja sobre WorkoutSession[].
 */

import type { WorkoutSession, ExerciseEntry, MuscleKey } from '../types'
import { EXERCISES_SEED } from '../data/exercisesSeed'

/** Índice del catálogo por id, para resolver el grupo muscular. */
const EX_BY_ID = new Map(EXERCISES_SEED.map((e) => [e.id, e]))

/** 1RM estimado con la fórmula de Epley. */
export function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  return weight * (1 + reps / 30)
}

/** Series que cuentan para estadísticas: completadas y no de calentamiento. */
export function seriesEfectivas(entry: ExerciseEntry) {
  return entry.sets.filter((s) => s.completed && s.type !== 'calentamiento')
}

/** Volumen (peso × reps) de un ejercicio dentro de una sesión. */
export function volumenEjercicio(entry: ExerciseEntry): number {
  return seriesEfectivas(entry).reduce((n, s) => n + s.weight * s.reps, 0)
}

/** Grupo muscular principal de un ejercicio del catálogo. */
export function musculoDeEjercicio(exerciseId: string): MuscleKey | undefined {
  return EX_BY_ID.get(exerciseId)?.muscleGroup
}

// ---------------------------------------------------------------------------
// Progreso por ejercicio
// ---------------------------------------------------------------------------

export interface ProgressPoint {
  /** Fecha ISO de la sesión. */
  date: string
  /** Etiqueta corta para el eje X. */
  label: string
  /** Peso máximo levantado en la sesión. */
  maxWeight: number
  /** Volumen total del ejercicio en la sesión. */
  volume: number
  /** 1RM estimado (mejor serie) en la sesión. */
  est1RM: number
}

const fmtLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

/** Serie temporal del progreso de un ejercicio a lo largo de las sesiones. */
export function progresoEjercicio(
  sessions: WorkoutSession[],
  exerciseId: string,
): ProgressPoint[] {
  const puntos: ProgressPoint[] = []
  for (const s of sessions) {
    for (const e of s.exercises) {
      if (e.exerciseId !== exerciseId) continue
      const efectivas = seriesEfectivas(e)
      if (efectivas.length === 0) continue
      const maxWeight = Math.max(...efectivas.map((x) => x.weight))
      const est1RM = Math.max(...efectivas.map((x) => epley1RM(x.weight, x.reps)))
      puntos.push({
        date: s.date,
        label: fmtLabel(s.date),
        maxWeight,
        volume: volumenEjercicio(e),
        est1RM: Math.round(est1RM),
      })
    }
  }
  return puntos.sort((a, b) => a.date.localeCompare(b.date))
}

export interface EjercicioEntrenado {
  id: string
  name: string
  sesiones: number
}

/** Lista de ejercicios con historial, ordenados por nº de sesiones. */
export function ejerciciosEntrenados(
  sessions: WorkoutSession[],
): EjercicioEntrenado[] {
  const map = new Map<string, EjercicioEntrenado>()
  for (const s of sessions) {
    for (const e of s.exercises) {
      if (seriesEfectivas(e).length === 0) continue
      const prev = map.get(e.exerciseId)
      if (prev) prev.sesiones += 1
      else
        map.set(e.exerciseId, {
          id: e.exerciseId,
          name: e.exerciseName,
          sesiones: 1,
        })
    }
  }
  return [...map.values()].sort((a, b) => b.sesiones - a.sesiones)
}

// ---------------------------------------------------------------------------
// Dashboard general
// ---------------------------------------------------------------------------

const DIA = 24 * 3600 * 1000

/** Volumen total de una sesión (series efectivas). */
export function volumenSesion(s: WorkoutSession): number {
  return s.exercises.reduce((n, e) => n + volumenEjercicio(e), 0)
}

export interface ResumenSemanal {
  entrenos: number
  volumen: number
  series: number
  prs: number
}

/** Resumen de los últimos `dias` días (por defecto 7). */
export function resumenReciente(
  sessions: WorkoutSession[],
  dias = 7,
): ResumenSemanal {
  const desde = Date.now() - dias * DIA
  const recientes = sessions.filter((s) => s.startedAt >= desde)
  return {
    entrenos: recientes.length,
    volumen: recientes.reduce((n, s) => n + volumenSesion(s), 0),
    series: recientes.reduce(
      (n, s) => n + s.exercises.reduce((k, e) => k + seriesEfectivas(e).length, 0),
      0,
    ),
    prs: recientes.reduce(
      (n, s) =>
        n + s.exercises.reduce((k, e) => k + e.sets.filter((x) => x.isPR).length, 0),
      0,
    ),
  }
}

/** Clave de semana ISO (año-semana) a partir de un timestamp. */
function claveSemana(ms: number): string {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  // Jueves de la semana ISO define el año.
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const semana =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / DIA - 3 + ((week1.getDay() + 6) % 7)) / 7,
    )
  return `${d.getFullYear()}-${semana}`
}

/** Racha de semanas consecutivas (hasta esta) con al menos un entreno. */
export function rachaSemanas(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0
  const semanas = new Set(sessions.map((s) => claveSemana(s.startedAt)))
  let racha = 0
  const cursor = new Date()
  // Retrocede semana a semana mientras haya entrenos.
  for (;;) {
    const clave = claveSemana(cursor.getTime())
    if (semanas.has(clave)) {
      racha += 1
      cursor.setDate(cursor.getDate() - 7)
    } else {
      // Permite que la semana actual aún esté "vacía" sin cortar la racha.
      if (racha === 0 && clave === claveSemana(Date.now())) {
        cursor.setDate(cursor.getDate() - 7)
        continue
      }
      break
    }
  }
  return racha
}

// ---------------------------------------------------------------------------
// Grupos musculares
// ---------------------------------------------------------------------------

export interface VolumenMusculo {
  muscle: MuscleKey
  volumen: number
}

/** Reparto de volumen por grupo muscular en los últimos `dias` días. */
export function volumenPorMusculo(
  sessions: WorkoutSession[],
  dias = 30,
): VolumenMusculo[] {
  const desde = Date.now() - dias * DIA
  const map = new Map<MuscleKey, number>()
  for (const s of sessions) {
    if (s.startedAt < desde) continue
    for (const e of s.exercises) {
      const m = musculoDeEjercicio(e.exerciseId)
      if (!m) continue
      map.set(m, (map.get(m) ?? 0) + volumenEjercicio(e))
    }
  }
  return [...map.entries()]
    .map(([muscle, volumen]) => ({ muscle, volumen }))
    .filter((x) => x.volumen > 0)
    .sort((a, b) => b.volumen - a.volumen)
}

/** Días transcurridos desde la última vez que se trabajó cada grupo. */
export function diasDesdeMusculo(
  sessions: WorkoutSession[],
): Map<MuscleKey, number> {
  const ultimo = new Map<MuscleKey, number>()
  for (const s of sessions) {
    for (const e of s.exercises) {
      if (seriesEfectivas(e).length === 0) continue
      const m = musculoDeEjercicio(e.exerciseId)
      if (!m) continue
      ultimo.set(m, Math.max(ultimo.get(m) ?? 0, s.startedAt))
    }
  }
  const res = new Map<MuscleKey, number>()
  for (const [m, ts] of ultimo) {
    res.set(m, Math.floor((Date.now() - ts) / DIA))
  }
  return res
}

// ---------------------------------------------------------------------------
// Detección de récords personales (PR)
// ---------------------------------------------------------------------------

export interface PRHallado {
  exerciseName: string
  tipo: 'peso' | '1rm' | 'volumen'
  valor: number
  unidad: string
}

interface MejoresPrevios {
  maxWeight: number
  max1RM: number
  maxVolume: number
  visto: boolean
}

/** Mejores marcas históricas de un ejercicio en sesiones previas. */
function mejoresPrevios(
  previas: WorkoutSession[],
  exerciseId: string,
): MejoresPrevios {
  const r: MejoresPrevios = {
    maxWeight: 0,
    max1RM: 0,
    maxVolume: 0,
    visto: false,
  }
  for (const s of previas) {
    for (const e of s.exercises) {
      if (e.exerciseId !== exerciseId) continue
      const ef = seriesEfectivas(e)
      if (ef.length === 0) continue
      r.visto = true
      r.maxWeight = Math.max(r.maxWeight, ...ef.map((x) => x.weight))
      r.max1RM = Math.max(r.max1RM, ...ef.map((x) => epley1RM(x.weight, x.reps)))
      r.maxVolume = Math.max(r.maxVolume, volumenEjercicio(e))
    }
  }
  return r
}

/**
 * Detecta récords en la sesión frente al historial previo y marca las series
 * responsables con `isPR`. Devuelve una copia de la sesión y la lista de PRs.
 * Solo cuenta como récord si el ejercicio ya se había entrenado antes.
 */
export function detectarPRs(
  session: WorkoutSession,
  previas: WorkoutSession[],
): { session: WorkoutSession; prs: PRHallado[] } {
  const prs: PRHallado[] = []
  const exercises = session.exercises.map((e) => {
    const ef = seriesEfectivas(e)
    if (ef.length === 0) return e
    const prev = mejoresPrevios(previas, e.exerciseId)
    // Sin historial previo no hay récord que batir.
    if (!prev.visto) return e

    const maxWeight = Math.max(...ef.map((x) => x.weight))
    const max1RM = Math.max(...ef.map((x) => epley1RM(x.weight, x.reps)))
    const volume = volumenEjercicio(e)

    let sets = e.sets

    if (maxWeight > prev.maxWeight) {
      prs.push({
        exerciseName: e.exerciseName,
        tipo: 'peso',
        valor: maxWeight,
        unidad: 'kg',
      })
      // Marca la primera serie que alcanza el peso máximo.
      const idx = e.sets.findIndex(
        (s) => s.completed && s.type !== 'calentamiento' && s.weight === maxWeight,
      )
      if (idx >= 0) sets = sets.map((s, i) => (i === idx ? { ...s, isPR: true } : s))
    } else if (max1RM > prev.max1RM) {
      prs.push({
        exerciseName: e.exerciseName,
        tipo: '1rm',
        valor: Math.round(max1RM),
        unidad: 'kg',
      })
    }

    if (volume > prev.maxVolume) {
      prs.push({
        exerciseName: e.exerciseName,
        tipo: 'volumen',
        valor: Math.round(volume),
        unidad: 'kg',
      })
    }

    return { ...e, sets }
  })

  return { session: { ...session, exercises }, prs }
}
