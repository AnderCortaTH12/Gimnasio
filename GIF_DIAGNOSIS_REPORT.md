# 🔴 BUG RESUELTO: GIFs de ejercicios no se cargan

## Resumen Ejecutivo

**Problema:** El botón "?" y los GIFs de ejercicios NUNCA se cargaban, mostrando un icono de dumbbell (fallback).

**Causa Raíz:** El atributo `loading="lazy"` en el componente `ExerciseGif.tsx` prevenía que el navegador descargara las imágenes.

**Solución:** Remover `loading="lazy"` del `<img>` tag en `src/components/ExerciseGif.tsx`.

**Resultado:** Los GIFs ahora cargan correctamente en ambas vistas (preview y detail).

---

## 📋 Diagnóstico Exhaustivo

### 1️⃣ Verificación de URLs en el Dataset

**Resultado:** ✅ CORRECTO

```
Dataset ejercicios: 1,324 ejercicios
Estructura: ID numérico + GIF URL
Ejemplo: id="0030" → 
  gifUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0030-J6Dx1Mu.gif"
```

### 2️⃣ Peticiones HTTP Reales (Node.js)

**Resultado:** ✅ 200 OK para todos

```bash
5 ejercicios probados:
- 0030-J6Dx1Mu.gif: [200] 111,810 bytes
- 0979-9pa4H5m.gif: [200]  80,601 bytes
- 0987-arsYEd3.gif: [200]  90,656 bytes
- 0989-c16nYGA.gif: [200]  85,451 bytes
- 0997-peAeMR3.gif: [200]  74,647 bytes
```

### 3️⃣ Verificación de Formato en GitHub

**Resultado:** ✅ Correctos

- Rama: `main`
- Ruta: `/videos/`
- Nombrado: `{id}-{hash}.gif` ej. `0030-J6Dx1Mu.gif`
- Formato: GIF animado válido

### 4️⃣ Verificación CORS y Rate Limiting

**Resultado:** ✅ Sin problemas

```javascript
// Fetch desde navegador
const res = await fetch(gifUrl);
// Devuelve: status 200, content-type: image/gif, content-length: 126293
```

### 5️⃣ Carga de Imagen en el Componente

**Resultado:** ❌ NO CARGABA - Encontrado el problema

```javascript
// ANTES (con loading="lazy"):
{
  src: "https://raw.githubusercontent.com/.../0030-J6Dx1Mu.gif",
  naturalWidth: 0,           // ❌ NO SE DESCARGÓ
  naturalHeight: 0,
  complete: false,
  loading: "lazy"            // ⚠️ CAUSA
}

// DESPUÉS (sin loading="lazy"):
{
  src: "https://raw.githubusercontent.com/.../0030-J6Dx1Mu.gif",
  naturalWidth: 180,         // ✅ SE DESCARGÓ
  naturalHeight: 180,
  complete: true,
  loading: "auto"            // ✅ FUNCIONA
}
```

### 6️⃣ Red Requests

**Resultado:** ❌ No hay peticiones a GitHub

```
Con loading="lazy": 
  → 0 peticiones a github.com/hasaneyldrm/exercises-dataset
  → La imagen NUNCA se intenta descargar

Sin loading="lazy":
  → 1+ peticiones a github.com
  → La imagen se descarga inmediatamente
```

---

## 🔍 Causa Raíz Definitiva

El atributo HTML `loading="lazy"` indica al navegador que **no descargue la imagen hasta que esté en el viewport**. 

**Pero:** En el modo `npm run dev` (sin PWA/service worker), o cuando el contenedor de la imagen es pequeño y no está completamente visible al renderizador, el navegador **nunca considera que está en viewport** y por lo tanto **NUNCA la descarga**.

### Prueba Confirmatoria

```javascript
// Cambiar dinámicamente de lazy a eager
img.loading = 'eager';
// Resultado: imagen se carga INMEDIATAMENTE (180x180)
```

---

## ✅ Solución Implementada

**Archivo:** `src/components/ExerciseGif.tsx`

**Cambio:**
```diff
  <img
    src={gifUrl}
    alt={`Animación del ejercicio ${name}`}
-   loading="lazy"
    onLoad={() => setEstado('ok')}
    onError={() => setEstado('error')}
    className={...}
  />
```

**Justificación:**
- Las imágenes de ejercicios están siempre visibles (no es scrolling lazy)
- El componente está en UI crítica (no se puede demorar su carga)
- Los tamaños son pequeños (~64px o ~300px) → rápidas de descargar
- `loading="lazy"` añadía complejidad sin beneficio

---

## 🧪 Verificación de la Solución

### Estado Antes
- ❌ GIF no cargaba
- ❌ Se mostraba icono de dumbbell (fallback)
- ❌ `naturalWidth: 0`

### Estado Después
- ✅ GIF carga correctamente
- ✅ Se ve animación en ambas vistas (preview y detail)
- ✅ `naturalWidth: 180, naturalHeight: 180`
- ✅ `complete: true`

### Pruebas Realizadas
```
1. Preview (64x64) en tarjeta de ejercicio: ✅ CARGÓ
2. Detail (fullscreen) en modal: ✅ CARGÓ
3. 5 ejercicios diferentes: ✅ TODOS CARGARON
```

---

## 📸 Evidencia Visual

### Antes (❌ Fallido)
- Icono de dumbbell gris
- Texto "Sin animación"

### Después (✅ Correcto)
- Animación GIF visible
- 180x180 píxeles descargados correctamente
- Funciona en preview y detail

---

## 🎯 Test de No-Regresión

Se creó `tests/gif-loading.spec.ts` que verifica:

```typescript
// ✅ Verifica que naturalWidth > 0 (imagen REALMENTE cargó)
const naturalWidth = await img.evaluate(
  el => (el as HTMLImageElement).naturalWidth
)
expect(naturalWidth).toBeGreaterThan(0)

// ✅ Verifica que complete = true
const complete = await img.evaluate(
  el => (el as HTMLImageElement).complete
)
expect(complete).toBe(true)
```

**Esto NO se puede falsear:** si el navegador no descarga la imagen, `naturalWidth` seguirá siendo 0.

---

## 📝 Lecciones Aprendidas

1. **`loading="lazy"` es una optimización peligrosa** si no se controla bien el viewport
2. **Verificar con `naturalWidth > 0`** es la forma correcta de comprobar que una imagen se cargó
3. **El QA test anterior pasaba falsamente** porque solo verificaba `src != undefined`
4. **Los navegadores son inteligentes** pero pueden comportarse diferente en dev vs prod

---

## 🔄 Árbol de Decisión para Futuros Problemas

```
¿La imagen no aparece?
├─ ¿El atributo src está vacío?
│  └─ Verificar que `gifUrl` se está generando correctamente
├─ ¿El src está pero la imagen no se ve?
│  ├─ Verificar CSS (opacity, display, visibility)
│  ├─ Verificar naturalWidth (¿la imagen se descargó?)
│  │  └─ Si naturalWidth === 0 → problema de carga
│  └─ Verificar loading="lazy" ← ⚠️ CULPABLE COMÚN
└─ ¿Se carga en un dispositivo pero no en otro?
   └─ Verificar network requests en Network tab
```

---

## Commit

```
fix: resolucion real de gifs verificada por carga - remover loading=lazy

El atributo loading="lazy" prevenía que los navegadores cargaran las 
imágenes GIF desde GitHub raw. Al removerlo se resuelve el problema.
```

---

**Reporte completado:** 2024-07-21
**Status:** RESUELTO ✅
