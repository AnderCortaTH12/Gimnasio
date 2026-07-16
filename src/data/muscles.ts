/**
 * Mapas de traducción inglés → español para mostrar en la UI.
 * El dato del catálogo se guarda en inglés (ver `types/exercise.ts`) y aquí
 * vive la única fuente de traducción a español.
 */

import type {
  MuscleKey,
  EquipmentKey,
  ExerciseCategory,
} from '../types'

/** Nombre en español de cada grupo muscular. */
export const MUSCLE_ES: Record<MuscleKey, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebrazos',
  quadriceps: 'Cuádriceps',
  hamstrings: 'Isquios',
  glutes: 'Glúteos',
  calves: 'Gemelos',
  abs: 'Abdominales',
  traps: 'Trapecio',
  lower_back: 'Lumbares',
  lats: 'Dorsales',
  cardio: 'Cardio',
  full_body: 'Cuerpo completo',
}

/** Nombre en español de cada tipo de equipamiento. */
export const EQUIPMENT_ES: Record<EquipmentKey, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Máquina',
  cable: 'Polea',
  bodyweight: 'Peso corporal',
  kettlebell: 'Kettlebell',
  band: 'Banda',
  other: 'Otro',
}

/** Nombre en español de cada categoría. */
export const CATEGORY_ES: Record<ExerciseCategory, string> = {
  strength: 'Fuerza',
  hypertrophy: 'Hipertrofia',
  cardio: 'Cardio',
  stretching: 'Estiramiento',
  plyometrics: 'Pliometría',
}

/** Traduce una clave de músculo, con fallback a la propia clave. */
export const traducirMusculo = (k: MuscleKey): string => MUSCLE_ES[k] ?? k

/** Traduce una clave de equipo, con fallback a la propia clave. */
export const traducirEquipo = (k: EquipmentKey): string => EQUIPMENT_ES[k] ?? k

/**
 * Grupos musculares principales que se ofrecen como filtro en la UI,
 * en el orden en que se muestran.
 */
export const GRUPOS_FILTRO: MuscleKey[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
]

/** Tipos de equipo que se ofrecen como filtro en la UI. */
export const EQUIPOS_FILTRO: EquipmentKey[] = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
]
