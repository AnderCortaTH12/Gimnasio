import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCircle2, XCircle, ClipboardList } from 'lucide-react'
import { leerPlanesEjecutados, estadisticasPlanes } from '../../db/db'
import { Card, Badge, SectionHeader } from '../ui'
import { cn } from '../../lib/cn'

const fmtFecha = (ms: number) =>
  new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

/** Sección de Progreso: planes ejecutados, % completados y racha semanal. */
export function PlanHistorySection() {
  const ejecutados = useLiveQuery(() => leerPlanesEjecutados(), [], [])
  const stats = useLiveQuery(() => estadisticasPlanes(), [], undefined)

  // Sin ningún plan ejecutado: no mostramos la sección.
  if (ejecutados.length === 0) return null

  return (
    <>
      <SectionHeader title="Planes ejecutados" />

      {/* Resumen 7 días + gráfico de 4 semanas */}
      {stats && (
        <Card className="mb-3">
          <p className="text-sm text-text/70">
            <span className="font-bold text-text">{stats.total7}</span> plan
            {stats.total7 === 1 ? '' : 'es'} en los últimos 7 días,{' '}
            <span className="font-bold text-pr">{stats.completados7}</span>{' '}
            completado{stats.completados7 === 1 ? '' : 's'} (
            {stats.porcentaje7}%).
          </p>

          {/* % completados por semana (últimas 4) */}
          <div className="mt-4 flex items-end justify-between gap-2">
            {stats.semanas.map((s, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold tabular-nums text-text/50">
                  {s.total > 0 ? `${s.pct}%` : '—'}
                </span>
                <div className="flex h-20 w-full items-end rounded-lg bg-surface">
                  <div
                    className={cn(
                      'w-full rounded-lg transition-all',
                      s.total > 0 ? 'bg-lime' : 'bg-transparent',
                    )}
                    style={{ height: `${s.total > 0 ? Math.max(s.pct, 4) : 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-text/40">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de ejecuciones */}
      <ul className="mb-6 flex flex-col gap-2.5">
        {ejecutados.slice(0, 12).map((e) => (
          <li key={e.id}>
            <Card className="flex items-center gap-3 py-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  e.completed ? 'bg-pr/10' : 'bg-white/5',
                )}
              >
                {e.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-pr" />
                ) : (
                  <XCircle className="h-5 w-5 text-text/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate font-semibold text-text">
                    {e.planName}
                  </p>
                  <Badge tone={e.planOrigin === 'user' ? 'lime' : 'neutral'}>
                    {e.planOrigin === 'user' ? 'Personal' : 'Predefinido'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-text/50">
                  {fmtFecha(e.startTime)}
                </p>
              </div>
              <ClipboardList className="h-4 w-4 shrink-0 text-text/25" />
            </Card>
          </li>
        ))}
      </ul>
    </>
  )
}
