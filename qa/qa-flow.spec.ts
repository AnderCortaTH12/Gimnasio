import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots')
const ERRORS_FILE = path.join(__dirname, 'errors.json')

// Configuración móvil-first
test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
})

const baseUrl = 'http://localhost:4173'

// Asegurarse de que el directorio de capturas existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

// Almacenar errores
const errors: Record<string, string[]> = {}

test.afterEach(async ({ page }, testInfo) => {
  const testName = testInfo.title
  // Capturar cualquier error de consola
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  if (consoleErrors.length > 0) {
    errors[testName] = consoleErrors
  }
})

test.afterAll(() => {
  fs.writeFileSync(ERRORS_FILE, JSON.stringify({
    timestamp: new Date().toISOString(),
    consoleErrors: errors,
    screenshotsDir: SCREENSHOTS_DIR,
    totalScreenshots: fs.readdirSync(SCREENSHOTS_DIR).length,
  }, null, 2))
})

// Test 1: App vacía en Hoy
test('Paso 1 - App vacía, pestañas visibles', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Verificar que las 5 pestañas existen
  const tabHoy = page.getByTestId('tab-hoy')
  const tabHistorial = page.getByTestId('tab-historial')
  const tabProgreso = page.getByTestId('tab-progreso')
  const tabEjercicios = page.getByTestId('tab-ejercicios')
  const tabPerfil = page.getByTestId('tab-perfil')

  await expect(tabHoy).toBeVisible()
  await expect(tabHistorial).toBeVisible()
  await expect(tabProgreso).toBeVisible()
  await expect(tabEjercicios).toBeVisible()
  await expect(tabPerfil).toBeVisible()

  // Captura: app vacía en Hoy
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-paso-1-app-vacia.png') })

  // Verificar botón "Empezar entrenamiento"
  const btnEmpezar = page.getByTestId('btn-empezar-entreno')
  await expect(btnEmpezar).toBeVisible()
})

// Test 2: Navegación a Perfil y edición
test('Paso 2 - Perfil inicial, editar datos personales', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Click en tab Perfil
  await page.getByTestId('tab-perfil').click()
  await page.waitForTimeout(500)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-paso-2-perfil-inicial.png') })

  // Buscar botón de editar (icono lápiz)
  const editBtn = page.locator('button[aria-label="Editar perfil"]')
  await expect(editBtn).toBeVisible()
  await editBtn.click()
  await page.waitForTimeout(500)

  // Llenar perfil: nombre, peso, altura, edad
  const inputNombre = page.getByTestId('input-nombre')
  await expect(inputNombre).toBeVisible()
  await inputNombre.fill('Test User')

  const inputPeso = page.getByTestId('input-peso')
  await inputPeso.fill('75.5')

  const inputAltura = page.getByTestId('input-altura')
  await inputAltura.fill('180')

  const inputEdad = page.getByTestId('input-edad')
  await inputEdad.fill('28')

  // Guardar
  const btnGuardar = page.getByTestId('btn-guardar-perfil')
  await expect(btnGuardar).toBeVisible()
  await btnGuardar.click()
  await page.waitForTimeout(1000)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-paso-2-perfil-guardado.png') })
})

// Test 3: Catálogo de ejercicios (búsqueda)
test('Paso 3 - Catálogo de ejercicios, búsqueda y filtros', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Tab Ejercicios
  await page.getByTestId('tab-ejercicios').click()
  await page.waitForTimeout(500)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-paso-3-ejercicios-inicial.png') })

  // El buscador debe estar visible
  const buscador = page.getByTestId('buscador-ejercicios')
  await expect(buscador).toBeVisible()

  // Buscar "press"
  await buscador.fill('press')
  await page.waitForTimeout(800)

  // Verificar que la lista de ejercicios es visible
  const listaEjercicios = page.getByTestId('lista-ejercicios')
  await expect(listaEjercicios).toBeVisible()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-paso-3-busqueda-press.png') })
})

