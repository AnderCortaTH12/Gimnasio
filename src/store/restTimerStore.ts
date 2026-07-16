/**
 * Temporizador de descanso entre series (Zustand).
 * Guarda el instante de fin para que el conteo sea preciso aunque la pestaña
 * se ralentice. El componente `RestTimerBar` es quien renderiza y avisa.
 */

import { create } from 'zustand'

/** Duraciones rápidas ofrecidas en la UI (segundos). */
export const PRESETS_DESCANSO = [60, 90, 120, 180]

interface RestTimerState {
  /** Duración por defecto seleccionada (segundos). */
  defaultSeconds: number
  /** Instante (epoch ms) en que termina el descanso, o null si parado. */
  endsAt: number | null
  /** Duración del descanso en curso (para la barra de progreso). */
  totalSeconds: number

  setDefault: (s: number) => void
  /** Inicia un descanso; usa la duración por defecto si no se indica. */
  start: (seconds?: number) => void
  /** Suma segundos al descanso en curso. */
  add: (seconds: number) => void
  /** Detiene el descanso. */
  stop: () => void
}

export const useRestTimerStore = create<RestTimerState>((set, get) => ({
  defaultSeconds: 90,
  endsAt: null,
  totalSeconds: 90,

  setDefault: (s) => set({ defaultSeconds: s }),

  start: (seconds) => {
    const secs = seconds ?? get().defaultSeconds
    set({ endsAt: Date.now() + secs * 1000, totalSeconds: secs })
  },

  add: (seconds) => {
    const { endsAt, totalSeconds } = get()
    if (endsAt === null) return
    set({ endsAt: endsAt + seconds * 1000, totalSeconds: totalSeconds + seconds })
  },

  stop: () => set({ endsAt: null }),
}))
