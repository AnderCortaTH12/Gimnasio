import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { EXERCISES_SEED } from '../data/exercisesSeed'
import { traducirMusculo, traducirEquipo } from '../data/muscles'
import { useExerciseFilter } from '../hooks/useExerciseFilter'
import { PageTitle } from '../components/PageTitle'
import { ExerciseFilters } from '../components/ExerciseFilters'
import { Badge, Card, EmptyState } from '../components/ui'

export function ExercisesScreen() {
  const navigate = useNavigate()
  const f = useExerciseFilter()

  return (
    <div>
      <PageTitle
        title="Ejercicios"
        subtitle={`${EXERCISES_SEED.length} en el catálogo`}
      />

      <ExerciseFilters {...f} />

      <div className="mt-3">
        {f.filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="Prueba con otro término o quita algún filtro."
          />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {f.filtered.map((ex) => (
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
      </div>

      {f.hayFiltros && f.filtered.length > 0 && (
        <p className="mt-4 text-center text-xs text-text/40">
          {f.filtered.length} resultado{f.filtered.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}
