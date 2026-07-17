/**
 * Estado global de la SESIÓN ACTIVA de entrenamiento (Zustand).
 *
 * La fuente de verdad persistente es IndexedDB (`db.ts`). Este store mantiene
 * en memoria la sesión en curso para render reactivo y, en cada mutación,
 * escribe la sesión completa en Dexie → todo sobrevive a recargar la app.
 */

import { create } from 'zustand'
import type { Exercise, WorkoutSession, SetEntry, WorkoutPlan } from '../types'
import {
  crearSesion,
  duplicarSesion,
  finalizarSesion,
  guardarSesion,
  eliminarSesion,
  obtenerSesionActiva,
  leerHistorial,
  nuevoId,
  calcularVolumen,
  iniciarPlanExecution,
  eliminarPlanExecution,
} from '../db/db'
import { obtenerEjercicio } from '../data/catalogRegistry'
import { obtenerIdDataset } from '../data/seedToDatasetMap'
import { detectarPRs, type PRHallado } from '../lib/stats'

/** Series objetivo que se precargan por ejercicio al ejecutar un plan. */
const SERIES_OBJETIVO = 3
const REPS_OBJETIVO = 10

interface SessionState {
  /** Sesión en curso, o null si no hay ninguna. */
  active: WorkoutSession | null
  /** true una vez hidratado desde IndexedDB al arrancar. */
  hydrated: boolean

  /** Carga la sesión activa desde IndexedDB (llamar al arrancar la app). */
  hidratar: () => Promise<void>

  /** Inicia una nueva sesión y la deja como activa. */
  iniciar: (name?: string) => Promise<void>
  /** Inicia una sesión precargada desde un plan y registra su ejecución. */
  iniciarPlan: (plan: WorkoutPlan) => Promise<void>
  /** Duplica una sesión previa como nueva sesión activa (plantilla). */
  duplicar: (origen: WorkoutSession) => Promise<void>
  /**
   * Finaliza la sesión activa (pasa a "completada"), detecta récords y los
   * devuelve para su celebración.
   */
  finalizar: () => Promise<PRHallado[]>
  /** Cancela y elimina la sesión activa sin guardarla en el historial. */
  cancelar: () => Promise<void>

  /** Añade un ejercicio del catálogo a la sesión activa. */
  addEjercicio: (ex: Exercise) => void
  /** Elimina un ejercicio de la sesión activa. */
  removeEjercicio: (entryId: string) => void

  /** Añade una serie a un ejercicio (copia peso/reps de la última). */
  addSerie: (entryId: string) => void
  /** Actualiza campos de una serie. */
  updateSerie: (entryId: string, setId: string, patch: Partial<SetEntry>) => void
  /** Elimina una serie. */
  removeSerie: (entryId: string, setId: string) => void
  /** Alterna el estado "completada" de una serie. */
  toggleSerie: (entryId: string, setId: string) => void
  /** Actualiza la nota de un ejercicio. */
  updateNotasEjercicio: (entryId: string, notes: string) => void
}

/** Aplica una transformación a la sesión activa y la persiste en IndexedDB. */
function mutate(
  set: (partial: Partial<SessionState>) => void,
  get: () => SessionState,
  fn: (session: WorkoutSession) => WorkoutSession,
) {
  const current = get().active
  if (!current) return
  const next = fn(current)
  next.totalVolume = calcularVolumen(next)
  set({ active: next })
  // Persistencia en segundo plano; no bloquea el render.
  void guardarSesion(next)
}

