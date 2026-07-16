import { Outlet, useLocation } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'

/**
 * Contenedor global móvil-first: área de contenido con scroll + tab bar fija.
 * La `key` por ruta reinicia la animación de entrada al cambiar de pestaña.
 */
export function AppLayout() {
  const location = useLocation()

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <main
        key={location.pathname}
        className="flex-1 animate-fade-in-up px-4 pb-28 pt-6"
      >
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
