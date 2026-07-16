import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { MuscleKey, EquipmentKey } from '../types'
import {
  GRUPOS_FILTRO,
  EQUIPOS_FILTRO,
  traducirMusculo,
  traducirEquipo,
} from '../data/muscles'
import { cn } from '../lib/cn'

interface Props {
  query: string
  setQuery: (v: string) => void
  muscle: MuscleKey | null
  setMuscle: (v: MuscleKey | null) => void
  equipment: EquipmentKey | null
  setEquipment: (v: EquipmentKey | null) => void
}

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

/** Buscador + filtros por grupo muscular y equipo (reutilizable). */
export function ExerciseFilters({
  query,
  setQuery,
  muscle,
  setMuscle,
  equipment,
  setEquipment,
}: Props) {
  return (
    <>
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
      <div className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
    </>
  )
}
