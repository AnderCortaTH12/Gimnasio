/**
 * Cálculo e interpretación del Índice de Masa Corporal (IMC / BMI).
 * Rangos estándar de la OMS para población adulta.
 */

export type ImcCategoria =
  | 'bajo-peso'
  | 'normal'
  | 'sobrepeso'
  | 'obesidad'

export interface ImcResultado {
  /** Valor del IMC (kg/m²). */
  valor: number
  /** Categoría según rangos OMS. */
  categoria: ImcCategoria
  /** Etiqueta en español. */
  etiqueta: string
  /** Tono de color para la UI. */
  tono: 'warn' | 'pr' | 'regress'
}

/** Etiqueta y tono de color por categoría. */
const META: Record<ImcCategoria, { etiqueta: string; tono: ImcResultado['tono'] }> = {
  'bajo-peso': { etiqueta: 'Bajo peso', tono: 'warn' },
  normal: { etiqueta: 'Peso normal', tono: 'pr' },
  sobrepeso: { etiqueta: 'Sobrepeso', tono: 'warn' },
  obesidad: { etiqueta: 'Obesidad', tono: 'regress' },
}

/** Clasifica un valor de IMC en su categoría. */
export function categoriaImc(valor: number): ImcCategoria {
  if (valor < 18.5) return 'bajo-peso'
  if (valor < 25) return 'normal'
  if (valor < 30) return 'sobrepeso'
  return 'obesidad'
}

/**
 * Calcula el IMC a partir de peso (kg) y altura (cm).
 * Devuelve null si faltan datos o no son válidos.
 */
export function calcularImc(
  pesoKg?: number,
  alturaCm?: number,
): ImcResultado | null {
  if (!pesoKg || !alturaCm || pesoKg <= 0 || alturaCm <= 0) return null
  const m = alturaCm / 100
  const valor = pesoKg / (m * m)
  const categoria = categoriaImc(valor)
  return {
    valor: Math.round(valor * 10) / 10,
    categoria,
    etiqueta: META[categoria].etiqueta,
    tono: META[categoria].tono,
  }
}

/** Rangos de referencia para mostrar en la UI. */
export const RANGOS_IMC: Array<{
  etiqueta: string
  rango: string
  categoria: ImcCategoria
}> = [
  { etiqueta: 'Bajo peso', rango: '< 18.5', categoria: 'bajo-peso' },
  { etiqueta: 'Normal', rango: '18.5 – 24.9', categoria: 'normal' },
  { etiqueta: 'Sobrepeso', rango: '25 – 29.9', categoria: 'sobrepeso' },
  { etiqueta: 'Obesidad', rango: '≥ 30', categoria: 'obesidad' },
]
