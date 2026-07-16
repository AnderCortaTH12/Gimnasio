/**
 * Catálogo de ejercicios en memoria (Zustand).
 *
 * Fuente principal: dataset completo (1.324) cacheado en IndexedDB; si no está,
 * se descarga de `public/data/exercises.json` y se cachea. El seed de 49 queda
 * como respaldo y se une al dataset (deduplicado por nombre, gana el dataset).
 * Tener todo en memoria hace que búsqueda y filtros sean instantáneos.
 */

import { create } from 'zustand'
import type { Exercise } from '../types'
import { EXERCISES_SEED } from '../data/exercisesSeed'
import { registrarEjercicios } from '../data/catalogRegistry'
import { contarDataset, guardarDataset, leerDataset } from '../db/db'

/** URL del dataset servido como asset estático (cacheado por el SW). */
const DATASET_URL = '/data/exercises.json'

/**
 * Versión del dataset. Súbela cuando cambie el contenido (p. ej. nombres
 * traducidos) para forzar el refresco de la caché de IndexedDB en los
 * dispositivos que ya lo tenían guardado.
 */
const DATASET_VERSION = 2
const VERSION_KEY = 'forja_dataset_v'

/** Normaliza un nombre para deduplicar (sin acentos ni mayúsculas). */
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

/** Une dataset (principal) + seed (respaldo), deduplicado por nombre. */
function unir(dataset: Exercise[], seed: Exercise[]): Exercise[] {
  const nombres = new Set(dataset.map((e) => norm(e.name)))
  const respaldo = seed.filter((e) => !nombres.has(norm(e.name)))
  return [...dataset, ...respaldo]
}

interface CatalogState {
  /** Catálogo completo en memoria (dataset + seed). */
  exercises: Exercise[]
  /** true mientras se carga por primera vez. */
  loading: boolean
  /** true si se pudo cargar el dataset completo (no solo el seed). */
  datasetOk: boolean
  cargar: () => Promise<void>
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  // Arranca con el seed para que la app sea usable de inmediato.
  exercises: EXERCISES_SEED,
  loading: true,
  datasetOk: false,

  cargar: async () => {
    if (!get().loading && get().datasetOk) return
    try {
      // Si la versión cacheada es antigua, forzamos volver a descargar.
      const versionVieja =
        localStorage.getItem(VERSION_KEY) !== String(DATASET_VERSION)

      let dataset = versionVieja ? [] : await leerDataset()

      // Si aún no está cacheado (o cambió de versión), lo descargamos.
      if (dataset.length === 0) {
        const cuenta = await contarDataset()
        if (versionVieja || cuenta === 0) {
          const res = await fetch(DATASET_URL)
          if (res.ok) {
            const json = (await res.json()) as Exercise[]
            await guardarDataset(json) // bulkPut: reemplaza por id
            localStorage.setItem(VERSION_KEY, String(DATASET_VERSION))
            dataset = json
          }
        } else {
          dataset = await leerDataset()
        }
      }

      if (dataset.length > 0) {
        const catalogo = unir(dataset, EXERCISES_SEED)
        registrarEjercicios(catalogo)
        set({ exercises: catalogo, loading: false, datasetOk: true })
      } else {
        // Sin dataset (p. ej. offline en primer arranque): solo el seed.
        set({ loading: false, datasetOk: false })
      }
    } catch {
      set({ loading: false, datasetOk: false })
    }
  },
}))
