import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronRight } from 'lucide-react'
import { EXERCISES_SEED } from '../data/exercisesSeed'
import {
  GRUPOS_FILTRO,
  EQUIPOS_FILTRO,
  traducirMusculo,
  traducirEquipo,
} from '../data/muscles'
import type { MuscleKey, EquipmentKey } from '../types'
import { PageTitle } from '../components/PageTitle'
import { Badge, Card, EmptyState } from '../components/ui'
import { cn } from '../lib/cn'

/** Normaliza texto para búsqueda insensible a mayúsculas y acentos. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

/** Pastilla de filtro seleccionable. */
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95',
        active
          ? 'border-lime bg-lime text-bg'
          : 'border-border bg-surface text-text/70 hover:border-lime/40',
      )}
    >
      {children}
    </button>
  )
}

export function ExercisesScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState<MuscleKey | null>(null)
  const [equipment, setEquipment] = useState<EquipmentKey | null>(null)

  const filtered = useMemo(() => {
    const q = norm(query.trim())
    return EXERCISES_SEED.filter((ex) => {
      if (q && !norm(ex.name).includes(q)) return false
      if (
        muscle &&
        ex.muscleGroup !== muscle &&
        ex.bodyPart !== muscle &&
        !ex.secondaryMuscles.includes(muscle)
      )
        return false
      if (equipment && ex.equipment !== equipment) return false
      return true
    })
  }, [query, muscle, equipment])

  const hayFiltros = muscle !== null || equipment !== null || query !== ''

  return (
    <div>
      <PageTitle
        title="Ejercicios"
        subtitle={`${EXERCISES_SEED.length} en el catálogo`}
      />

      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ejercicio…"
          className="h-12 w-full rounded-2xl border border-border bg-surface pl-10 pr-10 text-sm text-text placeholder:text-text/40 focus:border-lime/50 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 active:scale-90"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtros por grupo muscular */}
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text/50">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Grupo muscular
      </div>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GRUPOS_FILTRO.map((m) => (
          <FilterChip
            key={m}
            active={muscle === m}
            onClick={() => setMuscle(muscle === m ? null : m)}
          >
            {traducirMusculo(m)}
          </FilterChip>
        ))}
      </div>

      {/* Filtros por equipo */}
      <div className="mb-2 text-xs font-semibold text-text/50">Equipo</div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {EQUIPOS_FILTRO.map((e) => (
          <FilterChip
            key={e}
            active={equipment === e}
            onClick={() => setEquipment(equipment === e ? null : e)}
          >
            {traducirEquipo(e)}
          </FilterChip>
        ))}
      </div>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="Prueba con otro término o quita algún filtro."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {filtered.map((ex) => (
            <li key={ex.id}>
              <Card
                interactive
                onClick={() => navigate(`/ejercicios/${ex.id}`)}
                className="flex items-center gap-3 py-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime/10 text-sm font-black text-lime">
                  {traducirMusculo(ex.muscleGroup).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text">{ex.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone="lime">{traducirMusculo(ex.muscleGroup)}</Badge>
                    <Badge>{traducirEquipo(ex.equipment)}</Badge>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-text/30" />
              </Card>
            </li>
          ))}
        </ul>
      )}

      {hayFiltros && filtered.length > 0 && (
        <p className="mt-4 text-center text-xs text-text/40">
          {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}
