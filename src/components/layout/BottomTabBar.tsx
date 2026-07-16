import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  History,
  TrendingUp,
  Dumbbell,
  User,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/cn'

interface Tab {
  to: string
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { to: '/', label: 'Hoy', icon: CalendarDays },
  { to: '/historial', label: 'Historial', icon: History },
  { to: '/progreso', label: 'Progreso', icon: TrendingUp },
  { to: '/ejercicios', label: 'Ejercicios', icon: Dumbbell },
  { to: '/perfil', label: 'Perfil', icon: User },
]

/** Barra de pestañas inferior fija (5 pestañas). Móvil-first. */
export function BottomTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/90 backdrop-blur-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className="group flex flex-col items-center gap-1 py-2.5"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-9 w-14 items-center justify-center rounded-full transition-all duration-200',
                      isActive
                        ? 'bg-lime/15 text-lime'
                        : 'text-text/45 group-active:scale-90',
                    )}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={isActive ? 2.6 : 2}
                      aria-hidden
                    />
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold transition-colors',
                      isActive ? 'text-lime' : 'text-text/45',
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
