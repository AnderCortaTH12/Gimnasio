/**
 * Celebración de récord personal (PR).
 *
 * Muestra confeti + animación de entrada + sonido breve.
 * Respeata prefers-reduced-motion.
 * Dura ~1.5-2 segundos y se cierra automáticamente.
 */

import { useEffect, useRef } from 'react'
import { Trophy } from 'lucide-react'
import { cn } from '../lib/cn'

interface Props {
  exercise: string
  value: string
  unit: string
  onComplete?: () => void
}

export function PRCelebration({ exercise, value, unit, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    // Reproduce sonido breve (beep de celebración)
    if (!prefersReducedMotion) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    }

    // Auto-close después de 1.5s
    const timer = setTimeout(() => {
      onComplete?.()
    }, 1500)

    return () => clearTimeout(timer)
  }, [onComplete, prefersReducedMotion])

  // Genera confeti (si no reduce-motion)
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return

    const container = containerRef.current
    for (let i = 0; i < 30; i++) {
      const confeti = document.createElement('div')
      confeti.style.position = 'fixed'
      confeti.style.width = '8px'
      confeti.style.height = '8px'
      confeti.style.backgroundColor = ['#C6FF3D', '#4ADE80', '#F97316'][
        Math.floor(Math.random() * 3)
      ]
      confeti.style.borderRadius = '50%'
      confeti.style.left = Math.random() * window.innerWidth + 'px'
      confeti.style.top = '-10px'
      confeti.style.opacity = '1'
      confeti.style.pointerEvents = 'none'
      confeti.style.zIndex = '9999'

      const duration = 1500 + Math.random() * 500
      const xOffset = (Math.random() - 0.5) * 400

      confeti.animate(
        [
          {
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: 1,
          },
          {
            transform: `translateY(${window.innerHeight + 20}px) translateX(${xOffset}px) rotate(720deg)`,
            opacity: 0,
          },
        ],
        {
          duration,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
      )

      container.appendChild(confeti)

      setTimeout(() => confeti.remove(), duration)
    }
  }, [prefersReducedMotion])

  return (
    <>
      <div ref={containerRef} />

      <div
        className={cn(
          'fixed inset-0 flex items-center justify-center z-50 pointer-events-none',
          !prefersReducedMotion && 'animate-fadeIn',
        )}
      >
        <div
          className={cn(
            'bg-gradient-to-br from-lime to-pr rounded-3xl px-8 py-6 shadow-2xl shadow-lime/40',
            'flex flex-col items-center gap-2 text-center',
            !prefersReducedMotion && 'animate-slideInUp',
          )}
          style={
            !prefersReducedMotion
              ? {
                  animationDuration: '400ms',
                }
              : undefined
          }
        >
          <Trophy className="w-8 h-8 text-bg mb-2" />
          <p className="text-bg font-extrabold text-xl">¡Nuevo récord!</p>
          <p className="text-bg/80 text-sm">{exercise}</p>
          <p className="text-bg font-extrabold text-2xl mt-1">
            {value} {unit}
          </p>
        </div>
      </div>
    </>
  )
}
