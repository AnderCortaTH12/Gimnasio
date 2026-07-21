/**
 * Modelos de medidas corporales y perfil de usuario.
 */

import type { TrainingGoal } from './schedule'

/** Sistema de unidades preferido. */
export type UnitSystem = 'metrico' | 'imperial'

/** Tipo de medida corporal registrada. */
export type BodyMetricType =
  | 'peso'
  | 'grasa'
  | 'cintura'
  | 'pecho'
  | 'brazo'
  | 'muslo'
  | 'cadera'
  | 'cuello'
  | 'pantorrilla'

export interface BodyMetric {
  /** Identificador único de la medida. */
  id: string
  /** Fecha de la medida en formato ISO 8601. */
  date: string
  /** Tipo de medida. */
  type: BodyMetricType
  /** Valor numérico (kg, %, cm según el tipo y unidades del perfil). */
  value: number
  /** Notas opcionales. */
  notes?: string
}

export interface UserProfile {
  /** Clave fija; solo existe un perfil (monousuario). */
  id: 'profile'
  /** Nombre para mostrar. */
  name?: string
  /** Sistema de unidades preferido. */
  units: UnitSystem
  /** Altura en cm. */
  heightCm?: number
  /** Edad en años (para cálculos e interpretación). */
  age?: number
  /** Sexo biológico, usado en fórmulas opcionales. */
  sex?: 'hombre' | 'mujer' | 'otro'
  /** Objetivo de entrenamiento. */
  trainingGoal?: TrainingGoal
  /** Objetivo de peso corporal (kg). */
  targetWeight?: number
  /** Días de entrenamiento objetivo por semana. */
  weeklyGoal?: number
  /** Marca de creación (epoch ms). */
  createdAt: number
  /** Marca de última actualización (epoch ms). */
  updatedAt: number
}
