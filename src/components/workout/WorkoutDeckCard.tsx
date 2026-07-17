import { useState, useEffect } from 'react'
import { HelpCircle, Plus, Minus } from 'lucide-react'
import type { ExerciseEntry } from '../../types'
import { obtenerEjercicio } from '../../data/catalogRegistry'
import { ExerciseGif } from '../ExerciseGif'
import { Card, StatNumber } from '../ui'
import { ExerciseHelpModal } from './ExerciseHelpModal'
import { SetCompletionGesture } from './SetCompletionGesture'

interface Props {
  entry: ExerciseEntry
  currentSetIndex: number
  onSetComplete: (setId: string, weight: number, reps: number, rpe?: number) => void
  onSetUndo: (setId: string) => void
}

export function WorkoutDeckCard({
  entry,
  currentSetIndex,
  onSetComplete,
  onSetUndo,
}: Props) {
  const [showHelp, setShowHelp] = useState(false)
  const [weight, setWeight] = useState<number>(0)
  const [reps, setReps] = useState<number>(0)
  const [rpe, setRpe] = useState<number>(7)

  const currentSet = entry.sets[currentSetIndex]
  const totalSets = entry.sets.length
  const completedSets = entry.sets.filter((s) => s.completed).length
  // Intenta usar gifUrl cacheado; fallback: resuelve desde catálogo (sesiones antiguas)
  const gifUrl = entry.gifUrl || obtenerEjercicio(entry.exerciseId)?.gifUrl
  const ejercicio = obtenerEjercicio(entry.exerciseId)

  // Precargar con la serie anterior o valores por defecto
  useEffect(() => {
    if (currentSet) {
      if (currentSet.weight) setWeight(currentSet.weight)
      if (currentSet.reps) setReps(currentSet.reps)
      if (currentSet.rpe) setRpe(currentSet.rpe)
    }
  }, [currentSet])

  if (!currentSet) return null

  const handleComplete = () => {
    onSetComplete(currentSet.id, weight, reps, rpe)
    setTimeout(() => {
      setWeight(0)
      setReps(0)
      setRpe(7)
    }, 500)
  }

  const handleUndo = () => {
    onSetUndo(currentSet.id)
  }

  return (
    <>
      <SetCompletionGesture
        onComplete={handleComplete}
        onUndo={handleUndo}
      >
        <Card className="relative mx-4 flex flex-col gap-6 p-6 md:mx-auto md:max-w-md">
          {/* Cabecera con nombre y botón de ayuda */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black text-text">{entry.exerciseName}</h2>
              <p className="mt-1 text-sm text-text/50">
                Ejercicio {currentSetIndex + 1} de {totalSets}
              </p>
            </div>
            <button
              onClick={() => setShowHelp(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/10 text-lime hover:bg-lime/20 active:scale-90"
              title="Ver cómo hacer este ejercicio"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Miniatura del GIF */}
          <div className="flex justify-center">
            <div className="h-32 w-32">
              <ExerciseGif
                gifUrl={gifUrl}
                name={entry.exerciseName}
                variant="preview"
              />
            </div>
          </div>

          {/* Progreso visual */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase text-text/50">Progreso</p>
              <div className="mt-2 h-2 w-full rounded-full bg-bg">
                <div
                  className="h-2 rounded-full bg-lime transition-all duration-300"
                  style={{
                    width: `${(completedSets / totalSets) * 100}%`,
                  }}
                />
              </div>
            </div>
            <p className="ml-3 text-sm font-bold text-text/60">
              {completedSets}/{totalSets}
            </p>
          </div>

          {/* Campos de entrada: Peso y Reps */}
          <div className="grid grid-cols-2 gap-3">
            {/* Peso */}
            <div className="flex flex-col">
              <label className="mb-2 text-xs font-bold uppercase text-text/50">
                Peso
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeight(Math.max(0, weight - 2.5))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg text-text/50 active:scale-90"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={weight || ''}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2.5 text-center text-xl font-extrabold text-text focus:border-lime/50 focus:outline-none"
                  placeholder="0"
                />
                <button
                  onClick={() => setWeight(weight + 2.5)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg text-text/50 active:scale-90"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-text/40">kg</p>
            </div>

            {/* Reps */}
            <div className="flex flex-col">
              <label className="mb-2 text-xs font-bold uppercase text-text/50">
                Reps
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReps(Math.max(0, reps - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg text-text/50 active:scale-90"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={reps || ''}
                  onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2.5 text-center text-xl font-extrabold text-text focus:border-lime/50 focus:outline-none"
                  placeholder="0"
                />
                <button
                  onClick={() => setReps(reps + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg text-text/50 active:scale-90"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-text/40">reps</p>
            </div>
          </div>

          {/* RPE */}
          <div className="flex flex-col">
            <label className="mb-2 text-xs font-bold uppercase text-text/50">
              RPE (Esfuerzo 1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-text/50">Fácil</span>
              <StatNumber value={rpe} tone="lime" className="text-center" />
              <span className="text-xs text-text/50">Máximo</span>
            </div>
          </div>

          {/* Instrucciones: deslizar o botones */}
          <div className="space-y-2">
            <div className="text-center text-xs text-text/50">
              <p className="mb-3 font-semibold">Desliza para completar</p>
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  className="flex-1 rounded-lg border border-warn bg-warn/5 py-2.5 text-sm font-bold text-warn active:bg-warn/10"
                >
                  ↺ Atrás
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 rounded-lg border border-pr bg-pr/5 py-2.5 text-sm font-bold text-pr active:bg-pr/10"
                >
                  ✓ Completar
                </button>
              </div>
            </div>
          </div>
        </Card>
      </SetCompletionGesture>

      {/* Modal de ayuda */}
      {showHelp && (
        <ExerciseHelpModal
          exerciseName={entry.exerciseName}
          gifUrl={ejercicio?.gifUrl}
          instructions={ejercicio?.instructions}
          onClose={() => setShowHelp(false)}
        />
      )}
    </>
  )
}
