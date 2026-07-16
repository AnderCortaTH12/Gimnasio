// Transforma el dataset crudo (17 MB, multi-idioma) en un JSON adelgazado con
// la forma del tipo Exercise de la app: solo lo que usamos, instrucciones en
// español y la URL del GIF real. Reduce mucho el tamaño y el tiempo de parseo.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const rawPath = join(root, 'public', 'data', 'exercises.raw.json')
const outPath = join(root, 'public', 'data', 'exercises.json')

const GIF_BASE =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/'

// muscle_group / target / body_part (dataset) → MuscleKey (app)
const MUSCLE = {
  chest: 'chest',
  shoulders: 'shoulders',
  deltoids: 'shoulders',
  'rotator cuff': 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  'wrist flexors': 'forearms',
  'wrist extensors': 'forearms',
  wrists: 'forearms',
  hands: 'forearms',
  'lower arms': 'forearms',
  'upper arms': 'biceps',
  quadriceps: 'quadriceps',
  'upper legs': 'quadriceps',
  hamstrings: 'hamstrings',
  glutes: 'glutes',
  calves: 'calves',
  'lower legs': 'calves',
  ankles: 'calves',
  'ankle stabilizers': 'calves',
  soleus: 'calves',
  abs: 'abs',
  abdominals: 'abs',
  obliques: 'abs',
  core: 'abs',
  'hip flexors': 'abs',
  waist: 'abs',
  traps: 'traps',
  trapezius: 'traps',
  neck: 'traps',
  lats: 'back',
  'latissimus dorsi': 'back',
  rhomboids: 'back',
  'upper back': 'back',
  back: 'back',
  'lower back': 'lower_back',
  cardio: 'cardio',
}

// equipment (dataset) → EquipmentKey (app)
const EQUIP = {
  'body weight': 'bodyweight',
  dumbbell: 'dumbbell',
  cable: 'cable',
  barbell: 'barbell',
  'ez barbell': 'barbell',
  'olympic barbell': 'barbell',
  'trap bar': 'barbell',
  'leverage machine': 'machine',
  'smith machine': 'machine',
  'sled machine': 'machine',
  'stepmill machine': 'machine',
  'elliptical machine': 'machine',
  'skierg machine': 'machine',
  'stationary bike': 'machine',
  'upper body ergometer': 'machine',
  hammer: 'machine',
  band: 'band',
  'resistance band': 'band',
  kettlebell: 'kettlebell',
}

const muscle = (v) => MUSCLE[String(v || '').toLowerCase()] ?? undefined
const equip = (v) => EQUIP[String(v || '').toLowerCase()] ?? 'other'

/** Capitaliza la primera letra (los nombres del dataset van en minúscula). */
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const raw = JSON.parse(readFileSync(rawPath, 'utf8'))

const out = raw.map((e) => {
  const mg = muscle(e.muscle_group) ?? muscle(e.target) ?? muscle(e.body_part) ?? 'full_body'
  const sec = [...new Set((e.secondary_muscles || []).map(muscle).filter(Boolean))]
    .filter((m) => m !== mg)
  // Nombre del fichero GIF: preferimos gif_url del dataset, si no media_id.
  const gifFile = e.gif_url
    ? e.gif_url.split('/').pop()
    : e.media_id
      ? `${e.id}-${e.media_id}.gif`
      : undefined
  // Instrucciones en español (pasos), con respaldo al inglés.
  const steps =
    e.instruction_steps?.es || e.instruction_steps?.en || undefined

  return {
    id: e.id,
    name: cap(e.name),
    category: String(e.body_part).toLowerCase() === 'cardio' ? 'cardio' : 'strength',
    bodyPart: mg,
    equipment: equip(e.equipment),
    muscleGroup: mg,
    secondaryMuscles: sec,
    target: muscle(e.target) ?? mg,
    instructions: steps,
    gifUrl: gifFile ? GIF_BASE + gifFile : undefined,
  }
})

writeFileSync(outPath, JSON.stringify(out))
console.log(`✓ ${out.length} ejercicios → public/data/exercises.json`)
const kb = (readFileSync(outPath).length / 1024).toFixed(0)
console.log(`  tamaño: ${kb} KB`)
