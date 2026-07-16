import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell, Flag, Timer, ChevronDown, ClipboardList } from 'lucide-react'
import { useSessionStore } from '../store/sessionStore'
import { useRestTimerStore, PRESETS_DESCANSO } from '../store/restTimerStore'
import { calcularVolumen, finalizarPlanExecution } from '../db/db'
import { Button, EmptyState, StatNumber, Toast, type ToastData } from '../components/ui'
import { ExercisePickerSheet } from '../components/ExercisePickerSheet'
import { ExerciseEntryCard } from '../components/workout/ExerciseEntryCard'
import { PRCelebration } from '../components/workout/PRCelebration'
import type { PRHallado } from '../lib/stats'
import { cn } from '../lib/cn'

/** Formatea milisegundos a m:ss o h:mm:ss. */
function fmtElapsed(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

export function WorkoutScreen() {
  const navigate = useNavigate()
  const {
    active,
    hydrated,
    addEjercicio,
    removeEjercicio,
    addSerie,
    updateSerie,
    removeSerie,
    toggleSerie,
    updateNotasEjercicio,
    finalizar,
    cancelar,
  } = useSessionStore()
  const restDefault = useRestTimerStore((s) => s.defaultSeconds)
  const setRestDefault = useRestTimerStore((s) => s.setDefault)
  const startRest = useRestTimerStore((s) => s.start)

  const [picker, setPicker] = useState(false)
  const [ajustesDescanso, setAjustesDescanso] = useState(false)
  const [prs, setPrs] = useState<PRHallado[] | null>(null)
  // Evita que el efecto de redirección salte mientras se finaliza (la sesión
  // activa pasa a null antes de que se resuelva la detección de récords).
  const [finalizando, setFinalizando] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [, setTick] = useState(0)

  // Cronómetro de la sesión: refresca cada segundo.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  // Si no hay sesión activa (ya hidratado), volver a Hoy.
  // Excepción: mientras se muestra la celebración de récords.
  useEffect(() => {
    if (hydrated && !active && !prs && !finalizando)
      navigate('/', { replace: true })
  }, [hydrated, active, prs, finalizando, navigate])

  // Celebración de récords tras finalizar (la sesión activa ya es null).
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

  const volumen = calcularVolumen(active)
  const totalSeries = active.exercises.reduce((n, e) => n + e.sets.length, 0)
  const seriesHechas = active.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.completed).length,
    0,
  )
  // Progreso del plan: ejercicios con al menos una serie completada.
  const totalEjercicios = active.exercises.length
  const ejerciciosHechos = active.exercises.filter((e) =>
    e.sets.some((s) => s.completed),
  ).length

  /** Marca/desmarca una serie y arranca el descanso si se acaba de completar. */
  const handleToggle = (entryId: string, setId: string) => {
    const entry = active.exercises.find((e) => e.id === entryId)
    const s = entry?.sets.find((x) => x.id === setId)
    const seCompleta = s ? !s.completed : false
    toggleSerie(entryId, setId)
    if (seCompleta) startRest()
  }

  const handleFinalizar = async () => {
    if (
      seriesHechas === 0 &&
      !window.confirm('No has completado ninguna serie. ¿Finalizar igualmente?')
    )
      return
    // Capturamos datos del plan antes de que `finalizar` limpie la sesión.
    const planExecId = active.planExecutionId
    const planName = active.planName

    setFinalizando(true)
    const records = await finalizar()

    // Si vino de un plan, pregunta si lo completó y registra el resultado.
    let completado: boolean | null = null
    if (planExecId) {
      completado = window.confirm(`¿Completaste el plan "${planName}"?`)
      await finalizarPlanExecution(planExecId, completado)
    }

    // Récords → celebración; si no, historial (con toast si hubo plan).
    if (records.length > 0) {
      setPrs(records)
    } else if (planExecId) {
      setToast({
        tone: 'success',
        message: completado
          ? '¡Plan completado! 💪'
          : 'Plan guardado como no completado',
      })
      window.setTimeout(() => navigate('/historial', { replace: true }), 1400)
    } else {
      navigate('/historial', { replace: true })
    }
  }

  const handleCancelar = async () => {
    if (window.confirm('¿Descartar esta sesión? No se guardará en el historial.')) {
      await cancelar()
      navigate('/', { replace: true })
    }
  }

  return (
    <div>
      {/* Cabecera con cronómetro y stats */}
      <header className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            {active.planId && (
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-lime/15 px-2.5 py-1 text-xs font-bold text-lime">
                <ClipboardList className="h-3.5 w-3.5" />
                Plan: {active.planName}
              </div>
            )}
            <h1 className="text-2xl font-black tracking-tight text-text">
              {active.name}
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-bold tabular-nums text-lime">
              <Timer className="h-4 w-4" />
              {fmtElapsed(Date.now() - active.startedAt)}
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={handleCancelar}>
            Descartar
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface p-3">
          <StatNumber value={active.exercises.length} label="Ejercicios" />
          <StatNumber
            value={`${seriesHechas}/${totalSeries}`}
            label="Series"
            tone="lime"
          />
          <StatNumber
            value={Math.round(volumen)}
            unit="kg"
            label="Volumen"
            tone="pr"
          />
        </div>

        {/* Progreso del plan: ejercicios completados */}
        {active.planId && totalEjercicios > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-text/60">
              <span>Progreso del plan</span>
              <span className="tabular-nums text-lime">
                {ejerciciosHechos}/{totalEjercicios} ejercicios
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-lime transition-all duration-300"
                style={{
                  width: `${(ejerciciosHechos / totalEjercicios) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Ajustes de descanso */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <button
          onClick={() => setAjustesDescanso((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        >
          <Timer className="h-4 w-4 text-text/50" />
          <span className="flex-1 text-sm font-semibold text-text">
            Descanso por defecto
          </span>
          <span className="text-sm font-bold tabular-nums text-lime">
            {restDefault}s
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-text/40 transition-transform',
              ajustesDescanso && 'rotate-180',
            )}
          />
        </button>
        {ajustesDescanso && (
          <div className="flex gap-2 px-3 pb-3">
            {PRESETS_DESCANSO.map((p) => (
              <button
                key={p}
                onClick={() => setRestDefault(p)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-sm font-bold tabular-nums transition-all active:scale-95',
                  restDefault === p
                    ? 'border-lime bg-lime text-bg'
                    : 'border-border bg-bg text-text/70',
                )}
              >
                {p}s
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de ejercicios */}
      {active.exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Sesión vacía"
          description="Añade tu primer ejercicio para empezar a registrar series."
          action={
            <Button
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => setPicker(true)}
            >
              Añadir ejercicio
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {active.exercises.map((entry) => (
            <ExerciseEntryCard
              key={entry.id}
              entry={entry}
              onAddSet={() => addSerie(entry.id)}
              onUpdateSet={(setId, patch) => updateSerie(entry.id, setId, patch)}
              onToggleSet={(setId) => handleToggle(entry.id, setId)}
              onRemoveSet={(setId) => removeSerie(entry.id, setId)}
              onUpdateNotes={(notes) => updateNotasEjercicio(entry.id, notes)}
              onRemove={() => removeEjercicio(entry.id)}
            />
          ))}

          <Button
            variant="secondary"
            fullWidth
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => setPicker(true)}
          >
            Añadir ejercicio
          </Button>
        </div>
      )}

      {/* Finalizar */}
      {active.exercises.length > 0 && (
        <Button
          fullWidth
          size="lg"
          leftIcon={<Flag className="h-5 w-5" />}
          onClick={handleFinalizar}
          className="mt-6"
        >
          Finalizar entrenamiento
        </Button>
      )}

      <ExercisePickerSheet
        open={picker}
        onClose={() => setPicker(false)}
        yaAnadidos={active.exercises.map((e) => e.exerciseId)}
        onPick={(ex) => {
          addEjercicio(ex)
          setPicker(false)
        }}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
