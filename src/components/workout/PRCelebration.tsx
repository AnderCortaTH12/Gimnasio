import { Trophy, Sparkles } from 'lucide-react'
import type { PRHallado } from '../../lib/stats'
import { Button } from '../ui'

interface Props {
  prs: PRHallado[]
  onClose: () => void
}

const TIPO_LABEL: Record<PRHallado['tipo'], string> = {
  peso: 'Peso máximo',
  '1rm': '1RM estimado',
  volumen: 'Volumen',
}

/** Semillas de confeti generadas una vez (posición y color aleatorios). */
const CONFETI = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 8) * 0.15,
  color: ['#C6FF3D', '#4ADE80', '#FBBF24', '#22D3EE'][i % 4],
}))

/** Modal de celebración cuando se baten récords personales al finalizar. */
export function PRCelebration({ prs, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 animate-fade-in bg-black/70" />

      {/* Confeti cayendo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETI.map((c, i) => (
          <span
            key={i}
            className="absolute top-[-10%] h-2 w-2 rounded-sm animate-confetti"
            style={{
              left: `${c.left}%`,
              backgroundColor: c.color,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm animate-fade-in-up rounded-3xl border border-lime/30 bg-surface p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime/15">
          <Trophy className="h-8 w-8 text-lime" />
        </div>
        <h2 className="flex items-center justify-center gap-1.5 text-xl font-black text-text">
          <Sparkles className="h-5 w-5 text-lime" />
          ¡Nuevo{prs.length > 1 ? 's' : ''} récord{prs.length > 1 ? 's' : ''}!
        </h2>
        <p className="mt-1 text-sm text-text/50">
          Has superado tus mejores marcas
        </p>

        <ul className="mt-5 flex max-h-64 flex-col gap-2 overflow-y-auto text-left">
          {prs.map((pr, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2.5"
            >
              <Trophy className="h-4 w-4 shrink-0 text-pr" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text">
                  {pr.exerciseName}
                </p>
                <p className="text-xs text-text/50">{TIPO_LABEL[pr.tipo]}</p>
              </div>
              <span className="shrink-0 text-lg font-extrabold tabular-nums text-lime">
                {pr.valor}
                <span className="ml-0.5 text-xs text-text/40">{pr.unidad}</span>
              </span>
            </li>
          ))}
        </ul>

        <Button fullWidth size="lg" className="mt-6" onClick={onClose}>
          ¡Seguir así!
        </Button>
      </div>
    </div>
  )
}
