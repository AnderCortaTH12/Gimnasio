/**
 * Modelo de un ejercicio del catálogo.
 *
 * Las claves de músculo/equipo/categoría se guardan en INGLÉS (igual que el
 * dataset público hasaneyldrm/exercises-dataset, uso personal/no comercial) y
 * se traducen al español solo en la capa de UI mediante los mapas de
 * `src/data/muscles.ts`. Así el dato es estable y la traducción vive en un
 * único sitio.
 */

/** Grupo/región muscular (claves en inglés del dataset). */
export type MuscleKey =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'traps'
  | 'lower_back'
  | 'lats'
  | 'cardio'
  | 'full_body'

/** Equipamiento necesario (claves en inglés). */
export type EquipmentKey =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'other'

/** Categoría general del ejercicio. */
export type ExerciseCategory =
  | 'strength'
  | 'hypertrophy'
  | 'cardio'
  | 'stretching'
  | 'plyometrics'

export interface Exercise {
  /** Identificador estable (slug del dataset o generado). */
  id: string
  /** Nombre visible del ejercicio (en español para la UI). */
  name: string
  /** Categoría general. */
  category: ExerciseCategory
  /** Región corporal principal. */
  bodyPart: MuscleKey
  /** Equipamiento requerido. */
  equipment: EquipmentKey
  /** Grupo muscular principal trabajado. */
  muscleGroup: MuscleKey
  /** Músculos secundarios. */
  secondaryMuscles: MuscleKey[]
  /** Músculo objetivo específico (target), en inglés. */
  target: MuscleKey
  /** Instrucciones breves paso a paso (opcional, en inglés). */
  instructions?: string[]
  /** Rutas/URLs de imágenes ilustrativas (opcional). */
  images?: string[]
  /** URL del GIF animado que ilustra el ejercicio (opcional). */
  gifUrl?: string
}
