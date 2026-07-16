# FORJA — Memoria del proyecto

> Este archivo es la memoria persistente del proyecto. **Mantenerlo actualizado
> al final de cada fase.**

## Objetivo

Webapp **personal** de seguimiento de gimnasio. Registrar entrenamientos
(sesiones, ejercicios, series), medir progreso (récords personales, volumen) y
seguir medidas corporales. Uso monousuario, sin cuentas ni servidor: todos los
datos viven en el dispositivo (IndexedDB).

## Stack

- **React 18 + Vite + TypeScript** (TS estricto).
- **Tailwind CSS 3** para estilos (tokens de paleta en `tailwind.config.js`).
- **Recharts** para gráficas de progreso.
- **Dexie.js** como capa sobre IndexedDB.
- **lucide-react** para iconografía.
- Sin backend, sin login, monousuario. Textos de UI en **español**.

## Paleta (tema oscuro)

| Token          | Hex       | Uso                              |
| -------------- | --------- | -------------------------------- |
| `bg`           | `#0B0B0F` | Fondo base                       |
| `surface`      | `#1A1A22` | Tarjetas y paneles               |
| `border`       | `#26262F` | Bordes y separadores             |
| `text`         | `#F5F5F7` | Texto principal                  |
| `lime`         | `#C6FF3D` | Acento primario / CTA            |
| `pr`           | `#4ADE80` | Récord personal (verde)          |
| `regress`      | `#F87171` | Retroceso (rojo)                 |
| `warn`         | `#FBBF24` | Aviso (ámbar)                    |

- Tipografía **Inter** (cargada desde Google Fonts en `index.html`).
- Los **números destacados** (pesos, contadores) van en **extrabold** (`font-number` / `font-extrabold`).

## Convenciones de código

- **TypeScript estricto**: `strict`, `noUnusedLocals`, `noUnusedParameters`.
- **Componentes funcionales** con hooks. Nada de clases de React.
- **Comentarios en español** donde aporten contexto (no obvios).
- La **capa de datos está aislada** en `src/db/`: ningún componente accede a
  IndexedDB/Dexie directamente, solo a través de las funciones exportadas.
- Tipos de dominio centralizados en `src/types/` y reexportados desde
  `src/types/index.ts`.

## Estructura de carpetas

```
GImnasio/
├─ index.html              # Punto de entrada, carga fuente Inter
├─ package.json
├─ vite.config.ts
├─ tailwind.config.js      # Tokens de paleta y tipografía
├─ postcss.config.js
├─ tsconfig*.json
├─ CLAUDE.md               # Este archivo
└─ src/
   ├─ main.tsx             # Bootstrap de React
   ├─ App.tsx              # Pantalla raíz (placeholder por ahora)
   ├─ index.css            # Directivas Tailwind + base
   ├─ components/
   │  ├─ ui/               # Sistema de diseño: Card, Button, Badge,
   │  │                    #   StatNumber, SectionHeader, EmptyState
   │  ├─ layout/           # AppLayout + BottomTabBar
   │  └─ PageTitle.tsx     # Cabecera grande de pantalla
   ├─ screens/             # Pantallas: Today, Workout, History, SessionDetail,
   │                       #   Progress, Exercises, ExerciseDetail, Profile
   ├─ store/               # Zustand: sessionStore (sesión activa) +
   │                       #   restTimerStore (descanso)
   ├─ hooks/               # useExerciseFilter (búsqueda+filtros compartidos)
   ├─ data/
   │  ├─ exercisesSeed.ts  # ~48 ejercicios embebidos
   │  └─ muscles.ts        # Traducción EN→ES y listas de filtros
   ├─ lib/
   │  └─ cn.ts             # Helper de clases condicionales
   ├─ types/               # Tipos de dominio
   │  ├─ exercise.ts       # Exercise (claves en inglés) y enums
   │  ├─ workout.ts        # WorkoutSession, ExerciseEntry, SetEntry
   │  ├─ body.ts           # BodyMetric, UserProfile
   │  └─ index.ts          # Reexporta todo
   └─ db/
      └─ db.ts             # Dexie: esquema + stubs de funciones
```

> Navegación: **react-router-dom v6**. Rutas: `/` (Hoy), `/historial`,
> `/progreso`, `/ejercicios`, `/ejercicios/:id`, `/perfil`.

## Plan de fases

