import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')
const src = JSON.parse(readFileSync(resolve(root, 'design-tokens/Brand/Value.json'), 'utf8'))

const gradientGroup = src.Gradient
if (!gradientGroup || typeof gradientGroup !== 'object') {
  console.error('ERROR: No "Gradient" group found in Brand/Value.json')
  process.exit(1)
}

// ── Collect and validate ──────────────────────────────────────────────────────

const entries = [] // [{ name, value, description }]

for (const [name, token] of Object.entries(gradientGroup)) {
  if (!token || typeof token !== 'object' || typeof token.value !== 'string') {
    console.error(`ERROR: Gradient.${name} — unexpected shape: ${JSON.stringify(token)}`)
    process.exit(1)
  }
  if (!token.value.startsWith('linear-gradient(')) {
    console.error(`ERROR: Gradient.${name} value does not start with "linear-gradient(":\n  "${token.value}"`)
    process.exit(1)
  }
  entries.push({ name, value: token.value, description: token.description ?? '' })
}

console.log(`Collected ${entries.length} gradient(s): ${entries.map(e => e.name).join(', ')}`)

// ── src/styles/globals.css ────────────────────────────────────────────────────

const SENTINEL = '/* === Gradients === */'
let css = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const cutAt = css.indexOf(SENTINEL)
if (cutAt !== -1) css = css.slice(0, cutAt).trimEnd() + '\n'

const gradientBlock = [
  `\n${SENTINEL}`,
  ':root {',
  ...entries.map(({ name, value }) => `  --gradient-${name}: ${value};`),
  '}',
  '',
].join('\n')

writeFileSync(resolve(root, 'src/styles/globals.css'), css + gradientBlock)
console.log('✓ src/styles/globals.css (gradients appended)')

// ── src/tokens/gradients.ts ───────────────────────────────────────────────────

const tsLines = ['export const gradients = {']
for (const { name, value, description } of entries) {
  tsLines.push(`  '${name}': {`)
  tsLines.push(`    var: '--gradient-${name}',`)
  tsLines.push(`    value: '${value}',`)
  tsLines.push(`    description: '${description}',`)
  tsLines.push(`  },`)
}
tsLines.push('} as const', '', 'export type Gradients = typeof gradients', '')

writeFileSync(resolve(root, 'src/tokens/gradients.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/gradients.ts')

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
  '',
].join('\n'))
console.log('✓ src/tokens/index.ts')

// ── Summary ───────────────────────────────────────────────────────────────────
for (const { name, value, description } of entries) {
  console.log(`  --gradient-${name}: ${value}`)
  if (description) console.log(`    → ${description}`)
}
