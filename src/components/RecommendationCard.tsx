import {
  BedDouble,
  TrendingUp,
  Scale,
  Shuffle,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react'
import type { Recommendation, RecType } from '../recommendations'
import { Card } from './ui'
import { cn } from '../lib/cn'

const ICONO: Record<RecType, LucideIcon> = {
  descanso: BedDouble,
  progresion: TrendingUp,
  equilibrio: Scale,
  variacion: Shuffle,
  rutina: CalendarCheck,
}

const TONO_ICONO: Record<Recommendation['tono'], string> = {
  lime: 'bg-lime/10 text-lime',
  pr: 'bg-pr/10 text-pr',
  warn: 'bg-warn/10 text-warn',
  neutral: 'bg-white/5 text-text/60',
}

/** Tarjeta de una recomendación: icono, título y su porqué explicable. */
export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const Icon = ICONO[rec.type]
  return (
    <Card className="flex gap-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          TONO_ICONO[rec.tono],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-text">{rec.titulo}</p>
        {/* El PORQUÉ de la recomendación */}
        <p className="mt-0.5 text-sm leading-snug text-text/55">{rec.porque}</p>
      </div>
    </Card>
  )
}
