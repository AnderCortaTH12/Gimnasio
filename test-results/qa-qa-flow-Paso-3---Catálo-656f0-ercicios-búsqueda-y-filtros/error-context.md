# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa\qa-flow.spec.ts >> Paso 3 - Catálogo de ejercicios, búsqueda y filtros
- Location: qa\qa-flow.spec.ts:118:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('lista-ejercicios')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('lista-ejercicios')

```

```yaml
- main:
  - heading "Ejercicios" [level=1]
  - paragraph: 1370 en el catálogo
  - img
  - textbox "Buscar ejercicio…": press
  - button "Limpiar búsqueda":
    - img
  - img
  - text: Grupo muscular
  - button "Pecho"
  - button "Espalda"
  - button "Hombros"
  - button "Bíceps"
  - button "Tríceps"
  - button "Cuádriceps"
  - button "Isquios"
  - button "Glúteos"
  - button "Gemelos"
  - button "Abdominales"
  - text: Equipo
  - button "Barra"
  - button "Mancuernas"
  - button "Máquina"
  - button "Polea"
  - button "Peso corporal"
  - button "Kettlebell"
  - list:
    - listitem:
      - img "Animación del ejercicio Press de banca con banda"
      - paragraph: Press de banca con banda
      - text: Tríceps Banda
      - img
    - listitem:
      - img "Animación del ejercicio Horizontal pallof press con banda"
      - paragraph: Horizontal pallof press con banda
      - text: Abdominales Banda
      - img
    - listitem:
      - img "Animación del ejercicio A una brazo con giro press de pecho con banda"
      - paragraph: A una brazo con giro press de pecho con banda
      - text: Hombros Banda
      - img
    - listitem:
      - img "Animación del ejercicio Press de hombros con banda"
      - paragraph: Press de hombros con banda
      - text: Tríceps Banda
      - img
    - listitem:
      - img "Animación del ejercicio Con giro press por encima de la cabeza con banda"
      - paragraph: Con giro press por encima de la cabeza con banda
      - text: Tríceps Banda
      - img
    - listitem:
      - img "Animación del ejercicio Vertical pallof press con banda"
      - paragraph: Vertical pallof press con banda
      - text: Abdominales Banda
      - img
    - listitem:
      - img "Animación del ejercicio Press de banca con barra"
      - paragraph: Press de banca con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio Cargada y press con barra"
      - paragraph: Cargada y press con barra
      - text: Isquios Barra
      - img
    - listitem:
      - img "Animación del ejercicio Press de banca agarre cerrado con barra"
      - paragraph: Press de banca agarre cerrado con barra
      - text: Pecho Barra
      - img
    - listitem:
      - img "Animación del ejercicio Press de banca declinado con barra"
      - paragraph: Press de banca declinado con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio Declinado agarre cerrado a skull press con barra"
      - paragraph: Declinado agarre cerrado a skull press con barra
      - text: Pecho Barra
      - img
    - listitem:
      - img "Animación del ejercicio Declinado agarre ancho press con barra"
      - paragraph: Declinado agarre ancho press con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio Guillotine press de banca con barra"
      - paragraph: Guillotine press de banca con barra
      - text: Hombros Barra
      - img
    - listitem:
      - img "Animación del ejercicio Press de banca inclinado con barra"
      - paragraph: Press de banca inclinado con barra
      - text: Hombros Barra
      - img
    - listitem:
      - img "Animación del ejercicio Inclinado press de banca agarre cerrado con barra"
      - paragraph: Inclinado press de banca agarre cerrado con barra
      - text: Pecho Barra
      - img
    - listitem:
      - img "Animación del ejercicio Inclinado agarre inverso press con barra"
      - paragraph: Inclinado agarre inverso press con barra
      - text: Pecho Barra
      - img
    - listitem:
      - img "Animación del ejercicio Jm press de banca con barra"
      - paragraph: Jm press de banca con barra
      - text: Pecho Barra
      - img
    - listitem:
      - img "Animación del ejercicio Tumbado agarre cerrado press con barra"
      - paragraph: Tumbado agarre cerrado press con barra
      - text: Pecho Barra
      - img
    - listitem:
      - img "Animación del ejercicio A una brazo press en el suelo con barra"
      - paragraph: A una brazo press en el suelo con barra
      - text: Pecho Barra
      - img
    - listitem:
      - img "Animación del ejercicio Pin presses con barra"
      - paragraph: Pin presses con barra
      - text: Hombros Barra
      - img
    - listitem:
      - img "Animación del ejercicio Press abdominal con barra"
      - paragraph: Press abdominal con barra
      - text: Hombros Barra
      - img
    - listitem:
      - img "Animación del ejercicio Pullover a press con barra"
      - paragraph: Pullover a press con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio Inverso press de banca agarre cerrado con barra"
      - paragraph: Inverso press de banca agarre cerrado con barra
      - text: Pecho Barra
      - img
    - listitem:
      - img "Animación del ejercicio Agarre inverso press de banca declinado con barra"
      - paragraph: Agarre inverso press de banca declinado con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio Agarre inverso press de banca inclinado con barra"
      - paragraph: Agarre inverso press de banca inclinado con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio Sentado detrás head press militar con barra"
      - paragraph: Sentado detrás head press militar con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio Sentado bradford rocky press con barra"
      - paragraph: Sentado bradford rocky press con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio Sentado press por encima de la cabeza con barra"
      - paragraph: Sentado press por encima de la cabeza con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio De pie bradford press con barra"
      - paragraph: De pie bradford press con barra
      - text: Tríceps Barra
      - img
    - listitem:
      - img "Animación del ejercicio De pie agarre cerrado press militar con barra"
      - paragraph: De pie agarre cerrado press militar con barra
      - text: Tríceps Barra
      - img
  - paragraph: 164 resultados
