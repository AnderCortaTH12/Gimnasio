import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Icono opcional a la izquierda del texto. */
  leftIcon?: ReactNode
  /** Ocupa todo el ancho disponible. */
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  // Acento lima con texto oscuro para máximo contraste
  primary: 'bg-lime text-bg font-bold hover:brightness-105 active:brightness-95',
  secondary:
    'bg-surface text-text border border-border hover:border-lime/40 active:bg-white/5',
  ghost: 'bg-transparent text-text/80 hover:bg-white/5 active:bg-white/10',
  danger: 'bg-regress/15 text-regress border border-regress/30 hover:bg-regress/25',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  // Botones grandes cómodos para el pulgar
  lg: 'h-14 px-6 text-base rounded-2xl gap-2',
}

/** Botón base con variantes y feedback al pulsar (escala + brillo). */
export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold',
        'transition-all duration-100 active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/60',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon}
      {children}
    </button>
  )
}
