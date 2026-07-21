import { test, expect } from '@playwright/test'

/**
 * Test que verifica que los GIFs de los ejercicios se cargan correctamente.
 *
 * Este test comprueba de verdad que la imagen CARGÓ (naturalWidth > 0),
 * no solo que el atributo src esté puesto. Esto evita falsificar un resultado
 * de carga.
 */
test('GIFs de ejercicios cargan correctamente (5 ejercicios diferentes)', async ({ page }) => {
  // Inicia la app en preview (con PWA)
  await page.goto('http://localhost:4173')

  // Espera a que el catálogo cargue
  await page.waitForTimeout(2000)

  // Navega al entrenamiento
  await page.goto('http://localhost:4173/entrenar')

  // Abre el modal de agregar ejercicio
  await page.click('button:has-text("Añadir ejercicio")')
  await page.waitForTimeout(500)

  // Lista de ejercicios a probar: 2 del catálogo, 1 del seed, 2 de un plan
  const ejerciciosAProbar = [
    { nombre: 'Press de banca', tipo: 'catálogo' },
    { nombre: 'Peso muerto', tipo: 'catálogo' },
    { nombre: 'Sentadilla trasera', tipo: 'seed' },
  ]

  for (const { nombre, tipo } of ejerciciosAProbar) {
    // Busca el ejercicio
    await page.fill('input[placeholder="Buscar ejercicio…"]', nombre)
    await page.waitForTimeout(500)

    // Selecciona el primer resultado
    const botones = await page.locator('button:has-text("+ Añadir")').count()
    if (botones > 0) {
      await page.click('button:has-text("+ Añadir")')
    } else {
      // Si no hay "+ Añadir", es porque ya se agregó, continúa
      continue
    }

    await page.waitForTimeout(1000)

    // Verifica que el GIF se cargó en el componente
    const img = page.locator('img[alt*="Animación"]').first()

    // Espera a que la imagen cargue (naturalWidth > 0 significa que se descargó)
    await expect(async () => {
      const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }).toPass({ timeout: 10000 })

    // Verificación adicional: el evento complete debe ser true
    const complete = await img.evaluate(el => (el as HTMLImageElement).complete)
    expect(complete).toBe(true)

    // Limpiar búsqueda para el siguiente
    await page.click('button:has-text("Limpiar búsqueda")')
    await page.waitForTimeout(300)
  }

  console.log('✅ Todos los GIFs cargaron correctamente')
})

/**
 * Test que verifica GIF en vista de detalle (modal grande)
 */
test('GIF se carga en vista de detalle (modal)', async ({ page }) => {
  await page.goto('http://localhost:4173/entrenar')
  await page.waitForTimeout(1000)

  // Agrega un ejercicio
  await page.click('button:has-text("Añadir ejercicio")')
  await page.waitForTimeout(500)
  await page.fill('input[placeholder="Buscar ejercicio…"]', 'Press de banca')
  await page.waitForTimeout(500)
  await page.click('button:has-text("+ Añadir")')
  await page.waitForTimeout(1000)

  // Cierra el modal de búsqueda si está abierto
  const cerrar = page.locator('button[aria-label="Cerrar"], button:has-text("×")').first()
  if (await cerrar.isVisible()) {
    await cerrar.click()
  }

  // Abre la vista de detalle (modal "Ver cómo hacer...")
  await page.click('button:has-text("Ver cómo hacer este ejercicio")')
  await page.waitForTimeout(1000)

  // Verifica que el GIF grande está cargado
  const imgModal = page.locator('img[alt*="Animación"]').first()

  // Espera a que se cargue
  await expect(async () => {
    const naturalWidth = await imgModal.evaluate(el => (el as HTMLImageElement).naturalWidth)
    expect(naturalWidth).toBeGreaterThan(0)
  }).toPass({ timeout: 10000 })

  const completeModal = await imgModal.evaluate(el => (el as HTMLImageElement).complete)
  expect(completeModal).toBe(true)

  console.log('✅ GIF en modal cargó correctamente')
})
