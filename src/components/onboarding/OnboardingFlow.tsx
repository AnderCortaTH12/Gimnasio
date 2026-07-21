/**
 * Flujo de onboarding completo.
 *
 * Pantallas: nivel, objetivo, días/semana, días específicos, duración,
 * equipo, revisión.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore, type OnboardingStep } from '../../store/onboardingStore'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

const STEP_ORDER: OnboardingStep[] = [
  'level',
  'goal',
  'days-per-week',
  'training-days',
  'session-duration',
  'equipment',
  'review',
]

export function OnboardingFlow() {
  console.log('[OnboardingFlow] Renderizando')
  const navigate = useNavigate()
  console.log('[OnboardingFlow] useNavigate OK')
  const onboardingState = useOnboardingStore()
  console.log('[OnboardingFlow] useOnboardingStore OK, step:', onboardingState.step)
  const { step, data, saving, updateData, nextStep, prevStep, finalizarOnboarding } = onboardingState
  const [error, setError] = useState<string>('')
  console.log('[OnboardingFlow] Todos los hooks inicializados')

  // Al completar onboarding, navega a TodayScreen
  useEffect(() => {
    if (step === 'done') {
      navigate('/', { replace: true })
    }
  }, [step, navigate])

  const stepIndex = STEP_ORDER.indexOf(step)
  const progress = ((stepIndex + 1) / (STEP_ORDER.length + 1)) * 100

  const handleNext = async () => {
    setError('')

    // Validaciones por paso
    if (step === 'level' && !data.level) {
      setError('Selecciona tu nivel')
      return
    }
    if (step === 'goal' && !data.goal) {
      setError('Selecciona tu objetivo')
      return
    }
    if (step === 'days-per-week' && !data.daysPerWeek) {
      setError('Selecciona cuántos días')
      return
    }
    if (step === 'training-days' && (!data.trainingDays || data.trainingDays.length === 0)) {
      setError('Selecciona al menos un día')
      return
    }
    if (step === 'session-duration' && !data.sessionDurationMinutes) {
      setError('Ingresa la duración')
      return
    }
    if (step === 'equipment' && !data.equipment) {
      setError('Selecciona tu equipo')
      return
    }

    if (step === 'review') {
      try {
        await finalizarOnboarding()
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'desconocido'}`)
      }
    } else {
      nextStep()
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Barra de progreso */}
      <div className="w-full h-1 bg-border">
        <div
          className="h-full bg-lime transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-lg mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-text mb-2">Bienvenido a FORJA</h1>
        <p className="text-text/50 text-sm mb-8 text-center">
          {step === 'review'
            ? 'Revisa tu planificación'
            : 'Personalicemos tu entrenamiento'}
        </p>

        {/* PANTALLA: Nivel */}
        {step === 'level' && (
          <div className="w-full space-y-4">
            <p className="text-text font-medium mb-6">¿Cuál es tu nivel?</p>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateData({ level })}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-all text-left',
                  data.level === level
                    ? 'border-lime bg-lime/10'
                    : 'border-border bg-surface hover:border-text/20',
                )}
              >
                <p className="font-semibold text-text">
                  {level === 'beginner'
                    ? 'Principiante'
                    : level === 'intermediate'
                      ? 'Intermedio'
                      : 'Avanzado'}
                </p>
                <p className="text-text/50 text-sm">
                  {level === 'beginner'
                    ? 'Empezando mi viaje en el gym'
                    : level === 'intermediate'
                      ? 'Entreno regularmente hace meses'
                      : 'Sé lo que estoy haciendo'}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* PANTALLA: Objetivo */}
        {step === 'goal' && (
          <div className="w-full space-y-4">
            <p className="text-text font-medium mb-6">¿Cuál es tu objetivo?</p>
            {(['strength', 'hypertrophy', 'maintenance'] as const).map((goal) => (
              <button
                key={goal}
                onClick={() => updateData({ goal })}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-all text-left',
                  data.goal === goal
                    ? 'border-lime bg-lime/10'
                    : 'border-border bg-surface hover:border-text/20',
                )}
              >
                <p className="font-semibold text-text">
                  {goal === 'strength'
                    ? 'Fuerza'
                    : goal === 'hypertrophy'
                      ? 'Hipertrofia'
                      : 'Mantenimiento'}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* PANTALLA: Días por semana */}
        {step === 'days-per-week' && (
          <div className="w-full space-y-4">
            <p className="text-text font-medium mb-6">¿Cuántos días puedes entrenar?</p>
            {[2, 3, 4, 5, 6].map((days) => (
              <button
                key={days}
                onClick={() => updateData({ daysPerWeek: days })}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-all',
                  data.daysPerWeek === days
                    ? 'border-lime bg-lime/10'
                    : 'border-border bg-surface hover:border-text/20',
                )}
              >
                <p className="font-semibold text-text">{days} días por semana</p>
              </button>
            ))}
          </div>
        )}

        {/* PANTALLA: Días específicos */}
        {step === 'training-days' && (
          <div className="w-full space-y-4">
            <p className="text-text font-medium mb-6">¿Qué días te vienen bien?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'].map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const current = data.trainingDays || []
                    const dayOfWeek = (idx + 1) % 7
                    const updated = current.includes(dayOfWeek as any)
                      ? current.filter((d) => d !== dayOfWeek)
                      : [...current, dayOfWeek as any]
                    updateData({ trainingDays: updated as any })
                  }}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all font-medium',
                    data.trainingDays?.includes((idx + 1) % 7 as any)
                      ? 'border-lime bg-lime/10 text-lime'
                      : 'border-border bg-surface text-text/50 hover:border-text/20',
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PANTALLA: Duración */}
        {step === 'session-duration' && (
          <div className="w-full space-y-4">
            <p className="text-text font-medium mb-6">¿Cuánto tiempo suele durar tu sesión?</p>
            {[30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => updateData({ sessionDurationMinutes: mins })}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-all',
                  data.sessionDurationMinutes === mins
                    ? 'border-lime bg-lime/10'
                    : 'border-border bg-surface hover:border-text/20',
                )}
              >
                <p className="font-semibold text-text">{mins} minutos</p>
              </button>
            ))}
          </div>
        )}

        {/* PANTALLA: Equipo */}
        {step === 'equipment' && (
          <div className="w-full space-y-4">
            <p className="text-text font-medium mb-6">¿Qué equipo tienes disponible?</p>
            {(['full_gym', 'basic', 'home'] as const).map((eq) => (
              <button
                key={eq}
                onClick={() => updateData({ equipment: eq })}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-all text-left',
                  data.equipment === eq
                    ? 'border-lime bg-lime/10'
                    : 'border-border bg-surface hover:border-text/20',
                )}
              >
                <p className="font-semibold text-text">
                  {eq === 'full_gym' ? 'Gimnasio completo' : eq === 'basic' ? 'Equipo básico' : 'Casa'}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* PANTALLA: Resumen */}
        {step === 'review' && (
          <div className="w-full space-y-4">
            <p className="text-text font-medium mb-6">Tu planificación</p>
            <div className="bg-surface rounded-lg p-4 space-y-3">
              <div>
                <p className="text-text/50 text-sm">Nivel</p>
                <p className="text-text font-medium">
                  {data.level === 'beginner'
                    ? 'Principiante'
                    : data.level === 'intermediate'
                      ? 'Intermedio'
                      : 'Avanzado'}
                </p>
              </div>
              <div>
                <p className="text-text/50 text-sm">Objetivo</p>
                <p className="text-text font-medium">
                  {data.goal === 'strength'
                    ? 'Fuerza'
                    : data.goal === 'hypertrophy'
                      ? 'Hipertrofia'
                      : 'Mantenimiento'}
                </p>
              </div>
              <div>
                <p className="text-text/50 text-sm">Frecuencia</p>
                <p className="text-text font-medium">{data.daysPerWeek} días/semana</p>
              </div>
              <div>
                <p className="text-text/50 text-sm">Duración de sesión</p>
                <p className="text-text font-medium">{data.sessionDurationMinutes} minutos</p>
              </div>
            </div>
            <p className="text-text/50 text-sm text-center pt-4">
              ✅ Se creará automáticamente un plan coherente respetando tus días y descansos
            </p>
          </div>
        )}

        {/* Mensaje de error */}
        {error && <p className="text-warn text-sm mt-4">{error}</p>}
      </div>

      {/* Botones navegación */}
      <div className="flex gap-3 p-6 max-w-lg mx-auto w-full">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={stepIndex === 0}
          className="flex-1"
        >
          ← Atrás
        </Button>
        <Button
          onClick={handleNext}
          disabled={saving}
          className="flex-1"
        >
          {step === 'review' ? (saving ? 'Guardando...' : 'Empezar') : 'Siguiente →'}
        </Button>
      </div>
    </div>
  )
}
