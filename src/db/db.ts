/**
 * Capa de datos aislada de FORJA.
 *
 * Toda la persistencia vive en IndexedDB a través de Dexie. El resto de la app
 * NO debe tocar IndexedDB directamente: importa las funciones de este módulo.
 * En esta fase de andamiaje las funciones son STUBS: definen la firma y el
 * esquema, pero aún no contienen lógica de negocio.
 */

import Dexie, { type Table } from 'dexie'
import type {
  Exercise,
  WorkoutSession,
  BodyMetric,
  UserProfile,
} from '../types'

/** Base de datos de FORJA. Una única instancia compartida en toda la app. */
class ForjaDB extends Dexie {
  /** Sesiones de entrenamiento (con sus ejercicios y series anidados). */
  sessions!: Table<WorkoutSession, string>
  /** Catálogo de ejercicios cacheado desde el dataset. */
  exercises!: Table<Exercise, string>
  /** Medidas corporales (peso, grasa, perímetros...). */
  bodyMetrics!: Table<BodyMetric, string>
  /** Perfil de usuario (registro único con id 'profile'). */
  profile!: Table<UserProfile, string>

  constructor() {
    super('forja')

    // v1 — esquema inicial. Solo se indexan los campos por los que filtramos.
    this.version(1).stores({
      sessions: 'id, date, startedAt, status',
      exercises: 'id, name, category, equipment',
      bodyMetrics: 'id, date, type',
      profile: 'id',
    })
  }
}

/** Instancia única de la base de datos. */
export const db = new ForjaDB()

// ---------------------------------------------------------------------------
// STUBS de las funciones principales. Se implementarán en fases posteriores.
// ---------------------------------------------------------------------------

/** Crea y persiste una nueva sesión de entrenamiento. Devuelve su id. */
export async function crearSesion(
  _session: Omit<WorkoutSession, 'id'>,
): Promise<string> {
  throw new Error('crearSesion: no implementado (stub)')
}

/** Guarda/actualiza una serie dentro de una sesión y ejercicio dados. */
export async function guardarSerie(
  _sessionId: string,
  _exerciseEntryId: string,
  _set: import('../types').SetEntry,
): Promise<void> {
  throw new Error('guardarSerie: no implementado (stub)')
}

/** Lee el historial de sesiones, más recientes primero. */
export async function leerHistorial(
  _limit?: number,
): Promise<WorkoutSession[]> {
  throw new Error('leerHistorial: no implementado (stub)')
}

/** Lee el perfil de usuario, o undefined si aún no existe. */
export async function leerPerfil(): Promise<UserProfile | undefined> {
  throw new Error('leerPerfil: no implementado (stub)')
}

/** Guarda/actualiza el perfil de usuario. */
export async function guardarPerfil(_profile: UserProfile): Promise<void> {
  throw new Error('guardarPerfil: no implementado (stub)')
}

/** Guarda una nueva medida corporal. Devuelve su id. */
export async function guardarMedida(
  _metric: Omit<BodyMetric, 'id'>,
): Promise<string> {
  throw new Error('guardarMedida: no implementado (stub)')
}
