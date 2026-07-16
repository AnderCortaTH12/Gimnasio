import { useRef, useState } from 'react'
import { Download, Upload, ShieldCheck } from 'lucide-react'
import {
  exportarDatos,
  importarDatos,
  esBackupValido,
} from '../../db/db'
import { Card, Button, SectionHeader, Toast, type ToastData } from '../ui'

/** Descarga un objeto como archivo JSON. */
function descargarJSON(data: unknown, nombre: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Sección de copia de seguridad: exportar e importar todos los datos. */
export function BackupSection() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<ToastData | null>(null)

  const exportar = async () => {
    try {
      setToast({ tone: 'loading', message: 'Preparando copia…' })
      const datos = await exportarDatos()
      const fecha = new Date().toISOString().slice(0, 10)
      descargarJSON(datos, `forja-backup-${fecha}.json`)
      const total =
        datos.sessions.length +
        datos.bodyMetrics.length +
        datos.profile.length
      setToast({
        tone: 'success',
        message: `Copia exportada (${total} registros).`,
      })
    } catch {
      setToast({ tone: 'error', message: 'No se pudo exportar.' })
    }
  }

  /** Abre el selector de archivo para importar. */
  const pedirArchivo = () => inputRef.current?.click()

  const alElegirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Permite volver a elegir el mismo archivo más adelante.
    e.target.value = ''
    if (!file) return

    try {
      const texto = await file.text()
      const data = JSON.parse(texto)
      if (!esBackupValido(data)) {
        setToast({
          tone: 'error',
          message: 'El archivo no es una copia válida de FORJA.',
        })
        return
      }
      const resumen =
        `${data.sessions.length} sesiones, ${data.bodyMetrics.length} medidas` +
        `${data.profile.length ? ' y perfil' : ''}`
      if (
        !window.confirm(
          `Se reemplazarán TODOS los datos actuales por los de la copia ` +
            `(${resumen}). Esta acción no se puede deshacer. ¿Continuar?`,
        )
      )
        return

      setToast({ tone: 'loading', message: 'Restaurando copia…' })
      await importarDatos(data)
      setToast({ tone: 'success', message: 'Datos restaurados correctamente.' })
    } catch {
      setToast({
        tone: 'error',
        message: 'Archivo inválido o corrupto.',
      })
    }
  }

  return (
    <>
      <SectionHeader title="Copia de seguridad" />
      <Card className="mb-3 flex flex-col gap-2.5">
        <Button
          fullWidth
          size="lg"
          leftIcon={<Download className="h-5 w-5" />}
          onClick={exportar}
        >
          Exportar datos
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="secondary"
          leftIcon={<Upload className="h-5 w-5" />}
          onClick={pedirArchivo}
        >
          Importar datos
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={alElegirArchivo}
        />
      </Card>

      {/* Aviso de seguridad */}
      <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-warn/20 bg-warn/5 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
        <p className="text-xs leading-relaxed text-text/60">
          Tus datos viven en el dispositivo. Exporta regularmente para tener
          copia de seguridad.
        </p>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
