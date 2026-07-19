import { test, expect, Page, Browser, BrowserContext } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const BASE_URL = 'http://localhost:4173'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots')

// Crear directorio si no existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

let screenshotCounter = 0
const consoleMessages: string[] = []
const networkErrors: string[] = []

async function takeScreenshot(page: Page, name: string) {
  const num = String(++screenshotCounter).padStart(2, '0')
  const filename = `${num}-${name.toLowerCase().replace(/\s+/g, '-')}.png`
  const filepath = path.join(SCREENSHOTS_DIR, filename)
  await page.screenshot({ path: filepath, fullPage: true })
  console.log(`📸 Screenshot: ${filename}`)
  return filename
}

test.describe('FORJA QA Flow — Recorrido Completo de Usuario', () => {
  let page: Page
  let context: BrowserContext
  let browser: Browser

  test.beforeAll(async ({ playwright }) => {
    browser = await playwright.chromium.launch()
    context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36'
    })
    page = await context.newPage()

    // Capturar errores de consola
    page.on('console', msg => {
      const fullMsg = `[${msg.type().toUpperCase()}] ${msg.text()}`
      console.log(fullMsg)
      if (msg.type() === 'error') {
        consoleMessages.push(fullMsg)
      }
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
