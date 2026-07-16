import { useState } from 'react'
import { ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { BodyMetric, BodyMetricType } from '../../types'
import { METRIC_META } from '../../data/metrics'
import { Card, StatNumber } from '../ui'
import { MetricChart } from '../MetricChart'
import { MetricHistory } from './MetricHistory'
import { cn } from '../../lib/cn'

interface Props {
  type: BodyMetricType
  /** Medidas de este tipo, ordenadas por fecha ascendente. */
  data: BodyMetric[]
}

/** Tarjeta de una medida: valor actual, variación, gráfica e historial. */
export function MetricCard({ type, data }: Props) {
  const [abierto, setAbierto] = useState(false)
  const meta = METRIC_META[type]

  const ultima = data[data.length - 1]
  const anterior = data[data.length - 2]
  const delta = ultima && anterior ? ultima.value - anterior.value : 0
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus

  return (
    <Card className="p-4">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-text/60">{meta.label}</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tabular-nums text-text">
              {ultima ? ultima.value : '—'}
            </span>
            <span className="text-xs font-medium text-text/50">{meta.unit}</span>
            {delta !== 0 && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-bold',
                  delta > 0 ? 'text-warn' : 'text-pr',
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(Math.round(delta * 10) / 10)}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-text/40 transition-transform',
            abierto && 'rotate-180',
          )}
        />
      </button>

      {abierto && (
        <div className="mt-4">
          {data.length >= 2 ? (
            <MetricChart data={data} unit={meta.unit} color={meta.color} />
          ) : (
            <p className="py-4 text-center text-xs text-text/40">
              Registra al menos dos medidas para ver la evolución.
            </p>
          )}

          {/* Historial con opción de editar y borrar */}
          <div className="mt-3">
            <MetricHistory data={data} unit={meta.unit} />
          </div>
        </div>
      )}
    </Card>
  )
}

/** Versión compacta para el resumen de perfil (sin desplegar). */
export function MetricStat({ type, data }: Props) {
  const meta = METRIC_META[type]
  const ultima = data[data.length - 1]
  return (
    <StatNumber
      value={ultima ? ultima.value : '—'}
      unit={ultima ? meta.unit : undefined}
      label={meta.label}
      tone={type === 'peso' ? 'lime' : 'default'}
    />
  )
}
