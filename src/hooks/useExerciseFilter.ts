import { useMemo, useState } from 'react'
import type { Exercise, MuscleKey, EquipmentKey } from '../types'
import { useCatalogStore } from '../store/catalogStore'

/** Normaliza texto para búsqueda insensible a mayúsculas y acentos. */
export const normalizar = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

/**
 * Lógica compartida de búsqueda + filtros del catálogo de ejercicios.
 * La usan tanto la pantalla Ejercicios como el selector dentro de una sesión.
 */
export function useExerciseFilter(source?: Exercise[]) {
  const catalogo = useCatalogStore((s) => s.exercises)
  const lista = source ?? catalogo
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState<MuscleKey | null>(null)
  const [equipment, setEquipment] = useState<EquipmentKey | null>(null)

  const filtered = useMemo(() => {
    const q = normalizar(query.trim())
    return lista.filter((ex) => {
      if (q && !normalizar(ex.name).includes(q)) return false
      if (
        muscle &&
        ex.muscleGroup !== muscle &&
        ex.bodyPart !== muscle &&
        !ex.secondaryMuscles.includes(muscle)
      )
        return false
      if (equipment && ex.equipment !== equipment) return false
      return true
    })
  }, [lista, query, muscle, equipment])

  const hayFiltros = muscle !== null || equipment !== null || query.trim() !== ''

  return {
    query,
    setQuery,
    muscle,
    setMuscle,
    equipment,
    setEquipment,
    filtered,
    hayFiltros,
  }
}
