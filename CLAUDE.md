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
- **Fase 4 — Progreso y PRs**: detección de récords, gráficas (Recharts),
  volumen por grupo muscular.
- **Fase 5 — Medidas corporales**: registro y evolución de peso/perímetros.
- **Fase 6 — Perfil y ajustes**: unidades, objetivos, exportar/importar datos.
- **Fase 7 — Dataset completo**: integrar los 1.324 ejercicios de
  `hasaneyldrm/exercises-dataset` (uso personal/no comercial), buscador y
  cacheo en IndexedDB.

## Notas

- El documento `PROMPT_MAESTRO_GymTracker.md` (especificación completa) es la
  fuente de verdad, pero **no está presente** en la carpeta a fecha del
  andamiaje. Reincorporarlo cuando esté disponible y revisar que los tipos y el
  esquema encajan con sus secciones 4 y 5.
