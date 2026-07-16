# PROMPT MAESTRO — Webapp personal de seguimiento de gimnasio ("GymTracker")

> Pega este documento entero como **instrucciones de proyecto** (o como primer mensaje) en un chat dedicado. Está pensado para construir la aplicación por fases sin perder contexto. Cópialo tal cual.

---

## 1. ROL Y OBJETIVO

Actúa como un ingeniero de software full-stack y diseñador de producto senior. Vas a construir, conmigo y por fases, una **webapp personal de seguimiento de entrenamiento de gimnasio** con estética cuidada, pensada para usarse desde el móvil como si fuera una app nativa (PWA instalable en la pantalla de inicio).

El usuario es **una sola persona** (yo). No hay cuentas, ni login, ni multiusuario. Los datos se guardan **localmente en el dispositivo**, con función de exportar/importar copia de seguridad.

El enfoque de entrenamiento es **fuerza e hipertrofia con pesas y máquinas** (aunque el catálogo incluye todo tipo de ejercicios).

Prioridad: **equilibrio entre rapidez de desarrollo y app completa**. Nada de sobre-ingeniería, pero tampoco un prototipo pobre. Estética atractiva desde el día uno.

---

## 2. STACK TÉCNICO

- **Frontend:** React (con Vite) + TypeScript.
- **Estilos:** Tailwind CSS. Estética moderna, limpia, tipo app de fitness premium.
- **Gráficas:** Recharts.
- **Persistencia:** IndexedDB (vía la librería `idb` o `Dexie.js`) para todos los datos del usuario. NADA de backend ni servidor. NO usar localStorage para los entrenos (IndexedDB aguanta mucho más y es más robusto).
- **PWA:** configurar manifest + service worker para que sea instalable en el móvil y funcione offline.
- **Datos de ejercicios:** dataset JSON de 1.324 ejercicios (ver sección 6).

Todo debe funcionar **sin conexión** una vez cargado. Sin dependencias de APIs externas en tiempo de ejecución.

---

## 3. IDENTIDAD VISUAL Y ESTÉTICA

Esto es importante: la app debe entrar por los ojos. Directrices de diseño:

- **Estilo general:** moderno, oscuro por defecto (dark mode como principal), con acentos de color vivos. Estética tipo "fitness app premium" (piensa en apciones como Hevy, Gymshark app, Whoop): mucho espacio en negro/gris muy oscuro, tarjetas con bordes redondeados generosos, sombras suaves, tipografía potente.
- **Paleta sugerida (ajústala con buen criterio):**
  - Fondo: casi negro (`#0B0B0F` / `#111117`).
  - Superficies/tarjetas: gris muy oscuro (`#1A1A22`).
  - Acento primario: un color enérgico (verde lima eléctrico `#C6FF3D`, o naranja `#FF6B35`, o cian `#22D3EE` — elige uno y sé consistente).
  - Texto: blanco roto y grises para jerarquía.
  - Estados: verde (progreso/PR), rojo (retroceso), ámbar (aviso).
- **Tipografía:** una sans-serif con carácter (Inter, Satoshi, o similar). Números grandes y en negrita para pesos, repeticiones y estadísticas — los datos son el protagonista.
- **Microinteracciones:** transiciones suaves, feedback al pulsar, animaciones sutiles al registrar una serie o batir un récord (por ejemplo, un pequeño destello/confeti al lograr un PR).
- **Móvil primero:** todo diseñado para pantalla de móvil en vertical. Navegación inferior fija (bottom tab bar) con iconos. Botones grandes, cómodos para el pulgar.
- **Iconografía:** usar `lucide-react` para iconos consistentes.

El resultado debe parecer un producto real, no un ejercicio de programación.

---

## 4. FUNCIONALIDADES (por prioridad)

### 4.1 Núcleo — Registro de entrenamientos
- Iniciar una "sesión de entrenamiento" (workout) con fecha/hora.
- Añadir ejercicios a la sesión desde el catálogo (buscador + filtros por grupo muscular y equipo).
- Por cada ejercicio, registrar múltiples **series** con: peso (kg), repeticiones, y opcionalmente RPE (esfuerzo percibido, 1-10) y notas.
- Marcar series como completadas. Temporizador de descanso entre series (configurable, con aviso).
- Guardar la sesión. Ver historial de sesiones pasadas.
- Duplicar una sesión anterior como plantilla para repetir rutina.

### 4.2 Núcleo — Perfil y medidas corporales
- Pantalla de perfil con datos personales: **peso corporal, altura**, edad, sexo (para cálculos), objetivo (fuerza / hipertrofia / mantenimiento).
- Registrar **peso corporal a lo largo del tiempo** (con fecha) y ver su evolución en gráfica.
- Calcular y mostrar **IMC** automáticamente a partir de peso y altura, con su interpretación.
- Opcional: registrar otras medidas (cintura, brazo, pecho, etc.) y graficarlas.

### 4.3 Núcleo — Evolución y estadísticas
- Por cada ejercicio: gráfica de progreso en el tiempo (peso máximo, volumen total = peso×reps×series, 1RM estimado con fórmula de Epley).
- Dashboard general: volumen semanal total, número de entrenos por semana, grupos musculares trabajados (gráfico de reparto), racha de días/semanas entrenando.
- Detección y celebración de **records personales (PR)**: cuando se supera el mejor peso o mejor volumen histórico en un ejercicio.
- Vista de "grupos musculares" que muestre cuáles se han trabajado recientemente y cuáles están "descuidados".

