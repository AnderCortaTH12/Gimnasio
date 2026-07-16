import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Clock, Dumbbell, Trophy, History } from 'lucide-react'
import { leerHistorial, calcularVolumen } from '../db/db'
import type { WorkoutSession } from '../types'
import { PageTitle } from '../components/PageTitle'
import { Card, Badge, StatNumber, SectionHeader, EmptyState } from '../components/ui'

/** Fecha legible en español (relativa para hoy/ayer). */
function fechaLegible(iso: string): string {
  const d = new Date(iso)
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)
  const sameDay = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString()
  if (sameDay(d, hoy)) return 'Hoy'
  if (sameDay(d, ayer)) return 'Ayer'
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function duracion(s: WorkoutSession): string {
  if (!s.finishedAt) return '—'
  return `${Math.round((s.finishedAt - s.startedAt) / 60000)} min`
}

function contarPRs(s: WorkoutSession): number {
  return s.exercises.reduce(
    (n, e) => n + e.sets.filter((x) => x.isPR).length,
    0,
  )
}

export function HistoryScreen() {
  const navigate = useNavigate()
  const historial = useLiveQuery(() => leerHistorial(), [], undefined)

  const cargando = historial === undefined
  const sesiones = historial ?? []

  // Resumen del mes en curso.
  const mesActual = new Date().getMonth()
  const delMes = sesiones.filter(
    (s) => new Date(s.date).getMonth() === mesActual,
  )
  const volMes = delMes.reduce((n, s) => n + calcularVolumen(s), 0)
  const prsMes = delMes.reduce((n, s) => n + contarPRs(s), 0)
  const nombreMes = new Date().toLocaleDateString('es-ES', { month: 'long' })

  return (
    <div>
      <PageTitle title="Historial" subtitle="Tus sesiones registradas" />

      {cargando ? (
        <Card className="py-10 text-center text-sm text-text/40">Cargando…</Card>
      ) : sesiones.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin sesiones todavía"
          description="Cuando finalices un entrenamiento aparecerá aquí."
        />
      ) : (
        <>
          {/* Resumen del mes */}
          <Card className="mb-6">
            <SectionHeader
              title={nombreMes[0].toUpperCase() + nombreMes.slice(1)}
              subtitle="Resumen del mes"
            />
            <div className="grid grid-cols-3 gap-2">
              <StatNumber value={delMes.length} label="Sesiones" tone="lime" />
              <StatNumber
                value={(volMes / 1000).toFixed(1)}
                unit="t"
                label="Volumen"
              />
              <StatNumber value={prsMes} label="PRs" tone="pr" />
            </div>
          </Card>

          <SectionHeader title="Sesiones recientes" />
          <ul className="flex flex-col gap-2.5">
            {sesiones.map((s) => {
              const prs = contarPRs(s)
              return (
                <li key={s.id}>
                  <Card
                    interactive
                    onClick={() => navigate(`/historial/${s.id}`)}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime/10">
                      <Dumbbell className="h-6 w-6 text-lime" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-text">{s.name}</p>
                        {prs > 0 && (
                          <Badge tone="pr">
                            <Trophy className="mr-1 h-3 w-3" />
                            {prs} PR
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-text/50">
                        <span>{fechaLegible(s.date)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {duracion(s)}
                        </span>
                        <span>{s.exercises.length} ejerc.</span>
                      </div>
                    </div>
                    <StatNumber
                      value={(calcularVolumen(s) / 1000).toFixed(1)}
                      unit="t"
                      tone="lime"
                    />
                  </Card>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
