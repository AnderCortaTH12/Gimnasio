/**
 * Estado global de la SESIÓN ACTIVA de entrenamiento (Zustand).
 *
 * La fuente de verdad persistente es IndexedDB (`db.ts`). Este store mantiene
 * en memoria la sesión en curso para render reactivo y, en cada mutación,
 * escribe la sesión completa en Dexie → todo sobrevive a recargar la app.
 */

import { create } from 'zustand'
import type { Exercise, WorkoutSession, SetEntry } from '../types'
import {
  crearSesion,
  duplicarSesion,
  finalizarSesion,
  guardarSesion,
  eliminarSesion,
  obtenerSesionActiva,
  nuevoId,
  calcularVolumen,
} from '../db/db'

interface SessionState {
  /** Sesión en curso, o null si no hay ninguna. */
  active: WorkoutSession | null
  /** true una vez hidratado desde IndexedDB al arrancar. */
  hydrated: boolean

  /** Carga la sesión activa desde IndexedDB (llamar al arrancar la app). */
  hidratar: () => Promise<void>

  /** Inicia una nueva sesión y la deja como activa. */
  iniciar: (name?: string) => Promise<void>
  /** Duplica una sesión previa como nueva sesión activa (plantilla). */
  duplicar: (origen: WorkoutSession) => Promise<void>
  /** Finaliza la sesión activa (pasa a "completada"). */
  finalizar: () => Promise<void>
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

  duplicar: async (origen) => {
    const session = await duplicarSesion(origen)
    set({ active: session })
  },

  finalizar: async () => {
    const current = get().active
    if (!current) return
    await finalizarSesion(current)
    set({ active: null })
  },

  cancelar: async () => {
    const current = get().active
    if (!current) return
    await eliminarSesion(current.id)
    set({ active: null })
  },

  addEjercicio: (ex) =>
    mutate(set, get, (s) => ({
      ...s,
      exercises: [
        ...s.exercises,
        {
          id: nuevoId(),
          exerciseId: ex.id,
          exerciseName: ex.name,
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
    })),

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
