import { Plus, Flame, Dumbbell, Clock, Trophy } from 'lucide-react'
import { PageTitle } from '../components/PageTitle'
import {
  Button,
  Card,
  StatNumber,
  SectionHeader,
  Badge,
} from '../components/ui'

/** Rutina de muestra sugerida para hoy (aún sin lógica real). */
const RUTINA_MUESTRA = [
  { name: 'Press de banca', sets: '4 × 8', muscle: 'Pecho' },
  { name: 'Remo con barra', sets: '4 × 10', muscle: 'Espalda' },
  { name: 'Press militar', sets: '3 × 10', muscle: 'Hombros' },
  { name: 'Curl con mancuernas', sets: '3 × 12', muscle: 'Bíceps' },
]

const HOY = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function TodayScreen() {
  return (
    <div>
      <PageTitle title="Hoy" subtitle={HOY[0].toUpperCase() + HOY.slice(1)} />

      {/* Resumen rápido de la semana (datos de muestra) */}
      <Card className="mb-5 bg-gradient-to-br from-surface to-bg">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text/60">
          <Flame className="h-4 w-4 text-lime" />
          Esta semana
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatNumber value="3" unit="días" label="Entrenados" tone="lime" />
          <StatNumber value="12.4" unit="t" label="Volumen" />
          <StatNumber value="2" unit="PRs" label="Récords" tone="pr" />
        </div>
      </Card>

      {/* CTA principal */}
      <Button
        fullWidth
        size="lg"
        leftIcon={<Plus className="h-5 w-5" />}
        className="mb-6"
      >
        Empezar entrenamiento
      </Button>

      {/* Rutina sugerida de muestra */}
      <SectionHeader
        title="Rutina sugerida"
        subtitle="Empuje / Tirón · muestra"
      />
      <ul className="mb-6 flex flex-col gap-2.5">
        {RUTINA_MUESTRA.map((item) => (
          <li key={item.name}>
            <Card className="flex items-center gap-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                <Dumbbell className="h-5 w-5 text-text/50" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-text">{item.name}</p>
                <Badge tone="neutral" className="mt-1">
                  {item.muscle}
                </Badge>
              </div>
              <span className="shrink-0 text-sm font-extrabold tabular-nums text-lime">
                {item.sets}
              </span>
            </Card>
          </li>
        ))}
      </ul>

      {/* Último entrenamiento (muestra) */}
      <SectionHeader title="Último entrenamiento" />
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pr/10">
          <Trophy className="h-6 w-6 text-pr" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text">Pierna A</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-text/50">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> 58 min
            </span>
            <span>hace 2 días</span>
          </div>
        </div>
        <StatNumber value="8.2" unit="t" tone="lime" />
      </Card>
    </div>
  )
}
