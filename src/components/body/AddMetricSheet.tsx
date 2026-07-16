import { useEffect, useState } from 'react'
import type { BodyMetricType } from '../../types'
import { guardarMedida } from '../../db/db'
import { METRIC_META, TIPOS_MEDIDA } from '../../data/metrics'
import { Sheet, Field, TextInput, Button } from '../ui'
import { cn } from '../../lib/cn'

interface Props {
  open: boolean
  onClose: () => void
  /** Si se fija, el tipo no es editable (p. ej. registrar peso). */
  fixedType?: BodyMetricType
  /** Se llama tras guardar con éxito. */
  onSaved?: () => void
}

/** Fecha de hoy en formato yyyy-mm-dd para el input date. */
const hoyInput = () => new Date().toISOString().slice(0, 10)

/** Hoja para registrar una nueva medida corporal con fecha. */
export function AddMetricSheet({ open, onClose, fixedType, onSaved }: Props) {
  const [type, setType] = useState<BodyMetricType>(fixedType ?? 'peso')
  const [value, setValue] = useState('')
  const [fecha, setFecha] = useState(hoyInput())
  const [notes, setNotes] = useState('')

  // Al abrir, resetea el formulario.
  useEffect(() => {
    if (open) {
      setType(fixedType ?? 'peso')
      setValue('')
      setFecha(hoyInput())
      setNotes('')
    }
  }, [open, fixedType])

  const meta = METRIC_META[type]
  const num = Number(value)
  const valido = value !== '' && !Number.isNaN(num) && num > 0

  const guardar = async () => {
    if (!valido) return
    await guardarMedida({
      type,
      value: num,
      // Guarda a mediodía para evitar saltos de día por zona horaria.
      date: new Date(`${fecha}T12:00:00`).toISOString(),
      notes: notes.trim() || undefined,
    })
    onSaved?.()
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={fixedType ? `Registrar ${meta.label.toLowerCase()}` : 'Nueva medida'}
    >
      <div className="flex flex-col gap-4">
        {!fixedType && (
          <Field label="Tipo de medida">
            <div className="flex flex-wrap gap-1.5">
              {TIPOS_MEDIDA.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95',
                    type === t
                      ? 'border-lime bg-lime text-bg'
                      : 'border-border bg-surface text-text/70',
                  )}
                >
                  {METRIC_META[t].label}
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field label={`Valor (${meta.unit})`}>
          <TextInput
            type="number"
            inputMode="decimal"
            step="0.1"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`0 ${meta.unit}`}
          />
        </Field>

        <Field label="Fecha">
          <TextInput
            type="date"
            value={fecha}
            max={hoyInput()}
            onChange={(e) => setFecha(e.target.value)}
          />
        </Field>

        <Field label="Nota (opcional)">
          <TextInput
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="p. ej. en ayunas"
          />
        </Field>

        <Button fullWidth size="lg" disabled={!valido} onClick={guardar}>
          Guardar medida
        </Button>
      </div>
    </Sheet>
  )
}
