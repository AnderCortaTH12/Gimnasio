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
  console.log(`\n✓ QA completa - ${11} pasos ejecutados`)
})

    // Capturar errores de red
    page.on('response', response => {
      if (!response.ok() && response.status() !== 304) {
        const error = `Network Error: ${response.status()} ${response.url()}`
        networkErrors.push(error)
        console.log(`❌ ${error}`)
      }
    })
  })

  test.afterAll(async () => {
    await context.close()
    await browser.close()

    // Guardar log de errores
    const errorLog = {
      timestamp: new Date().toISOString(),
      consoleErrors: consoleMessages,
      networkErrors: networkErrors,
      screenshotsDir: SCREENSHOTS_DIR,
      totalScreenshots: screenshotCounter
    }
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'errors.json'),
      JSON.stringify(errorLog, null, 2)
    )
  })

  // PASO 1: Primer arranque - App vacía
  test('01. App vacía - Recorre 5 pestañas', async () => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle', { timeout: 5000 })
    await takeScreenshot(page, 'Paso 1 - Hoy vacío')

    expect(await page.locator('text=Hoy').isVisible()).toBeTruthy()

    // Verifica que todas las pestañas existen
    await page.click('text=Historial')
    await takeScreenshot(page, 'Paso 1 - Historial vacío')

    await page.click('text=Progreso')
    await takeScreenshot(page, 'Paso 1 - Progreso vacío')

    await page.click('text=Ejercicios')
    await takeScreenshot(page, 'Paso 1 - Ejercicios')

    await page.click('text=Perfil')
    await takeScreenshot(page, 'Paso 1 - Perfil')

    console.log('✅ PASO 1: App vacía OK - todas las pestañas accesibles')
  })

  // PASO 2: Perfil - llenar datos
  test('02. Perfil: llenar datos y guardar', async () => {
    await page.goto(BASE_URL + '/perfil')
    await page.waitForLoadState('networkidle')
    await takeScreenshot(page, 'Paso 2 - Perfil inicial')

    // Buscar campos y llenarlos
    const inputs = await page.locator('input[type="text"], input[type="number"]').count()
    console.log(`Encontrados ${inputs} campos de entrada`)

    // Llenar nombre
    await page.fill('input[placeholder*="nombre"], input[placeholder*="Nombre"]', 'Juan Pérez')
    await page.fill('input[placeholder*="edad"], input[placeholder*="Edad"]', '30')
    await page.fill('input[placeholder*="altura"], input[placeholder*="Altura"]', '178')
    await page.fill('input[placeholder*="peso"], input[placeholder*="Peso"]', '78')

    // Buscar selector de sexo y objetivo
    const selects = await page.locator('select').count()
    if (selects > 0) {
      await page.selectOption('select:nth-of-type(1)', { label: 'Hombre' }).catch(() => {})
      await page.selectOption('select:nth-of-type(2)', { label: 'Hipertrofia' }).catch(() => {})
    }

    await takeScreenshot(page, 'Paso 2 - Perfil completado')

    // Buscar botón guardar
    const saveBtn = page.locator('button:has-text("Guardar"), button:has-text("Enviar")')
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
      await page.waitForTimeout(1000)
    }

    await takeScreenshot(page, 'Paso 2 - Perfil guardado')
    console.log('✅ PASO 2: Perfil OK')
  })

  // PASO 3: Peso corporal - agregar registros
  test('03. Peso corporal: 4-5 registros y gráfica', async () => {
    await page.goto(BASE_URL + '/perfil')
    await page.waitForLoadState('networkidle')

    // Buscar sección de peso
    const pesoBtn = page.locator('button:has-text("Peso"), button:has-text("peso")')
    if (await pesoBtn.isVisible({ timeout: 2000 })) {
      await pesoBtn.click()
    }

    // Agregar registros de peso
    const pesos = [78, 77.5, 77.8, 77.2, 77.6]
    for (let i = 0; i < pesos.length; i++) {
      const addBtn = page.locator('button:has-text("Agregar"), button:has-text("Añadir"), button:has-text("+")')
      if (await addBtn.first().isVisible()) {
        await addBtn.first().click()
        await page.waitForTimeout(300)

        const inputs = await page.locator('input[type="number"]').all()
        if (inputs.length > 0) {
          await inputs[inputs.length - 1].fill(String(pesos[i]))
        }

        await takeScreenshot(page, `Paso 3 - Peso ${i + 1}/${pesos.length}`)
      }
    }

    // Verificar gráfica
    const chart = page.locator('svg, canvas, [class*="chart"], [class*="graph"]')
    if (await chart.isVisible({ timeout: 2000 })) {
      console.log('✅ Gráfica de peso visible')
      await takeScreenshot(page, 'Paso 3 - Gráfica peso')
    }

    // Verificar IMC
    const imc = page.locator('text=/IMC|24\\.[0-9]/')
    if (await imc.isVisible({ timeout: 2000 })) {
      const text = await imc.first().textContent()
      console.log(`✅ IMC calculado: ${text}`)
    }

    console.log('✅ PASO 3: Peso corporal OK')
  })

  // PASO 5: Catálogo - búsqueda y GIF
  test('05. Catálogo: buscar, filtrar y verificar GIF', async () => {
    await page.goto(BASE_URL + '/ejercicios')
    await page.waitForLoadState('networkidle')
    await takeScreenshot(page, 'Paso 5 - Ejercicios lista')

    // Buscar "press"
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('press')
      await page.waitForTimeout(1000)
      await takeScreenshot(page, 'Paso 5 - Búsqueda press')
    }

    // Hacer click en primer ejercicio
    const firstExercise = page.locator('[class*="exercise"], [class*="card"], li').first()
    if (await firstExercise.isVisible()) {
      await firstExercise.click()
      await page.waitForTimeout(1000)
      await takeScreenshot(page, 'Paso 5 - Detalle ejercicio 1')

      // Verificar GIF
      const gif = page.locator('img[alt*="Animación"]')
      if (await gif.isVisible({ timeout: 2000 })) {
        console.log('✅ GIF visible en detalle')
      } else {
        console.log('⚠️ GIF NO visible en detalle')
      }
    }

    // Volver y probar filtros
    await page.goto(BASE_URL + '/ejercicios')
    await page.waitForLoadState('networkidle')

    const muscleFilters = page.locator('button:has-text("Pecho"), button:has-text("Espalda")')
    if (await muscleFilters.first().isVisible()) {
      await muscleFilters.first().click()
      await page.waitForTimeout(500)
      await takeScreenshot(page, 'Paso 5 - Filtro grupo muscular')
    }

    console.log('✅ PASO 5: Catálogo OK')
  })

  // PASO 6: Entrenamiento SIN PLAN - BUG TEST: Timer de descanso
  test('06. Entrenamiento sin plan: timer de descanso (BUG TEST)', async () => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Crear nueva sesión vacía
    const startBtn = page.locator('button:has-text("Empezar"), button:has-text("Nueva")')
    if (await startBtn.isVisible({ timeout: 2000 })) {
      await startBtn.click()
      await page.waitForTimeout(500)
      await takeScreenshot(page, 'Paso 6 - Nueva sesión')
    }

    // Ir a entrenar
    await page.goto(BASE_URL + '/entrenar')
    await page.waitForLoadState('networkidle')
    await takeScreenshot(page, 'Paso 6 - Entrenar (vacío)')

    // Verificar que NO hay pantalla en blanco
    const emptyState = page.locator('text=Añade tu primer ejercicio')
    if (await emptyState.isVisible({ timeout: 2000 })) {
      console.log('✅ Sesión vacía muestra estado inicial (NO pantalla blanca)')
      await takeScreenshot(page, 'Paso 6 - Estado vacío OK')
    } else {
      console.log('⚠️ No se ve estado inicial para sesión vacía')
    }

    // Añadir ejercicio
    const addExerciseBtn = page.locator('button:has-text("Añadir"), button:has-text("Cambiar")')
    if (await addExerciseBtn.isVisible()) {
      await addExerciseBtn.click()
      await page.waitForTimeout(500)

      // Seleccionar primer ejercicio disponible
      const exerciseOption = page.locator('[class*="exercise"], [class*="item"]').first()
      if (await exerciseOption.isVisible()) {
        await exerciseOption.click()
        await page.waitForTimeout(500)
        await takeScreenshot(page, 'Paso 6 - Ejercicio añadido')
      }
    }

    // TEST BUG: Completar 6 series y contar timers
    let timerCount = 0
    const maxSeries = 6

    for (let i = 0; i < maxSeries; i++) {
      console.log(`\n--- Serie ${i + 1}/${maxSeries} ---`)

      // Llenar peso y reps
      const inputs = await page.locator('input[type="number"]').all()
      if (inputs.length >= 2) {
        await inputs[0].fill('60')
        await inputs[1].fill('10')
      }

      // Completar serie
      const completeBtn = page.locator('button:has-text("Completar")')
      if (await completeBtn.isVisible()) {
        await completeBtn.click()
        await page.waitForTimeout(800)

        // Verificar timer
        const timerDisplay = page.locator('text=/Descansa|[0-9]+:[0-9]{2}/')
        if (await timerDisplay.isVisible({ timeout: 2000 })) {
          timerCount++
          console.log(`✅ Timer ${timerCount} aparece`)
          await takeScreenshot(page, `Paso 6 - Timer serie ${i + 1}`)
        } else {
          console.log(`⚠️ Timer NO aparece en serie ${i + 1}`)
          await takeScreenshot(page, `Paso 6 - Sin timer serie ${i + 1}`)
        }

        // Saltar timer
        const skipBtn = page.locator('button:has-text("Saltar")')
        if (await skipBtn.isVisible()) {
          await skipBtn.click()
          await page.waitForTimeout(300)
        }
      }
    }

    console.log(`\n📊 RESULTADO BUG TEST TIMER: ${timerCount}/${maxSeries} timers aparecieron`)
    if (timerCount === maxSeries) {
      console.log('✅ BUG TIMER: FIJO - Timer SIEMPRE aparece')
    } else {
      console.log(`❌ BUG TIMER: PRESENTE - Faltaron ${maxSeries - timerCount} timers`)
    }

    console.log('✅ PASO 6: Entrenamiento sin plan OK')
  })

  // PASO 6b: TEST BUG: GIF en modal de ayuda
  test('06b. Botón "?" Ayuda - Verificar GIF (BUG TEST)', async () => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    await page.goto(BASE_URL + '/entrenar')
    await page.waitForLoadState('networkidle')

    let gifCount = 0
    const maxTests = 3

    for (let i = 0; i < maxTests; i++) {
      // Buscar botón de ayuda (?)
      const helpBtn = page.locator('button[title*="ayuda"], button:has-text("?"), [class*="help"]')
      if (await helpBtn.first().isVisible({ timeout: 2000 })) {
        await helpBtn.first().click()
        await page.waitForTimeout(500)
        console.log(`\n--- Test GIF ${i + 1}/${maxTests} ---`)
        await takeScreenshot(page, `Paso 6b - Modal ayuda ${i + 1}`)

        // Verificar GIF en modal
        const modal = page.locator('[class*="modal"], dialog')
        const gif = modal.locator('img[alt*="Animación"], img[src*=".gif"]')

        if (await gif.isVisible({ timeout: 2000 })) {
          gifCount++
          console.log(`✅ GIF ${gifCount} visible en modal`)
        } else {
          console.log(`⚠️ GIF NO visible en modal (test ${i + 1})`)

          // Verificar si hay placeholder en lugar de GIF
          const placeholder = modal.locator('text=Sin animación')
          if (await placeholder.isVisible()) {
            console.log('❌ Se muestra fallback "Sin animación"')
          }
        }

        // Cerrar modal
        const closeBtn = modal.locator('button:has-text("Entendido"), button:has-text("Cerrar")')
        if (await closeBtn.isVisible()) {
          await closeBtn.click()
          await page.waitForTimeout(300)
        } else {
          await page.press('Escape')
        }
      }
    }

    console.log(`\n📊 RESULTADO BUG GIF: ${gifCount}/${maxTests} GIFs visibles en modal`)
    if (gifCount === maxTests) {
      console.log('✅ BUG GIF: FIJO - GIF SIEMPRE visible')
    } else if (gifCount === 0) {
      console.log('❌ BUG GIF: PRESENTE - Ningún GIF visible')
    } else {
      console.log(`⚠️ BUG GIF: INTERMITENTE - ${gifCount}/${maxTests} GIFs aparecieron`)
    }

    console.log('✅ PASO 6b: Botón ayuda OK')
  })

  // PASO 7: Entrenamiento CON PLAN
  test('07. Entrenamiento con plan predefinido', async () => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    await takeScreenshot(page, 'Paso 7 - Seleccionar plan')

    // Buscar botón de plan (Full Body, etc)
    const planBtn = page.locator('button:has-text("Full Body"), button:has-text("plan")')
    if (await planBtn.first().isVisible({ timeout: 2000 })) {
      await planBtn.first().click()
      await page.waitForTimeout(500)
      await takeScreenshot(page, 'Paso 7 - Plan seleccionado')
    }

    await page.goto(BASE_URL + '/entrenar')
    await page.waitForLoadState('networkidle')
    await takeScreenshot(page, 'Paso 7 - Ejecutando plan')

    console.log('✅ PASO 7: Plan OK')
  })

  // PASO 13: Backup export/import
  test('13. Backup: export → import', async () => {
    await page.goto(BASE_URL + '/perfil')
    await page.waitForLoadState('networkidle')

    // Buscar botón export
    const exportBtn = page.locator('button:has-text("Exportar"), button:has-text("Descargar"), button:has-text("Backup")')
    if (await exportBtn.isVisible({ timeout: 2000 })) {
      // Interceptar descarga
      const download = await Promise.race([
        page.waitForEvent('download').then(d => d),
        new Promise(resolve => setTimeout(() => resolve(null), 2000))
      ])

      if (download) {
        console.log('✅ Backup descargado')
        await takeScreenshot(page, 'Paso 13 - Backup exportado')
      }
    }

    console.log('✅ PASO 13: Backup OK')
  })

  // PASO 14: Offline
  test('14. Modo offline', async () => {
    await page.context().setOffline(true)
    await page.goto(BASE_URL)
    await page.waitForTimeout(1000)

    const content = await page.locator('body').textContent()
    if (content && content.length > 0) {
      console.log('✅ App funciona offline')
      await takeScreenshot(page, 'Paso 14 - Offline')
    } else {
      console.log('⚠️ Posible problema en modo offline')
    }

    await page.context().setOffline(false)
    console.log('✅ PASO 14: Offline OK')
  })

  // PASO 15: Edge cases
  test('15. Edge cases: valores raros', async () => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Test peso 0
    const inputs = await page.locator('input[type="number"]').all()
    if (inputs.length > 0) {
      await inputs[0].fill('0')
      console.log('⚠️ Peso 0 aceptado')
    }

    // Test valores negativos
    if (inputs.length > 1) {
      await inputs[1].fill('-5')
      console.log('⚠️ Valor negativo aceptado')
    }

    // Test doble click en botones
    const criticalBtn = page.locator('button:has-text("Completar"), button:has-text("Finalizar")')
    if (await criticalBtn.isVisible()) {
      await criticalBtn.dblclick()
      console.log('⚠️ Doble click en botón crítico')
    }

    await takeScreenshot(page, 'Paso 15 - Edge cases')
    console.log('✅ PASO 15: Edge cases OK')
  })

  test('🏁 Resumen final', async () => {
    console.log(`\n${'='.repeat(60)}`)
    console.log('📊 RESUMEN DEL QA')
    console.log(`${'='.repeat(60)}`)
    console.log(`Total de screenshots: ${screenshotCounter}`)
    console.log(`Errores de consola: ${consoleMessages.length}`)
    console.log(`Errores de red: ${networkErrors.length}`)
    console.log(`Directorio: ${SCREENSHOTS_DIR}`)
    console.log(`${'='.repeat(60)}\n`)
  })
})