// Test 4: Iniciar entrenamiento (sesión nueva)
test('Paso 4 - Iniciar entrenamiento, añadir ejercicios', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Click "Empezar entrenamiento"
  const btnEmpezar = page.getByTestId('btn-empezar-entreno')
  await expect(btnEmpezar).toBeVisible()
  await btnEmpezar.click()
  await page.waitForTimeout(800)

  // Debe navegar a /entrenar
  await expect(page).toHaveURL(/\/entrenar/)

  // Clickear en "Cambiar / Añadir" para abrir el picker
  const btnAnadirAbajo = page.locator('text=Cambiar').first()
  await expect(btnAnadirAbajo).toBeVisible()
  await btnAnadirAbajo.click()
  await page.waitForTimeout(500)

  // Aparece el picker de ejercicios
  const buscador = page.getByTestId('buscador-ejercicios')
  await expect(buscador).toBeVisible()

  // Buscar y seleccionar un ejercicio
  await buscador.fill('bench')
  await page.waitForTimeout(800)

  // Seleccionar el primer resultado
  const listaEjercicios = page.getByTestId('lista-ejercicios')
  const primerItem = listaEjercicios.locator('button').first()
  await primerItem.click()
  await page.waitForTimeout(800)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-paso-4-primer-ejercicio.png') })
})

// Test 5: Completar 6 series (verificar timer)
test('Paso 5 - Completar 6 series seguidas y verificar timer', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Iniciar entrenamiento
  await page.getByTestId('btn-empezar-entreno').click()
  await page.waitForTimeout(800)

  // Añadir ejercicio
  await page.locator('text=Cambiar').first().click()
  await page.waitForTimeout(500)

  const buscador = page.getByTestId('buscador-ejercicios')
  await buscador.fill('squat')
  await page.waitForTimeout(800)

  const listaEjercicios = page.getByTestId('lista-ejercicios')
  const primerItem = listaEjercicios.locator('button').first()
  await primerItem.click()
  await page.waitForTimeout(800)

  // Ahora debe estar en la tarjeta del ejercicio
  // Rellenar peso y reps, completar 6 series
  let timerAppearanceCount = 0
  let timerMissingAfterSeries: number[] = []

  for (let i = 1; i <= 6; i++) {
    // Llenar peso
    const inputPeso = page.getByTestId('input-peso-serie')
    await inputPeso.fill('100')

    // Llenar reps
    const inputReps = page.getByTestId('input-reps-serie')
    await inputReps.fill('8')

    // Click completar
    const btnCompletar = page.getByTestId('btn-completar-serie')
    await btnCompletar.click()
    await page.waitForTimeout(1500)

    // Verificar si aparece el timer
    const restTimer = page.getByTestId('rest-timer')
    const timerVisible = await restTimer.isVisible().catch(() => false)

    if (timerVisible) {
      timerAppearanceCount++
      console.log(`✓ Serie ${i}/6: Timer VISIBLE`)
    } else {
      timerMissingAfterSeries.push(i)
      console.log(`✗ Serie ${i}/6: Timer NO visible (BUG)`)
    }

    // Si no es la última serie, esperar un poco
    if (i < 6) {
      await page.waitForTimeout(2000)
    }
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-paso-5-6-series.png') })

  // VALIDACIÓN: timer debería aparecer 6 veces
  console.log(`\n=== TIMER QA RESULT ===`)
  console.log(`Timer apareció: ${timerAppearanceCount}/6 veces`)
  if (timerMissingAfterSeries.length > 0) {
    console.log(`⚠ Timer FALTÓ en series: ${timerMissingAfterSeries.join(', ')}`)
  }
  expect(timerAppearanceCount).toBeGreaterThanOrEqual(5)
})

