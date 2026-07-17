import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { TrendingUp, Trophy, Flame, AlertTriangle } from 'lucide-react'
import { leerHistorial } from '../db/db'
import {
  resumenReciente,
  rachaSemanas,
  volumenPorMusculo,
  diasDesdeMusculo,
} from '../lib/stats'
import { GRUPOS_FILTRO, traducirMusculo } from '../data/muscles'
import type { MuscleKey } from '../types'
import { PageTitle } from '../components/PageTitle'
import { Card, Badge, StatNumber, SectionHeader, EmptyState } from '../components/ui'
import { ExerciseProgressCard } from '../components/progress/ExerciseProgressCard'
import { MuscleDistribution } from '../components/progress/MuscleDistribution'
import { PlanHistorySection } from '../components/plans/PlanHistorySection'
import { cn } from '../lib/cn'

interface PRItem {
  exerciseName: string
  weight: number
  reps: number
  date: string
}

export function ProgressScreen() {
  const historial = useLiveQuery(() => leerHistorial(), [], undefined)
  const [rango, setRango] = useState<7 | 30>(30)

  const sessions = historial ?? []
  const cargando = historial === undefined

  const semana = useMemo(() => resumenReciente(sessions, 7), [sessions])
  const racha = useMemo(() => rachaSemanas(sessions), [sessions])
  const reparto = useMemo(
    () => volumenPorMusculo(sessions, rango),
    [sessions, rango],
  )
  const diasMusculo = useMemo(() => diasDesdeMusculo(sessions), [sessions])

  // Récords recientes: series marcadas isPR, más recientes primero.
  const prsRecientes = useMemo<PRItem[]>(() => {
    const items: PRItem[] = []
    for (const s of sessions) {
      for (const e of s.exercises) {
        for (const set of e.sets) {
          if (set.isPR)
            items.push({
              exerciseName: e.exerciseName,
              weight: set.weight,
              reps: set.reps,
              date: s.date,
            })
        }
      }
    }
    return items.slice(0, 6)
  }, [sessions])

  // Grupos musculares descuidados (no entrenados en >4 días o nunca).
  const descuidados = useMemo(() => {
    return GRUPOS_FILTRO.map((m: MuscleKey) => ({
      muscle: m,
      dias: diasMusculo.get(m) ?? null,
    }))
      .filter((x) => x.dias === null || x.dias > 4)
      .sort((a, b) => (b.dias ?? 999) - (a.dias ?? 999))
  }, [diasMusculo])

  if (cargando) {
    return (
      <div>
        <PageTitle title="Progreso" subtitle="Tu evolución en el tiempo" />
        <Card className="py-10 text-center text-sm text-text/40">Cargando…</Card>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div>
        <PageTitle title="Progreso" subtitle="Tu evolución en el tiempo" />
        <EmptyState
          icon={TrendingUp}
          title="Aún no hay datos"
          description="Completa entrenamientos para ver aquí tu progreso, récords y volumen por grupo muscular."
        />
      </div>
    )
  }

  return (
    <div>
      <PageTitle title="Progreso" subtitle="Tu evolución en el tiempo" />

      {/* Dashboard: resumen de la semana + racha */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card className="col-span-2 bg-gradient-to-br from-surface to-bg">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text/60">
            <Flame className="h-4 w-4 text-lime" />
            Últimos 7 días
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatNumber value={semana.entrenos} label="Entrenamientos" tone="lime" />
            <StatNumber
              value={(semana.volumen / 1000).toFixed(1)}
              unit="t"
              label={`Volumen = ${semana.volumen.toFixed(0)} kg`}
            />
            <StatNumber value={semana.series} label="Series realizadas" />
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime/10">
            <Flame className="h-6 w-6 text-lime" />
          </div>
          <StatNumber value={racha} unit="sem" label="Racha actual" tone="lime" />
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pr/10">
            <Trophy className="h-6 w-6 text-pr" />
          </div>
          <StatNumber value={semana.prs} label="Récords nuevos (7d)" tone="pr" />
        </Card>
      </div>

      {/* Progreso por ejercicio */}
      <SectionHeader title="Progreso por ejercicio" />
      <div className="mb-6">
        <ExerciseProgressCard sessions={sessions} />
      </div>

      {/* Reparto por grupo muscular */}
      <SectionHeader
        title="Volumen por músculo"
        action={
          <div className="flex gap-1">
            {([7, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRango(r)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                  rango === r
                    ? 'bg-lime text-bg'
                    : 'bg-surface text-text/50',
                )}
              >
                {r}d
              </button>
            ))}
          </div>
        }
      />
      <Card className="mb-6">
        <MuscleDistribution data={reparto} />
      </Card>

      {/* Historial de planes ejecutados */}
      <PlanHistorySection />

      {/* Récords recientes */}
      {prsRecientes.length > 0 && (
        <>
          <SectionHeader title="Récords recientes" />
          <ul className="mb-6 flex flex-col gap-2.5">
            {prsRecientes.map((pr, i) => (
              <li key={i}>
                <Card className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pr/10">
                    <Trophy className="h-5 w-5 text-pr" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text">
                      {pr.exerciseName}
                    </p>
                    <p className="text-xs text-text/50">
                      {new Date(pr.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      · {pr.reps} reps
                    </p>
                  </div>
                  <StatNumber value={pr.weight} unit="kg" tone="pr" />
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Grupos musculares descuidados */}
      {descuidados.length > 0 && (
        <>
          <SectionHeader
            title="Grupos a recuperar"
            subtitle="Sin entrenar en más de 4 días"
          />
          <Card className="mb-4">
            <ul className="flex flex-col gap-2">
              {descuidados.map(({ muscle, dias }) => (
                <li
                  key={muscle}
                  className="flex items-center gap-3 text-sm"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warn" />
                  <span className="flex-1 font-medium text-text">
                    {traducirMusculo(muscle)}
                  </span>
                  <Badge tone="warn">
                    {dias === null ? 'Nunca' : `${dias} días`}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}
