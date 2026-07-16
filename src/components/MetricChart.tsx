import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { BodyMetric } from '../types'

interface Props {
  data: BodyMetric[]
  /** Unidad para el tooltip (kg, cm, %). */
  unit: string
  /** Color del trazo (hex). Por defecto lima. */
  color?: string
}

/** Formatea una fecha ISO a "12 jul". */
const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

/** Gráfica de evolución de una medida corporal en el tiempo. */
export function MetricChart({ data, unit, color = '#C6FF3D' }: Props) {
  const puntos = data.map((m) => ({
    fecha: fmtFecha(m.date),
    valor: m.value,
  }))
  const gradId = `grad-${unit}-${color.replace('#', '')}`

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={puntos}
          margin={{ top: 8, right: 6, left: -6, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#26262F" vertical={false} />
          <XAxis
            dataKey="fecha"
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
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip
            cursor={{ stroke: color, strokeOpacity: 0.3 }}
            contentStyle={{
              background: '#1A1A22',
              border: '1px solid #26262F',
              borderRadius: 12,
              color: '#F5F5F7',
              fontSize: 12,
            }}
            labelStyle={{ color: '#8b8b93' }}
            formatter={(v: number) => [`${v} ${unit}`, 'Valor']}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradId})`}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
