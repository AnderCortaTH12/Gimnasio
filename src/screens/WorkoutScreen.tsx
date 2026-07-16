import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell, Flag, Timer, ChevronDown } from 'lucide-react'
import { useSessionStore } from '../store/sessionStore'
import { useRestTimerStore, PRESETS_DESCANSO } from '../store/restTimerStore'
import { calcularVolumen } from '../db/db'
import { Button, EmptyState, StatNumber } from '../components/ui'
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
    setFinalizando(true)
    const records = await finalizar()
    // Si hay récords, celebra antes de salir; si no, va directo al historial.
    if (records.length > 0) {
      setPrs(records)
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
    </div>
  )
}
