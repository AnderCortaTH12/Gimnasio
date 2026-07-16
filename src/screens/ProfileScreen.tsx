import {
  User,
  Ruler,
  Scale,
  Target,
  Settings,
  Download,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { PageTitle } from '../components/PageTitle'
import { Card, StatNumber, SectionHeader, Badge } from '../components/ui'

/** Fila de ajuste/acción del perfil. */
function SettingRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value?: string
}) {
  return (
    <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-white/5">
      <Icon className="h-5 w-5 shrink-0 text-text/50" />
      <span className="flex-1 text-sm font-medium text-text">{label}</span>
      {value && <span className="text-sm text-text/50">{value}</span>}
      <ChevronRight className="h-4 w-4 text-text/30" />
    </button>
  )
}

export function ProfileScreen() {
  return (
    <div>
      <PageTitle title="Perfil" />

      {/* Cabecera de usuario (muestra) */}
      <Card className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime/10">
          <User className="h-8 w-8 text-lime" />
        </div>
        <div>
          <p className="text-lg font-black text-text">Atleta</p>
          <Badge tone="lime" className="mt-1">
            Objetivo: 3 días/semana
          </Badge>
        </div>
      </Card>

      {/* Medidas corporales (muestra) */}
      <SectionHeader
        title="Medidas corporales"
        action={<Badge tone="warn">Muestra</Badge>}
      />
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Card>
          <StatNumber value="78.5" unit="kg" label="Peso" tone="lime" />
        </Card>
        <Card>
          <StatNumber value="15.2" unit="%" label="Grasa" />
        </Card>
        <Card>
          <StatNumber value="180" unit="cm" label="Altura" />
        </Card>
      </div>

      {/* Ajustes */}
      <SectionHeader title="Ajustes" />
      <Card className="mb-5 divide-y divide-border p-0">
        <SettingRow icon={Scale} label="Unidades" value="Métrico (kg)" />
        <SettingRow icon={Ruler} label="Datos personales" />
        <SettingRow icon={Target} label="Objetivos" value="3 días/sem" />
        <SettingRow icon={Settings} label="Preferencias" />
        <SettingRow icon={Download} label="Exportar datos" />
      </Card>

      <p className="text-center text-xs text-text/30">FORJA · v0.1 · Fase 1</p>
    </div>
  )
}
