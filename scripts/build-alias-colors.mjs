import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')

// ── Slugify: lowercase, collapse non-alphanumeric runs to '-', trim edges ─────
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const aliasSrc = JSON.parse(readFileSync(resolve(root, 'design-tokens/Alias/Alias.json'), 'utf8'))
const brandSrc = JSON.parse(readFileSync(resolve(root, 'design-tokens/Brand/Value.json'), 'utf8'))

// ── Build the set of known brand CSS var names (from Brand/Value.json) ────────
const knownBrandVars = new Set()
for (const [group, tokens] of Object.entries(brandSrc)) {
  if (!tokens || typeof tokens !== 'object') continue
  for (const [step, token] of Object.entries(tokens)) {
    if (token?.type === 'color' && typeof token.value === 'string' && token.value.startsWith('#')) {
      knownBrandVars.add(
        group === 'foundations' ? `--brand-${step}` : `--brand-${group.toLowerCase()}-${step}`
      )
    }
  }
}

// ── Reference resolver ────────────────────────────────────────────────────────
// Parses {Group.Step} and maps to a --brand-* CSS var name.
// Exits loudly if the resulting var doesn't exist in Brand.
function resolveRef(ref) {
  const m = ref.match(/^\{(.+?)\.(.+?)\}$/)
  if (!m) {
    console.error(`ERROR: Cannot parse reference syntax: ${ref}`)
    process.exit(1)
  }
  const [, group, step] = m
  const varName = group === 'foundations'
    ? `--brand-${step}`
    : `--brand-${group.toLowerCase()}-${step}`
  if (!knownBrandVars.has(varName)) {
    console.error(`ERROR: Unresolvable reference ${ref} → ${varName} (not found in Brand)`)
    process.exit(1)
  }
  return varName
}

// ── Groups to process (allowlist) ─────────────────────────────────────────────
const ALLOWED = new Set([
  'Primary', 'Error', 'Success', 'Warning', 'Information',
  'Surface', 'Interactive', 'Neutral', 'Foundations',
  // Raw alpha-tint primitives (hex-with-alpha, not {Group.Step} refs) — used
  // by Mapped's surface.Alpha.hover/pressed for dark/light wash overlays.
  'Alpha light mode', 'Alpha dark mode',
])

const groups = [] // [{ name, steps: [[step, brandVarName], ...] }]

for (const [name, group] of Object.entries(aliasSrc)) {
  if (!ALLOWED.has(name)) continue
  if (!group || typeof group !== 'object') continue

  const steps = []
  for (const [step, token] of Object.entries(group)) {
    if (!token || typeof token !== 'object') continue
    if (token.type !== 'color') continue
    if (typeof token.value !== 'string') continue
    if (token.value.startsWith('{')) steps.push([step, resolveRef(token.value)])
    else if (token.value.startsWith('#')) steps.push([step, token.value])
  }
  if (steps.length > 0) groups.push({ name, steps })
}

// ── src/tokens/alias.ts ───────────────────────────────────────────────────────
const tsLines = ['export const alias = {']
for (const { name, steps } of groups) {
  tsLines.push(`  '${name}': {`)
  for (const [step, brandVar] of steps) {
    const key = /^\d+$/.test(step) ? step : `'${step}'`
    tsLines.push(`    ${key}: '${brandVar}',`)
  }
  tsLines.push(`  },`)
}
tsLines.push('} as const', '', 'export type Alias = typeof alias', '')

writeFileSync(resolve(root, 'src/tokens/alias.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/alias.ts')

// ── src/tokens/index.ts ───────────────────────────────────────────────────────
const index = [
  `export { brand } from './brand'`,
  `export type { Brand } from './brand'`,
  `export { alias } from './alias'`,
  `export type { Alias } from './alias'`,
  '',
].join('\n')
writeFileSync(resolve(root, 'src/tokens/index.ts'), index)
console.log('✓ src/tokens/index.ts')

// ── src/styles/globals.css (append alias block) ───────────────────────────────
const SENTINEL = '/* === Alias === */'
let css = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const cutAt = css.indexOf(SENTINEL)
if (cutAt !== -1) css = css.slice(0, cutAt).trimEnd() + '\n'

const aliasLines = [`\n${SENTINEL}`, ':root {']
for (const { name, steps } of groups) {
  aliasLines.push(`  /* ${name} */`)
  for (const [step, brandVar] of steps) {
    const aliasVar = `--alias-${slugify(name)}-${step}`
    const cssValue = brandVar.startsWith('--') ? `var(${brandVar})` : brandVar
    aliasLines.push(`  ${aliasVar}: ${cssValue};`)
  }
  aliasLines.push('')
}
if (aliasLines.at(-1) === '') aliasLines.pop()
aliasLines.push('}', '')

writeFileSync(resolve(root, 'src/styles/globals.css'), css + aliasLines.join('\n'))
console.log('✓ src/styles/globals.css (alias block appended)')

// ── Summary ───────────────────────────────────────────────────────────────────
const totalSteps = groups.reduce((n, g) => n + g.steps.length, 0)
console.log(`\nProcessed ${groups.length} alias groups (${totalSteps} tokens):`)
for (const { name, steps } of groups) {
  const sample = steps[0]
  console.log(`  ${name} (${steps.length} steps) — e.g. ${sample[0]} → ${sample[1]}`)
}
