import { X } from 'lucide-react'
import { ExerciseGif } from '../ExerciseGif'
import { Button } from '../ui'

interface Props {
  exerciseName: string
  gifUrl?: string
  instructions?: string[]
  onClose: () => void
}

export function ExerciseHelpModal({
  exerciseName,
  gifUrl,
  instructions,
  onClose,
}: Props) {
  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal centrado */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface rounded-3xl border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-bg text-text/50 hover:bg-white/10 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Título */}
          <h2 className="mb-4 text-xl font-bold text-text">{exerciseName}</h2>

          {/* GIF */}
          <div className="mb-6">
            <ExerciseGif gifUrl={gifUrl} name={exerciseName} variant="detail" />
          </div>

          {/* Instrucciones */}
          {instructions && instructions.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-bold text-text/70 uppercase">
                Cómo hacerlo
              </h3>
              <ol className="space-y-2.5">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-text/60">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/15 text-xs font-bold text-lime">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Botón de cierre */}
          <Button fullWidth onClick={onClose} variant="secondary">
            Entendido
          </Button>
        </div>
      </div>
    </>
  )
}
