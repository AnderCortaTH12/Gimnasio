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
  WorkoutPlan,
  WorkoutPlanExecution,
} from '../types'
import type { TrainingSchedule, CompletedDay } from '../types/schedule'

/** Base de datos de FORJA. Una única instancia compartida en toda la app. */
class ForjaDB extends Dexie {
  /** Sesiones de entrenamiento (con sus ejercicios y series anidados). */
  sessions!: Table<WorkoutSession, string>
  /** Catálogo de ejercicios cacheado desde el dataset (legado, no usado). */
  exercises!: Table<Exercise, string>
  /** Medidas corporales (peso, grasa, perímetros...). */
  bodyMetrics!: Table<BodyMetric, string>
  /** Perfil de usuario (registro único con id 'profile'). */
  profile!: Table<UserProfile, string>
  /** Dataset completo de ejercicios (1.324) cacheado para uso offline. */
  exercisesDataset!: Table<Exercise, string>
  /** Planes personalizados del usuario (fase 7). */
  workoutPlans!: Table<WorkoutPlan, string>
  /** Ejecuciones de planes de entrenamiento (fase 7). */
  workoutPlanExecutions!: Table<WorkoutPlanExecution, string>
  /** Planificación semanal de entrenamientos (fase 9). */
  trainingSchedule!: Table<TrainingSchedule, string>
  /** Días completados/saltados del calendario (fase 9). */
  completedDays!: Table<CompletedDay, string>

