import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Copy, Trash2, Trophy, Dumbbell } from 'lucide-react'
import { obtenerSesion, eliminarSesion, calcularVolumen } from '../db/db'
import { useSessionStore } from '../store/sessionStore'
import type { WorkoutSession } from '../types'
import { Button, Card, Badge, StatNumber, EmptyState } from '../components/ui'

function duracion(s: WorkoutSession): string {
  if (!s.finishedAt) return '—'
  return `${Math.round((s.finishedAt - s.startedAt) / 60000)} min`
}

export function SessionDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { active, duplicar } = useSessionStore()

  const [session, setSession] = useState<WorkoutSession | null | undefined>(
    undefined,
  )

  useEffect(() => {
    if (!id) return
    obtenerSesion(id).then((s) => setSession(s ?? null))
  }, [id])

  if (session === undefined) {
    return <p className="py-10 text-center text-sm text-text/40">Cargando…</p>
  }

  if (session === null) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Sesión no encontrada"
        action={
          <Button variant="secondary" onClick={() => navigate('/historial')}>
            Volver al historial
          </Button>
        }
      />
    )
  }

  const fecha = new Date(session.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const totalSeries = session.exercises.reduce((n, e) => n + e.sets.length, 0)

  const handleDuplicar = async () => {
    if (active) {
      window.alert(
        'Ya tienes una sesión en curso. Finalízala o descártala antes de duplicar otra.',
      )
      return
    }
    await duplicar(session)
    navigate('/entrenar')
  }

  const handleEliminar = async () => {
    if (window.confirm('¿Eliminar esta sesión del historial? No se puede deshacer.')) {
      await eliminarSesion(session.id)
      navigate('/historial', { replace: true })
    }
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-text/60 active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <header className="mb-5">
        <h1 className="text-2xl font-black tracking-tight text-text">
          {session.name}
        </h1>
        <p className="mt-1 text-sm capitalize text-text/50">{fecha}</p>
      </header>

      {/* Resumen */}
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface p-3">
        <StatNumber value={session.exercises.length} label="Ejercicios" />
        <StatNumber value={totalSeries} label="Series" tone="lime" />
        <StatNumber
          value={(calcularVolumen(session) / 1000).toFixed(1)}
          unit="t"
          label="Volumen"
          tone="pr"
        />
      </div>

      <div className="mb-5 flex items-center gap-2 text-sm text-text/50">
        <Clock className="h-4 w-4" />
        Duración: {duracion(session)}
      </div>

      {/* Ejercicios y series */}
      <div className="flex flex-col gap-3">
        {session.exercises.map((entry) => (
          <Card key={entry.id} className="p-3">
            <p className="mb-2 font-bold text-text">{entry.exerciseName}</p>
            {entry.notes && (
              <p className="mb-2 text-xs italic text-text/50">“{entry.notes}”</p>
            )}
            <div className="mb-1 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-wide text-text/30">
              <span className="w-6 text-center">#</span>
              <span className="flex-1">Peso</span>
              <span className="flex-1 text-center">Reps</span>
              <span className="flex-1 text-center">RPE</span>
            </div>
            <div className="flex flex-col gap-1">
              {entry.sets.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg bg-bg px-1 py-1.5 text-sm"
                >
                  <span className="w-6 text-center font-extrabold text-text/40">
                    {s.order}
                  </span>
                  <span className="flex-1 font-bold tabular-nums text-text">
                    {s.weight} kg
                  </span>
                  <span className="flex-1 text-center font-bold tabular-nums text-text">
                    {s.reps}
                  </span>
                  <span className="flex-1 text-center tabular-nums text-text/60">
                    {s.rpe ?? '—'}
                  </span>
                  {s.isPR && (
                    <Trophy className="h-4 w-4 shrink-0 text-pr" aria-label="PR" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {session.notes && (
        <Card className="mt-3">
          <p className="text-xs font-semibold text-text/50">Notas de la sesión</p>
          <p className="mt-1 text-sm text-text/80">{session.notes}</p>
        </Card>
      )}

      {/* Acciones */}
      <div className="mt-6 flex flex-col gap-2.5">
        <Button
          fullWidth
          size="lg"
          leftIcon={<Copy className="h-5 w-5" />}
          onClick={handleDuplicar}
        >
          Repetir esta rutina
        </Button>
        <Button
          fullWidth
          variant="danger"
          leftIcon={<Trash2 className="h-4 w-4" />}
          onClick={handleEliminar}
        >
          Eliminar sesión
        </Button>
      </div>

      {active && (
        <Badge tone="warn" className="mt-3">
          Tienes una sesión en curso
        </Badge>
      )}
    </div>
  )
}
