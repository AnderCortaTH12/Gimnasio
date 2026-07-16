/**
 * Capa de datos aislada de FORJA.
 *
 * Toda la persistencia vive en IndexedDB a través de Dexie. El resto de la app
 * NO debe tocar IndexedDB directamente: importa las funciones de este módulo.
 */

import Dexie, { type Table } from 'dexie'
import type {
  Exercise,
  WorkoutSession,
  ExerciseEntry,
  SetEntry,
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
// Utilidades
// ---------------------------------------------------------------------------

/** Genera un id único. Usa crypto.randomUUID cuando está disponible. */
export function nuevoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/** Suma el volumen (peso × reps) de las series completadas de una sesión. */
export function calcularVolumen(session: WorkoutSession): number {
  let total = 0
  for (const ex of session.exercises) {
    for (const s of ex.sets) {
      if (s.completed && s.type !== 'calentamiento') {
        total += s.weight * s.reps
      }
    }
  }
  return total
}

// ---------------------------------------------------------------------------
// Sesiones de entrenamiento
// ---------------------------------------------------------------------------

/** Crea y persiste una nueva sesión vacía en estado "en-progreso". */
export async function crearSesion(name?: string): Promise<WorkoutSession> {
  const now = Date.now()
  const session: WorkoutSession = {
    id: nuevoId(),
    date: new Date(now).toISOString(),
    startedAt: now,
    name: name?.trim() || 'Entrenamiento',
    exercises: [],
    status: 'en-progreso',
  }
  await db.sessions.put(session)
  return session
}

/** Guarda (upsert) una sesión completa. Recalcula el volumen cacheado. */
export async function guardarSesion(session: WorkoutSession): Promise<void> {
  await db.sessions.put({ ...session, totalVolume: calcularVolumen(session) })
}

/** Guarda/actualiza una serie dentro de una sesión y ejercicio dados. */
export async function guardarSerie(
  sessionId: string,
  exerciseEntryId: string,
  set: SetEntry,
): Promise<void> {
  const session = await db.sessions.get(sessionId)
  if (!session) throw new Error(`Sesión ${sessionId} no encontrada`)
  const entry = session.exercises.find((e) => e.id === exerciseEntryId)
  if (!entry) throw new Error(`Ejercicio ${exerciseEntryId} no encontrado`)
  const idx = entry.sets.findIndex((s) => s.id === set.id)
  if (idx >= 0) entry.sets[idx] = set
  else entry.sets.push(set)
  await guardarSesion(session)
}

/** Devuelve la sesión en curso (estado "en-progreso"), o undefined. */
export async function obtenerSesionActiva(): Promise<
  WorkoutSession | undefined
> {
  return db.sessions.where('status').equals('en-progreso').first()
}

/** Devuelve una sesión por id. */
export async function obtenerSesion(
  id: string,
): Promise<WorkoutSession | undefined> {
  return db.sessions.get(id)
}

/** Marca una sesión como completada, fija fin y volumen final. */
export async function finalizarSesion(
  session: WorkoutSession,
): Promise<void> {
  const finished: WorkoutSession = {
    ...session,
    status: 'completada',
    finishedAt: Date.now(),
  }
  await guardarSesion(finished)
}

/** Elimina una sesión por id. */
export async function eliminarSesion(id: string): Promise<void> {
  await db.sessions.delete(id)
}

/** Lee el historial de sesiones completadas, más recientes primero. */
export async function leerHistorial(
  limit?: number,
): Promise<WorkoutSession[]> {
  let coll = db.sessions
    .where('status')
    .equals('completada')
    .reverse()
    .sortBy('startedAt')
  const sorted = await coll
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

/**
 * Duplica una sesión anterior como nueva sesión "en-progreso".
 * Copia los ejercicios y series como OBJETIVO: mismos pesos/reps pero sin
 * marcar como completadas y sin PRs.
 */
export async function duplicarSesion(
  origen: WorkoutSession,
): Promise<WorkoutSession> {
  const now = Date.now()
  const exercises: ExerciseEntry[] = origen.exercises.map((ex) => ({
    ...ex,
    id: nuevoId(),
    sets: ex.sets
      .filter((s) => s.type !== 'calentamiento')
      .map((s) => ({
        ...s,
        id: nuevoId(),
        completed: false,
        isPR: false,
      })),
  }))
  const copia: WorkoutSession = {
    id: nuevoId(),
    date: new Date(now).toISOString(),
    startedAt: now,
    name: origen.name,
    exercises,
    status: 'en-progreso',
  }
  await db.sessions.put(copia)
  return copia
}

// ---------------------------------------------------------------------------
// Catálogo de ejercicios (cache)
// ---------------------------------------------------------------------------

/** Cachea el catálogo de ejercicios en IndexedDB (idempotente). */
export async function cachearEjercicios(items: Exercise[]): Promise<void> {
  await db.exercises.bulkPut(items)
}

// ---------------------------------------------------------------------------
// Perfil de usuario
// ---------------------------------------------------------------------------

/** Lee el perfil de usuario, o undefined si aún no existe. */
export async function leerPerfil(): Promise<UserProfile | undefined> {
  return db.profile.get('profile')
}

/** Guarda/actualiza el perfil de usuario. */
export async function guardarPerfil(profile: UserProfile): Promise<void> {
  await db.profile.put({ ...profile, updatedAt: Date.now() })
}

/**
 * Aplica cambios parciales al perfil, creándolo si aún no existe.
 * Devuelve el perfil resultante.
 */
export async function actualizarPerfil(
  patch: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<UserProfile> {
  const now = Date.now()
  const actual = await leerPerfil()
  const base: UserProfile = actual ?? {
    id: 'profile',
    units: 'metrico',
    createdAt: now,
    updatedAt: now,
  }
  const next: UserProfile = { ...base, ...patch, id: 'profile', updatedAt: now }
  await db.profile.put(next)
  return next
}

// ---------------------------------------------------------------------------
// Medidas corporales
// ---------------------------------------------------------------------------

/** Guarda una nueva medida corporal. Devuelve su id. */
export async function guardarMedida(
  metric: Omit<BodyMetric, 'id'>,
): Promise<string> {
  const id = nuevoId()
  await db.bodyMetrics.put({ ...metric, id })
  return id
}

/** Lee las medidas de un tipo dado, ordenadas por fecha ascendente. */
export async function leerMedidas(
  type?: BodyMetric['type'],
): Promise<BodyMetric[]> {
  const all = type
    ? await db.bodyMetrics.where('type').equals(type).toArray()
    : await db.bodyMetrics.toArray()
  return all.sort((a, b) => a.date.localeCompare(b.date))
}

/** Devuelve la última medida (más reciente) de un tipo, o undefined. */
export async function ultimaMedida(
  type: BodyMetric['type'],
): Promise<BodyMetric | undefined> {
  const medidas = await leerMedidas(type)
  return medidas[medidas.length - 1]
}

/** Actualiza campos de una medida existente. */
export async function actualizarMedida(
  id: string,
  patch: Partial<Omit<BodyMetric, 'id'>>,
): Promise<void> {
  await db.bodyMetrics.update(id, patch)
}

/** Elimina una medida corporal por id. */
export async function eliminarMedida(id: string): Promise<void> {
  await db.bodyMetrics.delete(id)
}

// ---------------------------------------------------------------------------
// Copia de seguridad (export / import)
// ---------------------------------------------------------------------------

/** Versión del formato de backup, por si el esquema cambia en el futuro. */
export const BACKUP_VERSION = 1

/** Estructura de un archivo de copia de seguridad de FORJA. */
export interface BackupData {
  app: 'forja'
  version: number
  exportedAt: string
  sessions: WorkoutSession[]
  exercises: Exercise[]
  bodyMetrics: BodyMetric[]
  profile: UserProfile[]
}

/** Lee todas las tablas y devuelve un objeto de backup serializable. */
export async function exportarDatos(): Promise<BackupData> {
  const [sessions, exercises, bodyMetrics, profile] = await Promise.all([
    db.sessions.toArray(),
    db.exercises.toArray(),
    db.bodyMetrics.toArray(),
    db.profile.toArray(),
  ])
  return {
    app: 'forja',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    sessions,
    exercises,
    bodyMetrics,
    profile,
  }
}

/** Valida (de forma defensiva) que un objeto tiene forma de backup de FORJA. */
export function esBackupValido(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    d.app === 'forja' &&
    typeof d.version === 'number' &&
    Array.isArray(d.sessions) &&
    Array.isArray(d.exercises) &&
    Array.isArray(d.bodyMetrics) &&
    Array.isArray(d.profile)
  )
}

/**
 * Restaura un backup: BORRA los datos actuales y escribe los del archivo.
 * Todo en una única transacción para no dejar la base a medias.
 */
export async function importarDatos(data: BackupData): Promise<void> {
  if (!esBackupValido(data)) {
    throw new Error('El archivo no es una copia de seguridad válida de FORJA.')
  }
  await db.transaction(
    'rw',
    db.sessions,
    db.exercises,
    db.bodyMetrics,
    db.profile,
    async () => {
      await Promise.all([
        db.sessions.clear(),
        db.exercises.clear(),
        db.bodyMetrics.clear(),
        db.profile.clear(),
      ])
      await Promise.all([
        db.sessions.bulkPut(data.sessions),
        db.exercises.bulkPut(data.exercises),
        db.bodyMetrics.bulkPut(data.bodyMetrics),
        db.profile.bulkPut(data.profile),
      ])
    },
  )
}
