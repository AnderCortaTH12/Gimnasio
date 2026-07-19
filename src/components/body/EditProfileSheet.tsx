import { useEffect, useState } from 'react'
import type { UserProfile, TrainingGoal } from '../../types'
import { actualizarPerfil, guardarMedida, ultimaMedida } from '../../db/db'
import { Sheet, Field, TextInput, SegmentedControl, Button } from '../ui'

interface Props {
  open: boolean
  onClose: () => void
  profile?: UserProfile
  /** Peso actual conocido (última medida de peso), para precargar. */
  pesoActual?: number
  onSaved?: () => void
}

/** Convierte un número a string para el input (vacío si undefined). */
const s = (n?: number) => (n === undefined ? '' : String(n))
/** Convierte el string de un input a número o undefined. */
const n = (v: string): number | undefined => {
  const x = Number(v)
  return v.trim() === '' || Number.isNaN(x) ? undefined : x
}

/** Hoja de edición de los datos personales del perfil. */
export function EditProfileSheet({
  open,
  onClose,
  profile,
  pesoActual,
  onSaved,
}: Props) {
  const [name, setName] = useState('')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [edad, setEdad] = useState('')
  const [sexo, setSexo] = useState<UserProfile['sex']>()
  const [objetivo, setObjetivo] = useState<TrainingGoal>()

  // Precarga el formulario al abrir.
  useEffect(() => {
    if (!open) return
    setName(profile?.name ?? '')
    setPeso(s(pesoActual))
    setAltura(s(profile?.heightCm))
    setEdad(s(profile?.age))
    setSexo(profile?.sex)
    setObjetivo(profile?.trainingGoal)
  }, [open, profile, pesoActual])

  const guardar = async () => {
    await actualizarPerfil({
      name: name.trim() || undefined,
      heightCm: n(altura),
      age: n(edad),
      sex: sexo,
      trainingGoal: objetivo,
    })
    // Si se indicó un peso y difiere del último registrado, lo guarda como medida.
    const nuevoPeso = n(peso)
    if (nuevoPeso !== undefined) {
      const ultimo = await ultimaMedida('peso')
      if (!ultimo || ultimo.value !== nuevoPeso) {
        await guardarMedida({
          type: 'peso',
          value: nuevoPeso,
          date: new Date().toISOString(),
        })
      }
    }
    onSaved?.()
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Editar perfil">
      <div className="flex flex-col gap-4">
        <Field label="Nombre">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            data-testid="input-nombre"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso actual (kg)" hint="Se registra en tu historial">
            <TextInput
              type="number"
              inputMode="decimal"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="0"
              data-testid="input-peso"
            />
          </Field>
          <Field label="Altura (cm)">
            <TextInput
              type="number"
              inputMode="numeric"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              placeholder="0"
              data-testid="input-altura"
            />
          </Field>
        </div>

        <Field label="Edad">
          <TextInput
            type="number"
            inputMode="numeric"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            placeholder="años"
            data-testid="input-edad"
          />
        </Field>

        <Field label="Sexo">
          <SegmentedControl
            value={sexo}
            onChange={setSexo}
            options={[
              { value: 'hombre', label: 'Hombre' },
              { value: 'mujer', label: 'Mujer' },
              { value: 'otro', label: 'Otro' },
            ]}
          />
        </Field>

        <Field label="Objetivo">
          <SegmentedControl
            value={objetivo}
            onChange={setObjetivo}
            options={[
              { value: 'fuerza', label: 'Fuerza' },
              { value: 'hipertrofia', label: 'Hipertrofia' },
              { value: 'mantenimiento', label: 'Mantener' },
            ]}
          />
        </Field>

        <Button fullWidth size="lg" onClick={guardar} data-testid="btn-guardar-perfil">
          Guardar cambios
        </Button>
      </div>
    </Sheet>
  )
}
