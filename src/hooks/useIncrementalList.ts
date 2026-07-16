import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Renderizado incremental para listas largas (1.000+): muestra una porción y
 * va ampliándola a medida que un "sentinela" entra en el viewport. Evita
 * montar miles de nodos (y miles de GIFs) de golpe, manteniendo el scroll de
 * página nativo. Alternativa ligera a react-window para este layout móvil.
 */
export function useIncrementalList<T>(
  items: T[],
  pageSize = 30,
  /** Contenedor con scroll propio (si la lista no usa el scroll de página). */
  root?: React.RefObject<HTMLElement | null>,
) {
  const [count, setCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Al cambiar la lista (p. ej. nueva búsqueda), vuelve al principio.
  useEffect(() => {
    setCount(pageSize)
  }, [items, pageSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setCount((c) => Math.min(c + pageSize, items.length))
        }
      },
      { root: root?.current ?? null, rootMargin: '400px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [items.length, pageSize, root])

  const visible = useMemo(() => items.slice(0, count), [items, count])
  const hayMas = count < items.length

  return { visible, hayMas, sentinelRef, total: items.length }
}
