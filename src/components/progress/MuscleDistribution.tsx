import type { VolumenMusculo } from '../../lib/stats'
import { traducirMusculo } from '../../data/muscles'

interface Props {
  data: VolumenMusculo[]
}

/**
 * Reparto de volumen por grupo muscular como barras horizontales.
 * Más legible en móvil que un donut y sin dependencias extra.
 */
export function MuscleDistribution({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-text/40">
        Sin volumen registrado en el periodo.
      </p>
    )
  }

  const total = data.reduce((n, d) => n + d.volumen, 0)
  const max = data[0].volumen

  return (
    <ul className="flex flex-col gap-2.5">
      {data.map((d) => {
        const pct = Math.round((d.volumen / total) * 100)
        const ancho = Math.max(4, (d.volumen / max) * 100)
        return (
          <li key={d.muscle}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-semibold text-text">
                {traducirMusculo(d.muscle)}
              </span>
              <span className="tabular-nums text-text/50">
                {(d.volumen / 1000).toFixed(1)} t · {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-lime transition-[width] duration-500"
                style={{ width: `${ancho}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
