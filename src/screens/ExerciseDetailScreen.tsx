import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Plus, Target } from 'lucide-react'
import {
  traducirMusculo,
  traducirEquipo,
  CATEGORY_ES,
} from '../data/muscles'
import { useSessionStore } from '../store/sessionStore'
import { useCatalogStore } from '../store/catalogStore'
import { ExerciseGif } from '../components/ExerciseGif'
import { Badge, Button, Card, EmptyState } from '../components/ui'

export function ExerciseDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { active, addEjercicio } = useSessionStore()
  const exercises = useCatalogStore((s) => s.exercises)
  const loading = useCatalogStore((s) => s.loading)
  const ex = exercises.find((e) => e.id === id)

  // Mientras carga el catálogo, no declaramos "no encontrado" todavía.
  if (!ex && loading) {
    return <p className="py-10 text-center text-sm text-text/40">Cargando…</p>
  }

  if (!ex) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Ejercicio no encontrado"
        description="Puede que ya no esté en el catálogo."
        action={
          <Button variant="secondary" onClick={() => navigate('/ejercicios')}>
            Volver al catálogo
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-text/60 active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      {/* Cabecera visual con GIF animado */}
      <div className="mb-5 flex flex-col items-center rounded-3xl border border-border bg-gradient-to-b from-surface to-bg px-6 py-6 text-center">
        <div className="mb-4 w-full max-w-[300px]">
          <ExerciseGif
            gifUrl={ex.gifUrl}
            name={ex.name}
            variant="detail"
            className="shadow-lg shadow-black/30"
          />
        </div>
        <h1 className="text-xl font-black tracking-tight text-text">{ex.name}</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          <Badge tone="lime">{traducirMusculo(ex.muscleGroup)}</Badge>
          <Badge>{traducirEquipo(ex.equipment)}</Badge>
          <Badge tone="warn">{CATEGORY_ES[ex.category]}</Badge>
        </div>
      </div>

      {/* Músculos */}
      <Card className="mb-3">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
          <Target className="h-4 w-4 text-lime" />
          Músculos implicados
        </div>
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-text/50">Principal</p>
            <Badge tone="lime">{traducirMusculo(ex.target)}</Badge>
          </div>
          {ex.secondaryMuscles.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-text/50">
                Secundarios
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ex.secondaryMuscles.map((m) => (
                  <Badge key={m}>{traducirMusculo(m)}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Instrucciones */}
      {ex.instructions && ex.instructions.length > 0 && (
        <Card className="mb-3">
          <div className="mb-3 text-sm font-bold text-text">Técnica</div>
          <ol className="space-y-2.5">
            {ex.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-text/70">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/15 text-xs font-bold text-lime">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Añadir a la sesión en curso (si la hay) */}
      <Button
        fullWidth
        size="lg"
        leftIcon={<Plus className="h-5 w-5" />}
        onClick={() => {
          if (active) {
            addEjercicio(ex)
            navigate('/entrenar')
          } else {
            navigate('/')
          }
        }}
        className="mt-2"
      >
        {active ? 'Añadir a la sesión' : 'Empieza una sesión para añadirlo'}
      </Button>
    </div>
  )
}
