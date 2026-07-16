import { calcularImc, RANGOS_IMC } from '../../lib/imc'
import { Card, Badge } from '../ui'
import { cn } from '../../lib/cn'

interface Props {
  pesoKg?: number
  alturaCm?: number
}

const TONO_TEXTO = {
  warn: 'text-warn',
  pr: 'text-pr',
  regress: 'text-regress',
} as const

/** Tarjeta de IMC: valor, interpretación por color y rangos de referencia. */
export function BmiCard({ pesoKg, alturaCm }: Props) {
  const imc = calcularImc(pesoKg, alturaCm)

  if (!imc) {
    return (
      <Card>
        <p className="text-sm font-bold text-text">IMC</p>
        <p className="mt-1 text-sm text-text/50">
          Añade tu peso y altura para calcular el Índice de Masa Corporal.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-text">IMC</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={cn(
                'text-4xl font-extrabold tabular-nums',
                TONO_TEXTO[imc.tono],
              )}
            >
              {imc.valor}
            </span>
            <span className="text-xs text-text/40">kg/m²</span>
          </div>
        </div>
        <Badge tone={imc.tono}>{imc.etiqueta}</Badge>
      </div>

      {/* Rangos de referencia */}
      <div className="mt-4 flex gap-1">
        {RANGOS_IMC.map((r) => (
          <div key={r.categoria} className="flex-1">
            <div
              className={cn(
                'h-1.5 rounded-full',
                r.categoria === imc.categoria
                  ? TONO_FONDO[imc.tono]
                  : 'bg-white/10',
              )}
            />
            <p
              className={cn(
                'mt-1 text-[10px] font-medium',
                r.categoria === imc.categoria ? 'text-text/70' : 'text-text/30',
              )}
            >
              {r.etiqueta}
            </p>
            <p className="text-[9px] tabular-nums text-text/30">{r.rango}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

const TONO_FONDO = {
  warn: 'bg-warn',
  pr: 'bg-pr',
  regress: 'bg-regress',
} as const
