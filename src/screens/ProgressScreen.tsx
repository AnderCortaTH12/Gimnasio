import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, Trophy } from 'lucide-react'
import { PageTitle } from '../components/PageTitle'
import { Card, SectionHeader, StatNumber, Badge } from '../components/ui'

/** Evolución de 1RM estimado (kg) de muestra para press de banca. */
const DATOS_1RM = [
  { semana: 'S1', kg: 82 },
  { semana: 'S2', kg: 85 },
  { semana: 'S3', kg: 84 },
  { semana: 'S4', kg: 88 },
  { semana: 'S5', kg: 90 },
  { semana: 'S6', kg: 93 },
]

/** PRs recientes de muestra. */
const PRS_MUESTRA = [
  { ejercicio: 'Press de banca', valor: '93 kg', fecha: 'Hoy' },
  { ejercicio: 'Sentadilla trasera', valor: '130 kg', fecha: 'hace 3 días' },
  { ejercicio: 'Peso muerto', valor: '160 kg', fecha: 'hace 6 días' },
]

export function ProgressScreen() {
  return (
    <div>
      <PageTitle title="Progreso" subtitle="Tu evolución en el tiempo" />

      {/* Gráfica de 1RM estimado */}
      <Card className="mb-5">
        <SectionHeader
          title="Press de banca"
          subtitle="1RM estimado · últimas 6 semanas"
          action={
            <Badge tone="pr">
              <TrendingUp className="mr-1 h-3 w-3" />
              +11 kg
            </Badge>
          }
        />
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={DATOS_1RM}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="limeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C6FF3D" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C6FF3D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#26262F" vertical={false} />
              <XAxis
                dataKey="semana"
                stroke="#6b6b73"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                stroke="#6b6b73"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={32}
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
                formatter={(v: number) => [`${v} kg`, '1RM est.']}
              />
              <Area
                type="monotone"
                dataKey="kg"
                stroke="#C6FF3D"
                strokeWidth={2.5}
                fill="url(#limeFill)"
                dot={{ r: 3, fill: '#C6FF3D', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Métricas destacadas (muestra) */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card>
          <StatNumber value="93" unit="kg" label="Mejor press banca" tone="lime" />
        </Card>
        <Card>
          <StatNumber value="78.4" unit="t" label="Volumen del mes" />
        </Card>
      </div>

      {/* PRs recientes */}
      <SectionHeader title="Récords recientes" />
      <ul className="flex flex-col gap-2.5">
        {PRS_MUESTRA.map((pr) => (
          <li key={pr.ejercicio}>
            <Card className="flex items-center gap-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pr/10">
                <Trophy className="h-5 w-5 text-pr" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-text">{pr.ejercicio}</p>
                <p className="text-xs text-text/50">{pr.fecha}</p>
              </div>
              <StatNumber value={pr.valor.split(' ')[0]} unit="kg" tone="pr" />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
