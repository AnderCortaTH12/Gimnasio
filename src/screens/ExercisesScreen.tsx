import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { traducirMusculo, traducirEquipo } from '../data/muscles'
import { useExerciseFilter } from '../hooks/useExerciseFilter'
import { useIncrementalList } from '../hooks/useIncrementalList'
import { useCatalogStore } from '../store/catalogStore'
import { ExerciseGif } from '../components/ExerciseGif'
import { PageTitle } from '../components/PageTitle'
import { ExerciseFilters } from '../components/ExerciseFilters'
import { Badge, Card, EmptyState } from '../components/ui'

export function ExercisesScreen() {
  const navigate = useNavigate()
  const total = useCatalogStore((s) => s.exercises.length)
  const loading = useCatalogStore((s) => s.loading)
  const f = useExerciseFilter()
  // Renderizado incremental: no montamos los 1.324 de golpe.
  const { visible, hayMas, sentinelRef } = useIncrementalList(f.filtered, 30)

  return (
    <div>
      <PageTitle
        title="Ejercicios"
        subtitle={loading ? 'Cargando catálogo…' : `${total} en el catálogo`}
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
          <>
            <ul className="flex flex-col gap-2.5">
              {visible.map((ex) => (
                <li key={ex.id}>
                  <Card
                    interactive
                    onClick={() => navigate(`/ejercicios/${ex.id}`)}
                    className="flex items-center gap-3 py-3"
                  >
                    <ExerciseGif
                      gifUrl={ex.gifUrl}
                      name={ex.name}
                      variant="preview"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-text">
                        {ex.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge tone="lime">
                          {traducirMusculo(ex.muscleGroup)}
                        </Badge>
                        <Badge>{traducirEquipo(ex.equipment)}</Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-text/30" />
                  </Card>
                </li>
              ))}
            </ul>
            {/* Sentinela: al acercarse, carga más resultados. */}
            {hayMas && <div ref={sentinelRef} className="h-8" />}
          </>
        )}
      </div>

      {f.filtered.length > 0 && (
        <p className="mt-4 text-center text-xs text-text/40">
          {f.filtered.length} resultado{f.filtered.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}
