import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')
const src = JSON.parse(readFileSync(resolve(root, 'design-tokens/Brand/Value.json'), 'utf8'))

// A solid color token: value is a hex string, type is 'color'
const isSolidColor = (token) =>
  token !== null &&
  typeof token === 'object' &&
  token.type === 'color' &&
  typeof token.value === 'string' &&
  token.value.startsWith('#')

const collectColorSteps = (group) =>
  Object.entries(group)
    .filter(([, v]) => isSolidColor(v))
    .map(([step, v]) => [step, v.value])

const collectScaleSteps = (group) =>
  Object.entries(group)
    .filter(([, v]) => v !== null && typeof v === 'object' && v.type === 'number' && typeof v.value === 'number')
    .map(([step, v]) => [step, v.value])

// Gather color groups and the Scale group in source order
const colorGroups = [] // [{ name, steps: [[step, hex], ...], isFoundation }]
let scaleSteps = []   // [[step, number], ...]

for (const [name, group] of Object.entries(src)) {
  if (!group || typeof group !== 'object') continue
  if (name === 'Scale') {
    scaleSteps = collectScaleSteps(group)
    continue
  }
  const steps = collectColorSteps(group)
  if (steps.length === 0) continue
  colorGroups.push({ name, steps, isFoundation: name === 'foundations' })
}

if (scaleSteps.length === 0) {
  console.error('ERROR: No Scale entries found in Brand/Value.json')
  process.exit(1)
}

// ── src/tokens/brand.ts ───────────────────────────────────────────────────────
const tsLines = ['export const brand = {']

for (const { name, steps } of colorGroups) {
  tsLines.push(`  ${name}: {`)
  for (const [step, hex] of steps) {
    const key = /^\d+$/.test(step) ? step : `'${step}'`
    tsLines.push(`    ${key}: '${hex}',`)
  }
  tsLines.push(`  },`)
}

tsLines.push(`  Scale: {`)
for (const [step, value] of scaleSteps) {
  tsLines.push(`    ${step}: ${value},`)
}
tsLines.push(`  },`)

tsLines.push('} as const', '', 'export type Brand = typeof brand', '')

mkdirSync(resolve(root, 'src/tokens'), { recursive: true })
writeFileSync(resolve(root, 'src/tokens/brand.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/brand.ts')

// ── src/styles/globals.css ────────────────────────────────────────────────────
// Build the brand :root block (colors + scale), then preserve everything from
// /* === Alias === */ onward so downstream scripts don't need to re-run.
const cssLines = [':root {']

for (const { name, steps, isFoundation } of colorGroups) {
  cssLines.push(`  /* ${name} */`)
  for (const [step, hex] of steps) {
    const varName = isFoundation
      ? `--brand-${step}`
      : `--brand-${name.toLowerCase()}-${step}`
    cssLines.push(`  ${varName}: ${hex};`)
  }
  cssLines.push('')
}

cssLines.push('  /* Scale */')
for (const [step, value] of scaleSteps) {
  cssLines.push(`  --brand-scale-${step}: ${value}px;`)
}

cssLines.push('}', '')

const brandBlock = cssLines.join('\n')

// Preserve everything from === Alias === onward (alias/mapped/responsive
// scripts don't need to re-run when only the brand block changes).
let preserved = ''
try {
  const existing = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
  const cutAt = existing.indexOf('/* === Alias === */')
  if (cutAt !== -1) preserved = '\n' + existing.slice(cutAt)
} catch { /* first run — nothing to preserve */ }

mkdirSync(resolve(root, 'src/styles'), { recursive: true })
writeFileSync(resolve(root, 'src/styles/globals.css'), brandBlock + preserved)
console.log('✓ src/styles/globals.css')

// ── Summary ───────────────────────────────────────────────────────────────────
const colorScales = colorGroups.filter(s => !s.isFoundation)
const foundations = colorGroups.find(s => s.isFoundation)
console.log(
  `\nExtracted ${colorScales.length} color scales: ${colorScales.map(s => s.name).join(', ')}` +
  (foundations ? `\nFoundations: ${foundations.steps.map(([k]) => k).join(', ')}` : '') +
  `\nScale: ${scaleSteps.length} steps (${scaleSteps[0][0]}→${scaleSteps[0][1]}px … ${scaleSteps.at(-1)[0]}→${scaleSteps.at(-1)[1]}px)`
)
