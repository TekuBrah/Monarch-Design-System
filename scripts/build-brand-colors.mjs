import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
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

// Collect solid-color steps from a group object. Returns [] if none found.
const collectSteps = (group) =>
  Object.entries(group)
    .filter(([, v]) => isSolidColor(v))
    .map(([step, v]) => [step, v.value])

// Gather all color scales in source order
const scales = [] // [{ name, steps: [[step, hex], ...], isFoundation }]

for (const [name, group] of Object.entries(src)) {
  if (group === null || typeof group !== 'object') continue
  const steps = collectSteps(group)
  if (steps.length === 0) continue
  scales.push({ name, steps, isFoundation: name === 'foundations' })
}

// ── brand.ts ─────────────────────────────────────────────────────────────────
const tsLines = ['export const brand = {']

for (const { name, steps } of scales) {
  tsLines.push(`  ${name}: {`)
  for (const [step, hex] of steps) {
    // Numeric steps stay unquoted; string steps (white, black) get quoted
    const key = /^\d+$/.test(step) ? step : `'${step}'`
    tsLines.push(`    ${key}: '${hex}',`)
  }
  tsLines.push(`  },`)
}

tsLines.push('} as const', '', 'export type Brand = typeof brand', '')

mkdirSync(resolve(root, 'src/tokens'), { recursive: true })
writeFileSync(resolve(root, 'src/tokens/brand.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/brand.ts')

// index.ts — only touch if it doesn't already re-export correctly
const indexPath = resolve(root, 'src/tokens/index.ts')
const indexContent = `export { brand } from './brand'\nexport type { Brand } from './brand'\n`
writeFileSync(indexPath, indexContent)
console.log('✓ src/tokens/index.ts')

// ── globals.css ───────────────────────────────────────────────────────────────
const cssLines = [':root {']

for (const { name, steps, isFoundation } of scales) {
  cssLines.push(`  /* ${name} */`)
  for (const [step, hex] of steps) {
    const varName = isFoundation
      ? `--brand-${step}`
      : `--brand-${name.toLowerCase()}-${step}`
    cssLines.push(`  ${varName}: ${hex};`)
  }
  cssLines.push('')
}

// Remove trailing blank line before closing brace
if (cssLines.at(-1) === '') cssLines.pop()
cssLines.push('}', '')

mkdirSync(resolve(root, 'src/styles'), { recursive: true })
writeFileSync(resolve(root, 'src/styles/globals.css'), cssLines.join('\n'))
console.log('✓ src/styles/globals.css')

// ── summary ───────────────────────────────────────────────────────────────────
const colorScales = scales.filter(s => !s.isFoundation)
const foundationsScale = scales.find(s => s.isFoundation)
console.log(
  `\nExtracted ${colorScales.length} color scales: ${colorScales.map(s => s.name).join(', ')}` +
  (foundationsScale ? `\nFoundations: ${foundationsScale.steps.map(([k]) => k).join(', ')}` : '')
)
