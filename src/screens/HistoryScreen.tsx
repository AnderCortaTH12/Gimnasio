import { Clock, Dumbbell, Trophy } from 'lucide-react'
import { PageTitle } from '../components/PageTitle'
import { Card, Badge, StatNumber, SectionHeader } from '../components/ui'

/** Sesiones de muestra agrupadas por fecha (aún sin persistencia). */
const SESIONES_MUESTRA = [
  {
    id: 's1',
    name: 'Pierna A',
    fecha: 'Hoy',
    duracion: '58 min',
    volumen: '8.2 t',
    ejercicios: 6,
    prs: 1,
  },
  {
    id: 's2',
    name: 'Empuje A',
    fecha: 'Ayer',
    duracion: '51 min',
    volumen: '6.9 t',
    ejercicios: 5,
    prs: 0,
  },
  {
    id: 's3',
    name: 'Tirón A',
    fecha: 'Lun, 13 jul',
    duracion: '47 min',
    volumen: '7.1 t',
    ejercicios: 5,
    prs: 1,
  },
]

export function HistoryScreen() {
  return (
    <div>
      <PageTitle title="Historial" subtitle="Tus sesiones registradas" />

      {/* Resumen del mes (muestra) */}
      <Card className="mb-6">
        <SectionHeader title="Julio" subtitle="Resumen del mes" />
        <div className="grid grid-cols-3 gap-2">
          <StatNumber value="11" label="Sesiones" tone="lime" />
          <StatNumber value="78.4" unit="t" label="Volumen" />
          <StatNumber value="4" label="PRs" tone="pr" />
        </div>
      </Card>

      <SectionHeader title="Sesiones recientes" />
      <ul className="flex flex-col gap-2.5">
        {SESIONES_MUESTRA.map((s) => (
          <li key={s.id}>
            <Card interactive className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime/10">
                <Dumbbell className="h-6 w-6 text-lime" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-text">{s.name}</p>
                  {s.prs > 0 && (
                    <Badge tone="pr">
                      <Trophy className="mr-1 h-3 w-3" />
                      {s.prs} PR
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-text/50">
                  <span>{s.fecha}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {s.duracion}
                  </span>
                  <span>{s.ejercicios} ejerc.</span>
                </div>
              </div>
              <StatNumber value={s.volumen.split(' ')[0]} unit="t" tone="lime" />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
