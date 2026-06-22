import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')
const src = JSON.parse(readFileSync(resolve(root, 'design-tokens/Brand/Value.json'), 'utf8'))

// ── Collect and validate ──────────────────────────────────────────────────────

const REQUIRED_FIELDS = ['x', 'y', 'blur', 'spread', 'color']

const entries = [] // [{ name, varName, shadow, description }]

for (const [key, token] of Object.entries(src)) {
  if (!key.startsWith('Dropshadow_')) continue

  const name = key.slice('Dropshadow_'.length).toLowerCase() // subtlest, subtle, medium
  const varName = `--shadow-${name}`

  if (!token.value || typeof token.value !== 'object' || Array.isArray(token.value)) {
    console.error(`ERROR: ${key} — "value" must be an object, got: ${JSON.stringify(token.value)}`)
    process.exit(1)
  }

  const missing = REQUIRED_FIELDS.filter(f => token.value[f] === undefined)
  if (missing.length) {
    console.error(`ERROR: ${key} — missing fields: ${missing.join(', ')}`)
    process.exit(1)
  }

  const { x, y, blur, spread, color } = token.value
  const shadow = `${x}px ${y}px ${blur}px ${spread}px ${color}`

  entries.push({ name, varName, shadow, description: token.description ?? '' })
}

if (entries.length === 0) {
  console.error('ERROR: No Dropshadow_* tokens found in Brand/Value.json')
  process.exit(1)
}

console.log(`Collected ${entries.length} shadow(s): ${entries.map(e => e.name).join(', ')}`)

// ── src/styles/globals.css ────────────────────────────────────────────────────

const SENTINEL = '/* === Shadows === */'
let css = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const cutAt = css.indexOf(SENTINEL)
if (cutAt !== -1) css = css.slice(0, cutAt).trimEnd() + '\n'

const shadowBlock = [
  `\n${SENTINEL}`,
  ':root {',
  ...entries.map(({ varName, shadow }) => `  ${varName}: ${shadow};`),
  '}',
  '',
].join('\n')

writeFileSync(resolve(root, 'src/styles/globals.css'), css + shadowBlock)
console.log('✓ src/styles/globals.css (shadows appended)')

// ── src/tokens/shadows.ts ─────────────────────────────────────────────────────

const tsLines = ['export const shadows = {']
for (const { name, varName, shadow, description } of entries) {
  tsLines.push(`  '${name}': {`)
  tsLines.push(`    var: '${varName}',`)
  tsLines.push(`    value: '${shadow}',`)
  tsLines.push(`    description: '${description}',`)
  tsLines.push(`  },`)
}
tsLines.push('} as const', '', 'export type Shadows = typeof shadows', '')

writeFileSync(resolve(root, 'src/tokens/shadows.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/shadows.ts')

// ── src/tokens/index.ts ───────────────────────────────────────────────────────

writeFileSync(resolve(root, 'src/tokens/index.ts'), [
  `export { brand } from './brand'`,
  `export type { Brand } from './brand'`,
  `export { alias } from './alias'`,
  `export type { Alias } from './alias'`,
  `export { mapped } from './mapped'`,
  `export type { Mapped } from './mapped'`,
  `export { spacing, responsiveFont } from './responsive'`,
  `export type { Spacing, ResponsiveFont } from './responsive'`,
  `export { typography } from './typography'`,
  `export type { Typography } from './typography'`,
  `export { gradients } from './gradients'`,
  `export type { Gradients } from './gradients'`,
  `export { shadows } from './shadows'`,
  `export type { Shadows } from './shadows'`,
  '',
].join('\n'))
console.log('✓ src/tokens/index.ts')

// ── Summary ───────────────────────────────────────────────────────────────────
for (const { varName, shadow, description } of entries) {
  console.log(`  ${varName}: ${shadow}`)
  if (description) console.log(`    → ${description}`)
}
