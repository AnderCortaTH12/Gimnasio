import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Search } from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'
import { useRestTimerStore } from '../../store/restTimerStore'
import { calcularVolumen, finalizarPlanExecution } from '../../db/db'
import { Button, Toast, type ToastData } from '../ui'
import { ExercisePickerSheet } from '../ExercisePickerSheet'
import { WorkoutDeckCard } from './WorkoutDeckCard'
import { PRCelebration } from './PRCelebration'
import type { PRHallado } from '../../lib/stats'
import type { Exercise } from '../../types'

function fmtElapsed(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

export function WorkoutDeckScreen() {
  const navigate = useNavigate()
  const {
    active,
    hydrated,
    addEjercicio,
    updateSerie,
    finalizar,
    cancelar,
  } = useSessionStore()
  const restTimer = useRestTimerStore()

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [prs, setPrs] = useState<PRHallado[] | null>(null)
  const [finalizando, setFinalizando] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [, setTick] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showQuitDialog, setShowQuitDialog] = useState(false)

  // Cronómetro
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  // Si no hay sesión y está hidratado, volver a Hoy
  useEffect(() => {
    if (hydrated && !active && !prs && !finalizando) {
      navigate('/', { replace: true })
    }
  }, [hydrated, active, prs, finalizando, navigate])

  // Celebración de récords
  if (prs) {
    return (
      <PRCelebration
        prs={prs}
        onClose={() => {
          setPrs(null)
          navigate('/historial', { replace: true })
        }}
      />
    )
  }

  if (!active) return null

  // Si no hay ejercicios en la sesión, mostrar estado vacío
  if (active.exercises.length === 0) {
    const handleAddExercise = (ex: Exercise) => {
      addEjercicio(ex)
      setPickerOpen(false)
      setToast({
        tone: 'success',
        message: `Añadido: ${ex.name}`,
      })
    }

    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <div className="border-b border-border bg-surface/50 px-4 py-3 backdrop-blur-sm">
          <p className="text-sm font-semibold text-text/50">Sesión vacía</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="text-center">
            <p className="text-lg font-bold text-text mb-2">Añade tu primer ejercicio</p>
            <p className="text-sm text-text/60">No hay ejercicios registrados en esta sesión.</p>
          </div>
          <Button onClick={() => setPickerOpen(true)} className="w-full max-w-xs">
            Añadir ejercicio
          </Button>
        </div>
        <div className="border-t border-border bg-surface/50 backdrop-blur-sm px-3 py-2">
          <div className="flex gap-2">
            <Button
              fullWidth
              variant="secondary"
              onClick={() => setPickerOpen(true)}
              size="sm"
              leftIcon={<Search className="h-4 w-4" />}
            >
              Cambiar / Añadir
            </Button>
          </div>
        </div>
        <ExercisePickerSheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={handleAddExercise}
          yaAnadidos={[]}
        />
      </div>
    )
  }

  const currentExercise = active.exercises[currentExerciseIdx]
  if (!currentExercise) return null

  const currentSetIdx = currentExercise.sets.findIndex((s) => !s.completed)
  const allSetsCompleted = currentSetIdx === -1
  const volumen = calcularVolumen(active)
  const totalSeries = active.exercises.reduce((n, e) => n + e.sets.length, 0)
  const seriesHechas = active.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.completed).length,
    0,
  )

  const handleSetComplete = (setId: string, weight: number, reps: number, rpe?: number) => {
    updateSerie(currentExercise.id, setId, {
      weight,
      reps,
      rpe,
      completed: true,
    })
    restTimer.start()
  }

  const handleSetUndo = (setId: string) => {
    updateSerie(currentExercise.id, setId, { completed: false })
  }

  const handleNextExercise = async () => {
    if (currentExerciseIdx < active.exercises.length - 1) {
      setCurrentExerciseIdx(currentExerciseIdx + 1)
      restTimer.stop()
    } else {
      // Última serie del último ejercicio
      handleFinalize()
    }
  }

  const handleAddExercise = (ex: Exercise) => {
    addEjercicio(ex)
    setPickerOpen(false)
    setToast({
      tone: 'success',
      message: `Añadido: ${ex.name}`,
    })
  }

  const handleFinalize = async () => {
    setFinalizando(true)
    try {
      const prsDetectados = await finalizar()

      // Si la sesión estaba vinculada a un plan, preguntar si se completó
      if (active?.planExecutionId) {
        const completado = window.confirm(
          `¿Completaste el plan "${active.planName}"?`,
        )
        await finalizarPlanExecution(active.planExecutionId, completado)
      }

      setPrs(prsDetectados)
    } catch (err) {
      console.error('Error finalizando sesión:', err)
      setFinalizando(false)
    }
  }

  const handleCancel = async () => {
    await cancelar()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      {/* Cabecera */}
      <div className="border-b border-border bg-surface/50 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text/50">
              {fmtElapsed(Date.now() - new Date(active.startedAt).getTime())}
            </p>
            <p className="text-xs text-text/40">{seriesHechas} de {totalSeries}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-lime">{(volumen / 1000).toFixed(1)}t</p>
            <p className="text-xs text-text/40">Volumen</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text/50 active:scale-90"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 z-20 w-40 rounded-lg border border-border bg-surface shadow-lg">
                  <button
                    onClick={() => {
                      setShowQuitDialog(true)
                      setMenuOpen(false)
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-regress hover:bg-white/5"
                  >
                    Cancelar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center py-2">
        <AnimatePresence mode="wait">
          {restTimer.endsAt !== null ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md px-4"
            >
              {/* Temporizador de descanso */}
              <div className="rounded-3xl border-2 border-lime bg-lime/5 p-6 text-center" data-testid="rest-timer">
                <p className="mb-2 text-sm font-semibold text-text/50">Descansa</p>
                <p className="text-6xl font-black tabular-nums text-lime">
                  {Math.max(0, Math.ceil((restTimer.endsAt - Date.now()) / 1000))}
                </p>
                <div className="mt-6 flex gap-2">
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => restTimer.stop()}
                    className="text-sm"
                  >
                    Saltar
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => restTimer.add(15)}
                    className="text-sm"
                  >
                    +15s
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : allSetsCompleted ? (
            <motion.div
              key="next"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md px-4"
              data-testid="card-siguiente"
            >
              {/* Fin del ejercicio */}
              <div className="rounded-3xl border border-border bg-surface p-6 text-center">
                <p className="mb-3 text-sm font-semibold text-text/50">
                  ✓ Ejercicio completado
                </p>
                <p className="mb-6 text-lg font-bold text-text">
                  {currentExercise.exerciseName}
                </p>
                {currentExerciseIdx < active.exercises.length - 1 ? (
                  <>
                    <p className="mb-4 text-sm text-text/60">
                      ¿Pasamos al siguiente ejercicio?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        fullWidth
                        variant="secondary"
                        onClick={() => setCurrentExerciseIdx(currentExerciseIdx)}
                      >
                        Quedarme aquí
                      </Button>
                      <Button
                        fullWidth
                        onClick={handleNextExercise}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-sm text-text/60">
                      ¡Sesión completada! 🎉
                    </p>
                    <Button
                      fullWidth
                      onClick={handleFinalize}
                      disabled={finalizando}
                    >
                      {finalizando ? 'Guardando…' : 'Finalizar'}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`exercise-${currentExercise.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <WorkoutDeckCard
                entry={currentExercise}
                currentSetIndex={currentSetIdx}
                onSetComplete={handleSetComplete}
                onSetUndo={handleSetUndo}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer con navegación */}
      <div className="border-t border-border bg-surface/50 backdrop-blur-sm px-3 py-2">
        <div className="flex gap-2">
          <Button
            fullWidth
            variant="secondary"
            onClick={() => setPickerOpen(true)}
            size="sm"
            leftIcon={<Search className="h-4 w-4" />}
          >
            Cambiar / Añadir
          </Button>
          {currentExerciseIdx > 0 && (
            <Button
              variant="secondary"
              onClick={() => setCurrentExerciseIdx(currentExerciseIdx - 1)}
              size="sm"
              data-testid="btn-anterior-ejercicio"
            >
              ←
            </Button>
          )}
          {currentExerciseIdx < active.exercises.length - 1 && (
            <Button
              onClick={() => setCurrentExerciseIdx(currentExerciseIdx + 1)}
              size="sm"
              data-testid="btn-siguiente-ejercicio"
            >
              →
            </Button>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación para cancelar */}
      <AnimatePresence>
        {showQuitDialog && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setShowQuitDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="rounded-2xl bg-surface p-6 max-w-sm border border-border">
                <p className="mb-4 font-bold text-text">¿Cancelar sesión?</p>
                <p className="mb-6 text-sm text-text/60">
                  Se perderá el progreso registrado hasta ahora.
                </p>
                <div className="flex gap-2">
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => setShowQuitDialog(false)}
                  >
                    Mantener
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleCancel}
                    className="bg-regress hover:bg-regress/80"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Picker de ejercicios */}
      <ExercisePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handleAddExercise}
        yaAnadidos={active.exercises.map((e) => e.exerciseId)}
      />

      {/* Toast */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
