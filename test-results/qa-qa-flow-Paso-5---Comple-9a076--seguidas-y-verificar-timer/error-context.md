# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa\qa-flow.spec.ts >> Paso 5 - Completar 6 series seguidas y verificar timer
- Location: qa\qa-flow.spec.ts:181:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('input-peso-serie')

```

# Test source

```ts
  110 |   await expect(btnGuardar).toBeVisible()
  111 |   await btnGuardar.click()
  112 |   await page.waitForTimeout(1000)
  113 | 
  114 |   await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-paso-2-perfil-guardado.png') })
  115 | })
  116 | 
  117 | // Test 3: Catálogo de ejercicios (búsqueda)
  118 | test('Paso 3 - Catálogo de ejercicios, búsqueda y filtros', async ({ page }) => {
  119 |   await page.goto(baseUrl)
  120 |   await page.waitForLoadState('networkidle')
  121 | 
  122 |   // Tab Ejercicios
  123 |   await page.getByTestId('tab-ejercicios').click()
  124 |   await page.waitForTimeout(500)
  125 | 
  126 |   await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-paso-3-ejercicios-inicial.png') })
  127 | 
  128 |   // El buscador debe estar visible
  129 |   const buscador = page.getByTestId('buscador-ejercicios')
  130 |   await expect(buscador).toBeVisible()
  131 | 
  132 |   // Buscar "press"
  133 |   await buscador.fill('press')
  134 |   await page.waitForTimeout(800)
  135 | 
  136 |   // Verificar que la lista de ejercicios es visible
  137 |   const listaEjercicios = page.getByTestId('lista-ejercicios')
  138 |   await expect(listaEjercicios).toBeVisible()
  139 | 
  140 |   await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-paso-3-busqueda-press.png') })
  141 | })
  142 | 
  143 | // Test 4: Iniciar entrenamiento (sesión nueva)
  144 | test('Paso 4 - Iniciar entrenamiento, añadir ejercicios', async ({ page }) => {
  145 |   await page.goto(baseUrl)
  146 |   await page.waitForLoadState('networkidle')
  147 | 
  148 |   // Click "Empezar entrenamiento"
  149 |   const btnEmpezar = page.getByTestId('btn-empezar-entreno')
  150 |   await expect(btnEmpezar).toBeVisible()
  151 |   await btnEmpezar.click()
  152 |   await page.waitForTimeout(800)
  153 | 
  154 |   // Debe navegar a /entrenar
  155 |   await expect(page).toHaveURL(/\/entrenar/)
  156 | 
  157 |   // Clickear en "Cambiar / Añadir" para abrir el picker
  158 |   const btnAnadirAbajo = page.locator('text=Cambiar').first()
  159 |   await expect(btnAnadirAbajo).toBeVisible()
  160 |   await btnAnadirAbajo.click()
  161 |   await page.waitForTimeout(500)
  162 | 
  163 |   // Aparece el picker de ejercicios
  164 |   const buscador = page.getByTestId('buscador-ejercicios')
  165 |   await expect(buscador).toBeVisible()
  166 | 
  167 |   // Buscar y seleccionar un ejercicio
  168 |   await buscador.fill('bench')
  169 |   await page.waitForTimeout(800)
  170 | 
  171 |   // Seleccionar el primer resultado
  172 |   const listaEjercicios = page.getByTestId('lista-ejercicios')
  173 |   const primerItem = listaEjercicios.locator('button').first()
  174 |   await primerItem.click()
  175 |   await page.waitForTimeout(800)
  176 | 
  177 |   await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-paso-4-primer-ejercicio.png') })
  178 | })
  179 | 
  180 | // Test 5: Completar 6 series (verificar timer)
  181 | test('Paso 5 - Completar 6 series seguidas y verificar timer', async ({ page }) => {
  182 |   await page.goto(baseUrl)
  183 |   await page.waitForLoadState('networkidle')
  184 | 
  185 |   // Iniciar entrenamiento
  186 |   await page.getByTestId('btn-empezar-entreno').click()
  187 |   await page.waitForTimeout(800)
  188 | 
  189 |   // Añadir ejercicio
  190 |   await page.locator('text=Cambiar').first().click()
  191 |   await page.waitForTimeout(500)
  192 | 
  193 |   const buscador = page.getByTestId('buscador-ejercicios')
  194 |   await buscador.fill('squat')
  195 |   await page.waitForTimeout(800)
  196 | 
  197 |   const listaEjercicios = page.getByTestId('lista-ejercicios')
  198 |   const primerItem = listaEjercicios.locator('button').first()
  199 |   await primerItem.click()
  200 |   await page.waitForTimeout(800)
  201 | 
  202 |   // Ahora debe estar en la tarjeta del ejercicio
  203 |   // Rellenar peso y reps, completar 6 series
  204 |   let timerAppearanceCount = 0
  205 |   let timerMissingAfterSeries: number[] = []
  206 | 
  207 |   for (let i = 1; i <= 6; i++) {
  208 |     // Llenar peso
  209 |     const inputPeso = page.getByTestId('input-peso-serie')
> 210 |     await inputPeso.fill('100')
      |                     ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  211 | 
  212 |     // Llenar reps
  213 |     const inputReps = page.getByTestId('input-reps-serie')
  214 |     await inputReps.fill('8')
  215 | 
  216 |     // Click completar
  217 |     const btnCompletar = page.getByTestId('btn-completar-serie')
  218 |     await btnCompletar.click()
  219 |     await page.waitForTimeout(1500)
  220 | 
  221 |     // Verificar si aparece el timer
  222 |     const restTimer = page.getByTestId('rest-timer')
  223 |     const timerVisible = await restTimer.isVisible().catch(() => false)
  224 | 
  225 |     if (timerVisible) {
  226 |       timerAppearanceCount++
  227 |       console.log(`✓ Serie ${i}/6: Timer VISIBLE`)
  228 |     } else {
  229 |       timerMissingAfterSeries.push(i)
  230 |       console.log(`✗ Serie ${i}/6: Timer NO visible (BUG)`)
  231 |     }
  232 | 
  233 |     // Si no es la última serie, esperar un poco
  234 |     if (i < 6) {
  235 |       await page.waitForTimeout(2000)
  236 |     }
  237 |   }
  238 | 
  239 |   await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-paso-5-6-series.png') })
  240 | 
  241 |   // VALIDACIÓN: timer debería aparecer 6 veces
  242 |   console.log(`\n=== TIMER QA RESULT ===`)
  243 |   console.log(`Timer apareció: ${timerAppearanceCount}/6 veces`)
  244 |   if (timerMissingAfterSeries.length > 0) {
  245 |     console.log(`⚠ Timer FALTÓ en series: ${timerMissingAfterSeries.join(', ')}`)
  246 |   }
  247 |   expect(timerAppearanceCount).toBeGreaterThanOrEqual(5)
  248 | })
  249 | 
  250 | // Test 6: Verificar GIF en modal de ayuda (3 ejercicios)
  251 | test('Paso 6 - Modal de ayuda: verificar GIF en 3 ejercicios', async ({ page }) => {
  252 |   await page.goto(baseUrl)
  253 |   await page.waitForLoadState('networkidle')
  254 | 
  255 |   // Iniciar entrenamiento
  256 |   await page.getByTestId('btn-empezar-entreno').click()
  257 |   await page.waitForTimeout(800)
  258 | 
  259 |   // Añadir ejercicio
  260 |   await page.locator('text=Cambiar').first().click()
  261 |   await page.waitForTimeout(500)
  262 | 
  263 |   const buscador = page.getByTestId('buscador-ejercicios')
  264 |   await buscador.fill('bench')
  265 |   await page.waitForTimeout(800)
  266 | 
  267 |   const listaEjercicios = page.getByTestId('lista-ejercicios')
  268 |   const items = await listaEjercicios.locator('button').all()
  269 | 
  270 |   if (items.length > 0) {
  271 |     // Seleccionar el primer ejercicio
  272 |     await items[0].click()
  273 |     await page.waitForTimeout(800)
  274 | 
  275 |     // Ahora clickear en el botón de ayuda
  276 |     const btnAyuda = page.getByTestId('btn-ayuda')
  277 |     await expect(btnAyuda).toBeVisible()
  278 |     await btnAyuda.click()
  279 |     await page.waitForTimeout(1000)
  280 | 
  281 |     // Verificar la modal
  282 |     const modalAyuda = page.getByTestId('modal-ayuda')
  283 |     await expect(modalAyuda).toBeVisible()
  284 | 
  285 |     // Verificar GIF
  286 |     const gifDiv = page.getByTestId('gif-ejercicio')
  287 |     const gifVisible = await gifDiv.isVisible()
  288 |     const gifImg = gifDiv.locator('img').first()
  289 |     const gifSrc = await gifImg.getAttribute('src').catch(() => '')
  290 | 
  291 |     console.log(`\n=== GIF QA RESULT ===`)
  292 |     console.log(`GIF visible: ${gifVisible}`)
  293 |     console.log(`GIF src: ${gifSrc?.slice(0, 60)}...`)
  294 | 
  295 |     await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-paso-6-gif-verificacion.png') })
  296 | 
  297 |     expect(gifVisible).toBe(true)
  298 |     expect(gifSrc).toBeTruthy()
  299 |   }
  300 | })
  301 | 
  302 | // Test 7: Backup export
  303 | test('Paso 7 - Backup: exportar datos', async ({ page }) => {
  304 |   await page.goto(baseUrl)
  305 |   await page.waitForLoadState('networkidle')
  306 | 
  307 |   // Ir a Perfil
  308 |   await page.getByTestId('tab-perfil').click()
  309 |   await page.waitForTimeout(500)
  310 | 
```