- **Fase 0 — Andamiaje** ✅ *(actual)*: proyecto Vite, Tailwind con paleta,
  tipos de dominio, capa de datos Dexie con esquema y stubs, pantalla
  placeholder. Sin funcionalidades.
- **Fase 1 — Esqueleto visual navegable** ✅: layout móvil-first con bottom tab
  bar (react-router), sistema de diseño (`components/ui`), seed de ~48
  ejercicios, pantalla Ejercicios con buscador + filtros y detalle. Resto de
  pantallas maquetadas con datos de muestra. Sin persistencia.
- **Fase 2 — Registro de entrenos** ✅: sesión activa (Zustand + persistencia
  en IndexedDB en cada mutación), añadir ejercicios (selector reutilizable),
  registrar/editar/eliminar series (peso, reps, RPE, notas), completar series,
  temporizador de descanso configurable con pitido + vibración, finalizar
  sesión, historial real con detalle, y duplicar sesión como plantilla. Todo
  sobrevive a recargar. `db.ts` implementado (sin stubs).
- **Fase 3 — Perfil y medidas corporales** ✅ (sección 4.2): perfil editable y
  persistente (nombre, altura, edad, sexo, objetivo), registro de peso corporal
  con fecha + gráfica de evolución (Recharts), IMC automático con interpretación
  por rangos y color, y otras medidas (cintura, brazo, pecho, grasa…) con
  registro/borrado y gráfica por tipo. Estados vacíos elegantes. Utilidades:
  `lib/imc.ts`, `data/metrics.ts`. Componentes en `components/body/`.
- **Fase 4 — Progreso, PRs y dashboard** ✅ (sección 4.3): analítica pura en
  `lib/stats.ts` (Epley 1RM, volumen, racha, reparto muscular, detección de
  PRs). Pantalla Progreso: dashboard (7 días, racha, PRs), progreso por
  ejercicio (selector + métrica peso/1RM/volumen + gráfica), volumen por músculo
  (7d/30d), récords recientes y "grupos a recuperar". Detección de récords al
  finalizar sesión con celebración + confeti (`PRCelebration`).
- **Fase 5 — Motor de recomendaciones** ✅ (sección 4.4): reglas explicables en
  `src/recommendations/` (umbrales en `rules.ts`, lógica en `engine.ts`):
  descanso <48h, equilibrio muscular, progresión de carga, variación y rutina
  del día. Cada recomendación lleva su porqué. Se muestran en la pantalla Hoy
  (`RecommendationCard`).
- **Fase 6 — Copia de seguridad, PWA y dataset completo** (secciones 4.5 y 6):
  - **6.1 Backup export/import** ✅: `exportarDatos`/`importarDatos`/
    `esBackupValido` en `db.ts`; sección en Perfil (`BackupSection`) con
    descarga `forja-backup-{fecha}.json`, importación con validación +
    confirmación (reemplaza todo en una transacción) y feedback con `Toast`.
  - **6.2 PWA** ✅: `vite-plugin-pwa` (Workbox) con manifest (standalone,
    portrait, iconos 192/512/maskable en `public/icons/`), precache del bundle
    + `navigateFallback`, runtime caching (fuentes Google + GIFs GitHub
    cache-first), y banner de actualización (`UpdatePrompt` con `useRegisterSW`).
    Iconos generados con `scripts/gen-icons.mjs` (sharp).
  - **6.3 Dataset completo** ✅: **1.324 ejercicios** de
    `hasaneyldrm/exercises-dataset` adelgazados con `scripts/build-dataset.mjs`
    (17 MB → 1.1 MB, español, GIF real por id) en `public/data/exercises.json`.
    Se cachean en IndexedDB (tabla `exercisesDataset`, esquema v2) y se precachean
    en el SW. Catálogo en memoria (`catalogStore`) = dataset + seed (deduplicado
    por nombre) → búsqueda/filtros instantáneos. Registro id→ejercicio
    (`catalogRegistry`) para stats. Listas con renderizado incremental
    (`useIncrementalList`, IntersectionObserver) en catálogo y selector.

