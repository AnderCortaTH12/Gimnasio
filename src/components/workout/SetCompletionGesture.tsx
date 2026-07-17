import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGesture } from '@use-gesture/react'

interface Props {
  children: React.ReactNode
  onComplete: () => void
  onUndo: () => void
}

export function SetCompletionGesture({
  children,
  onComplete,
  onUndo,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const bind = useGesture({
    onDrag: ({ offset: [ox], direction: [dx], down }: any) => {
      setIsDragging(down ?? false)
      setDragX(ox)

      if (!down && ox !== 0) {
        if (ox > 100 && dx > 0) {
          onComplete()
          setDragX(0)
        } else if (ox < -100 && dx < 0) {
          onUndo()
          setDragX(0)
        } else {
          setDragX(0)
        }
      }
    },
  })

  const dragPercent = Math.abs(dragX) / (window.innerWidth / 2)
  const isRightSwipe = dragX > 50
  const isLeftSwipe = dragX < -50

  return (
    <div ref={containerRef} className="relative w-full">
      <motion.div
        animate={{
          x: dragX,
          opacity: 1 - dragPercent * 0.3,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        {...(bind() as any)}
      >
        {/* Indicador de acción a la derecha (completar) */}
        <AnimatePresence>
          {isRightSwipe && (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: -20 }}
              exit={{ opacity: 0, x: -40 }}
              className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
            >
              <div className="flex items-center gap-2 text-pr font-bold text-sm">
                <span>✓ Completar</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de acción a la izquierda (atrás) */}
        <AnimatePresence>
          {isLeftSwipe && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 20 }}
              exit={{ opacity: 0, x: 40 }}
              className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
            >
              <div className="flex items-center gap-2 text-warn font-bold text-sm">
                <span>↺ Atrás</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <div className="relative z-10 bg-surface">{children}</div>
      </motion.div>
    </div>
  )
}
