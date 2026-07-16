import { useEffect, useRef, useState } from 'react'
import { Timer, Plus, X } from 'lucide-react'
import { useRestTimerStore } from '../store/restTimerStore'

/** Reproduce un pitido corto con Web Audio (sin ficheros externos). */
function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.55)
    osc.onended = () => ctx.close()
  } catch {
    /* silencioso si el navegador no lo permite */
  }
}

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/**
 * Barra flotante de descanso, fija sobre la tab bar. Cuenta atrás en tiempo
 * real y, al llegar a 0, avisa con pitido + vibración.
 */
export function RestTimerBar() {
  const { endsAt, totalSeconds, add, stop } = useRestTimerStore()
  const [remaining, setRemaining] = useState(0)
  const avisadoRef = useRef(false)

  useEffect(() => {
    if (endsAt === null) return
    avisadoRef.current = false

    const tick = () => {
      const rem = Math.max(0, Math.round((endsAt - Date.now()) / 1000))
      setRemaining(rem)
      if (rem <= 0 && !avisadoRef.current) {
        avisadoRef.current = true
        beep()
        navigator.vibrate?.([200, 100, 200])
        // Deja ver el 0:00 un instante y se cierra solo.
        window.setTimeout(() => stop(), 1200)
      }
    }

    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [endsAt, stop])

  if (endsAt === null) return null

  const pct = Math.max(0, Math.min(100, (remaining / totalSeconds) * 100))
  const terminado = remaining <= 0

  return (
    <div
      className="fixed inset-x-0 z-40 mx-auto max-w-md px-4"
      style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}
    >
      <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-black/40">
        {/* Barra de progreso */}
        <div className="h-1 w-full bg-white/5">
          <div
            className={
              'h-full transition-[width] duration-200 ' +
              (terminado ? 'bg-pr' : 'bg-lime')
            }
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Timer
            className={
              'h-5 w-5 shrink-0 ' + (terminado ? 'text-pr' : 'text-lime')
            }
          />
          <div className="flex-1">
            <span
              className={
                'text-xl font-extrabold tabular-nums ' +
                (terminado ? 'text-pr' : 'text-text')
              }
            >
              {terminado ? '¡Listo!' : fmt(remaining)}
            </span>
            <span className="ml-2 text-xs text-text/40">Descanso</span>
          </div>
          <button
            onClick={() => add(15)}
            className="flex items-center gap-0.5 rounded-full bg-white/5 px-2.5 py-1.5 text-xs font-bold text-text/80 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            15s
          </button>
          <button
            onClick={() => stop()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-text/60 active:scale-90"
            aria-label="Saltar descanso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
