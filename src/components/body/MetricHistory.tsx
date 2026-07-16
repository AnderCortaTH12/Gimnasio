import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { BodyMetric } from '../../types'
import { eliminarMedida } from '../../db/db'
import { AddMetricSheet } from './AddMetricSheet'

interface Props {
  /** Medidas del mismo tipo, ordenadas por fecha ascendente. */
  data: BodyMetric[]
  unit: string
}

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })

/** Lista de registros de una medida con opción de editar y borrar cada uno. */
export function MetricHistory({ data, unit }: Props) {
  const [editando, setEditando] = useState<BodyMetric | null>(null)

  return (
    <>
      <ul className="flex flex-col gap-1">
        {[...data].reverse().map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-sm"
          >
            <span className="flex-1 text-text/50">{fmtFecha(m.date)}</span>
            <span className="font-bold tabular-nums text-text">
              {m.value} {unit}
            </span>
            <button
              onClick={() => setEditando(m)}
              aria-label="Editar medida"
              className="ml-1 text-text/30 active:scale-90 active:text-lime"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => eliminarMedida(m.id)}
              aria-label="Eliminar medida"
              className="text-text/25 active:scale-90 active:text-regress"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <AddMetricSheet
        open={editando !== null}
        onClose={() => setEditando(null)}
        metric={editando ?? undefined}
      />
    </>
  )
}