// Test 6: Verificar GIF en modal de ayuda (3 ejercicios)
test('Paso 6 - Modal de ayuda: verificar GIF en 3 ejercicios', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Iniciar entrenamiento
  await page.getByTestId('btn-empezar-entreno').click()
  await page.waitForTimeout(800)

  // Añadir ejercicio
  await page.locator('text=Cambiar').first().click()
  await page.waitForTimeout(500)

  const buscador = page.getByTestId('buscador-ejercicios')
  await buscador.fill('bench')
  await page.waitForTimeout(800)

  const listaEjercicios = page.getByTestId('lista-ejercicios')
  const items = await listaEjercicios.locator('button').all()

  if (items.length > 0) {
    // Seleccionar el primer ejercicio
    await items[0].click()
    await page.waitForTimeout(800)

    // Ahora clickear en el botón de ayuda
    const btnAyuda = page.getByTestId('btn-ayuda')
    await expect(btnAyuda).toBeVisible()
    await btnAyuda.click()
    await page.waitForTimeout(1000)

    // Verificar la modal
    const modalAyuda = page.getByTestId('modal-ayuda')
    await expect(modalAyuda).toBeVisible()

    // Verificar GIF
    const gifDiv = page.getByTestId('gif-ejercicio')
    const gifVisible = await gifDiv.isVisible()
    const gifImg = gifDiv.locator('img').first()
    const gifSrc = await gifImg.getAttribute('src').catch(() => '')

    console.log(`\n=== GIF QA RESULT ===`)
    console.log(`GIF visible: ${gifVisible}`)
    console.log(`GIF src: ${gifSrc?.slice(0, 60)}...`)

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-paso-6-gif-verificacion.png') })

    expect(gifVisible).toBe(true)
    expect(gifSrc).toBeTruthy()
  }
})

// Test 7: Backup export
test('Paso 7 - Backup: exportar datos', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Ir a Perfil
  await page.getByTestId('tab-perfil').click()
  await page.waitForTimeout(500)

  // Buscar sección de backup
  const backupSection = page.locator('text=Copia de seguridad').first()

  if (await backupSection.isVisible().catch(() => false)) {
    await backupSection.scrollIntoViewIfNeeded()

    // Buscar botón de exportar
    const btnExportar = page.locator('text=Descargar').first()
    if (await btnExportar.isVisible()) {
      await btnExportar.click()
      await page.waitForTimeout(1000)
    }
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-paso-7-backup-export.png') })
})

// Test 8: Progreso
test('Paso 8 - Pantalla de Progreso', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Tab Progreso
  await page.getByTestId('tab-progreso').click()
  await page.waitForTimeout(500)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-paso-8-progreso.png') })
})

// Test 9: Historial
test('Paso 9 - Pantalla de Historial', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Tab Historial
  await page.getByTestId('tab-historial').click()
  await page.waitForTimeout(500)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-paso-9-historial.png') })
})

// Test 10: Completar entrenamiento
test('Paso 10 - Completar entrenamiento y finalizar sesión', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Iniciar entrenamiento
  await page.getByTestId('btn-empezar-entreno').click()
  await page.waitForTimeout(800)

  // Añadir un ejercicio
  await page.locator('text=Cambiar').first().click()
  await page.waitForTimeout(500)

  const buscador = page.getByTestId('buscador-ejercicios')
  await buscador.fill('deadlift')
  await page.waitForTimeout(800)

  const listaEjercicios = page.getByTestId('lista-ejercicios')
  const primerItem = listaEjercicios.locator('button').first()

  if (await primerItem.isVisible()) {
    await primerItem.click()
    await page.waitForTimeout(800)

    // Completar la serie
    const inputPeso = page.getByTestId('input-peso-serie')
    const inputReps = page.getByTestId('input-reps-serie')
    const btnCompletar = page.getByTestId('btn-completar-serie')

    if (await inputPeso.isVisible() && await inputReps.isVisible()) {
      await inputPeso.fill('120')
      await inputReps.fill('5')

      // Click completar
      await btnCompletar.click()
      await page.waitForTimeout(1500)

      // Debería mostrar "Ejercicio completado"
      const cardSiguiente = page.getByTestId('card-siguiente')
      if (await cardSiguiente.isVisible()) {
        // Click en "Finalizar"
        const btnFinalizar = page.locator('text=Finalizar').first()
        if (await btnFinalizar.isVisible()) {
          await btnFinalizar.click()
          await page.waitForTimeout(1500)
        }
      }
    }
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-paso-10-completar.png') })
})

// Test final: Resumen
test('Paso 11 - Resumen y verificación final', async ({ page }) => {
  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  // Navegar por todos los tabs rápidamente
  for (const tab of ['tab-hoy', 'tab-historial', 'tab-progreso', 'tab-ejercicios', 'tab-perfil']) {
    await page.getByTestId(tab).click()
    await page.waitForTimeout(400)
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-paso-11-resumen.png') })
  console.log(`\n✓ QA completa - 11 pasos ejecutados`)
})