> **Animaciones/microinteracciones**: no son una fase aparte. La base
> (feedback al pulsar, transiciones de pestaña, pill de la tab activa, hojas
> inferiores) está desde la **Fase 1**; el confeti/celebración de récords se
> añadió en la **Fase 4**. Cualquier pulido extra se puede hacer en un pase
> dedicado cuando quieras.
>
- **Fase 7 — Planes de entrenamiento** ✅: planes **predefinidos** (Tracción,
  Empuje, Piernas, Full Body, Brazos en `data/workoutPlans.ts`) y
  **personalizados** del usuario (crear/editar/eliminar, tabla `workoutPlans`,
  esquema v3). Tipos en `types/plan.ts` (`WorkoutPlan` con `createdBy` y
  `exerciseReps` series×reps; `WorkoutPlanExecution`). Motor de sugerencia
  explicable (`recommendations/planSuggestions.ts`): ordena por descuido
  muscular (derivado del catálogo) con los personales primero. UI: sección
  "Planes disponibles" en Hoy (`components/plans/`: `PlanCard`, `PlanForm`,
  `PlansSection`), ejecución con badge + progreso n/m en `WorkoutScreen`,
  pregunta "¿Completaste el plan?" al finalizar, e historial de planes en
  Progreso (`PlanHistorySection`: % completados 4 semanas + lista). DB
  (`db.ts`): `crearPlan`/`editarPlan`/`eliminarPlan`, `iniciarPlanExecution`/
  `finalizarPlanExecution`, `leerPlanesEjecutados`, `estadisticasPlanes`.
  Planes y ejecuciones incluidos en el backup.

> **Animaciones/microinteracciones**: no son una fase aparte (base en Fase 1,
> confeti/PR en Fase 4).

## Estado del proyecto

**Todas las fases (0–7) completadas.** La app es funcional de principio a fin:
registro de entrenos, historial, progreso/PRs, perfil/medidas/IMC, motor de
recomendaciones, backup export/import, PWA instalable/offline y catálogo de
1.324 ejercicios con GIFs. Todo offline-first sobre IndexedDB.

## Instalación y uso

Requisitos: Node 18+ (probado con Node 24) y npm.

```bash
npm install          # instala dependencias
npm run dev          # desarrollo en http://localhost:5173 (SIN service worker)
npm run build        # build de producción a dist/
npm run preview      # sirve dist/ en http://localhost:4173 (CON PWA/offline)
npm run lint         # typecheck (tsc --noEmit)
```

- **La PWA (instalable + offline) solo funciona en `build` + `preview`**, no en
  `dev`. Para instalarla: abre el preview en Chrome → icono "Instalar" en la
  barra de direcciones → se abre como app en ventana propia.
- **Móvil-first**: para verla bien en escritorio, usa la vista responsive del
  navegador (~390px).
- **Datos**: viven solo en el dispositivo (IndexedDB). Exporta desde
  Perfil → Copia de seguridad para no perderlos.

### Scripts de datos (regenerar dataset/iconos)

```bash
# Iconos PWA (public/icons/) — requiere sharp (devDependency)
node scripts/gen-icons.mjs

# Dataset de ejercicios: descarga el crudo y adelgázalo
#   1) descarga data/exercises.json del repo a public/data/exercises.raw.json
#   2) node scripts/build-dataset.mjs  → public/data/exercises.json (1.1 MB)
```

## Estructura relevante

```
public/
  data/exercises.json    # dataset adelgazado (1.324, servido como asset)
  icons/                 # iconos PWA (192, 512, maskable)
src/
  screens/               # una pantalla por pestaña + detalles
  components/            # ui/ (sistema de diseño), body/, workout/, progress/…
  store/                 # zustand: session, catalog, restTimer
  db/db.ts               # capa Dexie (única puerta a IndexedDB)
  lib/                   # stats, imc, cn
  recommendations/       # motor de reglas (rules.ts + engine.ts)
  data/                  # seed, dataset registry, traducciones, gifs
scripts/                 # gen-icons, build-dataset
```

## Notas

- El seed de 49 ejercicios (`data/exercisesSeed.ts`) queda como **respaldo**: se
  usa si el dataset no carga (p. ej. offline en el primer arranque) y se une al
  dataset deduplicado por nombre.
- El dataset trae el nombre del GIF por ejercicio (`gif_url`/`media_id`), así que
  cada ejercicio muestra su animación correcta. Los GIFs se sirven de GitHub raw
  y el SW los cachea al verlos (cache-first).
- Créditos del dataset: `hasaneyldrm/exercises-dataset` (uso personal/no
  comercial); GIFs © Gym Visual.
