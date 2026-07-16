import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

/**
 * Banner que avisa cuando hay una nueva versión de la app (service worker en
 * espera) y permite actualizar. También confirma cuando la app quedó lista para
 * usarse sin conexión.
 */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const cerrar = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div
      className="fixed inset-x-0 z-[80] mx-auto flex max-w-md justify-center px-4"
      style={{ bottom: 'calc(88px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex w-full animate-fade-in-up items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xl shadow-black/40">
        {needRefresh ? (
          <>
            <RefreshCw className="h-5 w-5 shrink-0 text-lime" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text">
                Actualización disponible
              </p>
              <p className="text-xs text-text/50">
                Hay una nueva versión de FORJA.
              </p>
            </div>
            <button
              onClick={() => updateServiceWorker(true)}
              className="shrink-0 rounded-lg bg-lime px-3 py-1.5 text-xs font-bold text-bg active:scale-95"
            >
              Actualizar
            </button>
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5 shrink-0 text-pr" />
            <p className="flex-1 text-sm font-medium text-text">
              Lista para usar sin conexión.
            </p>
          </>
        )}
        <button
          onClick={cerrar}
          aria-label="Cerrar"
          className="shrink-0 text-text/40 active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
