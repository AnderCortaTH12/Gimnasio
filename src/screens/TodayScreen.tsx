import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Flame, Play, Clock, Trophy, ChevronRight, Sparkles } from 'lucide-react'
import { useSessionStore } from '../store/sessionStore'
import { leerHistorial, leerPerfil, calcularVolumen } from '../db/db'
import { generarRecomendaciones } from '../recommendations'
import { PageTitle } from '../components/PageTitle'
import { RecommendationCard } from '../components/RecommendationCard'
import { PlansSection } from '../components/plans/PlansSection'
import { Button, Card, StatNumber, SectionHeader, Badge } from '../components/ui'

const HOY = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** Formatea la duración de una sesión terminada. */
function duracion(startedAt: number, finishedAt?: number): string {
  if (!finishedAt) return '—'
  const min = Math.round((finishedAt - startedAt) / 60000)
  return `${min} min`
}

export function TodayScreen() {
  const navigate = useNavigate()
  const { active, iniciar } = useSessionStore()

  // Historial reactivo: se recalcula solo al guardar una sesión.
  const historial = useLiveQuery(() => leerHistorial(20), [], [])
  const perfil = useLiveQuery(async () => (await leerPerfil()) ?? null, [], null)
  const ultima = historial[0]

  // Recomendaciones (reglas explicables) a partir del historial y el perfil.
  const recomendaciones = generarRecomendaciones(
    historial,
    perfil ?? undefined,
  )

  // Resumen simple de la semana (sesiones de los últimos 7 días).
  const haceUnaSemana = Date.now() - 7 * 24 * 3600 * 1000
  const semana = historial.filter((s) => s.startedAt >= haceUnaSemana)
  const volSemana = semana.reduce((n, s) => n + calcularVolumen(s), 0)
  const prsSemana = semana.reduce(
    (n, s) =>
      n + s.exercises.reduce((k, e) => k + e.sets.filter((x) => x.isPR).length, 0),
    0,
  )

  const empezar = async () => {
    await iniciar()
    navigate('/entrenar')
  }

  return (
    <div>
      <PageTitle title="Hoy" subtitle={HOY[0].toUpperCase() + HOY.slice(1)} />

      {/* Resumen de la semana */}
      <Card className="mb-5 bg-gradient-to-br from-surface to-bg">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text/60">
          <Flame className="h-4 w-4 text-lime" />
          Esta semana
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatNumber value={semana.length} unit="días" label="Entrenados" tone="lime" />
          <StatNumber
            value={(volSemana / 1000).toFixed(1)}
            unit="t"
            label="Volumen"
          />
          <StatNumber value={prsSemana} unit="PRs" label="Récords" tone="pr" />
        </div>
      </Card>

      {/* CTA: continuar o empezar */}
      {active ? (
        <Card
          interactive
          onClick={() => navigate('/entrenar')}
          className="mb-6 flex items-center gap-4 border-lime/40 bg-lime/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime/20">
            <Play className="h-6 w-6 text-lime" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-text">Sesión en curso</p>
            <p className="text-xs text-text/60">
              {active.name} · {active.exercises.length} ejercicios
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-lime" />
        </Card>
      ) : (
        <Button
          fullWidth
          size="lg"
          leftIcon={<Plus className="h-5 w-5" />}
          className="mb-6"
          onClick={empezar}
        >
          Empezar entrenamiento
        </Button>
      )}

      {/* Recomendaciones (reglas explicables) */}
      {recomendaciones.length > 0 && (
        <div className="mb-6">
          <SectionHeader
            title="Recomendaciones"
            subtitle="Basadas en tu historial y objetivo"
            action={
              <Sparkles className="h-4 w-4 text-lime" aria-hidden />
            }
          />
          <div className="flex flex-col gap-2.5">
            {recomendaciones.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Planes de entrenamiento (predefinidos + personalizados) */}
      <PlansSection sessions={historial} />

      {/* Último entrenamiento */}
      <SectionHeader
        title="Último entrenamiento"
        action={
          historial.length > 0 ? (
            <button
              onClick={() => navigate('/historial')}
              className="text-xs font-semibold text-lime"
            >
              Ver todos
            </button>
          ) : undefined
        }
      />
      {ultima ? (
        <Card
          interactive
          onClick={() => navigate(`/historial/${ultima.id}`)}
          className="flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pr/10">
            <Trophy className="h-6 w-6 text-pr" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text">{ultima.name}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-text/50">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {duracion(ultima.startedAt, ultima.finishedAt)}
              </span>
              <span>{ultima.exercises.length} ejerc.</span>
            </div>
          </div>
          <StatNumber
            value={(calcularVolumen(ultima) / 1000).toFixed(1)}
            unit="t"
            tone="lime"
          />
        </Card>
      ) : (
        <Card className="py-6 text-center text-sm text-text/40">
          Aún no has registrado ningún entrenamiento.
        </Card>
      )}

      {historial.length > 0 && (
        <div className="mt-3">
          <Badge tone="neutral">{historial.length} sesiones guardadas</Badge>
        </div>
      )}
    </div>
  )
}
