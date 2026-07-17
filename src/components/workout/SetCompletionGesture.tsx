import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [dragX, setDragX] = useState(0)

  const handleDragEnd = (info: any) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    // Umbral: >80px de arrastre O velocidad alta (>500px/s)
    if (offset > 80 || (offset > 30 && velocity > 500)) {
      onComplete()
    } else if (offset < -80 || (offset < -30 && velocity < -500)) {
      onUndo()
    }
  }

  const isRightSwipe = dragX > 50
  const isLeftSwipe = dragX < -50

  return (
    <motion.div
      drag="x"
      dragElastic={0.2}
      dragConstraints={{ left: -300, right: 300 }}
      onDrag={(_, info) => setDragX(info.offset.x)}
      onDragEnd={handleDragEnd}
      animate={{ x: dragX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative w-full touch-none"
      style={{
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      {/* Indicador a la derecha (completar) */}
      <AnimatePresence>
        {isRightSwipe && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: -20 }}
            exit={{ opacity: 0, x: -40 }}
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"
          >
            <div className="flex items-center gap-2 text-pr font-bold text-sm">
              <span>✓ Completar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador a la izquierda (atrás) */}
      <AnimatePresence>
        {isLeftSwipe && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 20 }}
            exit={{ opacity: 0, x: 40 }}
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4"
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
  )
}
