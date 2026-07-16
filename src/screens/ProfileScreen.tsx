import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { User, Pencil, Plus, Scale, Ruler, Cake } from 'lucide-react'
import { leerPerfil, leerMedidas } from '../db/db'
import type { BodyMetric, BodyMetricType } from '../types'
import { MEDIDAS_PERIMETRO } from '../data/metrics'
import { PageTitle } from '../components/PageTitle'
import {
  Card,
  Badge,
  Button,
  SectionHeader,
  EmptyState,
  StatNumber,
} from '../components/ui'
import { BmiCard } from '../components/body/BmiCard'
import { MetricCard } from '../components/body/MetricCard'
import { MetricHistory } from '../components/body/MetricHistory'
import { MetricChart } from '../components/MetricChart'
import { EditProfileSheet } from '../components/body/EditProfileSheet'
import { AddMetricSheet } from '../components/body/AddMetricSheet'
import { BackupSection } from '../components/body/BackupSection'

const OBJETIVO_LABEL: Record<string, string> = {
  fuerza: 'Fuerza',
  hipertrofia: 'Hipertrofia',
  mantenimiento: 'Mantenimiento',
}

export function ProfileScreen() {
  // null = no hay perfil aún; undefined = todavía cargando desde IndexedDB.
  const perfil = useLiveQuery(async () => (await leerPerfil()) ?? null, [], undefined)
  const medidas = useLiveQuery(() => leerMedidas(), [], undefined)

  const [editando, setEditando] = useState(false)
  const [registrandoPeso, setRegistrandoPeso] = useState(false)
  const [nuevaMedida, setNuevaMedida] = useState(false)

  // Agrupa las medidas por tipo (ya vienen ordenadas por fecha ascendente).
  const porTipo = useMemo(() => {
    const map = new Map<BodyMetricType, BodyMetric[]>()
    for (const m of medidas ?? []) {
      const arr = map.get(m.type) ?? []
      arr.push(m)
      map.set(m.type, arr)
    }
    return map
  }, [medidas])

  const pesos = porTipo.get('peso') ?? []
  const pesoActual = pesos[pesos.length - 1]?.value
  const perimetrosConDatos = MEDIDAS_PERIMETRO.filter((t) => porTipo.has(t))
  const grasa = porTipo.get('grasa') ?? []

  const cargando = perfil === undefined || medidas === undefined

  return (
    <div>
      <PageTitle
        title="Perfil"
        action={
          <button
            onClick={() => setEditando(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-lime active:scale-90"
            aria-label="Editar perfil"
          >
            <Pencil className="h-5 w-5" />
          </button>
        }
      />

      {/* Cabecera de usuario */}
      <Card className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lime/10">
          <User className="h-8 w-8 text-lime" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black text-text">
            {perfil?.name || 'Tu perfil'}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {perfil?.trainingGoal && (
              <Badge tone="lime">{OBJETIVO_LABEL[perfil.trainingGoal]}</Badge>
            )}
            {perfil?.age !== undefined && (
              <Badge>
                <Cake className="mr-1 h-3 w-3" />
                {perfil.age} años
              </Badge>
            )}
            {perfil?.heightCm !== undefined && (
              <Badge>
                <Ruler className="mr-1 h-3 w-3" />
                {perfil.heightCm} cm
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {cargando ? (
        <Card className="py-10 text-center text-sm text-text/40">Cargando…</Card>
      ) : (
        <>
          {/* Peso corporal */}
          <SectionHeader
            title="Peso corporal"
            action={
              <button
                onClick={() => setRegistrandoPeso(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-lime"
              >
                <Plus className="h-3.5 w-3.5" />
                Registrar
              </button>
            }
          />
          {pesos.length === 0 ? (
            <Card className="mb-5">
              <EmptyState
                icon={Scale}
                title="Sin registros de peso"
                description="Registra tu peso para ver su evolución en el tiempo."
                action={
                  <Button
                    leftIcon={<Plus className="h-5 w-5" />}
                    onClick={() => setRegistrandoPeso(true)}
                  >
                    Registrar peso
                  </Button>
                }
              />
            </Card>
          ) : (
            <Card className="mb-5">
              <div className="mb-3 flex items-end justify-between">
                <StatNumber
                  value={pesoActual ?? '—'}
                  unit="kg"
                  label="Peso actual"
                  tone="lime"
                />
                <span className="text-xs text-text/40">
                  {pesos.length} registro{pesos.length === 1 ? '' : 's'}
                </span>
              </div>
              {pesos.length >= 2 ? (
                <MetricChart data={pesos} unit="kg" />
              ) : (
                <p className="py-4 text-center text-xs text-text/40">
                  Registra al menos dos pesos para ver la gráfica.
                </p>
              )}
              <div className="mt-3">
                <MetricHistory data={pesos} unit="kg" />
              </div>
            </Card>
          )}

          {/* IMC */}
          <div className="mb-5">
            <BmiCard pesoKg={pesoActual} alturaCm={perfil?.heightCm} />
          </div>

          {/* Otras medidas */}
          <SectionHeader
            title="Medidas corporales"
            action={
              <button
                onClick={() => setNuevaMedida(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-lime"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir
              </button>
            }
          />
          {grasa.length === 0 && perimetrosConDatos.length === 0 ? (
            <Card className="mb-5">
              <EmptyState
                icon={Ruler}
                title="Sin medidas todavía"
                description="Registra cintura, brazo, pecho, grasa corporal… y sigue su evolución."
                action={
                  <Button
                    variant="secondary"
                    leftIcon={<Plus className="h-5 w-5" />}
                    onClick={() => setNuevaMedida(true)}
                  >
                    Añadir medida
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="mb-5 flex flex-col gap-2.5">
              {grasa.length > 0 && <MetricCard type="grasa" data={grasa} />}
              {perimetrosConDatos.map((t) => (
                <MetricCard key={t} type={t} data={porTipo.get(t)!} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Copia de seguridad */}
      <BackupSection />

      <p className="mt-2 text-center text-xs text-text/30">
        FORJA · v0.6 · Fase 6
      </p>

      {/* Hojas modales */}
      <EditProfileSheet
        open={editando}
        onClose={() => setEditando(false)}
        profile={perfil ?? undefined}
        pesoActual={pesoActual}
      />
      <AddMetricSheet
        open={registrandoPeso}
        onClose={() => setRegistrandoPeso(false)}
        fixedType="peso"
      />
      <AddMetricSheet
        open={nuevaMedida}
        onClose={() => setNuevaMedida(false)}
      />
    </div>
  )
}
