/**
 * Umbrales del motor de recomendaciones.
 *
 * Todo está aquí como constantes para poder leerlo y ajustarlo de un vistazo,
 * sin tocar la lógica. Las reglas que los usan viven en `engine.ts`.
 */

import type { MuscleKey } from '../types'

/** Días sin entrenar un grupo antes de avisar (equilibrio muscular). */
export const DIAS_DESCUIDADO = 5

/** Horas mínimas de descanso recomendadas para un mismo grupo muscular. */
export const HORAS_DESCANSO_MIN = 48

/** Reps por serie a partir de las cuales se sugiere subir peso. */
export const REPS_PROGRESION = 8

/** Incremento de peso sugerido al progresar (kg). */
export const INCREMENTO_KG = 2.5

/** Nº de sesiones repitiendo un ejercicio antes de sugerir variar. */
export const SESIONES_PARA_VARIAR = 3

/** Nº de grupos musculares a proponer en la rutina del día. */
export const GRUPOS_RUTINA = 2

/** Máximo de recomendaciones mostradas a la vez. */
export const MAX_RECOMENDACIONES = 5

/** Máximo de avisos de equilibrio, para no tapar otras reglas. */
export const MAX_GRUPOS_EQUILIBRIO = 2

/**
 * Grupos musculares "grandes" que vigila el equilibrio y la rutina del día.
 * (Se dejan fuera bíceps/tríceps/gemelos: suelen trabajarse como secundarios.)
 */
export const GRUPOS_PRINCIPALES: MuscleKey[] = [
  'chest',
  'back',
  'shoulders',
  'quadriceps',
  'hamstrings',
  'glutes',
]
