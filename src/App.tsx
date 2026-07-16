import { Dumbbell } from 'lucide-react'

/**
 * Pantalla placeholder mínima del andamiaje inicial.
 * Todavía no hay funcionalidades: solo confirma que el stack arranca.
 */
function App() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex items-center gap-3">
        <Dumbbell className="h-8 w-8 text-lime" strokeWidth={2.5} aria-hidden />
        <h1 className="text-4xl font-black tracking-tight">FORJA</h1>
      </div>

      <p className="max-w-md text-sm text-text/60">
        Seguimiento de gimnasio personal. Andamiaje inicial listo — todavía sin
        funcionalidades.
      </p>

      <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-lime">
        Fase 0 · Andamiaje
      </span>
    </div>
  )
}

export default App
