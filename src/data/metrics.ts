/** Metadatos de presentación de cada tipo de medida corporal. */

import type { BodyMetricType } from '../types'

export interface MetricMeta {
  label: string
  unit: string
  /** Color del trazo en la gráfica. */
  color: string
}

export const METRIC_META: Record<BodyMetricType, MetricMeta> = {
  peso: { label: 'Peso corporal', unit: 'kg', color: '#C6FF3D' },
  grasa: { label: 'Grasa corporal', unit: '%', color: '#FBBF24' },
  cintura: { label: 'Cintura', unit: 'cm', color: '#22D3EE' },
  pecho: { label: 'Pecho', unit: 'cm', color: '#F87171' },
  brazo: { label: 'Brazo', unit: 'cm', color: '#A78BFA' },
  muslo: { label: 'Muslo', unit: 'cm', color: '#4ADE80' },
  cadera: { label: 'Cadera', unit: 'cm', color: '#F472B6' },
  cuello: { label: 'Cuello', unit: 'cm', color: '#60A5FA' },
  pantorrilla: { label: 'Pantorrilla', unit: 'cm', color: '#FB923C' },
}

/** Medidas de perímetro (además de peso y grasa) que se ofrecen en la UI. */
export const MEDIDAS_PERIMETRO: BodyMetricType[] = [
  'cintura',
  'pecho',
  'brazo',
  'muslo',
  'cadera',
  'cuello',
  'pantorrilla',
]

/** Todos los tipos seleccionables al registrar una medida. */
export const TIPOS_MEDIDA: BodyMetricType[] = [
  'peso',
  'grasa',
  ...MEDIDAS_PERIMETRO,
]
