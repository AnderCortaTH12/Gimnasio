/**
 * Estado y lógica del flujo de onboarding (primer arranque).
 *
 * Gestiona:
 * - Paso actual del onboarding (qué pantalla mostrar)
 * - Datos recolectados (nivel, objetivo, días, etc.)
 * - Finalización y guardado en IndexedDB
 */

import { create } from 'zustand'
import type { OnboardingData, TrainingSchedule } from '../types/schedule'
import { generarPlanificacion } from '../lib/schedule-generator'
import {
  guardarPlanificacion,
  leerPlanificacionActiva,
  nuevoId,
} from '../db/db'

export type OnboardingStep =
  | 'level'
  | 'goal'
  | 'days-per-week'
  | 'training-days'
  | 'session-duration'
  | 'equipment'
  | 'review'
  | 'done'

interface OnboardingState {
  /** Paso actual (qué pantalla mostrar). */
  step: OnboardingStep
  /** Datos recolectados hasta ahora. */
  data: Partial<OnboardingData>
  /** true mientras se guarda en BD. */
  saving: boolean

  // Acciones
  setStep: (step: OnboardingStep) => void
  updateData: (patch: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  finalizarOnboarding: () => Promise<void>
  resetOnboarding: () => void
}

const STEP_ORDER: OnboardingStep[] = [
  'level',
  'goal',
  'days-per-week',
  'training-days',
  'session-duration',
  'equipment',
  'review',
]

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 'level',
  data: {},
  saving: false,

  setStep: (step) => set({ step }),

  updateData: (patch) =>
    set((s) => ({
      data: { ...s.data, ...patch },
    })),

  nextStep: () => {
    const current = get()
    const idx = STEP_ORDER.indexOf(current.step)
    if (idx < STEP_ORDER.length - 1) {
      set({ step: STEP_ORDER[idx + 1] })
    }
  },

  prevStep: () => {
    const current = get()
    const idx = STEP_ORDER.indexOf(current.step)
    if (idx > 0) {
      set({ step: STEP_ORDER[idx - 1] })
    }
  },

  finalizarOnboarding: async () => {
    const { data } = get()
    set({ saving: true })

    try {
      // Genera el plan semanal
      const weekPlan = generarPlanificacion({
        daysPerWeek: data.daysPerWeek || 3,
        trainingDays: data.trainingDays || [1, 3, 5],
        level: data.level || 'beginner',
        goal: data.goal || 'hypertrophy',
      })

      // Crea el objeto de planificación completo
      const now = Date.now()
      const schedule: TrainingSchedule = {
        id: nuevoId(),
        createdAt: now,
        updatedAt: now,
        onboarding: {
          level: data.level || 'beginner',
          goal: data.goal || 'hypertrophy',
          daysPerWeek: data.daysPerWeek || 3,
          trainingDays: data.trainingDays || [1, 3, 5],
          sessionDurationMinutes: data.sessionDurationMinutes || 60,
          equipment: data.equipment || 'full_gym',
          completedAt: now,
        },
        weekPlan,
        isActive: true,
      }

      // Guarda en IndexedDB
      await guardarPlanificacion(schedule)
      set({ step: 'done', saving: false })
    } catch (err) {
      console.error('Error al finalizar onboarding:', err)
      set({ saving: false })
      throw err
    }
  },

  resetOnboarding: () => {
    set({
      step: 'level',
      data: {},
      saving: false,
    })
  },
}))

/**
 * Hook que verifica si hay que mostrar el onboarding.
 * Si no hay perfil NI planificación, retorna true.
 */
export async function debeHayerOnboarding(): Promise<boolean> {
  try {
    const schedule = await leerPlanificacionActiva()
    return !schedule
  } catch {
    return true
  }
}