- img
- paragraph: Lista para usar sin conexión.
- button "Cerrar":
  - img
- navigation:
  - list:
    - listitem:
      - link "Hoy":
        - /url: /
    - listitem:
      - link "Historial":
        - /url: /historial
    - listitem:
      - link "Progreso":
        - /url: /progreso
    - listitem:
      - link "Ejercicios":
        - /url: /ejercicios
    - listitem:
      - link "Perfil":
        - /url: /perfil
```

# Test source

```ts
  38  |     errors[testName] = consoleErrors
  39  |   }
  40  | })
  41  | 
  42  | test.afterAll(() => {
  43  |   fs.writeFileSync(ERRORS_FILE, JSON.stringify({
  44  |     timestamp: new Date().toISOString(),
  45  |     consoleErrors: errors,
  46  |     screenshotsDir: SCREENSHOTS_DIR,
  47  |     totalScreenshots: fs.readdirSync(SCREENSHOTS_DIR).length,
  48  |   }, null, 2))
  49  | })
  50  | 
  51  | // Test 1: App vacía en Hoy
  52  | test('Paso 1 - App vacía, pestañas visibles', async ({ page }) => {
  53  |   await page.goto(baseUrl)
  54  |   await page.waitForLoadState('networkidle')
  55  | 
  56  |   // Verificar que las 5 pestañas existen
  57  |   const tabHoy = page.getByTestId('tab-hoy')
  58  |   const tabHistorial = page.getByTestId('tab-historial')
  59  |   const tabProgreso = page.getByTestId('tab-progreso')
  60  |   const tabEjercicios = page.getByTestId('tab-ejercicios')
  61  |   const tabPerfil = page.getByTestId('tab-perfil')
  62  | 
  63  |   await expect(tabHoy).toBeVisible()
  64  |   await expect(tabHistorial).toBeVisible()
  65  |   await expect(tabProgreso).toBeVisible()
  66  |   await expect(tabEjercicios).toBeVisible()
  67  |   await expect(tabPerfil).toBeVisible()
  68  | 
  69  |   // Captura: app vacía en Hoy
  70  |   await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-paso-1-app-vacia.png') })
  71  | 
  72  |   // Verificar botón "Empezar entrenamiento"
  73  |   const btnEmpezar = page.getByTestId('btn-empezar-entreno')
  74  |   await expect(btnEmpezar).toBeVisible()
  75  | })
  76  | 
  77  | // Test 2: Navegación a Perfil y edición
  78  | test('Paso 2 - Perfil inicial, editar datos personales', async ({ page }) => {
  79  |   await page.goto(baseUrl)
  80  |   await page.waitForLoadState('networkidle')
  81  | 
  82  |   // Click en tab Perfil
  83  |   await page.getByTestId('tab-perfil').click()
  84  |   await page.waitForTimeout(500)
  85  | 
  86  |   await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-paso-2-perfil-inicial.png') })
  87  | 
  88  |   // Buscar botón de editar (icono lápiz)
  89  |   const editBtn = page.locator('button[aria-label="Editar perfil"]')
  90  |   await expect(editBtn).toBeVisible()
  91  |   await editBtn.click()
  92  |   await page.waitForTimeout(500)
  93  | 
  94  |   // Llenar perfil: nombre, peso, altura, edad
  95  |   const inputNombre = page.getByTestId('input-nombre')
  96  |   await expect(inputNombre).toBeVisible()
  97  |   await inputNombre.fill('Test User')
  98  | 
  99  |   const inputPeso = page.getByTestId('input-peso')
  100 |   await inputPeso.fill('75.5')
  101 | 
  102 |   const inputAltura = page.getByTestId('input-altura')
  103 |   await inputAltura.fill('180')
  104 | 
  105 |   const inputEdad = page.getByTestId('input-edad')
  106 |   await inputEdad.fill('28')
  107 | 
  108 |   // Guardar
  109 |   const btnGuardar = page.getByTestId('btn-guardar-perfil')
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
> 138 |   await expect(listaEjercicios).toBeVisible()
      |                                 ^ Error: expect(locator).toBeVisible() failed
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
  210 |     await inputPeso.fill('100')
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
```