// Genera los iconos PNG de la PWA a partir de SVGs en línea (sharp).
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

/** Haltera estilizada. `pad` = margen extra (para maskable). */
function svg(pad = 0) {
  // Escala del dibujo dentro del lienzo 512; más pad = dibujo más pequeño.
  const s = 1 - pad
  const cx = 256
  const tx = (x) => cx + (x - cx) * s
  const ty = (y) => cx + (y - cx) * s
  const w = 26 * s
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${96 * (pad ? 0 : 1)}" fill="#C6FF3D"/>
    <g stroke="#0B0B0F" stroke-width="${w}" stroke-linecap="round" fill="none">
      <line x1="${tx(176)}" y1="${ty(256)}" x2="${tx(336)}" y2="${ty(256)}"/>
      <line x1="${tx(150)}" y1="${ty(206)}" x2="${tx(150)}" y2="${ty(306)}"/>
      <line x1="${tx(196)}" y1="${ty(221)}" x2="${tx(196)}" y2="${ty(291)}"/>
      <line x1="${tx(362)}" y1="${ty(206)}" x2="${tx(362)}" y2="${ty(306)}"/>
      <line x1="${tx(316)}" y1="${ty(221)}" x2="${tx(316)}" y2="${ty(291)}"/>
    </g>
  </svg>`
}

async function png(svgStr, size, name) {
  await sharp(Buffer.from(svgStr))
    .resize(size, size)
    .png()
    .toFile(join(outDir, name))
  console.log('✓', name)
}

// Normal: esquinas redondeadas, dibujo a tamaño completo.
await png(svg(0), 192, 'icon-192.png')
await png(svg(0), 512, 'icon-512.png')
// Maskable: sin esquinas (relleno hasta el borde) y con zona segura (padding).
await png(svg(0.2), 512, 'icon-maskable-512.png')