export const useSessionStore = create<SessionState>((set, get) => ({
  active: null,
  hydrated: false,

  hidratar: async () => {
    const active = (await obtenerSesionActiva()) ?? null
    set({ active, hydrated: true })
  },

  iniciar: async (name) => {
    const session = await crearSesion(name)
    set({ active: session })
  },

  iniciarPlan: async (plan) => {
    const now = Date.now()
    const sessionId = nuevoId()

    // Precarga los ejercicios del plan con sus series/reps objetivo (sin marcar).
    const exercises = plan.exerciseIds.map((exId, i) => {
      const ex = obtenerEjercicio(exId)
      const target = plan.exerciseReps?.[i]
      const nSets = target?.sets ?? SERIES_OBJETIVO
      const reps = target?.reps ?? REPS_OBJETIVO
      return {
        id: nuevoId(),
        exerciseId: exId,
        exerciseName: ex?.name ?? exId,
        order: i,
        sets: Array.from({ length: nSets }, (_, k) => ({
          id: nuevoId(),
          order: k + 1,
          reps,
          weight: 0,
          type: 'normal' as const,
          completed: false,
        })),
      }
    })

    // Registra la ejecución del plan (enlaza plan ↔ sesión).
    const exec = await iniciarPlanExecution({
      planId: plan.id,
      planName: plan.name,
      planOrigin: plan.createdBy,
      sessionId,
    })

    const session: WorkoutSession = {
      id: sessionId,
      date: new Date(now).toISOString(),
      startedAt: now,
      name: plan.name,
      exercises,
      status: 'en-progreso',
      planId: plan.id,
      planName: plan.name,
      planExecutionId: exec.id,
    }
    await guardarSesion(session)
    set({ active: session })
  },

  duplicar: async (origen) => {
    const session = await duplicarSesion(origen)
    set({ active: session })
  },

  finalizar: async () => {
    const current = get().active
    if (!current) return []
    // Compara con el historial previo para detectar y marcar récords.
    const previas = await leerHistorial()
    const { session, prs } = detectarPRs(current, previas)
    await finalizarSesion(session)
    set({ active: null })
    return prs
  },

  cancelar: async () => {
    const current = get().active
    if (!current) return
    // Si venía de un plan, descarta también su ejecución (no cuenta).
    if (current.planExecutionId) {
      await eliminarPlanExecution(current.planExecutionId)
    }
    await eliminarSesion(current.id)
    set({ active: null })
  },

  addEjercicio: (ex) =>
    mutate(set, get, (s) => {
      // Si el ejercicio es del seed, intenta usar el ID del dataset para el GIF correcto
      const datasetId = obtenerIdDataset(ex.name)
      const ejercicioReal = datasetId ? obtenerEjercicio(datasetId) : ex
      const gifUrlReal = ejercicioReal?.gifUrl || ex.gifUrl

      return {
        ...s,
        exercises: [
          ...s.exercises,
          {
            id: nuevoId(),
            exerciseId: ex.id,
            exerciseName: ex.name,
            gifUrl: gifUrlReal,
            order: s.exercises.length,
            sets: [
              {
                id: nuevoId(),
                order: 1,
                reps: 0,
                weight: 0,
                type: 'normal',
                completed: false,
              },
            ],
          },
        ],
      }
    }),

  removeEjercicio: (entryId) =>
    mutate(set, get, (s) => ({
      ...s,
      exercises: s.exercises
        .filter((e) => e.id !== entryId)
        .map((e, i) => ({ ...e, order: i })),
    })),

  addSerie: (entryId) =>
    mutate(set, get, (s) => ({
      ...s,
      exercises: s.exercises.map((e) => {
        if (e.id !== entryId) return e
        const last = e.sets[e.sets.length - 1]
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              id: nuevoId(),
              order: e.sets.length + 1,
              reps: last?.reps ?? 0,
              weight: last?.weight ?? 0,
              type: 'normal',
              completed: false,
            },
          ],
        }
      }),
    })),

  updateSerie: (entryId, setId, patch) =>
    mutate(set, get, (s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id !== entryId
          ? e
          : {
              ...e,
              sets: e.sets.map((st) =>
                st.id === setId ? { ...st, ...patch } : st,
              ),
            },
      ),
    })),

  removeSerie: (entryId, setId) =>
    mutate(set, get, (s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id !== entryId
          ? e
          : {
              ...e,
              sets: e.sets
                .filter((st) => st.id !== setId)
                .map((st, i) => ({ ...st, order: i + 1 })),
            },
      ),
    })),

  toggleSerie: (entryId, setId) =>
    mutate(set, get, (s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id !== entryId
          ? e
          : {
              ...e,
              sets: e.sets.map((st) =>
                st.id === setId ? { ...st, completed: !st.completed } : st,
              ),
            },
      ),
    })),

  updateNotasEjercicio: (entryId, notes) =>
    mutate(set, get, (s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === entryId ? { ...e, notes } : e,
      ),
    })),
}))
