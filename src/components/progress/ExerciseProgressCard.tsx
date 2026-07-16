import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import type { WorkoutSession } from '../../types'
import {
  ejerciciosEntrenados,
  progresoEjercicio,
  type ProgressPoint,
} from '../../lib/stats'
import { Card } from '../ui'
import { cn } from '../../lib/cn'

type Metric = 'maxWeight' | 'est1RM' | 'volume'

const METRICAS: Array<{ id: Metric; label: string; unit: string }> = [
  { id: 'maxWeight', label: 'Peso máx.', unit: 'kg' },
  { id: 'est1RM', label: '1RM est.', unit: 'kg' },
  { id: 'volume', label: 'Volumen', unit: 'kg' },
]

interface Props {
  sessions: WorkoutSession[]
}

/** Tarjeta de progreso de un ejercicio: selector, métrica y gráfica temporal. */
export function ExerciseProgressCard({ sessions }: Props) {
  const entrenados = useMemo(() => ejerciciosEntrenados(sessions), [sessions])
  const [exId, setExId] = useState<string>(entrenados[0]?.id ?? '')
  const [metric, setMetric] = useState<Metric>('maxWeight')
  const [abrirSelector, setAbrirSelector] = useState(false)

  // Si el ejercicio elegido desaparece, usa el primero disponible.
  const seleccionado = entrenados.find((e) => e.id === exId) ?? entrenados[0]

  const puntos = useMemo<ProgressPoint[]>(
    () => (seleccionado ? progresoEjercicio(sessions, seleccionado.id) : []),
    [sessions, seleccionado],
  )

  if (entrenados.length === 0) {
    return (
      <Card className="py-8 text-center text-sm text-text/40">
        Registra entrenamientos para ver tu progreso por ejercicio.
      </Card>
    )
  }

  const meta = METRICAS.find((m) => m.id === metric)!
  const datos = puntos.map((p) => ({ label: p.label, valor: p[metric] }))
  const ultimo = puntos[puntos.length - 1]
  const primero = puntos[0]
  const delta =
    ultimo && primero ? Math.round(ultimo[metric] - primero[metric]) : 0

  return (
    <Card>
      {/* Selector de ejercicio */}
      <div className="relative mb-3">
        <button
          onClick={() => setAbrirSelector((v) => !v)}
          className="flex w-full items-center gap-2 text-left"
        >
          <div className="flex-1">
            <h2 className="text-base font-bold tracking-tight text-text">
              {seleccionado?.name ?? 'Ejercicio'}
            </h2>
            <p className="mt-0.5 text-xs text-text/50">
              {puntos.length} sesión{puntos.length === 1 ? '' : 'es'}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-text/40 transition-transform',
              abrirSelector && 'rotate-180',
            )}
          />
        </button>
        {abrirSelector && (
          <>
            <button
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setAbrirSelector(false)}
              aria-hidden
            />
            <ul className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-xl">
              {entrenados.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => {
                      setExId(e.id)
                      setAbrirSelector(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm active:bg-white/5',
                      e.id === seleccionado?.id
                        ? 'font-bold text-lime'
                        : 'text-text',
                    )}
                  >
                    {e.name}
                    <span className="text-xs text-text/40">{e.sesiones}×</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Selector de métrica */}
      <div className="mb-4 flex gap-1.5">
        {METRICAS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetric(m.id)}
            className={cn(
              'flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all active:scale-95',
              metric === m.id
                ? 'border-lime bg-lime text-bg'
                : 'border-border bg-bg text-text/60',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {puntos.length < 2 ? (
        <p className="py-8 text-center text-xs text-text/40">
          Necesitas al menos dos sesiones con este ejercicio para ver la evolución.
        </p>
      ) : (
        <>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tabular-nums text-text">
              {ultimo?.[metric]}
            </span>
            <span className="text-xs text-text/40">{meta.unit}</span>
            {delta !== 0 && (
              <span
                className={cn(
                  'text-xs font-bold',
                  delta > 0 ? 'text-pr' : 'text-regress',
                )}
              >
                {delta > 0 ? '+' : ''}
                {delta} {meta.unit}
              </span>
            )}
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={datos}
                margin={{ top: 8, right: 6, left: -6, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="progFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C6FF3D" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C6FF3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#26262F" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#6b6b73"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  minTickGap={20}
                />
                <YAxis
                  stroke="#6b6b73"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={44}
                  tickFormatter={(v: number) => String(Math.round(v))}
                  domain={['dataMin - 4', 'dataMax + 4']}
                />
                <Tooltip
                  cursor={{ stroke: '#C6FF3D', strokeOpacity: 0.3 }}
                  contentStyle={{
                    background: '#1A1A22',
                    border: '1px solid #26262F',
                    borderRadius: 12,
                    color: '#F5F5F7',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#8b8b93' }}
                  formatter={(v: number) => [`${v} ${meta.unit}`, meta.label]}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#C6FF3D"
                  strokeWidth={2.5}
                  fill="url(#progFill)"
                  dot={{ r: 3, fill: '#C6FF3D', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  )
}
