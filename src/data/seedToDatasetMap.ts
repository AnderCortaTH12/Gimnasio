/**
 * Mapa curado: ejercicios del seed → IDs del dataset.
 *
 * Cada ejercicio del seed se mapea a su ID real en el dataset (1.324 ejercicios)
 * para que se use la animación correcta (gifUrl) del dataset.
 */

export const SEED_TO_DATASET_MAP: Record<string, string> = {
  // ── Pecho ────────────────────────────────────────────────────────────────
  'Press de banca': '0025',
  'Press inclinado con barra': '0026',
  'Press de banca con mancuernas': '0028',
  'Aperturas con mancuernas': '0008',
  'Cruce de poleas': '0110',
  'Flexiones': '0030',
  'Fondos en paralelas': '0032',

  // ── Espalda ──────────────────────────────────────────────────────────────
  'Peso muerto': '0020',
  'Dominadas': '0037',
  'Dominadas supinas': '0041',
  'Jalón al pecho': '0051',
  'Remo con barra': '0056',
  'Remo con mancuerna': '0057',
  'Remo sentado en polea': '0060',
  'Face pull': '0035',

  // ── Hombros ──────────────────────────────────────────────────────────────
  'Press militar': '0043',
  'Press de hombro con mancuernas': '0044',
  'Elevaciones laterales': '0053',
  'Elevaciones frontales': '0036',
  'Pájaro (deltoides posterior)': '0031',
  'Press Arnold': '0023',
  'Encogimientos': '0063',

  // ── Bíceps ───────────────────────────────────────────────────────────────
  'Curl con barra': '0009',
  'Curl con mancuernas': '0010',
  'Curl martillo': '0041',
  'Curl predicador': '0045',
  'Curl en polea': '0011',

  // ── Tríceps ──────────────────────────────────────────────────────────────
  'Extensión de tríceps en polea': '0034',
  'Extensión de tríceps sobre la cabeza': '0033',
  'Press francés': '0046',
  'Press cerrado': '0027',

  // ── Cuádriceps / piernas ─────────────────────────────────────────────────
  'Sentadilla trasera': '0048',
  'Sentadilla frontal': '0049',
  'Prensa de piernas': '0067',
  'Extensión de cuádriceps': '0050',
  'Zancadas': '0055',
  'Sentadilla búlgara': '0024',

  // ── Isquios / glúteos ────────────────────────────────────────────────────
  'Peso muerto rumano': '0021',
  'Curl femoral': '0014',
  'Hip thrust': '0040',
  'Puente de glúteos': '0039',

  // ── Gemelos ──────────────────────────────────────────────────────────────
  'Elevación de gemelos de pie': '0065',
  'Elevación de gemelos sentado': '0066',

  // ── Abdominales ──────────────────────────────────────────────────────────
  'Plancha': '0061',
  'Elevación de piernas colgado': '0052',
  'Encogimientos abdominales': '0012',
  'Crunch en polea': '0013',
  'Giro ruso': '0058',

  // ── Antebrazos ───────────────────────────────────────────────────────────
  'Curl de muñeca': '0042',
}

/**
 * Devuelve el ID real del dataset para un ejercicio del seed.
 * Si no está mapeado, devuelve undefined (usa el ID del seed como fallback).
 */
export function obtenerIdDataset(nombreSeed: string): string | undefined {
  return SEED_TO_DATASET_MAP[nombreSeed]
}
