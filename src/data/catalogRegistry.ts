/**
 * Registro global id → Exercise.
 *
 * Es la fuente única para resolver un ejercicio por su id desde cualquier parte
 * (stats, recomendaciones…) sin acoplarse al seed ni al dataset. Se inicializa
 * con el seed y se amplía cuando el catálogo completo se carga.
 */

import type { Exercise } from '../types'
import { EXERCISES_SEED } from './exercisesSeed'

const REGISTRO = new Map<string, Exercise>(
  EXERCISES_SEED.map((e) => [e.id, e]),
)

/** Añade/actualiza ejercicios en el registro (idempotente por id). */
export function registrarEjercicios(items: Exercise[]): void {
  for (const e of items) REGISTRO.set(e.id, e)
}

/** Devuelve un ejercicio por id, o undefined si no está registrado. */
export function obtenerEjercicio(id: string): Exercise | undefined {
  return REGISTRO.get(id)
}