### 4.4 Recomendaciones (basadas en reglas, honestas)
Motor de recomendaciones basado en reglas claras (NO caja negra), que sugiera:
- **Equilibrio muscular:** avisar de grupos musculares no trabajados en X días (p. ej. "llevas 6 días sin entrenar espalda").
- **Progresión de carga:** si en un ejercicio se han completado todas las series/reps objetivo en la última sesión, sugerir subir peso (progresión progresiva).
- **Descanso:** avisar si se está entrenando el mismo grupo muscular sin descanso suficiente (< 48h).
- **Variación:** sugerir ejercicios alternativos del dataset para un mismo grupo muscular, para variar estímulo.
- **Rutina del día:** proponer una sesión equilibrada según lo que toca (basado en lo trabajado recientemente y el objetivo del usuario).
Cada recomendación debe explicar SU PORQUÉ en una frase. Nada de sugerencias mágicas sin justificación.

### 4.5 Copia de seguridad
- Botón de **exportar** todos los datos (entrenos, perfil, medidas) a un archivo JSON descargable.
- Botón de **importar** desde un archivo JSON, para restaurar o migrar de dispositivo.
- Aviso claro al usuario de que los datos viven en el dispositivo y conviene exportar de vez en cuando.

---

## 5. ARQUITECTURA Y ESTRUCTURA

- App de una sola página (SPA) con navegación por pestañas inferior:
  1. **Hoy / Entrenar** (iniciar o continuar sesión)
  2. **Historial** (sesiones pasadas)
  3. **Progreso** (gráficas y estadísticas)
  4. **Ejercicios** (catálogo navegable)
  5. **Perfil** (datos, medidas, ajustes, copia de seguridad)
- Estado global gestionado con Context API o Zustand (ligero).
- Capa de datos aislada: un módulo `db.ts` que encapsula todas las operaciones de IndexedDB (crear sesión, guardar serie, leer historial, etc.), para que el resto de la app no toque IndexedDB directamente.
- Tipos TypeScript bien definidos para: `Exercise`, `WorkoutSession`, `ExerciseEntry`, `SetEntry`, `BodyMetric`, `UserProfile`.
- Código modular y comentado en español donde ayude.

---

## 6. DATOS DE EJERCICIOS

Se usará el dataset público **hasaneyldrm/exercises-dataset** (1.324 ejercicios, uso personal/no comercial). Cada ejercicio tiene esta forma:

```json
{
  "id": "0001",
  "name": "3/4 sit-up",
  "category": "waist",
  "body_part": "waist",
  "equipment": "body weight",
  "instructions": { "en": "...", "tr": "..." },
  "muscle_group": "hip flexors",
  "secondary_muscles": ["hip flexors", "lower back"],
  "target": "abs",
  "image": "images/0001-2gPfomN.jpg",
  "gif_url": "videos/0001-2gPfomN.gif"
}
```

Estrategia de integración:
1. **Fase inicial:** empezar con un subconjunto curado (~40-60 ejercicios) de los más comunes de fuerza/hipertrofia embebido directamente en el código, para que la app funcione al 100 % desde el primer momento sin dependencias.
2. **Fase de ampliación:** cargar el `exercises.json` completo. Como las imágenes/GIFs son archivos del repositorio, decidir entre: (a) descargarlos y servirlos localmente dentro de la PWA, o (b) referenciarlos por URL de GitHub raw. Recomendación: para uso offline real, descargar y empaquetar. Traducir/usar solo las instrucciones en inglés (`instructions.en`) y, si se desea, traducirlas al español.
3. Normalizar los nombres de grupos musculares a español para la interfaz (mapa de traducción: chest→pecho, back→espalda, upper legs→piernas, etc.).

---

## 7. FORMA DE TRABAJO (IMPORTANTE)

- Construye la app **por fases**, no todo de golpe. Propón un plan de fases al empezar y espera mi confirmación antes de cada una.
- **Fase 1 sugerida:** esqueleto visual navegable con las 5 pestañas, estética completa aplicada, datos de ejercicios de muestra, y capa de datos (IndexedDB) montada. Sin toda la lógica aún, pero bonito y navegable.
- **Fase 2:** registro de entrenos funcional (crear sesión, añadir ejercicios, registrar series, guardar, historial).
- **Fase 3:** perfil, peso corporal, medidas e IMC.
- **Fase 4:** progreso, gráficas, PRs y dashboard.
- **Fase 5:** motor de recomendaciones.
- **Fase 6:** copia de seguridad, PWA/instalable, y ampliación al dataset completo.
- Al final de cada fase: entregar el código funcionando y explicarme en lenguaje claro qué se ha hecho y cómo probarlo.
- Cuando entregues código de más de un archivo, dámelo organizado y dime exactamente dónde va cada pieza.
- Prioriza que **cada fase sea usable** por sí misma.

---

## 8. CRITERIOS DE CALIDAD

- La app debe verse profesional en un móvil real, no como un prototipo.
- Rápida y fluida: sin recargas, transiciones suaves.
- Los datos nunca se pierden por un cierre de la app (IndexedDB persistente) y se pueden exportar.
- Código limpio, tipado y modular.
- Textos de la interfaz en **español**.
- Accesible: buen contraste, botones grandes, legible.

---

## 9. PRIMERA INSTRUCCIÓN

Cuando reciba este documento, NO empieces a programar aún. Primero:
1. Confírmame que has entendido el alcance en un resumen breve.
2. Proponme el plan de fases concreto (ajustando el de la sección 7 si ves mejoras).
3. Propón la paleta de color y el nombre/identidad visual que recomiendas.
4. Espera mi "adelante con la Fase 1" antes de generar código.