  constructor() {
    super('forja')

    // v1 — esquema inicial. Solo se indexan los campos por los que filtramos.
    this.version(1).stores({
      sessions: 'id, date, startedAt, status',
      exercises: 'id, name, category, equipment',
      bodyMetrics: 'id, date, type',
      profile: 'id',
    })

    // v2 — tabla para el dataset completo de ejercicios.
    this.version(2).stores({
      exercisesDataset: 'id, name, muscleGroup, equipment',
    })

    // v3 — planes personalizados y ejecuciones de planes.
    this.version(3).stores({
      workoutPlans: 'id, createdBy, createdAt',
      workoutPlanExecutions: 'id, planId, sessionId, startTime, completed',
    })

    // v4 — planificación semanal y seguimiento de días completados (fase 9).
    this.version(4).stores({
      trainingSchedule: 'id',
      completedDays: 'id, date, dayOfWeek, sessionId',
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
// Planes de entrenamiento (personalizados del usuario)
// ---------------------------------------------------------------------------

/** Crea un plan personalizado y lo persiste. Devuelve el plan con su id. */
export async function crearPlan(
  data: Omit<WorkoutPlan, 'id' | 'createdBy' | 'createdAt'>,
): Promise<WorkoutPlan> {
  const plan: WorkoutPlan = {
    ...data,
    id: nuevoId(),
    createdBy: 'user',
    createdAt: Date.now(),
  }
  await db.workoutPlans.put(plan)
  return plan
}

/** Aplica cambios a un plan personalizado existente. */
export async function editarPlan(
  id: string,
  patch: Partial<Omit<WorkoutPlan, 'id' | 'createdBy' | 'createdAt'>>,
): Promise<void> {
  await db.workoutPlans.update(id, patch)
}

/** Elimina un plan personalizado (no afecta a sesiones ya ejecutadas). */
export async function eliminarPlan(id: string): Promise<void> {
  await db.workoutPlans.delete(id)
}

/** Lee los planes personalizados del usuario, más recientes primero. */
export async function leerPlanesUsuario(): Promise<WorkoutPlan[]> {
  const all = await db.workoutPlans.toArray()
  return all.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

// ---------------------------------------------------------------------------
// Planes de entrenamiento (ejecuciones)
// ---------------------------------------------------------------------------

/** Crea y persiste una ejecución de plan (sin terminar, no completada). */
export async function iniciarPlanExecution(input: {
  planId: string
  planName: string
  planOrigin: 'system' | 'user'
  sessionId: string
}): Promise<WorkoutPlanExecution> {
  const exec: WorkoutPlanExecution = {
    id: nuevoId(),
    planId: input.planId,
    planName: input.planName,
    planOrigin: input.planOrigin,
    sessionId: input.sessionId,
    startTime: Date.now(),
    completed: false,
  }
  await db.workoutPlanExecutions.put(exec)
  return exec
}

/** Marca una ejecución de plan como terminada, con el resultado dado. */
export async function finalizarPlanExecution(
  id: string,
  completed: boolean,
): Promise<void> {
  await db.workoutPlanExecutions.update(id, {
    completed,
    endTime: Date.now(),
  })
}

/** Guarda (upsert) una ejecución de plan completa. */
export async function guardarPlanExecution(
  exec: WorkoutPlanExecution,
): Promise<void> {
  await db.workoutPlanExecutions.put(exec)
}

/** Elimina una ejecución de plan (p. ej. si se descarta la sesión). */
export async function eliminarPlanExecution(id: string): Promise<void> {
  await db.workoutPlanExecutions.delete(id)
}

/** Lista de planes ejecutados, más recientes primero. */
export async function leerPlanesEjecutados(): Promise<WorkoutPlanExecution[]> {
  const all = await db.workoutPlanExecutions.toArray()
  return all.sort((a, b) => b.startTime - a.startTime)
}

/** Estadísticas de planes: resumen 7 días y % completados por semana (4 sem). */
export interface EstadisticasPlanes {
  /** Planes iniciados en los últimos 7 días. */
  total7: number
  /** De esos, cuántos se completaron. */
  completados7: number
  /** Porcentaje completado en 7 días (0-100). */
  porcentaje7: number
  /** Últimas 4 semanas (más antigua primero) con su % completado. */
  semanas: { label: string; total: number; completados: number; pct: number }[]
}

export async function estadisticasPlanes(): Promise<EstadisticasPlanes> {
  const DIA = 24 * 3600 * 1000
  const all = await db.workoutPlanExecutions.toArray()
  const ahora = Date.now()

  const recientes = all.filter((e) => e.startTime >= ahora - 7 * DIA)
  const completados7 = recientes.filter((e) => e.completed).length
  const total7 = recientes.length

  // 4 ventanas de 7 días: índice 0 = la más antigua, 3 = la actual.
  const semanas = [3, 2, 1, 0].map((atras) => {
    const fin = ahora - atras * 7 * DIA
    const inicio = fin - 7 * DIA
    const enSemana = all.filter(
      (e) => e.startTime >= inicio && e.startTime < fin,
    )
    const comp = enSemana.filter((e) => e.completed).length
    return {
      label: atras === 0 ? 'Esta' : `-${atras}`,
      total: enSemana.length,
      completados: comp,
      pct: enSemana.length ? Math.round((comp / enSemana.length) * 100) : 0,
    }
  })

  return {
    total7,
    completados7,
    porcentaje7: total7 ? Math.round((completados7 / total7) * 100) : 0,
    semanas,
  }
}

// ---------------------------------------------------------------------------
// Catálogo de ejercicios (cache)
// ---------------------------------------------------------------------------

/** Cachea el catálogo de ejercicios en IndexedDB (idempotente). */
export async function cachearEjercicios(items: Exercise[]): Promise<void> {
  await db.exercises.bulkPut(items)
}

/** Nº de ejercicios del dataset cacheados en IndexedDB. */
export async function contarDataset(): Promise<number> {
  return db.exercisesDataset.count()
}

/** Guarda el dataset completo de ejercicios en IndexedDB. */
export async function guardarDataset(items: Exercise[]): Promise<void> {
  await db.exercisesDataset.bulkPut(items)
}

/** Lee el dataset completo de ejercicios desde IndexedDB. */
export async function leerDataset(): Promise<Exercise[]> {
  return db.exercisesDataset.toArray()
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
// Planificación semanal (fase 9)
// ---------------------------------------------------------------------------

/** Crea o actualiza la planificación semanal activa del usuario. */
export async function guardarPlanificacion(schedule: TrainingSchedule): Promise<void> {
  // Desactiva cualquier otra planificación activa
  const activa = await db.trainingSchedule.where('isActive').equals(true).toArray()
  for (const s of activa) {
    if (s.id !== schedule.id) {
      await db.trainingSchedule.update(s.id, { isActive: false })
    }
  }
  // Guarda la nueva
  await db.trainingSchedule.put(schedule)
}

/** Lee la planificación activa, o undefined si no hay. */
export async function leerPlanificacionActiva(): Promise<TrainingSchedule | undefined> {
  const activa = await db.trainingSchedule.where('isActive').equals(true).first()
  return activa
}

/** Lee TODAS las planificaciones (historial). */
export async function leerTodasLasPlanificaciones(): Promise<TrainingSchedule[]> {
  const all = await db.trainingSchedule.toArray()
  return all.sort((a, b) => b.updatedAt - a.updatedAt)
}

/** Marca un día como completado (enlaza a una sesión real). */
export async function marcarDiaCompletado(input: {
  date: string // YYYY-MM-DD
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  trainingType: string
  sessionId: string
}): Promise<void> {
  const completed: CompletedDay = {
    id: nuevoId(),
    date: input.date,
    dayOfWeek: input.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    trainingType: input.trainingType as any,
    sessionId: input.sessionId,
    completedAt: Date.now(),
    skipped: false,
  }
  await db.completedDays.put(completed)
}

/** Marca un día como saltado/fallido. */
export async function marcarDiaSaltado(input: {
  date: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  trainingType: string
}): Promise<void> {
  const skipped: CompletedDay = {
    id: nuevoId(),
    date: input.date,
    dayOfWeek: input.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    trainingType: input.trainingType as any,
    sessionId: '',
    completedAt: Date.now(),
    skipped: true,
  }
  await db.completedDays.put(skipped)
}

/** Lee los días completados en un rango de fechas. */
export async function leerDiasCompletados(desde: string, hasta: string): Promise<CompletedDay[]> {
  return db.completedDays.where('date').between(desde, hasta).toArray()
}

/** Lee un día completado por fecha. */
export async function leerDiaCompletado(date: string): Promise<CompletedDay | undefined> {
  return db.completedDays.where('date').equals(date).first()
}

/** Estadísticas de adherencia: cuántos días completados/saltados en la última semana. */
export async function estadisticasAdherencia(): Promise<{
  completados7: number
  saltados7: number
  total7: number
  porcentaje: number
}> {
  const DIA = 24 * 3600 * 1000
  const ahora = new Date()
  ahora.setHours(0, 0, 0, 0)
  const hace7 = new Date(ahora.getTime() - 7 * DIA).toISOString().split('T')[0]
  const hoy = ahora.toISOString().split('T')[0]

  const dias = await leerDiasCompletados(hace7, hoy)
  const completados = dias.filter((d) => !d.skipped).length
  const saltados = dias.filter((d) => d.skipped).length

  return {
    completados7: completados,
    saltados7: saltados,
    total7: dias.length,
    porcentaje: dias.length > 0 ? Math.round((completados / dias.length) * 100) : 0,
  }
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
  /** Planes personalizados (opcional: backups antiguos no lo traen). */
  plans?: WorkoutPlan[]
  /** Ejecuciones de planes (opcional: backups antiguos no lo traen). */
  planExecutions?: WorkoutPlanExecution[]
  /** Planificación de entrenamientos (opcional: backups antiguos no lo traen). */
  trainingSchedules?: TrainingSchedule[]
  /** Días completados del calendario (opcional: backups antiguos no lo traen). */
  completedDays?: CompletedDay[]
}

/** Lee todas las tablas y devuelve un objeto de backup serializable. */
export async function exportarDatos(): Promise<BackupData> {
  const [
    sessions,
    exercises,
    bodyMetrics,
    profile,
    plans,
    planExecutions,
    trainingSchedules,
    completedDays,
  ] = await Promise.all([
    db.sessions.toArray(),
    db.exercises.toArray(),
    db.bodyMetrics.toArray(),
    db.profile.toArray(),
    db.workoutPlans.toArray(),
    db.workoutPlanExecutions.toArray(),
    db.trainingSchedule.toArray(),
    db.completedDays.toArray(),
  ])
  return {
    app: 'forja',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    sessions,
    exercises,
    bodyMetrics,
    profile,
    plans,
    planExecutions,
    trainingSchedules,
    completedDays,
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
    [
      db.sessions,
      db.exercises,
      db.bodyMetrics,
      db.profile,
      db.workoutPlans,
      db.workoutPlanExecutions,
      db.trainingSchedule,
      db.completedDays,
    ],
    async () => {
      await Promise.all([
        db.sessions.clear(),
        db.exercises.clear(),
        db.bodyMetrics.clear(),
        db.profile.clear(),
        db.workoutPlans.clear(),
        db.workoutPlanExecutions.clear(),
        db.trainingSchedule.clear(),
        db.completedDays.clear(),
      ])
      await Promise.all([
        db.sessions.bulkPut(data.sessions),
        db.exercises.bulkPut(data.exercises),
        db.bodyMetrics.bulkPut(data.bodyMetrics),
        db.profile.bulkPut(data.profile),
        db.workoutPlans.bulkPut(data.plans ?? []),
        db.workoutPlanExecutions.bulkPut(data.planExecutions ?? []),
        db.trainingSchedule.bulkPut(data.trainingSchedules ?? []),
        db.completedDays.bulkPut(data.completedDays ?? []),
      ])
    },
  )
}
