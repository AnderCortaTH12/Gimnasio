/**
 * Modelo de un ejercicio del catálogo.
 *
 * Basado en el esquema del dataset público hasaneyldrm/exercises-dataset
 * (uso personal/no comercial). En las primeras fases trabajamos con un
 * subconjunto curado embebido; el dataset completo (1.324 ejercicios) se
 * integrará en la última fase y se cachea en IndexedDB.
 */

/** Grupo muscular objetivo (normalizado a español para la UI). */
export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'antebrazos'
  | 'cuadriceps'
  | 'isquios'
  | 'gluteos'
  | 'gemelos'
  | 'abdominales'
  | 'trapecio'
  | 'lumbares'
  | 'cardio'
  | 'cuerpo-completo'

/** Tipo de fuerza principal del movimiento. */
export type Force = 'empuje' | 'traccion' | 'estatico'

/** Nivel de dificultad sugerido. */
export type Level = 'principiante' | 'intermedio' | 'avanzado'

/** Mecánica del ejercicio. */
export type Mechanic = 'compuesto' | 'aislamiento'

/** Equipamiento necesario. */
export type Equipment =
  | 'barra'
  | 'mancuernas'
  | 'maquina'
  | 'polea'
  | 'peso-corporal'
  | 'kettlebell'
  | 'banda'
  | 'otro'

/** Categoría general del ejercicio. */
export type ExerciseCategory =
  | 'fuerza'
  | 'hipertrofia'
  | 'cardio'
  | 'estiramiento'
  | 'pliometria'
  | 'strongman'

export interface Exercise {
  /** Identificador estable (viene del dataset o slug generado). */
  id: string
  /** Nombre visible del ejercicio. */
  name: string
  /** Tipo de fuerza principal. */
  force?: Force
  /** Nivel de dificultad. */
  level?: Level
  /** Mecánica: compuesto o aislamiento. */
  mechanic?: Mechanic
  /** Equipamiento requerido. */
  equipment?: Equipment
  /** Músculos principales trabajados. */
  primaryMuscles: MuscleGroup[]
  /** Músculos secundarios. */
  secondaryMuscles: MuscleGroup[]
  /** Instrucciones paso a paso. */
  instructions: string[]
  /** Categoría general. */
  category?: ExerciseCategory
  /** Rutas/URLs de imágenes ilustrativas. */
  images: string[]
}
