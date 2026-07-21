import { useState } from 'react'
import { Dumbbell, ImageOff } from 'lucide-react'
import { Skeleton } from './ui/Skeleton'
import { cn } from '../lib/cn'

interface Props {
  gifUrl?: string
  /** Nombre del ejercicio para el alt. */
  name: string
  /** 'preview' para las tarjetas de la lista, 'detail' para la vista grande. */
  variant?: 'preview' | 'detail'
  className?: string
}

/**
 * Muestra el GIF animado de un ejercicio con estados de carga y error.
 * - Cargando: skeleton con shimmer.
 * - Error o sin URL: placeholder gris con icono + "Sin animación".
 * - Cargado: transición suave con fadeIn.
 */
export function ExerciseGif({
  gifUrl,
  name,
  variant = 'detail',
  className,
}: Props) {
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>(
    gifUrl ? 'cargando' : 'error',
  )

  const esDetalle = variant === 'detail'
  const contenedor = cn(
    'relative overflow-hidden',
    esDetalle ? 'aspect-square w-full rounded-2xl' : 'h-16 w-16 rounded-xl',
    className,
  )

  // Sin URL o error de carga: placeholder.
  if (estado === 'error') {
    return (
      <div
        className={cn(
          contenedor,
          'flex flex-col items-center justify-center gap-1 text-text/30 bg-white/[0.03]',
        )}
      >
        {esDetalle ? (
          <>
            <ImageOff className="h-8 w-8" strokeWidth={1.5} />
            <span className="text-xs font-medium">Sin animación</span>
          </>
        ) : (
          <Dumbbell className="h-6 w-6" strokeWidth={1.5} />
        )}
      </div>
    )
  }

  return (
    <div className={contenedor}>
      {/* Skeleton mientras carga */}
      {estado === 'cargando' && (
        <Skeleton className="absolute inset-0" animated />
      )}
      <img
        src={gifUrl}
        alt={`Animación del ejercicio ${name}`}
        onLoad={() => setEstado('ok')}
        onError={() => setEstado('error')}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          estado === 'ok' ? 'opacity-100 animate-fadeIn' : 'opacity-0',
        )}
      />
    </div>
  )
}
